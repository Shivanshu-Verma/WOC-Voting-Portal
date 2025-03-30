import { useState } from "react";
import axios from "axios";

const CandidateVerification = () => {
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(false);

  // Verify Candidate
  const verifyCandidate = async () => {
    if (!candidateId) return alert("Please enter a candidate ID.");
    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/candidate/verify/${candidateId}`,
        { withCredentials: true }
      );

      if (res.data.Success) {
        alert("Candidate verification successful!");
      } else {
        alert("Candidate verification failed or candidate not found.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      alert("Error verifying candidate.");
    } finally {
      setLoading(false);
      setCandidateId("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Candidate Verification
        </h1>

        {/* Candidate ID Input */}
        <div className="flex mb-8 space-x-4">
          <input
            type="text"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            placeholder="Enter Candidate ID"
            className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={verifyCandidate}
            className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateVerification;
