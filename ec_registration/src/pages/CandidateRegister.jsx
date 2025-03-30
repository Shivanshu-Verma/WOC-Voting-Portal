import { useState, useEffect } from "react";
import axios from "axios";
import { useEcStore } from "../store/zustand";

const CandidateRegister = () => {
    const { staffId, volunteerId } = useEcStore();
    const [mode, setMode] = useState(null); // "volunteer" or "staff"
    const [candidate, setCandidate] = useState({
        id: "",
        name: "",
        contact: "",
        position: "",
        image: null,
    });
    const [searchId, setSearchId] = useState("");
    const [fetchedCandidate, setFetchedCandidate] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Detect if staff or volunteer is logged in
    useEffect(() => {
        if (staffId) setMode("staff");
        else if (volunteerId) setMode("volunteer");
    }, [staffId, volunteerId]);

    // Handle Candidate Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCandidate((prev) => ({ ...prev, [name]: value }));
    };

    // Capture Image
    const captureImage = () => {
        const video = document.createElement("video");
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                document.body.appendChild(video);

                setTimeout(() => {
                    const context = canvas.getContext("2d");
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    setCandidate((prev) => ({ ...prev, image: canvas.toDataURL("image/png") }));
                    video.pause();
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(video);
                }, 3000);
            })
            .catch((err) => alert("Camera access denied"));
    };

    // Helper: Capture and Match Fingerprint
    const captureAndMatchFingerprint = async (isoTemplate) => {
        if (typeof window.MatchFinger !== "function") {
            alert("Fingerprint scanner not detected.");
            return false;
        }

        try {
            const res = window.MatchFinger(60, 10, isoTemplate); // Capture and compare
            if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
                return true; // Matched successfully
            }
            alert(`Fingerprint mismatch: ${res.data?.ErrorDescription}`);
            return false;
        } catch (err) {
            alert("Error during fingerprint matching.");
            console.error(err);
            return false;
        }
    };

    // Volunteer: Submit Candidate
    const handleVolunteerSubmit = async () => {
        if (!volunteerId) return alert("Unauthorized access.");

        try {
            setIsProcessing(true);

            // 1. Get ISO Template of Volunteer
            const { data } = await axios.post("/api/get-template", { id: volunteerId, role: "volunteer" });
            if (!data.success || !data.isoTemplate) {
                alert("Failed to fetch volunteer fingerprint template.");
                return;
            }

            // 2. Capture and Match Volunteer Fingerprint
            const isMatched = await captureAndMatchFingerprint(data.isoTemplate);
            if (!isMatched) return;

            // 3. Register Candidate
            await axios.post("/api/register-candidate", {
                ...candidate,
                registeredBy: volunteerId,
            });

            alert("Candidate registered successfully!");
            setCandidate({ id: "", name: "", contact: "", position: "", image: null });
        } catch (err) {
            alert("Error during candidate registration.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Staff: Search Candidate
    const handleSearchCandidate = async () => {
        try {
            const { data } = await axios.get(`/api/candidate/${searchId}`);
            if (data.success) {
                setFetchedCandidate(data.candidate);
            } else {
                alert("Candidate not found.");
                setFetchedCandidate(null);
            }
        } catch (err) {
            alert("Error during candidate search.");
            console.error(err);
        }
    };

    // Staff: Verify and Register
    const handleStaffVerify = async () => {
        if (!staffId || !fetchedCandidate) return alert("Unauthorized access.");

        try {
            setIsProcessing(true);

            // 1. Capture and Match Candidate Fingerprint
            const isMatched = await captureAndMatchFingerprint(fetchedCandidate.isoTemplate);
            if (!isMatched) return;

            // 2. Register Candidate via Staff
            await axios.post("/api/verify-candidate", {
                candidateId: fetchedCandidate.id,
                verifiedBy: staffId,
            });

            alert("Candidate verified successfully!");
            setFetchedCandidate(null);
            setSearchId("");
        } catch (err) {
            alert("Error during candidate verification.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8">Candidate Registration</h1>

            {mode === "volunteer" && (
                <div className="w-full max-w-lg space-y-4 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl mb-4">Register Candidate</h2>

                    <input type="text" name="id" placeholder="Candidate ID" value={candidate.id} onChange={handleInputChange} className="p-2 border rounded w-full" />
                    <input type="text" name="name" placeholder="Name" value={candidate.name} onChange={handleInputChange} className="p-2 border rounded w-full" />
                    <input type="text" name="contact" placeholder="Contact" value={candidate.contact} onChange={handleInputChange} className="p-2 border rounded w-full" />
                    <input type="text" name="position" placeholder="Position" value={candidate.position} onChange={handleInputChange} className="p-2 border rounded w-full" />

                    <button onClick={captureImage} className="bg-blue-500 text-white p-2 rounded">Capture Image</button>

                    <button onClick={handleVolunteerSubmit} className="bg-green-500 text-white p-2 rounded" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Register Candidate"}
                    </button>
                </div>
            )}

            {mode === "staff" && (
                <div className="w-full max-w-lg space-y-4 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl mb-4">Search Candidate</h2>

                    <input type="text" placeholder="Enter Candidate ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="p-2 border rounded w-full" />

                    <button onClick={handleSearchCandidate} className="bg-blue-500 text-white p-2 rounded">Search</button>

                    {fetchedCandidate && (
                        <div className="mt-6">
                            <p>ID: {fetchedCandidate.id}</p>
                            <p>Name: {fetchedCandidate.name}</p>
                            <img src={fetchedCandidate.image} alt="Candidate" className="w-32 h-32 mt-4" />
                            <button onClick={handleStaffVerify} className="bg-green-500 text-white p-2 rounded mt-4">Capture & Verify Fingerprint</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CandidateRegister;
