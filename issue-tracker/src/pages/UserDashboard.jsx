
import { useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";
import { useIssues } from "../hooks/useIssues";
import IssueForm from "../components/IssueForm";
import EditIssueForm from "../components/EditIssueForm";
import IssueCard from "../components/IssueCard";
import "./UserDashboard.css";

const VIEWS = [
  { value: "all", label: "All Issues" },
  { value: "mine", label: "My Issues" },
];

export default function UserDashboard() {
  const { session, signOut } = useAuth();
  const { issues, loading, error, setError, reload } = useIssues();

  const [view, setView] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  async function handleCreate(data) {
    const { error } = await supabase.from("issues").insert({
      title: data.title,
      description: data.description,
      created_by: session.user.id,
    });

    if (error) throw error;

    setShowForm(false);
    reload();
  }

  async function handleSaveEdit({ title, description }) {
    const { error } = await supabase
      .from("issues")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingIssue.id);

    if (error) return setError(error.message);

    setEditingIssue(null);
    reload();
  }

  async function handleDelete(issue) {
    if (!window.confirm(`Delete "${issue.title}"?`)) return;

    const { error } = await supabase
      .from("issues")
      .delete()
      .eq("id", issue.id);

    if (error) return setError(error.message);

    if (editingIssue?.id === issue.id) {
      setEditingIssue(null);
    }

    reload();
  }

  function handleEdit(issue) {
    setEditingIssue(issue);
    setShowForm(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const visible =
    view === "mine"
      ? issues.filter((i) => i.created_by === session.user.id)
      : issues;

  return (
    <main className="ud-page">
      <header className="ud-header">
        <div>
          <h1 className="ud-heading">User Dashboard</h1>
          <p className="ud-signed-in">
            Signed in as {session.user.email}
          </p>
        </div>

        <div className="ud-header-actions">
          <button
            type="button"
            className="ud-btn create"
            onClick={() => {
              setShowForm((s) => !s);
              setEditingIssue(null);
              setError("");
            }}
          >
            {showForm ? "Close Form" : "+ Create Issue"}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="ud-btn logout"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="ud-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ud-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <section className="ud-form-wrap">
          <IssueForm
            onCreate={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      {editingIssue && (
        <section className="ud-form-wrap">
          <EditIssueForm
            issue={editingIssue}
            onSave={handleSaveEdit}
            onCancel={() => setEditingIssue(null)}
          />
        </section>
      )}

      <section className="ud-filters">
        <h2 className="ud-section-heading">Issues</h2>

        <div className="ud-filter-row">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={`ud-filter ${
                view === item.value ? "active" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="ud-message">
          <p>Loading issues...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="ud-message">
          <h3>No issues found</h3>
          <p>
            {view === "mine"
              ? "You have not created any issues yet."
              : "No issues have been created yet."}
          </p>
        </div>
      ) : (
        <section className="ud-issue-grid">
          {visible.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              session={session}
              isAdmin={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      <footer className="ud-footer">
        Showing {visible.length} of {issues.length} issues
      </footer>
    </main>
  );
}
