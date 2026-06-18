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
  return res.json() as Promise<T>;
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
  me: <T = Record<string, unknown>>() => request<T>('/users/me'),
  badges: <T = Record<string, unknown>>() => request<T[]>('/users/me/badges'),
  completeOnboarding: <T = Record<string, unknown>>() => request<T>('/users/me/onboarding', { method: 'PATCH' }),
  getPublicProfile: <T = Record<string, unknown>>(id: string) => request<T>(`/users/${id}`),
  leaderboard: <T = Record<string, unknown>>(params?: { country?: string; region?: string; limit?: number; filter?: 'global' | 'friends'; sort?: 'xp' | 'km' }) => {
    const q = new URLSearchParams();
    if (params?.country) q.set('country', params.country);
    if (params?.region) q.set('region', params.region);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.filter) q.set('filter', params.filter);
    if (params?.sort) q.set('sort', params.sort);
    return request<T[]>(`/users/leaderboard?${q}`);
  },
};

// Friends
export const friends = {
  getCode: () => request<{ friend_code: string }>('/friends/code'),
  add: <T = Record<string, unknown>>(code: string) => request<T>('/friends/add', { method: 'POST', body: JSON.stringify({ code }) }),
  list: <T = Record<string, unknown>>() => request<T[]>('/friends'),
  remove: <T = Record<string, unknown>>(id: string) => request<T>(`/friends/${id}`, { method: 'DELETE' }),
};

// Sensor Data
export const sensorData = {
  list: <T = Record<string, unknown>>(params?: { page?: number; limit?: number; since?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.since) q.set('since', params.since);
    return request<T>(`/sensor-data?${q}`);
  },
  sync: <T = Record<string, unknown>>() => request<T>('/sensor-data/sync', { method: 'POST' }),
};

// Tires
export const tires = {
  list: <T = Record<string, unknown>>() => request<T[]>('/tires'),
  readings: <T = Record<string, unknown>>(id: string) => request<T>(`/tires/${id}/readings`),
  create: <T = Record<string, unknown>>(body: { catalog_id: string; position: string }) =>
    request<T>('/tires', { method: 'POST', body: JSON.stringify(body) }),
  update: <T = Record<string, unknown>>(id: string, body: { is_active?: boolean }) =>
    request<T>(`/tires/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: <T = Record<string, unknown>>(id: string) => request<T>(`/tires/${id}`, { method: 'DELETE' }),
};

// Catalog
export const catalog = {
  list: <T = Record<string, unknown>>() => request<T[]>('/catalog'),
  recommend: <T = Record<string, unknown>>(usage?: string) => request<T[]>(`/catalog/recommend${usage ? `?usage=${usage}` : ''}`),
  get: <T = Record<string, unknown>>(id: string) => request<T>(`/catalog/${id}`),
};

// Challenges
export const challenges = {
  list: <T = Record<string, unknown>>(page = 1, limit = 20) => request<T>(`/challenges?page=${page}&limit=${limit}`),
  create: <T = Record<string, unknown>>(body: { title: string; description?: string; type: string; goal: number; end_date: string }) =>
    request<T>('/challenges', { method: 'POST', body: JSON.stringify(body) }),
  join: <T = Record<string, unknown>>(id: string) => request<T>(`/challenges/${id}/join`, { method: 'POST' }),
  leaderboard: <T = Record<string, unknown>>(id: string) => request<T[]>(`/challenges/${id}/leaderboard`),
};

// Tips
export const tips = {
  list: <T = Record<string, unknown>>() => request<T[]>('/tips'),
  forecast: <T = Record<string, unknown>>() => request<T>('/tips/forecast'),
};

// Ride readings (GPS)
export const rideReadings = {
  get: <T = Record<string, unknown>>(rideId: string) => request<T[]>(`/ride-readings/${rideId}`),
};

// Strava
export const strava = {
  loginUrl: () => `${API}/strava/login`,
};