import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EcStaffRegister = () => {
  const [staffId, setStaffId] = useState("");
  const [leftFingerprint, setLeftFingerprint] = useState(null);
  const [rightFingerprint, setRightFingerprint] = useState(null);
  const [leftCaptureStatus, setLeftCaptureStatus] = useState("Left Fingerprint Not Captured");
  const [rightCaptureStatus, setRightCaptureStatus] = useState("Right Fingerprint Not Captured");
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);

  const navigate = useNavigate();

  // Handle staff ID input
  const handleChange = (e) => {
    setStaffId(e.target.value);
  };

  // Capture fingerprint using MFS100
  const captureFingerprint = (finger) => {
    if (typeof window.CaptureFinger !== "function") {
      alert("Fingerprint scanner function is not available.");
      return;
    }

    try {
      const res = window.CaptureFinger(60, 10); // Quality 60, Timeout 10 seconds
      if (!res || !res.httpStaus) {
        alert("Error: No response from fingerprint scanner.");
        return;
      }

      if (res.data?.ErrorCode !== "0") {
        alert(`Capture error: ${res.data?.ErrorDescription || "Unknown error"}`);
        return;
      }

      if (finger === "left") {
        setLeftFingerprint(`data:image/bmp;base64,${res.data.BitmapData}`);
        setLeftCaptureStatus("Left fingerprint captured successfully!");
      } else if (finger === "right") {
        setRightFingerprint(`data:image/bmp;base64,${res.data.BitmapData}`);
        setRightCaptureStatus("Right fingerprint captured successfully!");
      }
    } catch (error) {
      console.error("Capture Error: ", error);
      alert(`Fingerprint capture failed: ${error.message}`);
    }
  };

  // Match fingerprint against EC stored ISO template
  const matchFingerprint = () => {
    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint matching function is not available.");
      return false;
    }

    // Retrieve the EC ISO template from localStorage
    const isoTemplate = "Rk1SACAyMAAAAADwAAABPAFiAMUAxQEAAAAoI0BlANoEAEA7ALOQAEBxAJH6AEAiAPSmAIBuARiwAEAMAJQOAIBbAF59AEB9AEx1AICCAUjKAEB0ADj4AEA8ACp7AEEGAGjnAEBPAOScAECLALR9AECYAKn6AEAaAOefAECuAKZ7AEAvASa4AIB1AS8UAECLAUXUAEAbAT69AEA7AVRBAEASACyDAIC4ABNvAECAANeEAIBwAPicAEBEAISJAEBiARYYAIBUASa9AEA8AS69AICpASdrAEAPAS+0AEBIAVHIAECIADV5AEBdAAttAAAA";
    if (!isoTemplate) {
      alert("No EC fingerprint template found in localStorage.");
      return false;
    }

    try {
      const res = window.MatchFinger(60, 10, isoTemplate); // Capture and compare
      console.log("MatchFinger Response: ", res);

      if (res?.httpStaus && res.data?.ErrorCode === "0" && res.data?.Status) {
        alert("Fingerprint verified successfully!");
        setIsVerified(true);
        return true; // Matched successfully
      }

      alert(`Fingerprint mismatch: ${res.data?.ErrorDescription || "Unknown error"}`);
      return false; // No match
    } catch (error) {
      console.error("Match Error: ", error);
      alert(`Fingerprint verification failed: ${error.message}`);
      return false; // Handle errors
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!staffId) {
      alert("Please enter Staff ID.");
      return;
    }
    if (!leftFingerprint || !rightFingerprint) {
      alert("Please capture both left and right fingerprints.");
      return;
    }

    if (!matchFingerprint()) return; // Verify fingerprint before registration

    const formData = new FormData();
    formData.append("staffId", staffId);
    formData.append("leftFingerprint", leftFingerprint);
    formData.append("rightFingerprint", rightFingerprint);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/abcd`, formData);
      alert(`Staff ID: ${staffId} registered successfully!`);
      setShowVerifyButton(true);
    } catch (error) {
      console.error("Registration Error: ", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">EC Staff Registration</h1>

      {/* Registration Form */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Staff ID Input */}
        <input
          type="text"
          placeholder="Staff ID"
          value={staffId}
          onChange={handleChange}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Capture Buttons */}
        <div className="flex justify-between mb-4">
          <button
            type="button"
            onClick={() => captureFingerprint("left")}
            className="py-3 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            Capture Left Fingerprint
          </button>

          <button
            type="button"
            onClick={() => captureFingerprint("right")}
            className="py-3 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            Capture Right Fingerprint
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Register Staff
        </button>
      </form>

      {/* Fingerprint Preview */}
      <div className="flex mt-8 space-x-12">
        <FingerprintPreview title="Left Fingerprint Preview" image={leftFingerprint} status={leftCaptureStatus} />
        <FingerprintPreview title="Right Fingerprint Preview" image={rightFingerprint} status={rightCaptureStatus} />
      </div>
    </div>
  );
};

// Fingerprint Preview Component
const FingerprintPreview = ({ title, image, status }) => (
  <div className="text-center">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {image ? (
      <img src={image} alt={title} className="w-48 h-48 border rounded" />
    ) : (
      <div className="w-48 h-48 border rounded bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No Image</span>
      </div>
    )}
    <p className={`mt-2 ${image ? "text-green-600" : "text-red-600"}`}>{status}</p>
  </div>
);

export default EcStaffRegister;
