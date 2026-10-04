import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/student/Dashboard";
import PracticeSetup from "./pages/student/PracticeSetup";
import TestScreen from "./pages/student/TestScreen";
import Result from "./pages/student/Result";
import Revise from "./pages/student/Revise";
import MockTests from "./pages/student/MockTests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageSyllabus from "./pages/admin/ManageSyllabus";
import ManageQuestions from "./pages/admin/ManageQuestions";
import QuestionForm from "./pages/admin/QuestionForm";
import ManageTests from "./pages/admin/ManageTests";
import ManageStudents from "./pages/admin/ManageStudents";

const protect = (page) => <ProtectedRoute>{page}</ProtectedRoute>;
const adminOnly = (page) => <AdminRoute>{page}</AdminRoute>;

// Sends admins to the admin area and students to their dashboard
function Home() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={protect(<Home />)} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student pages */}
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/practice" element={protect(<PracticeSetup />)} />
      <Route path="/revise" element={protect(<Revise />)} />
      <Route path="/mock-tests" element={protect(<MockTests />)} />
      <Route path="/attempt/:id" element={protect(<TestScreen />)} />
      <Route path="/result/:id" element={protect(<Result />)} />

      {/* Admin pages */}
      <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
      <Route path="/admin/syllabus" element={adminOnly(<ManageSyllabus />)} />
      <Route path="/admin/questions" element={adminOnly(<ManageQuestions />)} />
      <Route path="/admin/questions/:id" element={adminOnly(<QuestionForm />)} />
      <Route path="/admin/tests" element={adminOnly(<ManageTests />)} />
      <Route path="/admin/students" element={adminOnly(<ManageStudents />)} />

      {/* Any unknown URL goes back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}