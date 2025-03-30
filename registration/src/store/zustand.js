import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const ecStore = (set) => ({
    ecId: localStorage.getItem("ecId") || null,
    ecFingerprint: localStorage.getItem("ecFingerprint") || null,
    setEcId: (id) => {
        localStorage.setItem("ecId", id);
        set({ ecId: id });
    },

    setEcFingerprint: (fingerprint) => {
        localStorage.setItem("ecFingerprint", fingerprint);
        set({ecFingerprint: fingerprint});
    },

    clearStore: () => {
        localStorage.clear();
        set({ ecId: null, ecFingerprint: null }); 
    }
});

const staffStore = (set) => ({
    staffId: localStorage.getItem("staffId") || null,
    staffFingerprint: localStorage.getItem("staffFingerprint") || null,
    setStaffId: (id) => {
        localStorage.setItem("staffId", id);
        set({ staffId: id });
    },

    setStaffFingerprint: (fingerprint) => {
        localStorage.setItem("staffFingerprint", fingerprint);
        set({staffFingerprint: fingerprint});
    },

    clearStore: () => {
        localStorage.clear();
        set({ staffId: null, staffFingerprint: null }); 
    }
});

const volunteerStore = (set) => ({
    volunteerId: localStorage.getItem("volunteerId") || null,
    volunteerFingerprint: localStorage.getItem("volunteerFingerprint") || null,

    setVolunteerId: (id) => {
        localStorage.setItem("volunteerId", id);
        set({ volunteerId: id });
    },

    setVolunteerFingerprint: (fingerprint) => {
        localStorage.setItem("volunteerFingerprint", fingerprint);
        set({volunteerFingerprint: fingerprint});
    },

    clearStore: () => {
        localStorage.clear(); 
        set({ volunteerId: null, volunteerFingerprint: null }); 
    }
});

export const useEcStore = create(persist(devtools(ecStore), { name: "ecStore" }));
export const useStaffStore = create(persist(devtools(staffStore), { name: "staffStore" }));
export const useVolunteerStore = create(persist(devtools(volunteerStore), { name: "volunteerStore" }));