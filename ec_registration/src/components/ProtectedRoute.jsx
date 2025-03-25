import React from 'react';
import { Navigate } from 'react-router-dom';
import {useEcStore} from '../store/zustand';

function ProtectedRoute({ children }) {
    const ecId = useEcStore((state) => state.ecId);
    if (!ecId) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
