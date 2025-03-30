import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthContext from "../context/AuthContext";

function ECLoginPage() {
  const { LoginEcMember, ec } = useContext(AuthContext); // `ec` stores logged-in user data
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Step 1: Attempt Login
      await LoginEcMember(data);

      // Step 2: Check if login was successful
      if (!ec || !ec.id) {
        toast.error("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Login successful! Verifying fingerprint...");

      // Step 3: Retrieve stored fingerprint
      const storedFingerprint = localStorage.getItem("ecFingerprint");
      if (!storedFingerprint) {
        toast.error("No fingerprint stored. Please register first.");
        setLoading(false);
        return;
      }

      // Step 4: Check if `MatchFinger` is available
      if (typeof window.MatchFinger !== "function") {
        toast.error("Fingerprint matcher is not available.");
        setLoading(false);
        return;
      }

      // Step 5: Perform Fingerprint Verification
      const res = window.MatchFinger(60, 10, storedFingerprint);

      if (res.httpStaus && res.data?.ErrorCode === "0" && res.data.Status) {
        toast.success("Fingerprint verified successfully!");
      } else {
        toast.error(`Fingerprint mismatch: ${res.data?.ErrorDescription}`);
        return;
      }
    } catch (error) {
      console.error("Login or Fingerprint verification error:", error);
      toast.error("Error during login or fingerprint verification.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">EC Login</h2>
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
      </div>
    </div>
  );
}

export default ECLoginPage;
