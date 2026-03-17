import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  //This automatically closes mobile menu when page changes.
  useEffect(() => {
    setOpen(false);
  }, [location]);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isLawyer = role === "lawyer";

  return (
    <>
      <nav className="navbar">
        {/* LEFT */}
        <div className="navbar-left">
          <span className="logo-text">LegalEase</span>
        </div>

        {/* DESKTOP RIGHT */}
        <div className="navbar-right">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isLawyer && (
            <Link to="/upload" className="nav-btn primary">
              Upload Document
            </Link>
          )}
          {isAdmin && (
            <Link to="/create-lawyer" className="nav-btn primary">
              Create Lawyer
            </Link>
          )}

          <Link to="/login" className="nav-btn secondary">
            Logout
          </Link>
        </div>

        {/* MOBILE HAMBURGER */}
        <div
          className={`hamburger ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      <div className={`mobile-menu ${open ? "show" : ""}`}>
        <Link to="/" className="mobile-link" onClick={() => setOpen(false)}>
          Home
        </Link>
        {isLawyer && (
          <Link
            to="/upload"
            className="mobile-link"
            onClick={() => setOpen(false)}
          >
            Upload Document
          </Link>
        )}
        {isAdmin && (
          <Link
            to="/create-lawyer"
            className="mobile-link"
            onClick={() => setOpen(false)}
          >
            Create Lawyer
          </Link>
        )}

        <Link
          to="/login"
          className="mobile-link"
          onClick={() => setOpen(false)}
        >
          Logout
        </Link>
      </div>
    </>
  );
}
