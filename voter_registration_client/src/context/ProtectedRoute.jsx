import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './AuthContext';

const ProtectedRoute = ({ children }) => {
  let { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login-volunteer" />;
};

export default ProtectedRoute;
