import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEcStore, useStaffStore, useVolunteerStore } from "../store/zustand";

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const { ecId, clearStore: clearEc } = useEcStore();
  const { staffId, clearStore: clearStaff } = useStaffStore();
  const { volunteerId, clearStore: clearVolunteer } = useVolunteerStore();

  useEffect(() => {
    if (ecId) {
      setRole("commissioner");
      console.log("Setting role: commissioner");
    } else if (staffId) {
      setRole("staff");
      console.log("Setting role: staff");
    } else if (volunteerId) {
      setRole("volunteer");
      console.log("Setting role: volunteer");
    }
  }, [volunteerId, staffId, ecId]);

  // Redirect if no valid role
  useEffect(() => {
    if (volunteerId === null && staffId === null && ecId === null) {
      navigate("/");
    }
  }, [volunteerId, staffId, ecId, navigate]);

  // Logout function to clear state and localStorage
  const handleLogout = () => {
    if (role === "volunteer") {
      clearVolunteer();
    } else if (role === "staff") {
      clearStaff();
    } else if (role === "commissioner") {
      clearEc();
    }

    navigate("/");
  };

  const buttonsByRole = {
    volunteer: [
      { label: "Register Candidate", path: "/register-candidate" },
      { label: "Register Voter", path: "/register-voter" },
    ],
    staff: [
      { label: "Verify Candidate", path: "/verify-candidate" },
      { label: "Verify Voter", path: "/verify-voter" },
      { label: "Register Volunteer", path: "/register-volunteer" },
    ],
    commissioner: [
      { label: "Verify Candidate", path: "/verify-candidate" },
      { label: "Verify Voter", path: "/verify-voter" },
      { label: "Register Volunteer", path: "/register-volunteer" },
      { label: "Register Staff", path: "/register-staff" },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        {role && `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
      </h1>

      <div className="flex flex-col space-y-6">
        {buttonsByRole[role]?.map((btn) => (
          <button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            className="py-3 px-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {btn.label}
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="py-3 px-8 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
