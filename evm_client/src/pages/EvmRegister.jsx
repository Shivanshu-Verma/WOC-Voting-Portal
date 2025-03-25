import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEvmStore from "../context/zustand";
import axios from "axios";

const base_url = import.meta.env.VITE_BACKEND_URL;
const encryption_iv = import.meta.env.VITE_ENCRYPTION_IV;

// Create a singleton axios instance that can be updated with the EVM key
let axiosInstance = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update the axios instance with the new EVM key
const updateAxiosWithEvmId = (evmKey) => {
  console.log("Updated axios with EVM key:", evmKey);

  if (evmKey) {
    axiosInstance.defaults.headers.common['x-evm-id'] = evmKey;
  } else {
    delete axiosInstance.defaults.headers.common['x-evm-id'];
  }
};


const hexToBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
};

// Utility function to convert ArrayBuffer to hex string
const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// BigInteger operations for discrete logarithm Diffie-Hellman
// This is a simplified implementation using BigInt which is supported in modern browsers
class BigIntModular {
  // Modular exponentiation: (base^exponent) % modulus
  static modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }

    return result;
  }
}

// Browser-compatible discrete logarithm Diffie-Hellman
const generateDH = async () => {
  // These are the same prime and generator from your original code
  const prime = BigInt("0xeb984f6801b55ce41ccfc793ce2cf98122486e47afd51b31ffdbe26b816b0d5d851acdfcf5d84c786cbf41c6ea77d8e3f26beaeeb6147509a19fe4ce9e2f241448a3f05c08679b50fa7a4bce264757a506e5140fdb9be043f912f0c5c8f1419daf5f6307c83baa7d2c949be489cb1de4fa9f6c37bac1d4b4ce22f08704d40840c74f2fad51f9b5bc127259dc192f047bcc3d9bacbc01ec7916f842c1181e5b5c4c5375d057cb6912fbb51c454a0586d5a5af4777ef2c9e30867c0a40ab40e72b93a7856a5e58eaf377d4b731571b3e57baebab1db14ddb743e6496c2386647839c8702bbad5ec0c52c7d809ccd1a7289380e6489817fb1fa8fa557a8ae1c8ad7");
  const generator = BigInt("0x02");

  // Generate a random private key (a)
  // Create a secure random number for the private key
  const privateKeyBytes = new Uint8Array(32); // 256 bits
  window.crypto.getRandomValues(privateKeyBytes);

  // Convert to BigInt
  let privateKey = 0n;
  for (let i = 0; i < privateKeyBytes.length; i++) {
    privateKey = (privateKey << 8n) | BigInt(privateKeyBytes[i]);
  }

  // Calculate public key: A = g^a mod p
  const publicKey = BigIntModular.modPow(generator, privateKey, prime);

  // Convert public key to hex string for sending to server
  const publicKeyHex = publicKey.toString(16);

  return { privateKey, publicKeyHex, prime };
};

// Compute shared secret using discrete logarithm DH
const computeSharedSecret = (privateKey, serverPublicKeyHex, prime) => {
  const serverPublicKey = BigInt("0x" + serverPublicKeyHex);

  // Calculate shared secret: s = B^a mod p
  const sharedSecret = BigIntModular.modPow(serverPublicKey, privateKey, prime);

  // Convert shared secret to hex string
  return sharedSecret.toString(16);
};

// AES-256-CBC decryption using SHA-256 of the shared secret
const decryptAES256CBC = async (encryptedText, sharedSecretHex) => {
  try {
    // Convert hex strings to ArrayBuffer
    const sharedSecretBuffer = hexToBuffer(sharedSecretHex);
    const ivBuffer = hexToBuffer(encryption_iv);
    const encryptedBuffer = hexToBuffer(encryptedText);

    // Hash the shared secret with SHA-256 to derive the encryption key
    const hashedKey = await window.crypto.subtle.digest(
      'SHA-256',
      sharedSecretBuffer
    );

    // Import the hashed key for AES decryption
    const key = await window.crypto.subtle.importKey(
      'raw',
      hashedKey,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the data using AES-CBC
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      key,
      encryptedBuffer
    );

    // Convert the decrypted data to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt: " + error.message);
  }
};

const EvmRegistration = () => {
  const [evmRoom, setEvmRoom] = useState("");
  const [showStaffInput, setShowStaffInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const navigate = useNavigate();

  const handleRegister = () => {
    if (evmRoom.trim()) {
      setError("");
      setShowStaffInput(true);
    } else {
      setError("Please enter an EVM Room Number");
    }
  };

  const handleFingerprintCapture = async () => {
    try {
      setIsLoading(true);
      await registerEvm();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Fingerprint capture failed");
    }
  };

  const registerEvm = async () => {
    try {
      // Generate DH key pair
      const { privateKey, publicKeyHex, prime } = await generateDH();

      // Send our public key to the server - using axios directly for this request
      // since we don't have the EVM key yet
      const response = await axios.post(`${base_url}/evm/register`, {
        room: evmRoom,
        clientPublicKey: publicKeyHex,
      }, {
        withCredentials: true
      });
      // console.log(response.data);

      if (response.status === 201 && response.data) {
        // Save EVM ID to store
        setEvmId(response.data.Data.evmId);

        // Get server's public key
        const serverPublicKey = response.data.Data.serverPublicKey;
        if (!serverPublicKey) {
          throw new Error("Server did not provide a public key");
        }

        // Derive shared secret
        const sharedSecret = computeSharedSecret(privateKey, serverPublicKey, prime);
        // console.log("Shared Secret computed successfully", sharedSecret);

        // Decrypt EVM key
        const encryptedEvmKey = response.data.Data.encryptedEvmKey;
        if (!encryptedEvmKey) {
          throw new Error("Server did not provide an encrypted EVM key");
        }

        // Decrypt the key and update the axios instance
        const decryptedKey = await decryptAES256CBC(encryptedEvmKey, sharedSecret);
        updateAxiosWithEvmId(response.data.Data.evmId);

        console.log("EVM Key decrypted successfully");

        navigate("/voter-login");
      } else {
        throw new Error("EVM registration failed: Invalid server response");
      }
    } catch (error) {
      console.error("EVM registration failed:", error);
      setError(`EVM registration failed: ${error.message}`);
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold mb-4">EVM Registration</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        type="text"
        placeholder="Enter EVM Room Number"
        value={evmRoom}
        onChange={(e) => setEvmRoom(e.target.value)}
        className="border px-3 py-2 rounded w-64"
      />

      <button
        onClick={handleRegister}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors"
        disabled={isLoading}
      >
        Register
      </button>

      {showStaffInput && (
        <div className="mt-6 flex flex-col items-center">
          <p className="mb-2">Verify your fingerprint</p>
          <button
            onClick={handleFingerprintCapture}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Capture Fingerprint"}
          </button>
        </div>
      )}
    </div>
  );
};

// Export the axios instance to be used throughout the application
export { axiosInstance };
export default EvmRegistration;