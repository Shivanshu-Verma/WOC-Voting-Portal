import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEcStore } from "../store/zustand";
import axios from "axios";

const LoginPage = () => {
  const [ecId, setEcId] = useState("");
  const [password, setPassword] = useState("");
  const [ISOTemplate, setISOTemplate] = useState(null);
  const [matchStatus, setMatchStatus] = useState("");
  const [showCaptureButton, setShowCaptureButton] = useState(false);

  const navigate = useNavigate();
  const setEcIdInStore = useEcStore((state) => state.setEcId);

  // Capture and verify fingerprint
  const captureFingerprint = () => {
    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint scanner function is not available.");
      return;
    }

    const quality = 60; // Fingerprint quality level (40-90 recommended)
    const timeout = 10; // Capture timeout in seconds

    try {

      const res = window.MatchFinger(quality, timeout, ISOTemplate);
      console.log("MatchFinger Response: ", res);

      if (!res || !res.httpStaus) {
        alert("Error: No response from fingerprint scanner.");
        return;
      }

      if (res.data.ErrorCode !== "0") {
        alert(`Fingerprint capture error: ${res.data.ErrorDescription || "Unknown error"}`);
        return;
      }

      if (res.data.Status === true) {
        setMatchStatus("Fingerprint verified successfully!");
        alert("Fingerprint verification successful!");
        setEcIdInStore(ecId);
        navigate("/dashboard");
      } else {
        setMatchStatus("Fingerprint verification failed.");
        alert("Fingerprint verification failed. Please try again.");
      }
    } catch (error) {
      alert("Fingerprint capture failed: " + error.message);
    }
  };

  // Handle login form submission
  const handleLogin =  (e) => {
    e.preventDefault();

    const trimmedEcId = ecId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEcId || !trimmedPassword) {
      alert("Please enter valid credentials.");
      return;
    }

    setISOTemplate("Rk1SACAyMAAAAADwAAABPAFiAMUAxQEAAAAoI0BlANoEAEA7ALOQAEBxAJH6AEAiAPSmAIBuARiwAEAMAJQOAIBbAF59AEB9AEx1AICCAUjKAEB0ADj4AEA8ACp7AEEGAGjnAEBPAOScAECLALR9AECYAKn6AEAaAOefAECuAKZ7AEAvASa4AIB1AS8UAECLAUXUAEAbAT69AEA7AVRBAEASACyDAIC4ABNvAECAANeEAIBwAPicAEBEAISJAEBiARYYAIBUASa9AEA8AS69AICpASdrAEAPAS+0AEBIAVHIAECIADV5AEBdAAttAAAA");
    setShowCaptureButton(true);

    // try {
    //   const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/abcd`, {
    //     ecId: trimmedEcId,
    //     password: trimmedPassword,
    //   });

    //   console.log("Login Response: ", response.data);

    //   if (response.data.success) {
    //     setISOTemplate(response.data.ISOTemplate);
    //     setShowCaptureButton(true);
    //   } else {
    //     alert("Invalid credentials.");
    //   }
    // } catch (error) {
    //   console.error("Login Error: ", error);
    //   alert("Login failed. Please try again.");
    // }
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Login</h1>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <input
          type="text"
          placeholder="Username"
          value={ecId}
          onChange={(e) => setEcId(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
      </form>

      {/* Capture & Verify Button (Shown after successful login) */}
      {showCaptureButton && (
        <div className="mt-4 w-full max-w-md">
          <button
            type="button"
            onClick={captureFingerprint}
            className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            Capture & Verify Fingerprint
          </button>
        </div>
      )}

      {/* Match Status Message */}
      {matchStatus && (
        <p
          className={`mt-4 text-lg font-semibold ${
            matchStatus.includes("failed") ? "text-red-600" : "text-green-600"
          }`}
        >
          {matchStatus}
        </p>
      )}
    </div>
  );
};

export default LoginPage;
