import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      return setError(
        "This is an admin account. Please use the Admin Login page.",
      );
    }

    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">User Login</h2>

        {successMessage && <p className="auth-message success">{successMessage}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-message error">{error}</p>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            No account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/admin/login">Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}