import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user, token) => 
    set({ 
      user, 
      token, 
      isAuthenticated: true,
      isLoading: false,
    }),
  
  clearUser: () => 
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false,
    }),
  
  setLoading: (loading) => 
    set({ isLoading: loading }),
}));

