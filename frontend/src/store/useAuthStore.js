import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set({ user: userData }),
      setTheme: (themeColor) => set((state) => ({ user: { ...state.user, themeColor } })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
