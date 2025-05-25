import { writable, derived } from 'svelte/store';
import type { DynamicUserProfile } from '../services/dynamic';

export interface AuthState {
  isAuthenticated: boolean;
  user: DynamicUserProfile | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  return {
    subscribe,
    setUser: (user: DynamicUserProfile | null) => {
      update(state => ({
        ...state,
        user,
        isAuthenticated: !!user,
        error: null
      }));
    },
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    logout: () => {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  };
}

export const auth = createAuthStore();

export const isAuthenticated = derived(
  auth,
  $auth => $auth.isAuthenticated
);

export const currentUser = derived(
  auth,
  $auth => $auth.user
);

export const walletAddress = derived(
  auth,
  $auth => $auth.user?.walletAddress || null
);