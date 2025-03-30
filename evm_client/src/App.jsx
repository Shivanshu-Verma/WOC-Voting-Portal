import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useEvmStore from './context/zustand';
import EvmRegistration from './pages/EvmRegister';
import VoterLogin from './pages/VoterLogin';
import CastVote from './pages/CastVote'
import Warning from './pages/Warning';
import ProtectedRoute from './components/ProtectedRoute';
import ECLoginPage from './pages/ECLoginPage';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import DevToolsDetector from './components/DevToolDetector';
disableReactDevTools();
const AppRoutes = () => {
  // debugger; // Pause here when component initializes
  
  const evmId = useEvmStore((state) => state.evmId);
  
  useEffect(() => {
    // debugger; // Pause here when the effect runs
    
    document.addEventListener('contextmenu', (event) => event.preventDefault()); // Disable right-click

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && (event.key === 'u' || event.key === 's' || event.key === 'i' || event.key === 'j' || event.key === 'c')) {
        debugger; // Pause here when a keyboard event is intercepted
        event.preventDefault(); // Disable Ctrl+U, Ctrl+S, Ctrl+Shift+I, etc.
      }
    });

    return () => {
      debugger; // Pause here when the component unmounts (cleanup)
      document.removeEventListener('contextmenu', (event) => event.preventDefault());
      document.removeEventListener('keydown', (event) => event.preventDefault());
    };
  }, []);


  return (
    <Router>
      <AuthProvider >
        {/* <DevToolsDetector /> */}
        <Routes>
          <Route path="/" element={evmId ? <Navigate to="/voter-login" /> : <ECLoginPage />} />
          <Route path="/evm-register" element={<ProtectedRoute><EvmRegistration /> </ProtectedRoute>} />
          <Route path="/voter-login" element={<ProtectedRoute><VoterLogin /></ProtectedRoute>} />
          <Route path="/cast-vote" element={<ProtectedRoute><CastVote /></ProtectedRoute>} />
          <Route path="/warning" element={<Warning />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;