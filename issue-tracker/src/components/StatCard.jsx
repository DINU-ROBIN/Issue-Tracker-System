export default function StatCard({ label, count, color }) {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <h2 style={{ ...styles.count, color }}>{count}</h2>
    </div>
  );
}

const styles = {
  card: {
    padding: "16px 18px",
    background: "#ffffff",
    border: "1px solid #e2e5e9",
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  label: {
    margin: "0 0 6px",
    fontSize: 13,
    color: "#52606d",
  },
  count: {
    margin: 0,
    fontSize: 28,
    fontWeight: 600,
  },
};