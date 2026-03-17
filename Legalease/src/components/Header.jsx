import "./Header.css";

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="navbar">
      <h2 className="logo">LegalEase</h2>

      <Link to="/login" className="signin-link">
        Sign In
      </Link>
    </nav>
  );
}
