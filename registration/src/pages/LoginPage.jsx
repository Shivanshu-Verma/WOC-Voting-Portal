import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEcStore, useStaffStore, useVolunteerStore } from "../store/zustand";

const LoginPage = () => {
  const [userType, setUserType] = useState(null); // 'staff', 'volunteer', 'commissioner'
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isoTemplate, setIsoTemplate] = useState(null);
  const [error, setError] = useState("");
  const [showFingerprintButton, setShowFingerprintButton] = useState(false);

  const navigate = useNavigate();

  // Zustand stores
  const { setEcId, setEcFingerprint } = useEcStore();
  const { setStaffId, setStaffFingerprint } = useStaffStore();
  const { setVolunteerId, setVolunteerFingerprint } = useVolunteerStore();

  // Reset form fields
  const resetForm = () => {
    setId("");
    setPassword("");
    setError("");
    setIsoTemplate(null);
    setShowFingerprintButton(false);
  };

  // Select user type (Staff, Volunteer, Commissioner)
  const selectUserType = (type) => {
    setUserType(type);
    resetForm(); // Clear all inputs and errors
  };

  // Handle ID and password input
  const handleChange = (setter) => (e) => setter(e.target.value);

  // Login and fetch ISO template
  const handleLogin = async () => {
    if (!id || !password) {
      setError("Please enter both ID and password.");
      return;
    }
  
    // Determine the endpoint based on userType
    const endpoint =
      userType === "volunteer"
        ? "/ec/login/volunteer"
        : "/ec/login/staff";
  
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
        id,
        password
      }, 
      { withCredentials: true });
  
      if (res.data.Success && res.data.Data?.biometric_left && res.data.Data?.biometric_right) {
        alert(`${userType} authenticated.`);
        localStorage.setItem("authToken", res.data.Data.token);
        setIsoTemplate({
          left: res.data.Data.biometric_left,
          right: res.data.Data.biometric_right,
        });
        setShowFingerprintButton(true);
      } else {
        console.log(res);
        setError("Invalid ID or password.");
      }
    } catch (err) {
      console.error("Login Error: ", err);
      setError("Error during login. Try again later.");
    }
  };
  

  // Capture and verify fingerprint
  const handleFingerprintVerification = () => {
    if (!isoTemplate || !isoTemplate.left || !isoTemplate.right) {
      alert("ISO template is missing.");
      return;
    }
  
    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint scanner function is not available.");
      return;
    }
  
    try {
      const leftRes = window.MatchFinger(60, 10, isoTemplate.left);
      const rightRes = window.MatchFinger(60, 10, isoTemplate.right);
  
      const isLeftMatch =
        leftRes.httpStaus && leftRes.data?.ErrorCode === "0" && leftRes.data.Status;
      const isRightMatch =
        rightRes.httpStaus && rightRes.data?.ErrorCode === "0" && rightRes.data.Status;

        if (isLeftMatch) {
          alert("Left Fingerprint verified successfully!");
        }
    
        if (isRightMatch) {
          alert("Right Fingerprint verified successfully!");
        }
  
      if (isLeftMatch || isRightMatch) {
        alert("Fingerprint verified successfully!");
  
        // Store authenticated user's ID in the appropriate Zustand store
        if (userType === "staff") {
          setStaffId(id);
          setStaffFingerprint(isLeftMatch ? isoTemplate.left : isoTemplate.right);
        } else if (userType === "volunteer") {
          setVolunteerId(id);
          setVolunteerFingerprint(isLeftMatch ? isoTemplate.left : isoTemplate.right);
        } else if (userType === "commissioner") {
          setEcId(id);
          setEcFingerprint(isLeftMatch ? isoTemplate.left : isoTemplate.right);
        }
        console.log("ID: ", id);
        navigate("/dashboard");
      } else {
        alert(`Fingerprint not verified.`);
      }
    } catch (error) {
      console.error("Fingerprint Verification Error: ", error);
      alert("Error during fingerprint verification.");
    }
  };  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Login Page</h1>

      {!userType ? (
        <div className="space-x-8 flex">
          <button
            onClick={() => selectUserType("staff")}
            className="py-3 px-6 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Staff Login
          </button>

          <button
            onClick={() => selectUserType("volunteer")}
            className="py-3 px-6 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Volunteer Login
          </button>

          <button
            onClick={() => selectUserType("commissioner")}
            className="py-3 px-6 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Election Commissioner Login
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <h2 className="text-2xl font-semibold mb-6 capitalize">
            {userType} Login
          </h2>

          {/* ID Input */}
          <label className="block mb-4">
            <span className="text-gray-700">ID:</span>
            <input
              type="text"
              value={id}
              onChange={handleChange(setId)}
              className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* Password Input */}
          <label className="block mb-6">
            <span className="text-gray-700">Password:</span>
            <input
              type="password"
              value={password}
              onChange={handleChange(setPassword)}
              className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* Error Message */}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </button>

          {/* Capture & Verify Fingerprint Button */}
          {showFingerprintButton && (
            <button
              type="button"
              onClick={handleFingerprintVerification}
              className="w-full mt-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Capture & Verify Fingerprint
            </button>
          )}

          {/* Back Button */}
          <button
            type="button"
            onClick={() => selectUserType(null)}
            className="w-full mt-4 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
