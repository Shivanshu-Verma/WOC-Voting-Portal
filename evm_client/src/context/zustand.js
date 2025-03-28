import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { axiosInstance } from "../pages/EvmRegister";
import { getAllCommitmentSums } from "./idb";


const base_url = import.meta.env.VITE_BACKEND_URL;
const useEvmStore = create(
  persist(
    devtools((set, get) => ({
      evmId: null,
      setEvmId: (id) => set({ evmId: id }),
      clearStore: () => set({ evmId: null }),
      ec: null,
      setEc: (ec) => set({ ec }),
      removeUser: () => set({ ec: null }),
      numVoteCast: 0,
      setNumVoteCast: async () => {
        const { numVoteCast } = get();
        const newVoteCount = numVoteCast + 1;
        set({ numVoteCast: newVoteCount });

        if (newVoteCount === 3) {
          try {
            const randomVector = await getAllCommitmentSums(); // Await the async function
            await axiosInstance.post(
              `${base_url}/api/vote-cast/checkpoint`,
              { randomVector },
              { withCredentials: true }
            );
            set({ numVoteCast: 0 }); // Reset count only after successful API call
          } catch (err) {
            console.error("Error posting votes:", err);
          }
        }
      },
    })),
    { name: "evmStore" }
  )
);

export default useEvmStore;