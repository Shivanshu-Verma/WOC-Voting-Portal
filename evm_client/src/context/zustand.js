import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { axiosInstance } from "../pages/EvmRegister";
import { getAllCommitmentSums } from "./idb";


const base_url = import.meta.env.VITE_BACKEND_URL;

const useEvmStore = create(
  persist(
    devtools((set) => ({
      evmId: null,
      setEvmId: (id) => set({ evmId: id }),
      clearStore: () => set({ evmId: null }),
      ec: null,
      setEc: (ec) => set({ ec }),
      removeUser: () => set({ ec: null }),
      numVoteCast :0,
      numVoteCast: 0,
      setNumVoteCast: () => {
        const { numVoteCast } = get(); 
        const newVoteCount = numVoteCast + 1;
        set({ numVoteCast: newVoteCount });

        if (newVoteCount === 10) {
          axiosInstance.post(`${base_url}/api/vote-cast/checkpoint`,{
            randomVector:getAllCommitmentSums()
          },{ withCredentials:true }) 
            .then(() => set({ numVoteCast: 0 })) 
            .catch((err) => console.error("Error posting votes:", err));
        }
      }
    })),
    { name: "evmStore" }
  )
);

export default useEvmStore;