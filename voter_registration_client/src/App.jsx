import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VolunteerLoginPage from "./pages/VolunteerLoginPage";
import ECLoginPage from "./pages/ECLoginPage";
import AddVoter from "./pages/AddVoter";
import ProtectedRoute from "./context/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login-volunteer" element={<VolunteerLoginPage />} />
          <Route path="/login-ec" element={<ECLoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AddVoter />
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
