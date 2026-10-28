import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./CommentSection.css";

export default function CommentSection({
  issueId,
  session,
  isAdmin = false,
}) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(() => {
    return supabase
      .from("comments")
      .select(`
        *,
        author:profiles!comments_author_id_fkey(full_name, email)
      `)
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });
  }, [issueId]);

  // Load comments for this issue
  const loadComments = useCallback(async () => {
    const { data, error } = await fetchComments();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setComments(data ?? []);
    setLoading(false);
  }, [fetchComments]);

  useEffect(() => {
    if (!issueId) return;

    let active = true;

    async function fetchIssueComments() {
      try {
        const { data, error } = await fetchComments();

        if (!active) return;

        if (error) {
          setError(error.message);
        } else {
          setComments(data ?? []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Failed to load comments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchIssueComments();

    return () => {
      active = false;
    };
  }, [fetchComments, issueId]);

  // Add a comment
  async function handleAddComment(event) {
    event.preventDefault();

    if (!session?.user?.id) {
      setError("Please log in to add a comment.");
      return;
    }

    if (!body.trim()) {
      setError("Please enter a comment.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.from("comments").insert({
      issue_id: issueId,
      body: body.trim(),
      author_id: session.user.id,
    });

    if (error) {
      setError(error.message);
    } else {
      setBody("");
      await loadComments();
    }

    setSaving(false);
  }

  // Delete a comment
  async function handleDeleteComment(comment) {
    const isAuthor = comment.author_id === session?.user?.id;

    if (!isAuthor && !isAdmin) {
      setError("You cannot delete this comment.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setError("");

    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id)
      .select("id");

    if (error) {
      setError(error.message);
      return;
    }

    if (!data?.length) {
      setError("Comment could not be deleted. Check your permissions.");
      return;
    }

    setComments((previous) =>
      previous.filter((item) => item.id !== comment.id)
    );
  }

  return (
    <section className="comments">
      <h3 className="comments-heading">Comments ({comments.length})</h3>

      {error && (
        <div className="comments-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="comments-error-close"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {session && (
        <form onSubmit={handleAddComment} className="comments-form">
          <textarea
            className="comments-textarea"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={5000}
            required
          />

          <button
            type="submit"
            className="comments-add"
            disabled={saving || !body.trim()}
          >
            {saving ? "Adding..." : "Add Comment"}
          </button>
        </form>
      )}

      {loading && issueId ? (
        <p className="comments-empty">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="comments-empty">No comments yet.</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isAuthor = comment.author_id === session?.user?.id;

            return (
              <article key={comment.id} className="comment">
                <div className="comment-header">
                  <div>
                    <strong className="comment-author">
                      {comment.author?.full_name ||
                        comment.author?.email ||
                        "Unknown user"}
                    </strong>

                    <div className="comment-date">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>

                  {(isAuthor || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment)}
                      className="comment-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="comment-body">{comment.body}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}