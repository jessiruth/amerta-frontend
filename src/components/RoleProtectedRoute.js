import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem("role");
    return allowedRoles.includes(role) ? children : <Navigate to="/home" replace />;
};

export default RoleProtectedRoute;