// Use empty string to use Vite proxy when in development
const API_URL = import.meta.env.VITE_API_URL || '';

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  token: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  }

  async signInWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/__signin_google__`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  async signUpWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/__signup_google__`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  async makeProtectedRequest(endpoint: string, query?: Record<string, string>): Promise<Response> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const queryString = query 
      ? '?' + new URLSearchParams(query).toString()
      : '';

    const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      this.clearToken();
      throw new Error('Authentication expired');
    }

    return response;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
