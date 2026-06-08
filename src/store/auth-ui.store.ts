/**
 * Optional: Zustand store for auth UI state (separate from actual auth tokens/session)
 * Use this for auth-related UI state like loading, errors, etc.
 */

import { create } from "zustand";

interface AuthUIState {
  isLoading: boolean;
  error: string | null;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  isLoading: false,
  error: null,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ isLoading: false, error: null }),
}));
