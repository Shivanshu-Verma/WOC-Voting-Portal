import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEvmStore from '../context/zustand';
import axios from 'axios';

let evmKey = null; 

const EvmRegistration = () => {
  const [evmRoom, setEvmRoom] = useState("");
  const [showStaffInput, setShowStaffInput] = useState(false);
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const navigate = useNavigate();

  const handleRegister = () => {
    if (evmRoom.trim()) {
      setShowStaffInput(true);
    }
  };

  const handleFingerprintCapture = async () => {
    // If fingerprint matches
    await registerEvm();
    navigate('/voter-login');
  };

  const registerEvm = async () => {
    try {
      const prime = 'PASTE_PRIME_HERE';
      const generator = 'PASTE_GENERATOR_HERE';

      const encoder = new TextEncoder();
      const primeBuffer = encoder.encode(prime);
      const generatorBuffer = encoder.encode(generator);

      // Generate keys using Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        ["deriveKey"]
      );

      const clientPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);

      const response = await axios.post('baseurl/registerEvm', {
        evmRoom,
        clientPublicKey: Buffer.from(clientPublicKey).toString("base64"),
      });

      if (response.status === 200) {
        const serverPublicKey = response.data.serverPublicKey;
        const importedServerKey = await window.crypto.subtle.importKey(
          "spki",
          Buffer.from(serverPublicKey, "base64"),
          { name: "ECDH", namedCurve: "P-256" },
          false,
          []
        );

        const sharedSecret = await window.crypto.subtle.deriveKey(
          { name: "ECDH", public: importedServerKey },
          keyPair.privateKey,
          { name: "AES-CBC", length: 256 },
          false,
          ["decrypt"]
        );

        // evmKey = sharedSecret; // Store in memory
        evmKey = "hello"
        setEvmId(response.data.evmId);
        navigate('/voter-login');
      } else {
        alert('EVM registration failed');
      }
    } catch (error) {
      console.error("EVM registration failed:", error);
      alert(`EVM registration failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold mb-4">EVM Registration</h2>
      <input
        type="text"
        placeholder="Enter EVM Room Number"
        value={evmRoom}
        onChange={(e) => setEvmRoom(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <button
        onClick={handleRegister}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Register
      </button>

      {showStaffInput && (
        <>
          <p className="mt-4">Verify your fingerprint</p>
          <button
            onClick={handleFingerprintCapture}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Capture Fingerprint
          </button>
        </>
      )}
    </div>
  );
};

export { evmKey };
export default EvmRegistration;
