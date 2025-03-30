import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";
import useEvmStore from "../context/zustand";
import { getAllCommitmentSums, updateCommitmentSum } from "../context/idb";
import axios from "axios";


const base_url = import.meta.env.VITE_BACKEND_URL;

// import axios from "axios";
// let axiosInstance = axios.create({
//   baseURL: base_url,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const updateAxiosWithEvmId = (evmKey) => {
//   console.log("Updated axios with EVM key:", evmKey);

//   if (evmKey) {
//     axiosInstance.defaults.headers.common['x-evm-id'] = evmKey;
//   } else {
//     delete axiosInstance.defaults.headers.common['x-evm-id'];
//   }
// };

const VoterLogin = () => {
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");
  const [part4, setPart4] = useState("");

  const [fingerprint, setFingerprint] = useState(null);
  const { GetStudentDetail } = useContext(AuthContext);
  const [voter, setVoter] = useState({})
  const navigate = useNavigate();
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const evmId = useEvmStore((state) => state.evmId);
  const setNumVoteCast = useEvmStore((state) => state.setNumVoteCast);
  // updateAxiosWithEvmId(evmId)
  const handleClick = async () => {
    if (![part1, part2, part3, part4].every(part => part && part.trim())) {
      toast.error("Please select all parts of your Voter ID");
      return;
    }

    const voterId = `${part1.trim()}${part2.trim()}${part3.trim()}${part4.trim()}`;
    console.log("Voter ID:", voterId);

    try {
      const response = await GetStudentDetail(voterId);

      if (response) {
        const { biometric_left, biometric_right, imageUrl, name } = response.Data.voter;
        // console.log(response?.Data);

        if (!biometric_left || !biometric_right) {
          toast.warning("Incomplete biometric data found.");
        }

        setFingerprint({
          left: biometric_left || null,
          right: biometric_right || null,
        });
        setVoter(response?.Data);
      } else {
        toast.error("No data found for the given Voter ID.");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to fetch student details. Please try again.");
      setEvmId(null);
      navigate('/')
    }
  };
  const verifyFingerprint = () => {
    console.log(voter);

    navigate("/cast-vote", { state: { data: voter } });
  }
 

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">Voter Login</h2>


      <div className="flex space-x-2 mt-4">
        {/* Dropdown 1 */}
        <select value={part1} onChange={(e) => setPart1(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 1</option>
          <option value="B">B</option>
          <option value="M">M</option>
          <option value="P">P</option>
        </select>

        {/* Dropdown 2 */}
        <select value={part2} onChange={(e) => setPart2(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 2</option>
          <option value="20">20</option>
          <option value="21">21</option>
          <option value="22">22</option>
          <option value="23">23</option>
        </select>

        {/* Dropdown 3 */}
        <select value={part3} onChange={(e) => setPart3(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 3</option>
          <option value="BB">BB</option>
          <option value="CS">CS</option>
          <option value="CH">CH</option>
        </select>

        {/* Dropdown 4 */}
        <select value={part4} onChange={(e) => setPart4(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 4</option>
          <option value="88">88</option>
          <option value="89">89</option>
          <option value="90">90</option>
          <option value="95">95</option>
          <option value="96">96</option>
        </select>
      </div>

      <button
        onClick={handleClick}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Fetch Details
      </button>
      
      {fingerprint && (
        <button
          onClick={verifyFingerprint}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          verify fingerprint
        </button>
      )}
    </div>
  );
};

export default VoterLogin;
