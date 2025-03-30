import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useEcStore } from './store/zustand';
import LoginPage from './pages/LoginPage';
import EcStaffRegister from './pages/EcStaffRegister';
import EcVolunteerRegister from './pages/EcVolunteerRegister';
import CandidateRegister from './pages/CandidateRegister';
import Warning from './pages/Warning';
import ProtectedRoute from './components/ProtectedRoute';
import DevToolsDetector from './components/DevToolDetector';
import OptionsPage from './pages/OptionsPage';
import VerificationPage from './pages/VerificationPage';

const AppRoutes = () => {
  const ecId = useEcStore((state) => state.ecId);
  useEffect(() => {
    document.addEventListener('contextmenu', (event) => event.preventDefault()); // Disable right-click

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && (event.key === 'u' || event.key === 's' || event.key === 'i' || event.key === 'j' || event.key === 'c')) {
        event.preventDefault(); // Disable Ctrl+U, Ctrl+S, Ctrl+Shift+I, etc.
      }
    });

    return () => {
      document.removeEventListener('contextmenu', (event) => event.preventDefault());
      document.removeEventListener('keydown', (event) => event.preventDefault());
    };
  }, []);


  return (
    <Router>
      <Routes>
    <Route path="/" element={ecId ? <Navigate to="/dashboard" /> : <LoginPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><OptionsPage /></ProtectedRoute>} />

    <Route path="/verify" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />

    <Route path="/staff-registration" element={<ProtectedRoute><EcStaffRegister /></ProtectedRoute>} />

    <Route path="/volunteer-registration" element={
      <ProtectedRoute requires="staff">
        <EcVolunteerRegister />
      </ProtectedRoute>
    } />

    <Route path="/candidate-registration" element={
      <ProtectedRoute requires="volunteer">
        <CandidateRegister />
      </ProtectedRoute>
    } />

    <Route path="/warning" element={<Warning />} />
  </Routes>

    </Router>
  );
};

export default AppRoutes;
