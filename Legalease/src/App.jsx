import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Upload from "./pages/Upload";

import LawyerDashboard from "./pages/LawyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Summary from "./pages/Summary";
import CreateLawyer from "./pages/CreateLawyer";

import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages (NO Navbar) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Lawyer-dashboard */}
        <Route
          path="/lawyer-dashboard"
          element={
            <ProtectedRoute allowedRole="lawyer">
              <>
                <Navbar />
                <LawyerDashboard />
              </>
            </ProtectedRoute>
          }
        />
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <>
                <Navbar />
                <AdminDashboard />
              </>
            </ProtectedRoute>
          }
        />

        {/* Upload */}
        <Route
          path="/upload"
          element={
            <>
              <Navbar />
              <Upload />
            </>
          }
        />
        <Route
          path="/summary/:id"
          element={
            <>
              <Navbar />
              <Summary />
            </>
          }
        />
        <Route
          path="/create-lawyer"
          element={
            <ProtectedRoute allowedRole="admin">
              <>
                <Navbar />
                <CreateLawyer />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
