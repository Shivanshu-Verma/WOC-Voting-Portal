import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";
import useEvmStore from "../context/zustand";
import { clearAllCommitmentSums, getAllCommitmentSums, updateCommitmentSum } from "../context/idb";
import axios from "axios";
import { axiosInstance } from "./EvmRegister";

const base_url = import.meta.env.VITE_BACKEND_URL;

const VoterLogin = () => {
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");
  const [part4, setPart4] = useState("");

  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { GetStudentDetail } = useContext(AuthContext);
  const [voter, setVoter] = useState({});
  const navigate = useNavigate();
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const evmId = useEvmStore((state) => state.evmId);
  const setNumVoteCast = useEvmStore((state) => state.setNumVoteCast);

  const handleClick = async () => {
    if (![part1, part2, part3, part4].every(part => part && part.trim())) {
      toast.error("Please select all parts of your Voter ID");
      return;
    }

    setLoading(true);
    const voterId = `${part1.trim()}${part2.trim()}${part3.trim()}${part4.trim()}`;
    console.log("Voter ID:", voterId);

    try {
      const response = await GetStudentDetail(voterId);

      if (response) {
        const { biometric_left, biometric_right, imageUrl, name } = response.Data.voter;
        console.log(response?.Data);

        if (!biometric_left && !biometric_right) {
          toast.warning("No biometric data found. Please register first.");
        } else if (!biometric_left || !biometric_right) {
          toast.warning("Incomplete biometric data found. Continuing with available fingerprints.");
        } else {
          toast.success("Student details found. Please verify your fingerprint.");
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
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const verifyFingerprint = () => {
    if (!fingerprint.left && !fingerprint.right) {
      toast.error("No fingerprint data available to verify.");
      return;
    }

    setLoading(true);
    toast.loading("Verifying fingerprint...", { id: "fingerprint" });

    try {
      // Check if MatchFinger is available
      if (typeof window.MatchFinger !== "function") {
        toast.error("Fingerprint matcher is not available.");
        setLoading(false);
        return;
      }

      // Verify fingerprints
      let leftRes = { httpStaus: false };
      let rightRes = { httpStaus: false };

      if (fingerprint.left) {
        leftRes = window.MatchFinger(60, 10, fingerprint.left);
      }
      
      if (fingerprint.right) {
        rightRes = window.MatchFinger(60, 10, fingerprint.right);
      }

      const isLeftMatch = 
        leftRes.httpStaus && leftRes.data?.ErrorCode === "0" && leftRes.data.Status;
      const isRightMatch = 
        rightRes.httpStaus && rightRes.data?.ErrorCode === "0" && rightRes.data.Status;

      toast.dismiss("fingerprint");

      if (isLeftMatch) {
        toast.success("Left Fingerprint verified successfully!");
      }
      
      if (isRightMatch) {
        toast.success("Right Fingerprint verified successfully!");
      }
      
      if (isLeftMatch || isRightMatch) {
        toast.success("Fingerprint verification successful!");
        setFingerprintVerified(true);
        // Navigate to cast vote page after successful verification
        navigate("/cast-vote", { state: { data: voter } });
      } else {
        toast.error("Fingerprint verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during fingerprint verification:", error);
      toast.error("An error occurred during fingerprint verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">Voter Login</h2>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
        {/* Dropdown 1 */}
        <select 
          value={part1} 
          onChange={(e) => setPart1(e.target.value)} 
          className="border px-3 py-2 rounded"
          disabled={loading}
        >
          <option value="">Select Part 1</option>
          <option value="B">B</option>
          <option value="M">M</option>
          <option value="P">P</option>
        </select>

        {/* Dropdown 2 */}
        <select 
          value={part2} 
          onChange={(e) => setPart2(e.target.value)} 
          className="border px-3 py-2 rounded"
          disabled={loading}
        >
          <option value="">Select Part 2</option>
          <option value="20">20</option>
          <option value="21">21</option>
          <option value="22">22</option>
          <option value="23">23</option>
        </select>

        {/* Dropdown 3 */}
        <select 
          value={part3} 
          onChange={(e) => setPart3(e.target.value)} 
          className="border px-3 py-2 rounded"
          disabled={loading}
        >
          <option value="">Select Part 3</option>
          <option value="BB">BB</option>
          <option value="CS">CS</option>
          <option value="CH">CH</option>
        </select>

        {/* Dropdown 4 */}
        <select 
          value={part4} 
          onChange={(e) => setPart4(e.target.value)} 
          className="border px-3 py-2 rounded"
          disabled={loading}
        >
          <option value="">Select Part 4</option>
          <option value="80">80</option>
          <option value="81">81</option>
          <option value="82">82</option>
          <option value="83">83</option>
          <option value="84">84</option>
          <option value="85">85</option>
          <option value="86">86</option>
          <option value="87">87</option>
          <option value="88">88</option>
          <option value="89">89</option>
          <option value="90">90</option>
          <option value="95">95</option>
          <option value="96">96</option>
        </select>
      </div>

      <button
        onClick={handleClick}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        {loading ? "Loading..." : "Fetch Details"}
      </button>
     
      {fingerprint && (fingerprint.left || fingerprint.right) && (
        <div className="mt-4 w-full max-w-md">
          {voter?.Data?.voter?.name && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="font-medium">Name: {voter.Data.voter.name}</p>
              {voter.Data.voter.course && <p>Course: {voter.Data.voter.course}</p>}
              {voter.Data.voter.branch && <p>Branch: {voter.Data.voter.branch}</p>}
            </div>
          )}
          
          <button
            onClick={verifyFingerprint}
            className="w-full bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Fingerprint"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VoterLogin;