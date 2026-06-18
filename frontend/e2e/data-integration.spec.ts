import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

// Helper: register user and get token
async function createUserWithTires(): Promise<{ token: string; userId: string }> {
  const email = `data_test_${Date.now()}@test.com`;
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test1234!', name: 'Data Test User' }),
  });
  const { access_token } = await res.json();
  const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

  // Get user ID
  const me = await (await fetch(`${API}/users/me`, { headers })).json();

  // Complete onboarding
  await fetch(`${API}/users/me/onboarding`, { method: 'PATCH', headers });

  // Get a catalog item and create 2 tires
  const catalog = await (await fetch(`${API}/catalog`, { headers })).json();
  const cupId = catalog.find((c: any) => c.name.includes('Power Cup'))?.id || catalog[0].id;
  await fetch(`${API}/tires`, { method: 'POST', headers, body: JSON.stringify({ catalog_id: cupId, position: 'rear' }) });
  await fetch(`${API}/tires`, { method: 'POST', headers, body: JSON.stringify({ catalog_id: cupId, position: 'front' }) });

  return { token: access_token, userId: me.id };
}

test.describe('Data Integration Tests', () => {

  test('user can join a challenge and it updates participant count', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Get challenges
    const challenges = await (await fetch(`${API}/challenges`, { headers })).json();
    const challenge = challenges.data[0];
    expect(challenge).toBeDefined();
    expect(challenge.title).toBe('100 000 km en 7 jours');

    const countBefore = challenge.participant_count;

    // Join challenge
    const joinRes = await fetch(`${API}/challenges/${challenge.id}/join`, { method: 'POST', headers });
    expect(joinRes.status).toBe(201);

    // Verify participant count increased
    const after = await (await fetch(`${API}/challenges`, { headers })).json();
    expect(after.data[0].participant_count).toBe(countBefore + 1);
    expect(after.data[0].is_participant).toBe(true);
  });

  test('joining a challenge twice returns 409 conflict', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const challenges = await (await fetch(`${API}/challenges`, { headers })).json();
    const id = challenges.data[0].id;

    // Join first time
    await fetch(`${API}/challenges/${id}/join`, { method: 'POST', headers });
    // Join second time
    const res = await fetch(`${API}/challenges/${id}/join`, { method: 'POST', headers });
    expect(res.status).toBe(409);
  });

  test('sensor data creation updates user XP and level', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Check initial XP
    const before = await (await fetch(`${API}/users/me`, { headers })).json();
    expect(before.xp).toBe(0);
    expect(before.level).toBe(1);

    // Post sensor data (50km ride)
    await fetch(`${API}/sensor-data`, {
      method: 'POST', headers,
      body: JSON.stringify({ distance_km: 50, elevation_m: 600, avg_speed: 25, duration_seconds: 7200 }),
    });

    // Verify XP updated (10 per km = 500)
    const after = await (await fetch(`${API}/users/me`, { headers })).json();
    expect(after.xp).toBe(500);
    expect(after.best_distance_km).toBe(50);
    expect(after.best_elevation_m).toBe(600);
  });

  test('sensor data updates tire km and wear', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Get tires
    const tiresBefore = await (await fetch(`${API}/tires`, { headers })).json();
    const activeTire = tiresBefore.find((t: any) => t.is_active);
    expect(activeTire).toBeDefined();
    expect(activeTire.total_km).toBe(0);
    expect(activeTire.wear_score).toBe(100);

    // Post a 200km ride linked to tire
    await fetch(`${API}/sensor-data`, {
      method: 'POST', headers,
      body: JSON.stringify({ distance_km: 200, elevation_m: 1500, avg_speed: 28, duration_seconds: 25200, tire_id: activeTire.id }),
    });

    // Verify tire km and wear updated
    const tiresAfter = await (await fetch(`${API}/tires`, { headers })).json();
    const updatedTire = tiresAfter.find((t: any) => t.id === activeTire.id);
    expect(updatedTire.total_km).toBe(200);
    // 200/5000 = 4% used → wear_score = 96
    expect(updatedTire.wear_score).toBe(96);
  });

  test('sensor data updates challenge contributed_km', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Join challenge
    const challenges = await (await fetch(`${API}/challenges`, { headers })).json();
    const challengeId = challenges.data[0].id;
    await fetch(`${API}/challenges/${challengeId}/join`, { method: 'POST', headers });

    const kmBefore = challenges.data[0].current_km;

    // Post ride
    await fetch(`${API}/sensor-data`, {
      method: 'POST', headers,
      body: JSON.stringify({ distance_km: 75, elevation_m: 800, avg_speed: 26, duration_seconds: 10000 }),
    });

    // Verify challenge km increased
    const after = await (await fetch(`${API}/challenges`, { headers })).json();
    expect(after.data[0].current_km).toBeCloseTo(kmBefore + 75, 0);

    // Verify leaderboard shows contribution
    const lb = await (await fetch(`${API}/challenges/${challengeId}/leaderboard`, { headers })).json();
    const me = await (await fetch(`${API}/users/me`, { headers })).json();
    const myEntry = lb.find((e: any) => e.user_id === me.id);
    expect(myEntry).toBeDefined();
    expect(myEntry.contributed_km).toBe(75);
  });

  test('user level progresses with XP', async () => {
    const { token } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 200km = 2000 XP → level 2 (Rider threshold)
    await fetch(`${API}/sensor-data`, {
      method: 'POST', headers,
      body: JSON.stringify({ distance_km: 200, elevation_m: 0, avg_speed: 30, duration_seconds: 24000 }),
    });

    const user = await (await fetch(`${API}/users/me`, { headers })).json();
    expect(user.xp).toBe(2000);
    expect(user.level).toBe(2);
    expect(user.level_name).toBe('Rider');
  });

  test('tires without pneu cannot join challenge (frontend guard)', async ({ page }) => {
    const email = `no_tires_${Date.now()}@test.com`;

    // Register user without tires
    await page.goto('/');
    await page.getByText("Pas de compte ? S'inscrire").click();
    await page.getByPlaceholder('Nom').fill('No Tires User');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Mot de passe').fill('Test1234!');
    await page.getByRole('button', { name: "S'inscrire" }).click();
    await page.waitForURL(/\/(tires|onboarding)/, { timeout: 10000 });

    if (page.url().includes('onboarding')) {
      await page.getByText('Passer').click();
      await page.waitForTimeout(1000);
    }

    // Go to challenges
    await page.locator('a[href="/challenges"]').click();
    await page.waitForTimeout(2000);

    // Verify buttons are locked
    await expect(page.getByText('Pneu connecté requis').first()).toBeVisible();
  });

  test('profile public shows correct stats and tires', async () => {
    const { token, userId } = await createUserWithTires();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Create some rides
    await fetch(`${API}/sensor-data`, {
      method: 'POST', headers,
      body: JSON.stringify({ distance_km: 80, elevation_m: 900, avg_speed: 27, duration_seconds: 10800 }),
    });

    // Fetch public profile
    const profile = await (await fetch(`${API}/users/${userId}`, { headers })).json();
    expect(profile.name).toBe('Data Test User');
    expect(profile.stats.total_km).toBe(80);
    expect(profile.stats.total_elevation).toBe(900);
    expect(profile.tires.length).toBe(2);
    expect(profile.tires[0].name).toContain('Michelin');
  });
});
