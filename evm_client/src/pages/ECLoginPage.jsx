import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ECLoginPage() {
  const { LoginEcMember, ec } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Step 1: Attempt Login
      await LoginEcMember(data);
      toast.success("Login successful!");
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const verifyFingerprint = async () => {
    setLoading(true);
    try {
      // Step 1: Retrieve stored fingerprint
      const storedFingerprintLeft = localStorage.getItem("ecFingerprintLeft");
      const storedFingerprintRight = localStorage.getItem("ecFingerprintRight");
      
      if (!storedFingerprintLeft || !storedFingerprintRight) {
        toast.error("No fingerprint stored. Please register first.");
        return;
      }
      
      // Step 2: Check if `MatchFinger` is available
      if (typeof window.MatchFinger !== "function") {
        toast.error("Fingerprint matcher is not available.");
        return;
      }
      
      // Step 3: Perform Fingerprint Verification using the provided implementation
      toast.loading("Verifying fingerprint...", { id: "fingerprint" });
      
      const isoTemplate = {
        left: storedFingerprintLeft,
        right: storedFingerprintRight
      };
      
      const leftRes = window.MatchFinger(60, 10, isoTemplate.left);
      const rightRes = window.MatchFinger(60, 10, isoTemplate.right);
      
      const isLeftMatch = 
        leftRes.httpStaus && leftRes.data?.ErrorCode === "0" && leftRes.data.Status;
      const isRightMatch = 
        rightRes.httpStaus && rightRes.data?.ErrorCode === "0" && rightRes.data.Status;
      
      toast.dismiss("fingerprint");
      
      if (isLeftMatch) {
        toast.success("Left Fingerprint verified successfully!");
      }
      
      if (isRightMatch) {
        toast.success("Right Fingerprint verified successfully!");
      }
      
      if (isLeftMatch || isRightMatch) {
        toast.success("Fingerprint verified successfully!");
        // Navigate to EVM registration page upon success
        navigate("/evm-register");
      } else {
        toast.error("Fingerprint verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Fingerprint verification error:", error);
      toast.error("Error during fingerprint verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">EC Login</h2>
        
        {!isLoggedIn ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input 
                type="text" 
                {...register("id", { required: "Email is required" })} 
                className="w-full p-2 border border-gray-300 rounded mt-1" 
              />
              {errors.id && <p className="text-red-500 text-sm">{errors.id.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input 
                type="password" 
                {...register("password", { required: "Password is required" })} 
                className="w-full p-2 border border-gray-300 rounded mt-1" 
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-green-600 font-medium text-center">
              Successfully logged in as {ec?.name || "EC Member"}
            </p>
            
            <button 
              onClick={verifyFingerprint} 
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Fingerprint"}
            </button>
            
            <button 
              onClick={() => setIsLoggedIn(false)} 
              className="w-full bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ECLoginPage;