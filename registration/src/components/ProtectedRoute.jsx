import React from "react";
import { Navigate } from "react-router-dom";
import { useEcStore } from "../store/zustand";

function ProtectedRoute({ children, requires }) {
  const ecId = useEcStore((state) => state.ecId);
  const staffId = useEcStore((state) => state.staffId);
  const volunteerId = useEcStore((state) => state.volunteerId);

  // Check general auth
  if (!ecId) {
    return <Navigate to="/" replace />;
  }

  // Additional role-based checks
  if (requires === "staff" && !staffId) {
    return <Navigate to="/verify" replace />;
  }

  if (requires === "volunteer" && (!staffId || !volunteerId)) {
    return <Navigate to="/verify" replace />;
  }

  return children;
}

export default ProtectedRoute;
