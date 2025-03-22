import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      removeUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // Key for localStorage
      getStorage: () => localStorage, // Persist in localStorage
    }
  )
);

export default useUserStore;
