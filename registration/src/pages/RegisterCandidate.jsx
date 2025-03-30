import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { POSITIONS } from "../assets/constants.js";

const RegisterCandidate = () => {
  const [candidate, setCandidate] = useState({
    id: "",
    name: "",
    contact: "",
    verifiedByVolunteer: "",
    position: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Open external camera
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

  // Handle input change
  const handleChange = (e) => {
    setCandidate({ ...candidate, [e.target.name]: e.target.value });
  };

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

      const file = new File([blob], "candidate_image.png", { type: "image/png" });

      setImagePreview(URL.createObjectURL(blob)); // Display preview
      setImageFile(file); // Save image file for upload

      console.log("Captured image file:", file); // Debugging
      alert("Image captured successfully.");
    }, "image/png");
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
        return true;
      } else {
        alert(`Fingerprint mismatch: ${res.data?.ErrorDescription}`);
        return false;
      }
    } catch (error) {
      console.error("Fingerprint Verification Error: ", error);
      alert("Error verifying fingerprint.");
      return false;
    }
  };

  const handleRegister = async () => {
    if (!candidate.id || !candidate.name || !candidate.contact || !candidate.position || !imageFile) {
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

    const formData = new FormData();
    formData.append("id", candidate.id);
    formData.append("name", candidate.name);
    formData.append("contact", candidate.contact);
    formData.append("verifiedByVolunteer", volunteerId);
    formData.append("position", candidate.position);
    formData.append("image", imageFile);

    console.log("Request Data: ", imageFile); // Debugging

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/candidate/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data?.Success) {
        alert("Candidate registered successfully.");
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
          Register Candidate
        </h1>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <label className="flex flex-col">
            <span className="font-semibold mb-2">ID:</span>
            <input
              type="text"
              name="id"
              value={candidate.id}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold mb-2">Name:</span>
            <input
              type="text"
              name="name"
              value={candidate.name}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold mb-2">Contact:</span>
            <input
              type="text"
              name="contact"
              value={candidate.contact}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold mb-2">Position:</span>
            <select
              name="position"
              value={candidate.position}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Position</option>
              {Object.entries(POSITIONS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Capture Image */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={captureImage}
            className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Capture Image
          </button>
        </div>

        {/* Preview Image */}
        <div className="flex justify-center mb-8">
          {imagePreview ? (
            <img src={imagePreview} className="w-32 h-32 object-cover rounded" alt="Captured Image" />
          ) : (
            <video ref={videoRef} autoPlay className="w-32 h-32 object-cover rounded" />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="w-full py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
        >
          Register Candidate
        </button>
      </div>
    </div>
  );
};

export default RegisterCandidate;
