import { useNavigate } from "react-router-dom";

const OptionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Choose Registration Type</h1>

      <div className="space-y-6">
        <button
          onClick={() => navigate("/verify")}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Candidate Registration
        </button>

        <button
          onClick={() => navigate("/staff-registration")}
          className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
        >
          Staff Registration
        </button>

        <button
          onClick={() => navigate("/volunteer-registration")}
          className="px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
        >
          Volunteer Registration
        </button>
      </div>
    </div>
  );
};

export default OptionsPage;
