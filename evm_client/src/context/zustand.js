import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { axiosInstance } from "../pages/EvmRegister";
import { clearAllCommitmentSums, getAllCommitmentSums } from "./idb";


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

        if (newVoteCount === 2) {
          try {
            const randomVector = await getAllCommitmentSums(); // Await the async function
            const responce = await axiosInstance.post(
              `${base_url}/vote-cast/checkpoint`,
              { randomVector,clientCurrentTS: new Date() },
              { withCredentials: true }
            );
            if(responce.status==200){
              set({ numVoteCast: 0 }); 
              await clearAllCommitmentSums();
            }
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