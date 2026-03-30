import api from '@/lib/api';

const TOKEN_KEY = 'token';
const COOKIE_NAME = 'auth_token';

export async function login(username: string, password: string): Promise<void> {
  const response = await api.post('/api/Auth', { username, password });
  const data = response.data;

  // Handle different token field names the API might return
  const token: string | undefined =
    data?.token ?? data?.accessToken ?? data?.access_token ?? data?.jwt;

  if (!token) {
    throw new Error('Invalid credentials. Please try again.');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Set a plain cookie so Next.js middleware can read it for route protection
    document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=Lax`;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
    window.location.replace('/login');
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
