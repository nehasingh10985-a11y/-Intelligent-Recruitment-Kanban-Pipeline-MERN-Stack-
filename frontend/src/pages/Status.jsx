import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiSun,
  FiMoon,
  FiLogOut,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const themes = {
  Pending: {
    color: "#EAB308",
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
  },
  Reviewed: {
    color: "#3B82F6",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  Interview: {
    color: "#A855F7",
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
  Hired: {
    color: "#22C55E",
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
  },
  Rejected: {
    color: "#EF4444",
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
  },
};

const Status = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        const res = await axios.get(`${API_URL}/api/jobs/my-application`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#050505]" : "bg-white"}`}
      >
        <div
          className={`w-12 h-12 border-4 rounded-full animate-spin ${isDark ? "border-zinc-800 border-t-cyan-500" : "border-zinc-200 border-t-black"}`}
        ></div>
      </div>
    );

  if (!application)
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDark ? "bg-[#050505] text-white" : "bg-zinc-50 text-zinc-900"}`}
      >
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          No Application Found
        </h1>
        <p className="opacity-50 mb-6">
          You haven't submitted any applications yet.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${isDark ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-black text-white hover:bg-zinc-800"}`}
        >
          Browse Jobs
        </button>
      </div>
    );

  const currentTheme = themes[application.status] || themes.Pending;
  const steps = ["Applied", "Reviewed", "Interview", "Decision"];
  const currentStepIdx = [
    "Pending",
    "Reviewed",
    "Interview",
    "Hired",
    "Rejected",
  ].indexOf(application.status);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans p-4 lg:p-12 ${isDark ? "bg-[#080808] text-zinc-100" : "bg-[#fafafa] text-zinc-900"}`}
    >
      {/* --- TOP BAR (Logout & Theme Toggle) --- */}
      <div className="max-w-5xl mx-auto flex justify-end items-center gap-6 mb-12">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${isDark ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-600"}`}
        >
          <FiLogOut size={16} /> Logout
        </button>

        {/* 🌗 THEME TOGGLE SWITCH */}
        <div
          onClick={() => setIsDark(!isDark)}
          className={`relative w-14 h-8 flex items-center px-1 rounded-full cursor-pointer transition-colors ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
        >
          <motion.div
            layout
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${isDark ? "bg-black text-blue-400" : "bg-white text-yellow-500"}`}
            animate={{ x: isDark ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {isDark ? <FiMoon size={14} /> : <FiSun size={14} />}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT: Profile Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div
            className={`p-6 rounded-2xl border transition-all ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}
          >
            <div
              className={`w-14 h-14 rounded-xl ${currentTheme.bg} flex items-center justify-center mb-4`}
            >
              <FiUser className={`text-xl ${currentTheme.text}`} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              {application.fullName}
            </h2>
            <p className="opacity-50 text-sm mb-4">
              Applicant ID: {application._id.slice(-6).toUpperCase()}
            </p>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}
            >
              {application.status}
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl border transition-all ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"} space-y-4`}
          >
            <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">
              Data Points
            </h4>
            <div className="flex items-center gap-3 text-sm">
              <FiMail className="opacity-40" /> <span>{application.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiPhone className="opacity-40" />{" "}
              <span>{application.phone}</span>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT: Timeline --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div
            className={`p-8 rounded-2xl border transition-all ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}
          >
            <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-10">
              Recruitment Pipeline
            </h4>
            <div className="relative flex justify-between">
              <div
                className={`absolute top-5 left-0 w-full h-[2px] ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
              ></div>
              {steps.map((step, idx) => {
                const active = idx <= currentStepIdx;
                return (
                  <div
                    key={step}
                    className="relative z-10 flex flex-col items-center gap-3"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: active ? 1 : 0.8,
                        backgroundColor: active
                          ? isDark
                            ? "#06b6d4"
                            : "#000000"
                          : isDark
                            ? "#18181b"
                            : "#ffffff",
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${active ? "border-transparent text-white" : "border-zinc-800 text-zinc-500"}`}
                    >
                      {active ? (
                        <FiCheckCircle size={18} />
                      ) : (
                        <span className="text-xs">{idx + 1}</span>
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-tighter ${active ? (isDark ? "text-cyan-400" : "text-black") : "opacity-30"}`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
              >
                <FiDownload />
              </div>
              <div>
                <h3 className="text-sm font-bold">Resume_Final.pdf</h3>
                <p className="text-xs opacity-40 text-zinc-400">
                  Verified document
                </p>
              </div>
            </div>
            {application.resumeLink && (
              <a
                href={`${API_URL}/uploads/${application.resumeLink.split(/[/\\]/).pop()}`}
                target="_blank"
                rel="noreferrer"
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"}`}
              >
                VIEW
              </a>
            )}
          </div>

          <motion.div
            layout
            className={`p-5 rounded-2xl border flex gap-4 ${currentTheme.bg} ${currentTheme.border}`}
          >
            <div
              className={`mt-1 h-2 w-2 rounded-full animate-pulse ${currentTheme.bg.replace("/10", "")}`}
            ></div>
            <p
              className={`text-xs leading-relaxed font-medium ${currentTheme.text}`}
            >
              SYSTEM NOTIFICATION: Your profile is currently tagged as{" "}
              <b>{application.status}</b>. Our technical leads are analyzing
              your performance metrics. Stay tuned to your registered email for
              direct comms.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Status;
