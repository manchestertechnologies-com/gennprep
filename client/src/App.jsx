import Profile from "./pages/student/Profile";
import BulkUpload from "./pages/admin/BulkUpload";
import Analytics from "./pages/student/Analytics";
import Welcome from "./pages/student/Welcome";
import { ExamProvider } from "./context/ExamContext";
import Landing from "./pages/Landing";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import StudentLayout from "./components/StudentLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
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
      <Route path="/" element={<Landing loggedIn={protect(<Home />)} />} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student pages share one navigation bar */}
      <Route element={protect(<StudentLayout />)}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<PracticeSetup />} />
        <Route path="/mock-tests" element={<MockTests />} />
        <Route path="/revise" element={<Revise />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/result/:id" element={<Result />} />
      </Route>

      {/* The test screen is full-screen, without the menu */}
      <Route path="/attempt/:id" element={protect(<TestScreen />)} />
      <Route path="/welcome" element={protect(<ExamProvider><Welcome /></ExamProvider>)} />

      {/* Admin pages */}
      <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
      <Route path="/admin/syllabus" element={adminOnly(<ManageSyllabus />)} />
      <Route path="/admin/questions" element={adminOnly(<ManageQuestions />)} />
      <Route path="/admin/questions/bulk" element={adminOnly(<BulkUpload />)} />
      <Route path="/admin/questions/:id" element={adminOnly(<QuestionForm />)} />
      <Route path="/admin/tests" element={adminOnly(<ManageTests />)} />
      <Route path="/admin/students" element={adminOnly(<ManageStudents />)} />

      {/* Any unknown URL goes back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}