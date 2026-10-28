import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./auth-context";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import IssueDetail from "./pages/IssueDetail";
import UserDashboard from "./pages/UserDashboard";

function Home() {
  const { session, profile, loading } = useAuth();
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!session || !profile) return <Navigate to="/login" replace />;
  return (
    <Navigate to={profile.role === "admin" ? "/admin" : "/dashboard"} replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Both roles can open an issue; each role's own routes link here */}
          <Route path="/issues/:id" element={<IssueDetailGuard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function IssueDetailGuard() {
  const { session, loading } = useAuth();
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  return session ? <IssueDetail /> : <Navigate to="/login" replace />;
}
