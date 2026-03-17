import "./Landing.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaUpload,
  FaBrain,
  FaExclamationTriangle,
  FaLock,
  FaFolderOpen,
  FaBell,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <Header />

      <section className="hero">
        <h1>AI-Powered Legal Document Management</h1>

        <p>
          Streamline your legal workflow with intelligent document analysis,
          automated categorization, risk assessment, and AI-powered
          summarization.
        </p>

        <Link to="/login" className="hero-btn">
          Get Started
        </Link>
      </section>
      <section className="features-section">
        <h2 className="features-title">
          Powerful Features for Modern Legal Practice
        </h2>

        <div className="features-cards">
          <div className="feature-card">
            <FaLock className="feature-icon" />
            <h3>Secure Access</h3>
            <p>
              Role-based access control ensures that only authorized lawyers and
              admins can view sensitive documents.
            </p>
          </div>
          <div className="feature-card">
            <FaUpload className="feature-icon" />
            <h3>Smart Document Upload</h3>
            <p>
              Upload legal documents in PDF or DOCX format with automatic
              classification and secure storage.
            </p>
          </div>

          <div className="feature-card">
            <FaBrain className="feature-icon" />
            <h3>AI Legal Analysis</h3>
            <p>
              Advanced NLP analyzes contracts, agreements, and affidavits to
              extract key clauses and insights.
            </p>
          </div>

          <div className="feature-card">
            <FaFolderOpen className="feature-icon" />
            <h3>Automatic Folder Creation</h3>
            <p>
              Automatically creates document folders if they do not exist and
              organizes files based on document type for easy management.
            </p>
          </div>
          <div className="feature-card">
            <FaExclamationTriangle className="feature-icon" />
            <h3>Risk Detection</h3>
            <p>
              Identifies high-risk clauses, compliance issues, and legal red
              flags to support better decisions.
            </p>
          </div>
          <div className="feature-card">
            <FaBell className="feature-icon" />
            <h3>Deadline & Email Notifications</h3>
            <p>
              Tracks important legal deadlines and sends automated email
              reminders to lawyers to prevent missed dates.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
