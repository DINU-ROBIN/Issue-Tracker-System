import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Auth.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      return setError("Access denied. This account is not an admin.");
    }

    setLoading(false);
    navigate("/admin");
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-admin">
        <h2 className="auth-title">Admin Login</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Admin email"
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
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <Link to="/login">Back to user login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}