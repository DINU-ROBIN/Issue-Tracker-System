import { EMPLOYEES } from "./employees";
import CommentSection from "./CommentSection";
import { STATUS_LABELS } from "../dashboardStyles";
import "./IssueCard.css";

const STATUS_CLASSES = {
  open: "open",
  in_progress: "progress",
  closed: "closed",
};

export default function IssueCard({
  issue,
  session,
  isAdmin,
//   users = [],
  onEdit,
  onDelete,
  onStatusChange,
  onAssign,
}) {
  const isOwner = issue.created_by === session.user.id;
  const canEdit = !isAdmin && isOwner;
  const canDelete = isAdmin || isOwner;

  return (
    <article className="card">
      {/* Issue Header */}
      <div className="card-header">
        <span className={`card-status ${STATUS_CLASSES[issue.status] || ""}`}>
          {STATUS_LABELS[issue.status] || issue.status}
        </span>
      </div>

      {/* Issue Content */}
      <h3 className="card-title">{issue.title}</h3>

      <p className="card-description">
        {issue.description || "No description provided."}
      </p>

      {/* Issue Metadata */}
      <div className="card-metadata">
        <p>
          <strong>Created by</strong>
          <span>
            {issue.creator?.full_name || issue.creator?.email || "Unknown"}
          </span>
        </p>

        <p>
          <strong>Assigned to</strong>
          <span>
            {issue.assignee?.full_name || issue.assignee?.email || "Unassigned"}
          </span>
        </p>

        <p>
          <strong>Created</strong>
          <span>
            {issue.created_at
              ? new Date(issue.created_at).toLocaleString()
              : "Unknown"}
          </span>
        </p>

        <p>
          <strong>Updated</strong>
          <span>
            {issue.updated_at
              ? new Date(issue.updated_at).toLocaleString()
              : "Unknown"}
          </span>
        </p>
      </div>

      {/* Administrator Controls */}
      {isAdmin && (
        <div className="card-controls">
          <label htmlFor={`status-${issue.id}`} className="card-label">
            Change status
          </label>

          <select
            id={`status-${issue.id}`}
            className="card-select"
            value={issue.status}
            onChange={(e) => onStatusChange?.(issue, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <p>
            <strong>Assigned to</strong>
            <span>{issue.assignee_name || "Unassigned"}</span>
          </p>

          <select
            id={`assign-${issue.id}`}
            className="card-select"
            value={issue.assignee_name || ""}
            onChange={(e) => onAssign?.(issue, e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {EMPLOYEES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Issue Actions */}
      {(canEdit || canDelete) && (
        <div className="card-buttons">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(issue)}
              className="card-btn"
            >
              Edit Issue
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(issue)}
              className="card-btn danger"
            >
              Delete Issue
            </button>
          )}
        </div>
      )}

      {/* Comments */}
      <CommentSection issueId={issue.id} session={session} isAdmin={isAdmin} />
    </article>
  );
}
