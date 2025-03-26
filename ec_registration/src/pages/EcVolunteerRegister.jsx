import { useState } from 'react';
import axios from 'axios';

const VolunteerRegister = () => {
    const [staffId, setStaffId] = useState('');
    const [staffIsoTemplate, setStaffIsoTemplate] = useState('');
    const [volunteerId, setVolunteerId] = useState('');
    const [volunteerName, setVolunteerName] = useState('');
    const [volunteerContact, setVolunteerContact] = useState('');
    const [leftFinger, setLeftFinger] = useState('');
    const [rightFinger, setRightFinger] = useState('');
    const [leftPreview, setLeftPreview] = useState('');
    const [rightPreview, setRightPreview] = useState('');
    const [step, setStep] = useState(1);

    // Fingerprint Capture Helper
    const captureFinger = async (setFinger, setPreview) => {
        if (typeof window.CaptureFinger !== 'function') {
            alert('Fingerprint scanner not detected.');
            return false;
        }
    
        try {
            const res = await window.CaptureFinger(60, 10);
            console.log('Fingerprint Capture Response:', res);
    
            if (res?.httpStaus && res.data?.ErrorCode === '0') {
                setFinger(res.data.ISOTemplate);
                setPreview(res.data.BitmapData);
                alert('Fingerprint captured successfully!');
                return true;
            } else {
                alert(`Capture Error: ${res?.data?.ErrorDescription || 'Unknown error'}`);
                return false;
            }
        } catch (err) {
            console.error('Capture Error:', err);
            alert('Error during fingerprint capture.');
            return false;
        }
    };

    // Step 1: Staff Verification
    const verifyStaff = async () => {
        if (!staffId) return alert('Please enter Staff ID.');
        try {
            const res = await axios.post(`${import.meta.env}/abcd`, { staffId });
            if (res.data.success && res.data.ISOTemplate) {
                setStaffIsoTemplate(res.data.ISOTemplate);
                alert('Staff verified successfully!');
                setStep(2);
            } else {
                alert('Invalid Staff ID.');
            }
        } catch (err) {
            alert('Error during staff verification.');
        }
    };

    // Step 2: Volunteer Registration
    const registerVolunteer = async (e) => {
        e.preventDefault();

        if (!volunteerId || !volunteerName || !volunteerContact) {
            return alert('Please fill in all fields.');
        }

        if (!leftFinger || !rightFinger) {
            return alert('Please capture both fingerprints.');
        }

        setStep(3);
    };

    // Step 3: Final Staff Fingerprint Check
    const finalStaffCheck = async () => {
        if (typeof window.MatchFinger !== 'function') {
            alert('Fingerprint scanner not detected.');
            return;
        }

        try {
            const res = window.MatchFinger(staffIsoTemplate, 60, 10);
            if (res.httpStaus && res.data?.Status === 'MATCHED') {
                await axios.post(`${import.meta.env}/abcd`, {
                    staffId,
                    volunteerId,
                    volunteerName,
                    volunteerContact,
                    leftFinger,
                    rightFinger,
                });
                alert('Volunteer registered successfully!');
                resetForm();
            } else {
                alert('Staff fingerprint verification failed.');
            }
        } catch (err) {
            alert('Error during final verification.');
        }
    };

    // Reset the Form
    const resetForm = () => {
        setVolunteerId('');
        setVolunteerName('');
        setVolunteerContact('');
        setLeftFinger('');
        setRightFinger('');
        setLeftPreview('');
        setRightPreview('');
        setStep(2);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-8">Volunteer Registration</h1>

            {step === 1 && (
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-xl mb-4">Step 1: Staff Verification</h2>
                    <input
                        type="text"
                        placeholder="Enter Staff ID"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />
                    <button
                        type="button"
                        onClick={verifyStaff}
                        className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Verify Staff
                    </button>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={registerVolunteer} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-xl mb-4">Step 2: Volunteer Registration</h2>
                    <input
                        type="text"
                        placeholder="Enter Volunteer ID"
                        value={volunteerId}
                        onChange={(e) => setVolunteerId(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />
                    <input
                        type="tel"
                        placeholder="Enter Contact No."
                        value={volunteerContact}
                        onChange={(e) => setVolunteerContact(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => captureFinger(setLeftFinger, setLeftPreview)}
                            className="py-3 bg-blue-500 text-white rounded hover:bg-blue-600 w-1/2"
                        >
                            Capture Left Finger
                        </button>
                        {leftPreview && (
                            <img src={`data:image/png;base64,${leftPreview}`} alt="Left" className="h-16 w-16 border rounded" />
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => captureFinger(setRightFinger, setRightPreview)}
                            className="py-3 bg-blue-500 text-white rounded hover:bg-blue-600 w-1/2"
                        >
                            Capture Right Finger
                        </button>
                        {rightPreview && (
                            <img src={`data:image/png;base64,${rightPreview}`} alt="Right" className="h-16 w-16 border rounded" />
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Register Volunteer
                    </button>
                </form>
            )}

            {step === 3 && (
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-xl mb-4">Step 3: Final Staff Verification</h2>
                    <button
                        type="button"
                        onClick={finalStaffCheck}
                        className="w-full py-3 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Verify Staff Fingerprint
                    </button>
                </div>
            )}
        </div>
    );
};

export default VolunteerRegister;
