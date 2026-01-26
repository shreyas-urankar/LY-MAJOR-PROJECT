import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // Check if user is authenticated
  const isAuthenticated = user && token;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

