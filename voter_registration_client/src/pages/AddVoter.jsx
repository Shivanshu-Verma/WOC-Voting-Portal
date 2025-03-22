import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Logo from '../assets/IITJ_Logo.png';

function AddVoterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Call the voter registration function (to be implemented in API)
      console.log("Voter Data Submitted", data);
      toast.success('Voter Registered Successfully');
    } catch (error) {
      toast.error('Registration Failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-400 text-white w-full flex justify-center items-center p-4 shadow-md">
        <img src={Logo} alt="IIT Jodhpur Logo" className="h-16 mr-4" />
        <h2 className="text-xl font-semibold text-center">Indian Institute of Technology, Jodhpur</h2>
      </header>
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
            <div className="mb-4">
              <label className="block text-gray-700">Verified by Staff</label>
              <input
                type="checkbox"
                {...register("verifiedByStaff")}
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
