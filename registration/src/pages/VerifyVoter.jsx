import { useState } from "react";
import axios from "axios";

const VoterVerification = () => {
  const [voterId, setVoterId] = useState("");
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Voter Details
  const fetchVoter = async () => {
    if (!voterId) return alert("Please enter a voter ID.");
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/voter/get/${voterId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setVoter(res.data.voter);
      } else {
        alert("Voter not found.");
      }
    } catch (err) {
      console.error("Error fetching voter:", err);
      alert("Error fetching voter.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Voter via Fingerprint
  const verifyVoter = async () => {
    if (!voter) return alert("No voter to verify.");

    // Check for MatchFinger function
    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint scanner not available.");
      return;
    }

    // Get stored fingerprint & verifier ID (staff/volunteer) from localStorage
    const storedFingerprint = localStorage.getItem("ecFingerprint") || localStorage.getItem("staffFingerprint");
    const verifierId = localStorage.getItem("ecId") || localStorage.getItem("staffId");

    if (!storedFingerprint || !verifierId) {
      alert("Verifier data missing in local storage.");
      return;
    }

    try {
      // Match fingerprint using MatchFinger function
      const res = window.MatchFinger(60, 10, storedFingerprint);

      if (res.httpStaus && res.data?.Status) {
        alert("Fingerprint matched successfully!");

        // Send verification request
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/voter/verify-voter`,
          { voterId: voter.voterId, verifierId },
          { withCredentials: true }
        );

        alert("Voter verified successfully!");
      } else {
        alert("Fingerprint mismatch.");
      }
    } catch (error) {
      console.error("Fingerprint Matching Error:", error);
      alert("Error during fingerprint matching.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Voter Verification</h1>

        {/* Search Voter */}
        <div className="flex mb-8 space-x-4">
          <input
            type="text"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            placeholder="Enter Voter ID"
            className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchVoter}
            className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Display Voter Info */}
        {voter && (
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Voter Information</h2>
            <p className="mb-2"><strong>Voter ID:</strong> {voter.voterId}</p>
            <p className="mb-4"><strong>Name:</strong> {voter.name}</p>

            <div className="grid grid-cols-3 gap-4">
              {/* Left Fingerprint */}
              <div className="text-center">
                <h3 className="font-semibold mb-2">Left Fingerprint</h3>
                <img
                  src={`data:image/png;base64,${voter.biometric.left}`}
                  alt="Left Fingerprint"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>

              {/* Right Fingerprint */}
              <div className="text-center">
                <h3 className="font-semibold mb-2">Right Fingerprint</h3>
                <img
                  src={`data:image/png;base64,${voter.biometric.right}`}
                  alt="Right Fingerprint"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>

              {/* Captured Image */}
              <div className="text-center">
                <h3 className="font-semibold mb-2">Captured Image</h3>
                <img
                  src={voter.image}
                  alt="Captured"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            </div>
          </div>
        )}

        {/* Verify Button */}
        {voter && (
          <button
            onClick={verifyVoter}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Verify Voter
          </button>
        )}
      </div>
    </div>
  );
};

export default VoterVerification;
