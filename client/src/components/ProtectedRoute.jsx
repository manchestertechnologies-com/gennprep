import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppLoading } from "./Skeleton";

// Only logged-in users get through
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}