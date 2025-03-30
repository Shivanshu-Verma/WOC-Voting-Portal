import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffStore, useVolunteerStore } from "../store/zustand";
import axios from "axios";

const VerificationPage = () => {
    const [role, setRole] = useState(null); // "staff" or "volunteer"
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const setStaffIdInStore = useStaffStore((state) => state.setStaffId);
    const setVolunteerIdInStore = useVolunteerStore((state) => state.setVolunteerId);

    // Helper: Capture Fingerprint using MFS100
    const captureFingerprint = async () => {
        if (typeof window.CaptureFinger !== "function") {
            alert("Fingerprint scanner not detected.");
            return null;
        }

        try {
            const res = window.CaptureFinger(60, 10); // Quality: 60, Timeout: 10s
            if (res.httpStaus && res.data?.ErrorCode === "0") {
                return res.data.ISOTemplate; // Successfully captured
            }
            alert(`Capture Error: ${res.data?.ErrorDescription}`);
            return null;
        } catch (err) {
            alert("Error during fingerprint capture.");
            console.error(err);
            return null;
        }
    };

    // Helper: Match Fingerprint using MFS100
    const matchFingerprint = async (isoTemplate) => {
        if (typeof window.MatchFinger !== "function") {
            alert("Fingerprint scanner not detected.");
            return false;
        }

        try {
            const res = window.MatchFinger(60, 10, isoTemplate);
            if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
                return true; // Fingerprint matched successfully
            }
            alert(`Fingerprint mismatch: ${res.data?.ErrorDescription}`);
            return false; // Mismatch
        } catch (err) {
            alert("Error during fingerprint matching.");
            console.error(err);
            return false;
        }
    };

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!id || !password) return alert("Please enter ID and Password.");

        try {
            setIsVerifying(true);

            // 1. Fetch ISO Template from backend
            const { data } = await axios.post("/api/get-template", { id, password, role });
            if (!data.success || !data.isoTemplate) {
                alert("Invalid ID, password, or no ISO template found.");
                setIsVerifying(false);
                return;
            }

            // 2. Capture Fingerprint
            const capturedFinger = await captureFingerprint();
            if (!capturedFinger) {
                setIsVerifying(false);
                return;
            }

            // 3. Match Fingerprint
            const isMatched = await matchFingerprint(data.isoTemplate);
            if (isMatched) {
                alert(`${role === "staff" ? "Staff" : "Volunteer"} verified successfully!`);
                if (role === "staff") setStaffIdInStore(id);
                else if (role === "volunteer") setVolunteerIdInStore(id);
                navigate("/dashboard"); // Redirect to dashboard after successful login
            } else {
                alert("Fingerprint verification failed.");
            }
        } catch (err) {
            alert("Error during login.");
            console.error(err);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-8">Verify Yourself</h1>

            {/* Step 1: Choose Role */}
            {!role && (
                <div className="space-x-6">
                    <button
                        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setRole("volunteer")}
                    >
                        Volunteer Login
                    </button>
                    <button
                        className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => setRole("staff")}
                    >
                        Staff Login
                    </button>
                </div>
            )}

            {/* Step 2: ID and Password Form */}
            {role && (
                <form onSubmit={handleLogin} className="mt-8 bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-xl mb-6">
                        {role === "staff" ? "Staff" : "Volunteer"} Login
                    </h2>

                    <input
                        type="text"
                        placeholder="Enter ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full p-3 mb-4 border border-gray-300 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-4 border border-gray-300 rounded"
                    />

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full py-3 rounded ${isVerifying ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"} text-white`}
                    >
                        {isVerifying ? "Verifying..." : "Login"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole(null)}
                        className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default VerificationPage;
