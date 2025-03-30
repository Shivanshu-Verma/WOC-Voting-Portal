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

      if (res.data.Success && res.data.Data) {
        console.log("Voter data:", res.data.Data);
        setVoter(res.data.Data.voter);
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

    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint scanner not available.");
      return;
    }

    const storedFingerprint =
      localStorage.getItem("ecFingerprint") ||
      localStorage.getItem("staffFingerprint");
    const verifierId =
      localStorage.getItem("ecId") || localStorage.getItem("staffId");

    if (!storedFingerprint || !verifierId) {
      alert("Verifier data missing in local storage.");
      return;
    }

    try {
      const res = await window.MatchFinger(60, 10, storedFingerprint);

      if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
        alert("Fingerprint matched successfully!");

        // Send verification request
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/voter/verify-voter`,
          { id: voterId, verifiedByStaff: verifierId },
          { withCredentials: true }
        );

        alert("Voter verified successfully!");
        setVoter(null); // Clear voter data after verification
        setVoterId(""); // Clear input field
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
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Voter Verification
        </h1>

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
          <div className="border rounded-lg p-8 mb-8 bg-gray-50 shadow-md">
            {/* Voter Info Section - Centered */}
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Voter Information
                </h2>
                <p className="mt-2 text-lg">
                  <strong>Voter ID:</strong> {voterId}
                </p>
                <p className="text-lg">
                  <strong>Name:</strong> {voter.name}
                </p>
              </div>

              {/* Captured Image - Right Aligned & Larger */}
              {voter.imageUrl && (
                <div className="text-center ml-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Captured Image
                  </h3>
                  <img
                    src={voter.imageUrl}
                    alt="Captured"
                    className="w-48 h-48 object-cover rounded-xl border shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Fingerprints Section - Below */}
            <div className="flex justify-center gap-12 mt-6">
              {/* Left Fingerprint */}
              {voter.biometric?.left && (
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Left Fingerprint
                  </h3>
                  <img
                    src={`data:image/png;base64,${voter.biometric.left}`}
                    alt="Left Fingerprint"
                    className="w-32 h-32 object-cover rounded-lg border shadow"
                  />
                </div>
              )}

              {/* Right Fingerprint */}
              {voter.biometric?.right && (
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Right Fingerprint
                  </h3>
                  <img
                    src={`data:image/png;base64,${voter.biometric.right}`}
                    alt="Right Fingerprint"
                    className="w-32 h-32 object-cover rounded-lg border shadow"
                  />
                </div>
              )}
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
