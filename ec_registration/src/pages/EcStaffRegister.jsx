import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const EcStaffRegister = () => {
  const [staffId, setStaffId] = useState("");
  const [leftFingerprint, setLeftFingerprint] = useState(null);
  const [rightFingerprint, setRightFingerprint] = useState(null);
  const [leftCaptureStatus, setLeftCaptureStatus] = useState("Left Fingerprint Not Captured");
  const [rightCaptureStatus, setRightCaptureStatus] = useState("Right Fingerprint Not Captured");

  const navigate = useNavigate();

  // Handle staff ID input change
  const handleChange = (e) => {
    setStaffId(e.target.value);
  };

  // Fingerprint capture function
  const captureFingerprint = (finger) => {
    if (typeof window.CaptureFinger !== "function") {
      alert("Fingerprint scanner function is not available.");
      return;
    }

    const quality = 60; // Fingerprint quality (40-90)
    const timeout = 10; // Timeout in seconds

    try {
      const res = window.CaptureFinger(quality, timeout);
      console.log(`CaptureFinger Response (${finger}):`, res);

      if (!res || !res.httpStaus) {
        alert("Error: No response from fingerprint scanner.");
        return;
      }

      if (res.data.ErrorCode !== "0") {
        alert(`Capture error: ${res.data.ErrorDescription || "Unknown error"}`);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!staffId) {
      alert("Please enter Staff ID.");
      return;
    }
    if (!leftFingerprint || !rightFingerprint) {
      alert("Please capture both left and right fingerprints.");
      return;
    }
  
    // Send staff ID and fingerprints to server
    const formData = new FormData();
    formData.append("staffId", staffId);
    formData.append("leftFingerprint", leftFingerprint);
    formData.append("rightFingerprint", rightFingerprint);
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/abcd`, formData);
      console.log("Registration Response: ", response.data);
  
      alert(`Staff ID: ${staffId} registered successfully!`);
  
      // Reset the form fields and states
      setStaffId("");
      setLeftFingerprint(null);
      setRightFingerprint(null);
      setLeftCaptureStatus("Left Fingerprint Not Captured");
      setRightCaptureStatus("Right Fingerprint Not Captured");
    } catch (error) {
      console.error("Registration Error: ", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">EC Staff Registration</h1>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Staff ID Input */}
        <input
          type="text"
          placeholder="Staff ID"
          name="staffId"
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
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Register Staff
        </button>
      </form>

      {/* Fingerprint Preview Section */}
      <div className="flex mt-8 space-x-12">
        {/* Left Fingerprint Preview */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Left Fingerprint Preview</h2>
          {leftFingerprint ? (
            <img
              src={leftFingerprint}
              alt="Left Fingerprint"
              className="w-48 h-48 border rounded"
            />
          ) : (
            <div className="w-48 h-48 border rounded bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <p className={`mt-2 ${leftFingerprint ? "text-green-600" : "text-red-600"}`}>
            {leftCaptureStatus}
          </p>
        </div>

        {/* Right Fingerprint Preview */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Right Fingerprint Preview</h2>
          {rightFingerprint ? (
            <img
              src={rightFingerprint}
              alt="Right Fingerprint"
              className="w-48 h-48 border rounded"
            />
          ) : (
            <div className="w-48 h-48 border rounded bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <p className={`mt-2 ${rightFingerprint ? "text-green-600" : "text-red-600"}`}>
            {rightCaptureStatus}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EcStaffRegister;
