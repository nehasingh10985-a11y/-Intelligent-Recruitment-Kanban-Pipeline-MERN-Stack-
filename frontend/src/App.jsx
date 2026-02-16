import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Status from "./pages/Status";

// --- 🛡️ SMART SECURITY GUARD (PrivateRoute) ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ Agar login nahi hai toh seedha Login page bhejo
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Token hai -> Page render karo
  return children;
};

function App() {
  return (
    <div className="veridia-app">
      <Routes>
        {/* --- 🌍 PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 🔒 PROTECTED ROUTES --- */}

        {/* Dashboard Access */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Status Page Access */}
        <Route
          path="/status"
          element={
            <PrivateRoute>
              <Status />
            </PrivateRoute>
          }
        />

        {/* --- 🕵️ CATCH ALL (404 Protection) --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
