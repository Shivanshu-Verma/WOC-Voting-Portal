import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

function ECLoginPage() {
  const { LoginEcMember } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log(data);
      await LoginEcMember(data);
    } catch (error) {
      toast.error('Login Failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">EC Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input 
              type="email"
              {...register("email", { required: "Email is required" })} 
              className="w-full p-2 border border-gray-300 rounded mt-1" 
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input 
              type="text"
              {...register("password", { required: "Biometric data is required" })} 
              className="w-full p-2 border border-gray-300 rounded mt-1" 
            />
            {errors.biometric && <p className="text-red-500 text-sm">{errors.biometric.message}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ECLoginPage;
