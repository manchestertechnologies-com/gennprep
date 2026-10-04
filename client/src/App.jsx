import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/student/Dashboard";
import PracticeSetup from "./pages/student/PracticeSetup";
import TestScreen from "./pages/student/TestScreen";
import Result from "./pages/student/Result";
import Revise from "./pages/student/Revise";

// Wraps a page so only logged-in users can see it
const protect = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Logged-in pages */}
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/practice" element={protect(<PracticeSetup />)} />
      <Route path="/revise" element={protect(<Revise />)} />
      <Route path="/attempt/:id" element={protect(<TestScreen />)} />
      <Route path="/result/:id" element={protect(<Result />)} />

      {/* Any unknown URL goes back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}