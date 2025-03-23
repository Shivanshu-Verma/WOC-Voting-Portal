import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

function AddVoterPage() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const location = useLocation();
  const voterInfo = location.state?.studentInfo;

  useEffect(() => {
    if (voterInfo) {
      setValue("voterId", voterInfo.voterId || "");
      setValue("name", voterInfo.name || "");
      setValue("biometric", voterInfo.biometric || "");
    }
  }, [voterInfo, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log("Voter Data Submitted", data);
      toast.success('Voter Registered Successfully');
    } catch (error) {
      toast.error('Registration Failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Add Voter</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700">Voter ID</label>
              <input
                type="text"
                {...register("voterId", { required: "Voter ID is required" })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
              {errors.voterId && <p className="text-red-500 text-sm">{errors.voterId.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Biometric</label>
              <input
                type="text"
                {...register("biometric", { required: "Biometric data is required" })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
              {errors.biometric && <p className="text-red-500 text-sm">{errors.biometric.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Verified by Volunteer</label>
              <input
                type="checkbox"
                {...register("verifiedByVolunteer")}
                className="mt-1"
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Register Voter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVoterPage;
