import { useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";
import { useIssues } from "../hooks/useIssues";
import IssueCard from "../components/IssueCard";
import StatCard from "../components/StatCard";
import { STATUS_LABELS } from "../dashboardStyles";
import "./AdminDashboard.css";

const FILTERS = [
  { value: "all", label: "All Issues" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

export default function AdminDashboard() {
  const { session, signOut } = useAuth();
  const { issues, users, loading, error, setError, reload } = useIssues();
  const [filter, setFilter] = useState("all");

  async function handleStatusChange(issue, status) {
    const { error } = await supabase
      .from("issues")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", issue.id);
    if (error) return setError(error.message);
    reload();
  }

  async function handleAssign(issue, assigneeName) {
    const { error } = await supabase
      .from("issues")
      .update({
        assignee_name: assigneeName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", issue.id);
    if (error) return setError(error.message);
    reload();
  }

  async function handleDelete(issue) {
    if (!window.confirm(`Delete "${issue.title}"?`)) return;
    const { error } = await supabase.from("issues").delete().eq("id", issue.id);
    if (error) return setError(error.message);
    reload();
  }

  const visible =
    filter === "all" ? issues : issues.filter((i) => i.status === filter);

  const counts = {
    total: issues.length,
    open: issues.filter((i) => i.status === "open").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    closed: issues.filter((i) => i.status === "closed").length,
  };

  return (
    <main className="dash-page">
      <header className="dash-header">
        <div>
          <h1 className="dash-heading">Admin Dashboard</h1>
          <p className="dash-signed-in">
            Signed in as {session.user.email}
            <span className="dash-badge">Admin</span>
          </p>
        </div>
        <button type="button" onClick={signOut} className="dash-btn">
          Logout
        </button>
      </header>

      {error && (
        <div className="dash-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="dash-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <section className="dash-stats">
        <StatCard label="Total Issues" count={counts.total} color="#374151" />
        <StatCard label="Open" count={counts.open} color="#2563eb" />
        <StatCard
          label="In Progress"
          count={counts.in_progress}
          color="#d97706"
        />
        <StatCard label="Closed" count={counts.closed} color="#16a34a" />
      </section>

      <section className="dash-filters">
        <h2 className="dash-section-heading">All Issues</h2>
        <div className="dash-filter-row">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`dash-filter ${filter === item.value ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="dash-message">
          <p>Loading issues...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="dash-message">
          <h3>No issues found</h3>
          <p>
            {filter === "all"
              ? "No issues have been created yet."
              : `There are no ${STATUS_LABELS[filter]?.toLowerCase()} issues.`}
          </p>
        </div>
      ) : (
        <section className="dash-issue-grid">
          {visible.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              session={session}
              isAdmin={true}
              users={users}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      <footer className="dash-footer">
        Showing {visible.length} of {issues.length} issues
      </footer>
    </main>
  );
}
