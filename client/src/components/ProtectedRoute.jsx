import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Still checking the saved token: show a short loading message
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading...
            </div>
        );
    }

    // Not logged in: send them to the login page
    if (!user) return <Navigate to="/login" replace />;

    return children;
}