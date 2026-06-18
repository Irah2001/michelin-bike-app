const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers(), ...opts });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Auth
export const auth = {
  register: (email: string, password: string, name: string) =>
    request<{ access_token: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// Users
export const users = {
  me: () => request<any>('/users/me'),
  badges: () => request<any[]>('/users/me/badges'),
  completeOnboarding: () => request<any>('/users/me/onboarding', { method: 'PATCH' }),
  getPublicProfile: (id: string) => request<any>(`/users/${id}`),
  leaderboard: (params?: { country?: string; region?: string; limit?: number; filter?: 'global' | 'friends'; sort?: 'xp' | 'km' }) => {
    const q = new URLSearchParams();
    if (params?.country) q.set('country', params.country);
    if (params?.region) q.set('region', params.region);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.filter) q.set('filter', params.filter);
    if (params?.sort) q.set('sort', params.sort);
    return request<any[]>(`/users/leaderboard?${q}`);
  },
};

// Friends
export const friends = {
  getCode: () => request<{ friend_code: string }>('/friends/code'),
  add: (code: string) => request<any>('/friends/add', { method: 'POST', body: JSON.stringify({ code }) }),
  list: () => request<any[]>('/friends'),
  remove: (id: string) => request<any>(`/friends/${id}`, { method: 'DELETE' }),
};

// Sensor Data
export const sensorData = {
  list: (params?: { page?: number; limit?: number; since?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.since) q.set('since', params.since);
    return request<any>(`/sensor-data?${q}`);
  },
  sync: () => request<any>('/sensor-data/sync', { method: 'POST' }),
};

// Tires
export const tires = {
  list: () => request<any[]>('/tires'),
  readings: (id: string) => request<any>(`/tires/${id}/readings`),
  create: (body: { catalog_id: string; position: string }) =>
    request<any>('/tires', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { is_active?: boolean }) =>
    request<any>(`/tires/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<any>(`/tires/${id}`, { method: 'DELETE' }),
};

// Catalog
export const catalog = {
  list: () => request<any[]>('/catalog'),
  recommend: (usage?: string) => request<any[]>(`/catalog/recommend${usage ? `?usage=${usage}` : ''}`),
  get: (id: string) => request<any>(`/catalog/${id}`),
};

// Challenges
export const challenges = {
  list: (page = 1, limit = 20) => request<any>(`/challenges?page=${page}&limit=${limit}`),
  create: (body: { title: string; description?: string; type: string; goal: number; end_date: string }) =>
    request<any>('/challenges', { method: 'POST', body: JSON.stringify(body) }),
  join: (id: string) => request<any>(`/challenges/${id}/join`, { method: 'POST' }),
  leaderboard: (id: string) => request<any[]>(`/challenges/${id}/leaderboard`),
};

// Tips
export const tips = {
  list: () => request<any[]>('/tips'),
  forecast: () => request<any>('/tips/forecast'),
};

// Ride readings (GPS)
export const rideReadings = {
  get: (rideId: string) => request<any[]>(`/ride-readings/${rideId}`),
};

// Strava
export const strava = {
  loginUrl: () => `${API}/strava/login`,
};
