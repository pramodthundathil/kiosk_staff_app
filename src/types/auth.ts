export interface StaffUser {
  username: string;
  email?: string;
  role: string;
  role_display: string;
  employee_id?: string;
  designation?: string;
  location?: string;
  profile_image?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  username: string;
  role: string;
  role_display: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StaffUser | null;
  tokens: AuthTokens | null;
  error: string | null;
}
