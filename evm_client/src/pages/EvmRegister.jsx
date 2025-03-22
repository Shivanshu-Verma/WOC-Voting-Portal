import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useEvmStore} from '../store/zustand';
import axios from 'axios';

const EvmRegistration = () => {
  const [evmIdInput, setEvmIdInput] = useState("");
  const [staffId, setStaffId] = useState("");
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [fingerprintData, setFingerprintData] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [showStaffInput, setShowStaffInput] = useState(false);
  const [showFingerprintCapture, setShowFingerprintCapture] = useState(false);
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const navigate = useNavigate();

  const handleRegister = () => {
    if (evmIdInput.trim()) {
      setShowStaffInput(true);
    }
  };

  const handleStaffSubmit = async () => {
    setShowFingerprintCapture(true);
    // if (staffId.trim()) {
    //   try {
    //     const res = await axios.get(``, {
    //       staffId,
    //     });

    //     if (res.data.success) {
    //       setStatusMessage("Staff ID submitted successfully.");
    //       setShowFingerprintCapture(true);
    //     } else {
    //       setStatusMessage(res.data.message);
    //     }
    //   } catch (e) {
    //     setStatusMessage("An error occurred. Please try again.");
    //   }
    // }
  };

  const handleFingerprintCapture = async () => {
    try {
      if (typeof window.CaptureFinger === "function") {
        let quality = 60;
        let timeout = 10;

        let res = window.CaptureFinger(quality, timeout);
        if (res.httpStaus) {
          if (res.data.ErrorCode === "0") {
            setFingerprintImage(`data:image/bmp;base64,${res.data.BitmapData}`);
            setFingerprintData(res.data.IsoTemplate);
            setStatusMessage("Fingerprint captured successfully. Matching fingerprint...");
            handleFingerprintMatch();
          } else {
            setStatusMessage(
              `ErrorCode: ${res.data.ErrorCode} - ${res.data.ErrorDescription}`
            );
          }
        } else {
          alert(`Capture failed: ${res.err}`);
        }
      } else {
        alert("MFS100 SDK not detected. Ensure it is loaded in index.html.");
      }
    } catch (e) {
      alert(`Error capturing fingerprint: ${e}`);
    }
  };

  const handleFingerprintMatch = () => {
    try {
      if (typeof window.MatchFinger === "function") {
        let quality = 60;
        let timeout = 10;
        let isotemplate = "Rk1SACAyMAAAAACcAAABPAFiAMUAxQEAAAAoFUBpAJ5sAIAtALqEAECnAGLmAEBrAD5sAEAOAGF0AEChAT7KAEA4AT9OAIBPANdxAIC0AOPTAIA4APrGAIC6ARLTAECrATDQAECUAUm5AEArACFqAECjAIFoAIA4AO2iAIATAHx+AEDTAGdoAID8AOvhAIBuABhpAECPAAhmAAAA";
        let res = window.MatchFinger(quality, timeout, isotemplate);
        if (res.httpStaus) {
          if (res.data.Status) {
            setStatusMessage("Fingerprint matched successfully!");
          } else {
            if (res.data.ErrorCode !== "0") {
              setStatusMessage(res.data.ErrorDescription);
            } else {
              setStatusMessage("Fingerprint not matched");
            }
          }
        } else {
          setStatusMessage(res.err);
        }
      } else {
        alert("MFS100 SDK MatchFinger function not detected. Ensure it is loaded in index.html.");
      }
    } catch (e) {
      alert(`Error matching fingerprint: ${e}`);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold mb-4">EVM Registration</h2>
      <input
        type="text"
        placeholder="Enter EVM ID"
        value={evmIdInput}
        onChange={(e) => setEvmIdInput(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <button
        onClick={handleRegister}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Register
      </button>

      {showStaffInput && (
        <div className="mt-4 flex flex-row items-start gap-6">
          {/* Staff Input Section */}
          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <div className="w-full flex justify-center mt-2">
              <button
                onClick={handleStaffSubmit}
                className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Submit Staff ID
              </button>
            </div>
          </div>
          {showFingerprintCapture && (
            <div className="p-4 border rounded shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Fingerprint Capture</h3>
              <div className="w-40 h-40 border flex items-center justify-center bg-gray-100">
                {fingerprintImage ? (
                  <img
                    src={fingerprintImage}
                    alt="Fingerprint Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-500">Fingerprint Preview</p>
                )}
              </div>
              <button
                onClick={handleFingerprintCapture}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Capture Fingerprint
              </button>
              {statusMessage && (
                <p className="mt-2 text-sm text-gray-700">{statusMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvmRegistration;
