
export type AuthUser = {
  id: string;
  email: string | null;
  name: string;
  role: "mentor" | "client";
  company?: string;
  phone?: string;
  position?: string;
  bio?: string;
  avatar_url?: string | null;
  createdAt?: string;
  mentor_id?: string;
  cnpj?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  website?: string | null;
  is_master_account?: boolean;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: object) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isDevMode: boolean;
  toggleDevMode: () => void;
};
