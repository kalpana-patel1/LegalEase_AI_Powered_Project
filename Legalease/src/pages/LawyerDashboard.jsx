import "./LawyerDashboard.css";

import { useState } from "react";
import { Link } from "react-router-dom";

export default function LawyerDashboard() {
  const [riskFilter, setRiskFilter] = useState("All");

  /* ---- FUTURE: COMES FROM DATABASE ---- */
  const categories = [
    { name: "Contracts", count: 5 },
    { name: "Agreements", count: 4 },
    { name: "NDAs", count: 2 },
    { name: "Leases", count: 1 },
  ];

  const documents = [
    {
      id: "doc1",
      title: "Employment Agreement",
      desc: "Non-compete clause detected",
      risk: "Medium",
    },
    {
      id: "doc2",
      title: "Property Lease",
      desc: "Standard residential lease",
      risk: "Low",
    },
    {
      id: "doc3",
      title: "NDA with Tech Partner",
      desc: "Unclear liability clause",
      risk: "High",
    },
  ];

  const deadlines = [
    { title: "Employment Agreement", date: "15 Oct", urgent: true },
    { title: "Lease Renewal", date: "20 Oct", urgent: false },
    { title: "NDA Review", date: "25 Oct", urgent: false },
  ];

  /* ---- FILTER LOGIC ---- */
  const filteredDocs =
    riskFilter === "All"
      ? documents
      : documents.filter((d) => d.risk === riskFilter);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <h1 className="dashboard-title">Lawyer Dashboard</h1>
      <p className="dashboard-subtitle">
        Manage your legal documents and track risks efficiently.
      </p>

      {/* Attention (only if needed) */}
      {(documents.length > 0 || deadlines.length > 0) && (
        <div className="attention-box compact">
          ⚠️ <strong>Attention:</strong>{" "}
          {documents.filter((d) => d.risk === "High").length} High Risk •{" "}
          {deadlines.length} Upcoming Deadlines
        </div>
      )}

      {/* TOP GRID: TOTAL + CATEGORIES */}
      <div className="grid-2">
        {/* Total Documents */}
        <div className="panel total-panel">
          <h3>Total Documents</h3>
          <p className="total-count">{documents.length}</p>
        </div>

        {/* Categories */}
        <div className="panel">
          <h3>📁 Categories</h3>

          {categories.length === 0 ? (
            <p className="empty-text">
              No categories yet. Categories will be created automatically after
              upload.
            </p>
          ) : (
            <div className="categories-grid">
              {categories.map((cat, i) => (
                <div key={i} className="category-card">
                  {cat.name} ({cat.count})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* MAIN GRID */}
      {documents.length === 0 ? (
        /* FIRST-TIME USER EMPTY STATE */
        <div className="panel">
          <p className="empty-text">You haven’t uploaded any documents yet.</p>

          <Link to="/upload" className="hero-btn">
            Upload your first document
          </Link>
        </div>
      ) : (
        /* NORMAL DASHBOARD VIEW */
        <div className="grid-2">
          {/* RISK DISTRIBUTION */}
          <div className="panel">
            <h3>📊 Risk Distribution</h3>

            <div className="risk-actions">
              <button
                className={`risk-btn high ${riskFilter === "High" ? "active" : ""}`}
                onClick={() => setRiskFilter("High")}
              >
                High ({documents.filter((d) => d.risk === "High").length})
              </button>

              <button
                className={`risk-btn medium ${riskFilter === "Medium" ? "active" : ""}`}
                onClick={() => setRiskFilter("Medium")}
              >
                Medium ({documents.filter((d) => d.risk === "Medium").length})
              </button>

              <button
                className={`risk-btn low ${riskFilter === "Low" ? "active" : ""}`}
                onClick={() => setRiskFilter("Low")}
              >
                Low ({documents.filter((d) => d.risk === "Low").length})
              </button>

              <button
                className={`risk-btn ${riskFilter === "All" ? "active" : ""}`}
                onClick={() => setRiskFilter("All")}
              >
                All ({documents.length})
              </button>
            </div>
          </div>

          {/* DOCUMENT LIST */}
          <div className="panel">
            <h3>📄 Documents — {riskFilter}</h3>

            {filteredDocs.map((d) => (
              <div key={d.id} className="doc-row">
                <div>
                  <strong>{d.title}</strong>
                  <p>{d.desc}</p>
                </div>
                <div className="doc-actions">
                  <span className={`badge ${d.risk.toLowerCase()}`}>
                    {d.risk}
                  </span>

                  <Link
                    to={`/summary/${d.id}`}
                    className="dashboard-btn secondary"
                  >
                    View Summary
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEADLINES (ONLY IF EXISTS) */}
      {deadlines.length > 0 && (
        <div className="panel">
          <h3>📅 Upcoming Deadlines</h3>

          {deadlines.map((d, i) => (
            <div key={i} className={`deadline ${d.urgent ? "urgent" : ""}`}>
              {d.title} — <span>{d.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
