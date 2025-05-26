import { writable, derived } from 'svelte/store';
import type { WalletProfile } from '../services/wallet';

interface AuthState {
  user: WalletProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    setUser: (user: WalletProfile | null) => {
      update(state => ({ ...state, user, error: null }));
    },
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    logout: () => {
      set(initialState);
    }
  };
}

export const auth = createAuthStore();

export const isAuthenticated = derived(
  auth,
  $auth => $auth.user !== null
);

export const user = derived(
  auth,
  $auth => $auth.user
);

export const walletAddress = derived(
  auth,
  $auth => $auth.user?.walletAddress || null
);

export const walletBalance = derived(
  auth,
  $auth => $auth.user?.balance || '0'
);