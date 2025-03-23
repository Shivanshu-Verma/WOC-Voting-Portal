import React from 'react';
import { Navigate } from 'react-router-dom';
import useEvmStore from '../context/zustand';

function ProtectedRoute({ children }) {
    const ec = useEvmStore((state) => state.ec);
    if (!ec) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
