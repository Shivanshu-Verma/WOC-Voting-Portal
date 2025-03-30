import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterVolunteer = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [rightFingerprint, setRightFingerprint] = useState(null);
  const [leftFingerprint, setLeftFingerprint] = useState(null);
  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Reset Form
  const resetForm = () => {
    setId("");
    setPassword("");
    setContact("");
    setName("");
    setRightFingerprint(null);
    setLeftFingerprint(null);
    setError("");
  };

  // Capture Fingerprint Helper
  const captureFingerprint = (setFinger, setPreview) => {
    if (typeof window.CaptureFinger !== "function") {
      alert("Fingerprint scanner is not available.");
      return;
    }

    try {
      const res = window.CaptureFinger(60, 10);
      if (res.httpStaus && res.data?.ErrorCode === "0") {
        setFinger(res.data.IsoTemplate);
        setPreview(`data:image/png;base64,${res.data.BitmapData}`);
        alert("Fingerprint captured successfully.");
      } else {
        alert(`Error capturing fingerprint: ${res.data?.ErrorDescription}`);
      }
    } catch (error) {
      console.error("Fingerprint Capture Error: ", error);
      alert("Error capturing fingerprint.");
    }
  };

  const verifyFingerprint = async () => {
    const ecFingerprint = localStorage.getItem("ecFingerprint");
    const staffFingerprint = localStorage.getItem("staffFingerprint");
  
    // Ensure fingerprint is available
    if (!ecFingerprint && !staffFingerprint) {
      alert("Verifier fingerprint template is missing. Please log in again.");
      return false;
    }
  
    // Ensure MatchFinger function exists
    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint matcher is not available.");
      return false;
    }
  
    try {
      // Match against commissioner or staff fingerprint
      const storedFingerprint = ecFingerprint || staffFingerprint;
      const res = window.MatchFinger(60, 10, storedFingerprint);
  
      if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
        alert("Fingerprint verified successfully.");
        return true; // Fingerprint matched
      } else {
        alert(`Fingerprint mismatch: ${res.data?.ErrorDescription}`);
        return false; // Mismatch
      }
    } catch (error) {
      console.error("Fingerprint Verification Error: ", error);
      alert("Error verifying fingerprint.");
      return false; // Error during verification
    }
  };
  

  // Handle Registration
  const handleRegister = async () => {
    const verifiedBy = localStorage.getItem("staffId") || localStorage.getItem("ecId");
  
    if (!verifiedBy) {
      setError("Verifier information is missing. Please log in again.");
      return;
    }
  
    if (!id || !password || !contact || !name || !rightFingerprint || !leftFingerprint) {
      setError("Please fill all fields and capture fingerprints.");
      return;
    }
  
    try {
      // Step 1: Verify the verifier’s fingerprint (staff or commissioner)
      const isFingerprintValid = await verifyFingerprint();
      if (!isFingerprintValid) {
        setError("Fingerprint verification failed. Access denied.");
        return;
      }
  
      setLoading(true);
  
      // Step 2: Proceed with volunteer registration
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/ec/register/volunteer`,
        {
          id,
          name,
          password,
          contact,
          biometric: {
            right: rightFingerprint,
            left: leftFingerprint,
          },
          verifiedByStaff: verifiedBy,
        }
      );
  
      if (res.data?.Success) {
        alert(res.data.Data?.message || "Volunteer registered successfully.");
        resetForm();
      } else {
        setError(res.data?.Error?.Message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration Error: ", error);
      setError("Error during registration. Try again later.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Register Volunteer
        </h1>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Volunteer ID */}
          <label className="flex flex-col">
            <span className="text-gray-700 mb-2">Volunteer ID:</span>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* Password */}
          <label className="flex flex-col">
            <span className="text-gray-700 mb-2">Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* Contact */}
          <label className="flex flex-col">
            <span className="text-gray-700 mb-2">Contact:</span>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* Name */}
          <label className="flex flex-col">
            <span className="text-gray-700 mb-2">Name:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>

        {/* Fingerprint Capture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Right Fingerprint */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() =>
                captureFingerprint(setRightFingerprint, setRightPreview)
              }
              className="flex-1 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Capture Right Fingerprint
            </button>
            <div className="w-40 h-40 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
              {rightFingerprint ? (
                <img
                  src={rightPreview}
                  alt="Right Fingerprint"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">No Image</span>
              )}
            </div>
          </div>

          {/* Left Fingerprint */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() =>
                captureFingerprint(setLeftFingerprint, setLeftPreview)
              }
              className="flex-1 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Capture Left Fingerprint
            </button>
            <div className="w-40 h-40 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
              {leftFingerprint ? (
                <img
                  src={leftPreview}
                  alt="Left Fingerprint"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">No Image</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        {/* Submit and Back Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className={`flex-1 py-3 ${
              loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            } text-white rounded transition text-center`}
          >
            {loading ? "Registering..." : "Register Volunteer"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterVolunteer;
