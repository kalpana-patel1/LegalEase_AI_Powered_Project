import "./LawyerDashboard.css";
import { useEffect, useState } from "react";
import { Icons } from "../icons";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LawyerDashboard() {
  const [riskFilter, setRiskFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [documents, setDocuments] = useState([]);

  const formatCategory = (cat) => {
    if (cat === "Property") return "Properties";
    if (cat === "NDA") return "NDAs";
    return cat + "s";
  };
  const WarningIcon = Icons.warning;
  const CategoryIcon = Icons.category;
  const ChartIcon = Icons.chart;
  const DocumentIcon = Icons.document;
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/documents/my-documents",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setDocuments(res.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocs();
  }, []);
  const categoryCount = {};

  documents.forEach((doc) => {
    const cat = doc.category || "Other";

    if (categoryCount[cat]) {
      categoryCount[cat]++;
    } else {
      categoryCount[cat] = 1;
    }
  });
  const high = documents.filter((d) => d.risk?.toLowerCase() === "high").length;
  const medium = documents.filter(
    (d) => d.risk?.toLowerCase() === "medium",
  ).length;
  const low = documents.filter((d) => d.risk?.toLowerCase() === "low").length;

  /* ---- FILTER LOGIC ---- */
  const filteredDocs = documents.filter((d) => {
    const matchCategory =
      categoryFilter === "All" || d.category === categoryFilter;

    // const matchRisk = riskFilter === "All" || d.risk === riskFilter;
    const matchRisk =
      riskFilter === "All" ||
      d.risk?.toLowerCase() === riskFilter.toLowerCase();
    return matchCategory && matchRisk;
  });

  const today = new Date();

  const upcomingDeadlines = documents.flatMap((doc) => {
    let deadlines = [];

    if (doc.displayDeadlines && doc.displayDeadlines.length > 0) {
      //  new docs (already filtered)
      return doc.displayDeadlines;
    }

    //  OLD DOCS → apply filtering here
    const parsed = (doc.deadlines || [])
      .map((d) => {
        let date = new Date(d);

        if (isNaN(date)) {
          const match = d.match(/\b\w+\s\d{1,2},\s\d{4}\b/);

          if (match) {
            let baseDate = new Date(match[0]);

            if (d.toLowerCase().includes("week")) {
              baseDate.setDate(baseDate.getDate() + 7);
            }

            if (d.toLowerCase().includes("month")) {
              baseDate.setMonth(baseDate.getMonth() + 1);
            }

            date = baseDate;
          }
        }

        if (isNaN(date)) return null;

        return {
          title: doc.title,
          date: d,
          dateObj: date,
        };
      })
      .filter(Boolean)
      .filter((d) => d.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);

    const within7 = parsed.filter(
      (d) => (d.dateObj - today) / (1000 * 60 * 60 * 24) <= 7,
    );

    if (within7.length > 0) return within7;

    return parsed.length > 0 ? [parsed[0]] : [];
  });
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // update UI instantly
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
  const categoryInfo = {
    NDA: "Confidentiality agreement",
    Contract: "Business/service agreement",
    Agreement: "General agreement",
    Lease: "Rental/property usage",
    Affidavit: "Sworn legal statement",
    Property: "Ownership/sale documents",
    Court: "Petitions, judgments",
    Tender: "Government notice",
    Other: "General legal document",
  };
  return (
    <div className="dashboard-page">
      {/* Header */}
      <h1 className="dashboard-title">Lawyer Dashboard</h1>
      <p className="dashboard-subtitle">
        Manage your legal documents and track risks efficiently.
      </p>

      {/* Attention (only if needed) */}
      {(documents.length > 0 || upcomingDeadlines.length > 0) && (
        <div className="attention-box compact">
          <WarningIcon className="attention-icon" />
          <div className="attention-text">
            <strong>Attention:</strong>{" "}
            {documents.filter((d) => d.risk === "High").length} High Risk •{" "}
            {upcomingDeadlines.length} Upcoming Deadlines
          </div>
        </div>
      )}

      {/* TOP GRID: TOTAL + CATEGORIES */}
      <div className="grid-2">
        {/* Total Documents */}
        <div className="panel total-panel">
          <h2>Total Documents</h2>
          <p className="total-count">{documents.length}</p>
        </div>

        {/* Categories */}
        <div className="panel">
          <h3>
            <CategoryIcon className="icon-category" /> Categories
          </h3>
          {/* ADD THIS BUTTON HERE */}
          <button
            onClick={() => setCategoryFilter("All")}
            className={`filter-btn ${categoryFilter === "All" ? "active" : ""}`}
          >
            All ({documents.length})
          </button>
          <div className="categories-grid">
            {Object.entries(categoryCount).map(([cat, count]) => (
              <div
                key={cat}
                className={`category-card ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <strong>
                  {formatCategory(cat)} ({count})
                </strong>

                <p className="category-desc">
                  {categoryInfo[cat] || "Legal document"}
                </p>
              </div>
            ))}
          </div>
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
            <h3>
              <ChartIcon className="icon-chart" /> Risk Distribution
            </h3>

            <div className="risk-actions">
              <button
                className={`risk-btn high ${riskFilter === "High" ? "active" : ""}`}
                onClick={() => setRiskFilter("High")}
              >
                High ({high})
              </button>

              <button
                className={`risk-btn medium ${riskFilter === "Medium" ? "active" : ""}`}
                onClick={() => setRiskFilter("Medium")}
              >
                {/* Medium ({documents.filter((d) => d.risk === "Medium").length}) */}
                Medium ({medium})
              </button>

              <button
                className={`risk-btn low ${riskFilter === "Low" ? "active" : ""}`}
                onClick={() => setRiskFilter("Low")}
              >
                {/* Low ({documents.filter((d) => d.risk === "Low").length}) */}
                Low ({low})
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
            <h3>
              <DocumentIcon className="icon-document" /> Documents —{" "}
              {categoryFilter} /{riskFilter}
            </h3>

            {filteredDocs.map((d) => (
              <div key={d._id} className="doc-row">
                <div>
                  <strong>{d.title}</strong>
                </div>
                <div className="doc-actions">
                  <span className={`badge ${d.risk?.toLowerCase()}`}>
                    {d.risk}
                  </span>
                  <Link
                    to={`/summary/${d._id}`}
                    className="dashboard-btn secondary"
                  >
                    View Summary
                  </Link>
                  {/* 🗑 DELETE BUTTON */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(d._id)}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEADLINES (ONLY IF EXISTS) */}
      <div className="panel">
        <h3 className="deadline-title icon-text">
          <WarningIcon className="icon-warning" /> Upcoming Deadlines
        </h3>
        {upcomingDeadlines.length === 0 ? (
          <p>No upcoming deadlines</p>
        ) : (
          upcomingDeadlines.map((d, i) => (
            <div key={i} className="deadline">
              <strong>{d.title}</strong> — <span>{d.date}</span>
              <p>{d.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
