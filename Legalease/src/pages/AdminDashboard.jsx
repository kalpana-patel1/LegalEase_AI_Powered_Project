import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Icons } from "../icons";
export default function AdminDashboard() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const token = localStorage.getItem("token");
        const [lawyersRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/lawyers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setLawyers(lawyersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch lawyers");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  if (loading) return <p>Loading lawyers...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  const displayStats = stats || {
    totalLawyers: lawyers.length,
    totalDocuments: 0,
    highRisk: 0,
    pending: 0,
  };
  const UserIcon = Icons.users;
  const handleDelete = async (lawyer) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${lawyer.name}? This will remove their account and all associated documents.`,
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/users/lawyers/${lawyer._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLawyers((prev) => prev.filter((l) => l._id !== lawyer._id));
      // refresh stats
      const statsRes = await axios.get(
        "http://localhost:5000/api/users/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lawyer");
    }
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-subtitle">
        Monitor lawyers, documents, and platform activity.
      </p>

      {/* STATS */}
      <div className="grid-2">
        <div className="panel total-panel">
          <h3>Total Lawyers</h3>
          <p className="total-count">{displayStats.totalLawyers}</p>
        </div>

        <div className="panel total-panel">
          <h3>Total Documents</h3>
          <p className="total-count">{displayStats.totalDocuments}</p>
        </div>
      </div>

      {/* LAWYER LIST */}
      <div className="panel">
        <h3 className="icon-text">
          <UserIcon className="icon-users" /> Registered Lawyers
        </h3>

        {loading && <p>Loading lawyers...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && lawyers.length === 0 ? (
          <p className="empty-text">No lawyers registered yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Bar Council ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lawyer) => (
                <tr key={lawyer._id}>
                  <td>{lawyer.name}</td>
                  <td>{lawyer.barId || lawyer.barCouncilId}</td>
                  <td>
                    <span className="badge low">Active</span>
                    <button
                      className="btn btn-secondary"
                      style={{ marginLeft: 12 }}
                      onClick={() => handleDelete(lawyer)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
