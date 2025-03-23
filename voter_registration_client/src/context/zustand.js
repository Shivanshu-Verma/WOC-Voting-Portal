import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      removeUser: () => set({ user: null }),
      ec: null,
      setEc: (ec) => set({ ec }),
      removeEc: () => set({ ec: null }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
