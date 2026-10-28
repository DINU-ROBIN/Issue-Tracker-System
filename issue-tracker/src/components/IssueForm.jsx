import { useState } from "react";
import "./IssueForm.css";

export default function IssueForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Create issue
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter an issue title.");
      return;
    }

    setSaving(true);

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
      });

      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Failed to create issue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="issue-form">
      <h2 className="issue-form-heading">Create Issue</h2>

      {error && (
        <p className="issue-form-error" role="alert">
          {error}
        </p>
      )}

      <label htmlFor="issue-title" className="issue-form-label">
        Issue Title
      </label>
      <input
        id="issue-title"
        className="issue-form-input"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Enter issue title"
        maxLength={200}
        required
      />

      <label htmlFor="issue-description" className="issue-form-label">
        Description
      </label>
      <textarea
        id="issue-description"
        className="issue-form-input issue-form-textarea"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe the issue"
        rows={4}
      />

      <div className="issue-form-actions">
        <button
          type="submit"
          disabled={saving}
          className="issue-form-btn primary"
        >
          {saving ? "Creating..." : "Create Issue"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="issue-form-btn secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}