import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [openRole, setOpenRole] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
      );

      const { token, user } = response.data;

      // ✅ STORE USER ID HERE
      localStorage.setItem("userId", user._id);

      // (optional but recommended)
      localStorage.setItem("token", token);

      localStorage.setItem("role", user.role);

      // redirect based on role

      if (user.role === "lawyer") {
        navigate("/lawyer-dashboard");
      } else {
        navigate("/admin-dashboard");
      }
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">LegalEase</h2>
        <p className="login-subtitle">Sign up to your account</p>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Bar Council ID – ONLY FOR LAWYER */}
        {/* {role === "Lawyer" && (
          <div className="form-group">
            <label>Bar Council ID</label>
            <input type="text" placeholder="BCE-12345" />
          </div>
        )} */}

        {/* Sign In Button */}
        <button className="login-btn" onClick={handleLogin}>
          Sign Up
        </button>

        <p className="login-footer">
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
