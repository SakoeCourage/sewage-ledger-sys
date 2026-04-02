import api from '@/lib/api';

const TOKEN_KEY = 'token';
const COOKIE_NAME = 'auth_token';

export async function login(username: string, password: string): Promise<void> {
  const response = await api.post('/api/Auth', { username, password });
  const data = response.data;

  // Handle different token field names the API might return
  const token: string | undefined =
    data?.token ?? data?.Token ?? data?.accessToken ?? data?.AccessToken ?? data?.access_token ?? data?.jwt;

  if (!token) {
    throw new Error('Invalid credentials. Please try again.');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    
    // Decode and store user session
    const payload = decodeToken(token);
    if (payload?.user) {
      try {
        // The 'user' field is stringified JSON in the payload
        const userObj = typeof payload.user === 'string' ? JSON.parse(payload.user) : payload.user;
        localStorage.setItem('current_user', JSON.stringify(userObj));
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }

    // Set a plain cookie so Next.js middleware can read it for route protection
    document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=Lax`;
  }
}

export function decodeToken(token: string): any {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
    window.dispatchEvent(new Event('navigation-start'));
    window.location.replace('/login');
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserProfile(): any {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
