import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  component: React.ComponentType<any>;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser && currentUser.role === "admin") {
    return <Component />;
  }

  return <Navigate to="/" state={{ from: location }} />;
};

export default AdminRoute;
