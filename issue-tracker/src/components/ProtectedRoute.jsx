import { Navigate } from "react-router-dom";
import { useAuth } from "../auth-context";

// role = 'admin' or 'user'
export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <p style={styles.loading}>Loading...</p>;

  if (!session || !profile) {
    return (
      <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />
    );
  }

  // Logged in, but with the wrong role: send them to their own dashboard
  if (profile.role !== role) {
    return (
      <Navigate
        to={profile.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

const styles = {
  loading: {
    padding: 20,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    color: "#52606d",
  },
};