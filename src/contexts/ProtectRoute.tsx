import { useLocation, Navigate } from "react-router-dom";
import { User } from "../tokens/token";

const ProtectedRoute = ({ children, allowedRoutes }: { children: React.ReactNode; allowedRoutes: string[]; }) => {
    const location = useLocation();
    const { role } = User();
    const path = location.pathname;
    
    const domain = path.split("/")[1];

    // PERMISSION SUPER ADMIN
    if (role === "super_admin") {
        if (path.includes("/super-admin")) {
            return children;
        } else {
            return <Navigate to={`/${domain}/super-admin`} replace />;
        }
    }

    // PERMISSION ADMIN
    if (role === "admin") {
        if (path.includes("/super-admin")) {
            return <Navigate to={allowedRoutes[0] || `/${domain}/pipelines`} replace />;
        }
        return children;
    }

    if (allowedRoutes.includes(path)) {
        return children;
    }

    return <Navigate to={allowedRoutes[0] || `/${domain}/pipelines`} replace />;
};

export default ProtectedRoute;