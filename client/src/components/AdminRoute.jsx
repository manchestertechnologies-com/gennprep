import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Like ProtectedRoute, but only admins get through
export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
    }
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

    return children;
}