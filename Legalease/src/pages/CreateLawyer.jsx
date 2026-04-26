import "./Login.css"; // reuse login styling
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CreateLawyer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, barCouncilId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Lawyer created successfully");
      navigate("/admin-dashboard");
      setName("");
      setEmail("");
      setPassword("");
      setBarCouncilId("");
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="create-lawyer-page">
      {/* Back Link */}
      <div className="back-wrapper">
        <span
          className="back-link"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/admin-dashboard")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              navigate("/admin-dashboard");
          }}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </span>
      </div>

      {/* Form Section */}
      <div className="login-page">
        <div className="login-card">
          <h2 className="login-title">Create New Lawyer</h2>

          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Bar Council ID</label>
            <input
              value={barCouncilId}
              onChange={(e) => setBarCouncilId(e.target.value)}
            />
          </div>

          <button className="login-btn" onClick={handleCreate}>
            Create Lawyer
          </button>
        </div>
      </div>
    </div>
  );
}
