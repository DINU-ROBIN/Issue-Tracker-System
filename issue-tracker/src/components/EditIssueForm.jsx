import { useState } from "react";
import "./EditIssueForm.css";

export default function EditIssueForm({ issue, onSave, onCancel }) {
  const [title, setTitle] = useState(issue.title || "");
  const [description, setDescription] = useState(issue.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), description: description.trim() });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <h2 className="edit-heading">Edit Issue #{issue.id}</h2>

      <label htmlFor="edit-title" className="edit-label">
        Issue Title
      </label>
      <input
        id="edit-title"
        className="edit-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        required
      />

      <label htmlFor="edit-description" className="edit-label">
        Description
      </label>
      <textarea
        id="edit-description"
        className="edit-input edit-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      <div className="edit-buttons">
        <button type="submit" disabled={saving} className="edit-btn primary">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="edit-btn secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}