// import "./Upload.css";
// import { io } from "socket.io-client";
// import axios from "axios";

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaFileAlt, FaSpinner } from "react-icons/fa";

// const socket = io("http://localhost:5000");

// export default function Upload() {
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const navigate = useNavigate();

//   const handleProcess = () => {
//     setLoading(true);
//     setProgress(0);
//   };

//   // Fake progress animation

//   useEffect(() => {
//     if (!loading) return;

//     const interval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) return 100;
//         return prev + 20;
//       });
//     }, 600);

//     return () => clearInterval(interval);
//   }, [loading]);

//   // Navigate separately when progress hits 100
//   useEffect(() => {
//     if (progress >= 100) {
//       navigate("/lawyer-dashboard");
//     }
//   }, [progress, navigate]);

//   return (
//     <div className="dashboard-page">
//       <div className="panel upload-panel">
//         <h2>Upload Legal Document</h2>
//         <p className="upload-subtitle">
//           Upload PDF or DOC files for AI-powered analysis
//         </p>

//         {!loading ? (
//           <>
//             <div className="upload-box">
//               <FaFileAlt className="upload-icon" />
//               <p>Drag & drop files here or click to browse</p>
//               <input type="file" />
//               <p className="upload-info">
//                 Supported formats: PDF, DOC, DOCX (Max 10MB)
//               </p>
//             </div>

//             <button className="login-btn" onClick={handleProcess}>
//               Process Document
//             </button>
//           </>
//         ) : (
//           <div className="upload-loading">
//             <FaSpinner className="spinner" />
//             <p className="loading-text">Analyzing document…</p>

//             <div className="progress-bar">
//               <div
//                 className="progress-fill"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>

//             <p className="small-text">{getAIStep(progress)}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function getAIStep(progress) {
//   if (progress < 30) return "Reading document…";
//   if (progress < 60) return "Extracting key clauses…";
//   if (progress < 90) return "Detecting risks & deadlines…";
//   return "Finalizing analysis…";
// }

import "./Upload.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaSpinner } from "react-icons/fa";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  // Listen to backend progress
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      socket.emit("joinRoom", userId);
    }

    socket.on("progress", (data) => {
      setProgress(data.percent);
      setStatus(data.message);

      if (data.percent === 100) {
        setTimeout(() => {
          navigate("/lawyer-dashboard");
        }, 1000);
      }
    });

    return () => {
      socket.off("progress");
    };
  }, [navigate]);

  const handleProcess = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userId);

      await axios.post("http://localhost:5000/api/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("RESPONSE:", error.response);
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

            <button className="login-btn" onClick={handleProcess}>
              Process Document
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
