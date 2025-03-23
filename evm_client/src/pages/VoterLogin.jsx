import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const VoterLogin = () => {
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");
  const [part4, setPart4] = useState("");

  const [fingerprint, setFingerprint] = useState(null);
  const { GetStudentDetail } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!part1 || !part2 || !part3 || !part4) {
      toast.error("Please select all parts of your Voter ID");
      return;
    }

    const voterId = `${part1}${part2}${part3}${part4}`;
    setFingerprint("temp");

    // const response = await GetStudentDetail(voterId);
    // if (response?.fingerprint) {
    //   setFingerprint(response.fingerprint);
    // }
  };

  const verifyFingerprint = () => {
    navigate("/cast-vote");
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">Voter Login</h2>


      <div className="flex space-x-2 mt-4">
        {/* Dropdown 1 */}
        <select value={part1} onChange={(e) => setPart1(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 1</option>
          <option value="AB12">B</option>
          <option value="XY34">M</option>
          <option value="MN56">P</option>
        </select>

        {/* Dropdown 2 */}
        <select value={part2} onChange={(e) => setPart2(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 2</option>
          <option value="5678">20</option>
          <option value="1234">21</option>
          <option value="8765">22</option>
          <option value="8765">23</option>
          <option value="8765">24</option>
        </select>

        {/* Dropdown 3 */}
        <select value={part3} onChange={(e) => setPart3(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 3</option>
          <option value="X1">BB</option>
          <option value="Y2">CS</option>
          <option value="Z3">CH</option>
        </select>

        {/* Dropdown 4 */}
        <select value={part4} onChange={(e) => setPart4(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Select Part 4</option>
          <option value="90">90</option>
          <option value="87">87</option>
          <option value="65">65</option>
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
