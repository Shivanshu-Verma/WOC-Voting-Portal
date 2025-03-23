import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const useEvmStore = create(
  persist(
    devtools((set) => ({
      evmId: null,
      setEvmId: (id) => set({ evmId: id }),
      clearStore: () => set({ evmId: null }),
      ec: null,
      setEc: (ec) => set({ ec }),
      removeUser: () => set({ ec: null }),
    })),
    { name: "evmStore" }
  )
);

export default useEvmStore;