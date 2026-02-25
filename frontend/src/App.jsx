import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/index";
import Status from "./pages/Status";
import FinalForm from "./pages/FinalForm";

// --- 🛡️ SMART SECURITY GUARD (PrivateRoute - For All Users) ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// --- 👑 ELITE SECURITY GUARD (AdminRoute - ONLY For Admins) ---
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Safely parse user data
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    user = {};
  }

  // ❌ 1. Login nahi hai toh Login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ 2. Login hai par role 'admin' nahi hai toh Status page (Forbidden Access)
  if (user.role !== "admin") {
    console.warn("Access Denied: Admin privileges required.");
    return <Navigate to="/status" replace />;
  }

  // ✅ 3. Authorized Admin
  return children;
};

function App() {
  // --- 🎨 THEME PERSISTENCE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="veridia-app">
      <Routes>
        {/* --- 🌍 PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 🔒 PROTECTED ROUTES (Candidates) --- */}

        <Route
          path="/apply"
          element={
            <PrivateRoute>
              <FinalForm onSuccess={() => (window.location.href = "/status")} />
            </PrivateRoute>
          }
        />

        <Route
          path="/status"
          element={
            <PrivateRoute>
              <Status />
            </PrivateRoute>
          }
        />

        {/* --- 👑 STRICT PROTECTED ROUTE (Admin Only) --- */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        {/* --- 🕵️ CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
