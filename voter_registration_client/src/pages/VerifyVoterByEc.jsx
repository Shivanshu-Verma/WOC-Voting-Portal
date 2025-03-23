import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function VerifyVoterByEc() {
  const location = useLocation();
  const voterInfo = location.state?.studentInfo;

  const handleVerify = async () => {
    try {
      const response = await fetch('/verifyStaff', { method: 'POST' });
      if (response.ok) {
        toast.success('Voter Verified Successfully');
      } else {
        toast.error('Verification Failed');
      }
    } catch (error) {
      toast.error('Verification Failed');
      console.error('Error verifying voter:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Voter</h2>
        {voterInfo ? (
          <div>
            <p className="mb-2"><strong>Voter ID:</strong> {voterInfo.voterId}</p>
            <p className="mb-2"><strong>Name:</strong> {voterInfo.name}</p>
            <p className="mb-4"><strong>Biometric:</strong> {voterInfo.biometric}</p>
            <button 
              onClick={handleVerify} 
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Verify EC
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600">No voter data available.</p>
        )}
      </div>
    </div>
  );
}

export default VerifyVoterByEc;