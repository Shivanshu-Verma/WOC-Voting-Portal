import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const ecStore = (set) => ({
    ecId: localStorage.getItem("ecId") || null,
    setEcId: (id) => {
        localStorage.setItem("ecId", id);
        set({ ecId: id });
    },

    clearStore: () => {
        localStorage.removeItem("ecId"); 
        set({ ecId: null }); 
    }
});

export const useEcStore = create(persist(devtools(ecStore), { name: "ecStore" }));