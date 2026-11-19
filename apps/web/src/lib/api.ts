const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiClient {
  private static cachedUser: any = null;

  /**
   * Deprecated token storage shim to preserve backwards-compatibility.
   * Authentication tokens are strictly persisted via httpOnly secure cookies.
   */
  public static setTokens(_accessToken?: string, _refreshToken?: string) {
    // Intentionally no-op: tokens are managed via secure httpOnly cookies.
    if (typeof window !== 'undefined') {
      localStorage.removeItem('labourlens_token');
      localStorage.removeItem('labourlens_refresh_token');
    }
  }

  public static async clearTokens() {
    this.cachedUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('labourlens_token');
      localStorage.removeItem('labourlens_refresh_token');
      localStorage.removeItem('labourlens_user');
      sessionStorage.removeItem('labourlens_user');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort logout
    }
  }

  public static setCurrentUser(user: any) {
    this.cachedUser = user;
    if (typeof window === 'undefined') return;
    if (user) {
      sessionStorage.setItem('labourlens_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('labourlens_user');
    }
  }

  public static getCurrentUser(): any {
    if (this.cachedUser) return this.cachedUser;
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('labourlens_user');
    if (!stored) return null;
    try {
      this.cachedUser = JSON.parse(stored);
      return this.cachedUser;
    } catch {
      return null;
    }
  }

  /**
   * Core HTTP request handler.
   * Uses credentials: 'include' so httpOnly session cookies are automatically transmitted.
   */
  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const isInternalAuthRoute = endpoint.startsWith('/api/auth');
    const url = isInternalAuthRoute ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText || 'Network response was not ok' };
      }
      const message = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'An error occurred';
      throw new Error(message);
    }

    // 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // --- Auth Methods (routed through Next.js httpOnly cookie endpoints) ---

  public static async login(cnic: string, password: string, rememberMe: boolean = false) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cnic, password, rememberMe }),
    });
    if (data?.user) {
      this.setCurrentUser(data.user);
    }
    return data;
  }

  public static async registerWorker(data: any) {
    const res = await this.request('/api/auth/register/worker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  }

  public static async registerEmployer(data: any) {
    const res = await this.request('/api/auth/register/employer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  }

  public static async logout() {
    await this.clearTokens();
  }

  public static async getMe() {
    try {
      const res = await this.request('/api/auth/me');
      if (res?.user) {
        this.setCurrentUser(res.user);
        return res.user;
      }
      return null;
    } catch {
      this.setCurrentUser(null);
      return null;
    }
  }

  public static async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public static async resetPassword(data: { token: string; newPassword: string; confirmPassword?: string }) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Taxonomy Endpoints ---
  public static getCategories() {
    return this.request('/taxonomy/categories');
  }

  public static getSkills(categoryId?: string) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request(`/taxonomy/skills${query}`);
  }

  // --- Worker Profile Endpoints ---
  public static getWorkerProfile() {
    return this.request('/workers/profile/me');
  }

  public static updateWorkerProfile(data: any) {
    return this.request('/workers/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static updateWorkerSkills(skills: any[]) {
    return this.request('/workers/profile/me/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
  }

  public static addWorkerExperience(data: any) {
    return this.request('/workers/profile/me/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static deleteWorkerExperience(id: string) {
    return this.request(`/workers/profile/me/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  public static addWorkerQualification(data: any) {
    return this.request('/workers/profile/me/qualifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static deleteWorkerQualification(id: string) {
    return this.request(`/workers/profile/me/qualifications/${id}`, {
      method: 'DELETE',
    });
  }

  public static updateWorkerAvailability(data: any) {
    return this.request('/workers/profile/me/availability', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public static updateWorkerPortfolio(portfolioItems: any[]) {
    return this.request('/workers/profile/me/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ portfolioItems }),
    });
  }

  public static updateWorkerAddress(data: any) {
    return this.request('/workers/profile/me/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Employer Profile Endpoints ---
  public static getEmployerProfile() {
    return this.request('/employers/profile/me');
  }

  public static updateEmployerProfile(data: any) {
    return this.request('/employers/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static updateEmployerPreferences(data: any) {
    return this.request('/employers/profile/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public static updateEmployerAddress(data: any) {
    return this.request('/employers/profile/me/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
