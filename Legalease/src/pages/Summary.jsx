import "./Summary.css";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Summary() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  /* MOCK DATA (future: backend API) */
  const summaries = {
    doc1: {
      title: "Employment Agreement",
      type: "Contract",
      uploaded: "10 Feb 2026",
      risk: "Medium",
      summary:
        "This employment agreement follows a standard structure but contains clauses that may pose legal concerns depending on jurisdiction.",
      clauses: [
        {
          name: "Non-Compete Clause",
          risk: "Medium",
          note: "Duration may be considered excessive in certain jurisdictions.",
        },
        {
          name: "Termination Clause",
          risk: "Medium",
          note: "Notice period is not clearly defined.",
        },
      ],
      deadlines: ["Contract Review — 15 Oct 2026"],
      suggestion:
        "Review the non-compete duration and clarify termination notice requirements.",
    },
    doc2: {
      title: "Property Lease",
      type: "Lease",
      uploaded: "05 Feb 2026",
      risk: "Low",
      summary:
        "This lease agreement follows standard residential leasing practices with minimal legal risk.",
      clauses: [],
      deadlines: [],
      suggestion: "No immediate action required.",
    },

    doc3: {
      title: "NDA with Tech Partner",
      type: "NDA",
      uploaded: "12 Feb 2026",
      risk: "High",
      summary:
        "This NDA contains ambiguous liability provisions that may expose the company to legal disputes.",
      clauses: [
        {
          name: "Liability Clause",
          risk: "High",
          note: "Liability cap is unclear and may not sufficiently protect your organization.",
        },
      ],
      deadlines: ["NDA Renewal — 25 Oct 2026"],
      suggestion:
        "Clarify liability limitations and define dispute resolution jurisdiction clearly.",
    },
  };

  const doc = summaries[id];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (!doc) {
    return (
      <div className="summary-page">
        <div className="summary-card">
          <h2>Document not found.</h2>
          <Link to="/lawyer-dashboard" className="dashboard-btn secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-page">
      {loading ? (
        <div className="summary-loading">
          <h3>Analyzing document…</h3>
          <p>AI is reviewing clauses and assessing risks.</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="summary-header">
            <div>
              <h1>{doc.title}</h1>
              <p className="summary-meta">
                {doc.type} • Uploaded on {doc.uploaded}
              </p>
            </div>
            <span className={`badge ${doc.risk.toLowerCase()}`}>
              {doc.risk} Risk
            </span>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <div className="summary-card">
            <h3>🧠 AI Executive Summary</h3>
            <p>{doc.summary}</p>
          </div>

          {/* RISKY CLAUSES */}
          <div className="summary-card">
            <h3>⚠️ Risky Clauses</h3>

            {doc.clauses.length === 0 ? (
              <p className="empty-text">No risky clauses detected.</p>
            ) : (
              doc.clauses.map((clause, index) => (
                <div key={index} className="clause-item">
                  <div className="clause-header">
                    <strong>{clause.name}</strong>
                    <span className={`badge ${clause.risk.toLowerCase()}`}>
                      {clause.risk}
                    </span>
                  </div>
                  <p>{clause.note}</p>
                </div>
              ))
            )}
          </div>

          {/* DEADLINES */}
          <div className="summary-card">
            <h3>📅 Important Deadlines</h3>

            {doc.deadlines.length === 0 ? (
              <p className="empty-text">
                AI did not detect any actionable deadlines.
              </p>
            ) : (
              doc.deadlines.map((d, i) => (
                <div key={i} className="deadline-item">
                  {d}
                </div>
              ))
            )}
          </div>

          {/* RECOMMENDATION */}
          <div className="summary-card">
            <h3>✅ AI Recommendation</h3>
            <p>{doc.suggestion}</p>
          </div>

          {/* ACTIONS */}
          <div className="summary-actions">
            <button className="dashboard-btn">Download AI Summary (PDF)</button>

            <Link to="/lawyer-dashboard" className="dashboard-btn secondary">
              Back to Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
