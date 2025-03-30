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

const staffStore = (set) => ({
    staffId: localStorage.getItem("staffId") || null,
    setStaffId: (id) => {
        localStorage.setItem("staffId", id);
        set({ staffId: id });
    },

    clearStore: () => {
        localStorage.removeItem("staffId"); 
        set({ staffId: null }); 
    }
});

const volunteerStore = (set) => ({
    volunteerId: localStorage.getItem("volunteerId") || null,
    setVolunteerId: (id) => {
        localStorage.setItem("volunteerId", id);
        set({ volunteerId: id });
    },

    clearStore: () => {
        localStorage.removeItem("volunteerId"); 
        set({ volunteerId: null }); 
    }
});

export const useEcStore = create(persist(devtools(ecStore), { name: "ecStore" }));
export const useStaffStore = create(persist(devtools(staffStore), { name: "staffStore" }));
export const useVolunteerStore = create(persist(devtools(volunteerStore), { name: "volunteerStore" }));