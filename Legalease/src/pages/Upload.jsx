import "./Upload.css";
import { MdWarning } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaSpinner } from "react-icons/fa";
import { io } from "socket.io-client";
import axios from "axios";
import { useRef } from "react";

export default function Upload() {
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      navigate("/login");
      return;
    }

    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", userId);
      setSocketReady(true);
    });

    socketRef.current.on("connect_error", () => {
      console.log("Socket retrying...");
    });
    socketRef.current.on("progress", (data) => {
      console.log(`Progress: ${data.percent}% - ${data.message}`);

      setProgress(data.percent);
      setStatus(data.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleProcess = async () => {
    if (!socketReady) {
      alert("Please wait, connecting...");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      setLoading(true);
      setProgress(10);
      setStatus("Uploading file...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userId);

      const res = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("RESPONSE:", res.data);
      if (res.data.error) {
        alert(res.data.error);
        setLoading(false);
        setProgress(0);
        setStatus("");

        return;
      }

      setProgress(100);
      setStatus("Completed!");

      setTimeout(() => {
        setLoading(false);
        navigate("/lawyer-dashboard");
      }, 1000);
    } catch (error) {
      console.error("ERROR:", error);
      alert(error.response?.data?.error || "Upload failed");
      setLoading(false);
    }
  };
  return (
    <div className="dashboard-page">
      <div className="panel upload-panel">
        <h2>Upload Legal Document</h2>
        <p className="upload-subtitle">
          Upload PDF or DOC files for AI-powered analysis
        </p>

        {!loading ? (
          <>
            <div className="upload-box">
              <FaFileAlt className="upload-icon" />
              <p>Drag & drop files here or click to browse</p>

              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <p className="upload-info">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <button
              className="login-btn"
              onClick={handleProcess}
              disabled={!socketReady}
            >
              {socketReady ? "Process Document" : "Connecting..."}
            </button>
          </>
        ) : (
          <div className="upload-loading">
            <FaSpinner className="spinner" />
            <p className="loading-text">Analyzing document…</p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="small-text">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
