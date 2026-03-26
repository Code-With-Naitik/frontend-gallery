import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, token, admin, adminToken, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/users';

    if (isAdminRoute) {
        if (!adminToken || admin?.role !== 'admin') {
            return <Navigate to="/admin/login" replace />;
        }
    } else {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
