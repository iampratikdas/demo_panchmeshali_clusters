import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  rememberMe: boolean;
  login: (remember?: boolean) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasOnboarded: false,
  rememberMe: true,
  login: (remember = true) =>
    set({ isAuthenticated: true, hasOnboarded: true, rememberMe: remember }),
  logout: () => set({ isAuthenticated: false }),
  completeOnboarding: () => set({ hasOnboarded: true }),
}));

interface AppState {
  completedMedicines: Record<string, string[]>;
  toggleMedicineComplete: (medicineId: string, timing: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  completedMedicines: {},
  toggleMedicineComplete: (medicineId, timing) =>
    set((state) => {
      const current = state.completedMedicines[medicineId] ?? [];
      const next = current.includes(timing)
        ? current.filter((t) => t !== timing)
        : [...current, timing];
      return {
        completedMedicines: {
          ...state.completedMedicines,
          [medicineId]: next,
        },
      };
    }),
  recentSearches: ['Paracetamol', 'Cardiologist', 'Blood Test'],
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter((s) => s !== query),
      ].slice(0, 8),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
