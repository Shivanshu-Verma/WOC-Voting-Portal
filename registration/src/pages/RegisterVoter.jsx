import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VoterRegistration = () => {
  const [voterId, setVoterId] = useState("");
  const [name, setName] = useState("");
  const [leftFingerprint, setLeftFingerprint] = useState(null);
  const [rightFingerprint, setRightFingerprint] = useState(null);
  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  // Access External Camera
  useEffect(() => {
    const openExternalCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const externalCamera = devices.find(
          (device) =>
            device.kind === "videoinput" &&
            device.label.toLowerCase().includes("fhd")
        );

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: externalCamera?.deviceId || undefined },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Error accessing external camera.");
        console.error(err);
      }
    };

    openExternalCamera();
  }, []);

  // Capture Image from Video Feed
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current)
      return alert("Camera not ready.");
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    canvas.toBlob((blob) => {
      if (!blob) return alert("Failed to capture image.");
  
      const file = new File([blob], "captured_image.png", { type: "image/png" });
  
      setImagePreview(URL.createObjectURL(blob)); // Display preview
      setImageFile(file); // Save image file for upload
  
      console.log("Captured image file:", file); // Debugging
      alert("Image captured successfully.");
    }, "image/png");
  };
  

  // Capture Fingerprint (Left/Right)
  const captureFingerprint = (setFinger, setPreview) => {
    if (typeof window.CaptureFinger !== "function") {
      alert("Fingerprint scanner not available.");
      return;
    }

    try {
      const res = window.CaptureFinger(60, 10);
      if (res.httpStaus && res.data?.ErrorCode === "0") {
        setFinger(res.data.IsoTemplate);
        setPreview(`data:image/png;base64,${res.data.BitmapData}`);
        alert("Fingerprint captured successfully.");
      } else {
        alert(`Fingerprint capture error: ${res.data?.ErrorDescription}`);
      }
    } catch (error) {
      console.error("Fingerprint Capture Error: ", error);
      alert("Error capturing fingerprint.");
    }
  };

  const verifyVolunteerFingerprint = async () => {
    const volunteerFingerprint = localStorage.getItem("volunteerFingerprint");
    if (!volunteerFingerprint) {
      alert("Volunteer fingerprint template is missing. Please log in again.");
      localStorage.clear();
      navigate("/");
      return false;
    }

    if (typeof window.MatchFinger !== "function") {
      alert("Fingerprint matcher is not available.");
      return false;
    }

    try {
      const res = window.MatchFinger(60, 10, volunteerFingerprint);
      if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
        alert("Volunteer fingerprint verified successfully.");
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

  const handleRegister = async () => {
    if (!voterId || !name || !leftFingerprint || !rightFingerprint || !imageFile) {
      alert("Please complete all fields.");
      return;
    }
  
    const isVerified = await verifyVolunteerFingerprint();
    if (!isVerified) {
      alert("Volunteer verification failed. Registration aborted.");
      return;
    }
  
    const volunteerId = localStorage.getItem("volunteerId");
    if (!volunteerId) {
      alert("Volunteer ID is missing. Please log in again.");
      localStorage.clear();
      navigate("/");
      return;
    }
  
    // Prepare request payload as an object
    const formData = new FormData();
    formData.append("voterId", voterId);
    formData.append("name", name);
    formData.append("verifiedByVolunteer", volunteerId);
    formData.append("image", imageFile);
  
    // Instead of appending as JSON, send biometric as an object
    const requestData = {
      voterId,
      name,
      image: imageFile,
      biometric: { left: leftFingerprint, right: rightFingerprint },
      verifiedByVolunteer: volunteerId,
    };

    console.log("Request Data: ", requestData); // Debugging
  
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/voter/register`,
        requestData,  // Send as an object instead of FormData
        { withCredentials: true }
      );
  
      if (res.data?.Success) {
        alert("Voter registered successfully.");
      } else {
        alert("Registration failed.");
      }
    } catch (error) {
      console.error("Registration Error: ", error);
      alert("Error during registration.");
    }
  };  
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Voter Registration
        </h1>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <label className="flex flex-col">
            <span className="font-semibold mb-2">Voter ID:</span>
            <input
              type="text"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold mb-2">Name:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>

        {/* Capture Buttons */}
        <div className="flex justify-between mb-6">
          <button
            type="button"
            onClick={() =>
              captureFingerprint(setLeftFingerprint, setLeftPreview)
            }
            className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Capture Left Fingerprint
          </button>

          <button
            type="button"
            onClick={() =>
              captureFingerprint(setRightFingerprint, setRightPreview)
            }
            className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Capture Right Fingerprint
          </button>

          <button
            type="button"
            onClick={captureImage}
            className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Capture Image
          </button>
        </div>

        {/* Preview Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Left Fingerprint</h2>
            {leftPreview ? (
              <img
                src={leftPreview}
                className="w-32 h-32 object-cover rounded"
                alt="Left Fingerprint"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded" />
            )}
          </div>

          <div className="flex flex-col items-center border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Right Fingerprint</h2>
            {rightPreview ? (
              <img
                src={rightPreview}
                className="w-32 h-32 object-cover rounded"
                alt="Right Fingerprint"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded" />
            )}
          </div>

          <div className="flex flex-col items-center border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Image Captured</h2>
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-32 h-32 object-cover rounded"
                alt="Captured Image"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                className="w-32 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Register Button */}
        <div className="flex gap-4">
          <button
            onClick={handleRegister}
            className="w-full py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
          >
            Register Voter
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800"
          >
            Back to Dashoard
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoterRegistration;
