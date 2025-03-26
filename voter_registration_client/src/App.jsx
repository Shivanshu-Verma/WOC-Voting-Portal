import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VolunteerLoginPage from "./pages/VolunteerLoginPage";
import ECLoginPage from "./pages/ECLoginPage";
import AddVoter from "./pages/AddVoter";
import ProtectedRoute from "./context/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import VerifyVoterByEc from "./pages/VerifyVoterByEc";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<VolunteerLoginPage />} />
          <Route path="/login-volunteer" element={<VolunteerLoginPage />} />
          <Route path="/login-ec" element={<ECLoginPage />} />
          <Route
            path="/add-voter"
            element={
              <ProtectedRoute>
                <AddVoter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-voter"
            element={
              <ProtectedRoute>
                <VerifyVoterByEc />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
