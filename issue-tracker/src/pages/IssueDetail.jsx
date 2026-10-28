import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import CommentSection from "../components/CommentSection";
import "./IssueDetail.css";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

const STATUS_CLASSES = {
  open: "open",
  in_progress: "progress",
  closed: "closed",
};

export default function IssueDetail() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [issue, setIssue] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the logged-in user
  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) setError(error.message);

      setSession(data?.session ?? null);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAdmin(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check whether the logged-in user is an admin
  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        return;
      }

      setIsAdmin(data?.role === "admin");
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Load the selected issue
  useEffect(() => {
    let cancelled = false;

    async function fetchIssue() {
      await Promise.resolve();
      if (cancelled) return;

      setLoading(true);
      setError("");

      if (!session?.user?.id || !id) {
        setIssue(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("issues")
          .select(
            `
            *,
            creator:profiles!issues_created_by_fkey(full_name, email),
            assignee:profiles!issues_assignee_id_fkey(full_name, email)
          `,
          )
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setError(error.message);
          setIssue(null);
        } else {
          setIssue(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Failed to load issue.");
          setIssue(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchIssue();

    return () => {
      cancelled = true;
    };
  }, [id, session]);

  if (loading) {
    return (
      <main className="issue-page">
        <p>Loading issue...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="issue-page">
        <h1>Issue Details</h1>
        <p>Please log in to view this issue and its comments.</p>
        <Link to="/" className="issue-back">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  if (!issue) {
    return (
      <main className="issue-page">
        <h1>Issue Not Found</h1>

        {error && (
          <p className="issue-error" role="alert">
            {error}
          </p>
        )}

        {!error && <p>This issue may have been deleted or is unavailable.</p>}

        <Link to="/" className="issue-back">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const statusClass = STATUS_CLASSES[issue.status] ?? "closed";

  return (
    <main className="issue-page">
      <Link to="/" className="issue-back">
        ← Back to Dashboard
      </Link>

      {error && (
        <div className="issue-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="issue-error-close"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <article className="issue-card">
        <header className="issue-header">
          <div>
            <h1 className="issue-title">{issue.title}</h1>
            <p className="issue-id">Issue #{issue.id}</p>
          </div>

          <span className={`issue-status ${statusClass}`}>
            {STATUS_LABELS[issue.status] ?? issue.status}
          </span>
        </header>

        <section className="issue-section">
          <h2 className="issue-section-heading">Description</h2>
          <p className="issue-description">
            {issue.description || "No description provided."}
          </p>
        </section>

        <section className="issue-metadata">
          <div className="issue-meta-item">
            <strong>Created by</strong>
            <span>
              {issue.creator?.full_name || issue.creator?.email || "Unknown"}
            </span>
          </div>

          <div className="issue-meta-item">
            <strong>Assigned to</strong>
            <span>{issue.assignee_name || "Unassigned"}</span>
          </div>

          <div className="issue-meta-item">
            <strong>Created at</strong>
            <span>
              {issue.created_at
                ? new Date(issue.created_at).toLocaleString()
                : "Unknown"}
            </span>
          </div>

          <div className="issue-meta-item">
            <strong>Last updated</strong>
            <span>
              {issue.updated_at
                ? new Date(issue.updated_at).toLocaleString()
                : "Not updated"}
            </span>
          </div>
        </section>

        {isAdmin && (
          <div className="issue-admin-notice">
            You are viewing this issue as an administrator.
          </div>
        )}

        <CommentSection
          issueId={issue.id}
          session={session}
          isAdmin={isAdmin}
        />
      </article>
    </main>
  );
}
