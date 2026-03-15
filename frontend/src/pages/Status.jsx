import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { API_URL } from "../constants";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiLogOut,
  FiMoon,
  FiSun,
  FiFileText,
  FiChevronRight,
  FiShield,
  FiCheck,
} from "react-icons/fi";

const Status = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get("/api/jobs/my-application");
        setApplication(res.data);
      } catch (err) {
        console.error("Error fetching application:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [navigate]);

  const getResumeUrl = (link) => {
    if (!link) return "#";
    return link.startsWith("http") ? link : `${API_URL}/${link}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const steps = [
    { id: "Pending", label: "Applied", desc: "Dossier received and indexed." },
    {
      id: "Reviewed",
      label: "Under Review",
      desc: "Human intelligence is evaluating your profile.",
    },
    {
      id: "Interview",
      label: "Interview",
      desc: "Strategic session scheduled with the lead.",
    },
    {
      id: "Hired",
      label: "Hired",
      desc: "Access granted. Welcome to the collective.",
    },
  ];

  // Helper to find the current active step index
  const currentStepIndex = steps.findIndex((s) => s.id === application?.status);
  const currentStepIdx =
    application?.status === "Rejected" ? -1 : currentStepIndex;

  // --- LOADING / REDIRECTING UI ---
  if (loading)
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
            <FiShield className="text-white text-3xl animate-pulse" />
          </div>
          <div className="text-center">
            <h2
              className={`text-sm font-bold tracking-[0.2em] uppercase ${isDark ? "text-white" : "text-black"}`}
            >
              Verifying_Session
            </h2>
            <p className="text-[10px] opacity-40 mt-2 font-mono">
              ESTABLISHING SECURE CONNECTION...
            </p>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F8F9FA] text-zinc-900"}`}
    >
      {/* --- NAVBAR --- */}
      <nav
        className={`border-b ${isDark ? "border-white/5 bg-black/20" : "border-zinc-200 bg-white"} px-6 md:px-12 h-20 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">
            V
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic">
            Veridia
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-zinc-500/10 rounded-lg"
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-widest text-rose-500 px-4 py-2 hover:bg-rose-500/5 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT: USER CARD --- */}
          <div className="lg:col-span-4">
            <div
              className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"}`}
            >
              <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <FiCheckCircle size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">
                Application Tracking
              </p>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-6 leading-tight">
                Welcome back, <br />
                {application?.fullName?.split(" ")[0] || "Candidate"}
              </h1>
              <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-40 font-bold uppercase">Status</span>
                  <span className="text-blue-500 font-black uppercase italic tracking-widest">
                    {application.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-40 font-bold uppercase">Ref No</span>
                  <span className="font-mono opacity-80">
                    {application._id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: TRACKER --- */}
          <div className="lg:col-span-8">
            {/* Rejected State Alert Card */}
            {application.status === "Rejected" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-10 text-center"
              >
                <h3 className="text-red-500 font-black uppercase italic tracking-tighter text-xl">
                  Dossier_Terminated
                </h3>
                <p className="text-xs text-zinc-500 mt-2">
                  The protocol has concluded. Your profile did not meet the
                  current operational requirements.
                </p>
              </motion.div>
            )}

            <div
              className={`p-10 rounded-[2.5rem] border ${isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"}`}
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-12">
                Recruitment Pipeline
              </h3>

              <div className="py-12 px-4 max-w-4xl mx-auto">
                <div className="relative flex justify-between items-center">
                  {/* Background Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-zinc-800 z-0" />

                  {/* Animated Active Progress Line */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    }}
                    className="absolute top-5 left-0 h-[2px] bg-blue-600 z-0"
                  />

                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const isRejected =
                      application.status === "Rejected" && idx === 1;

                    return (
                      <div
                        key={step.id}
                        className="relative z-10 flex flex-col items-center group"
                      >
                        {/* Circle Indicator */}
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{
                            scale: isActive ? 1.2 : 1,
                            backgroundColor:
                              isCompleted || isActive ? "#2563eb" : "#18181b",
                            borderColor:
                              isCompleted || isActive ? "#3b82f6" : "#27272a",
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500
                            ${isActive ? "shadow-[0_0_20px_rgba(37,99,235,0.4)]" : ""}
                          `}
                        >
                          {isCompleted ? (
                            <FiCheck className="text-white text-sm" />
                          ) : (
                            <span
                              className={`text-[10px] font-bold ${isActive ? "text-white" : "text-zinc-600"}`}
                            >
                              0{idx + 1}
                            </span>
                          )}
                        </motion.div>

                        {/* Label & Description */}
                        <div className="mt-4 text-center">
                          <h4
                            className={`text-[10px] font-black uppercase tracking-widest mb-1
                            ${isActive ? "text-blue-500" : isCompleted ? "text-white" : "text-zinc-600"}
                          `}
                          >
                            {step.label}
                          </h4>
                          <p className="hidden md:block text-[8px] font-mono opacity-40 uppercase max-w-[100px] leading-tight">
                            {isActive ? step.desc : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className={`mt-16 p-6 rounded-3xl border border-blue-500/10 bg-blue-500/5`}
              >
                <p className="text-xs leading-relaxed font-medium opacity-70">
                  {application.status === "Pending"
                    ? "We have successfully received your application. Our team is currently reviewing your profile to match it with our requirements."
                    : "Your profile has moved to the next stage. Please stay tuned for further instructions via email."}
                </p>
              </div>
            </div>

            {/* Resume Button */}
            <a
              href={getResumeUrl(application.resumeLink)}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 flex items-center justify-between p-6 rounded-3xl border transition-all 
              ${isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"}`}
            >
              <div className="flex items-center gap-4">
                <FiFileText size={20} />
                <span className="text-xs font-black uppercase tracking-widest">
                  View Submitted Dossier
                </span>
              </div>
              <FiChevronRight size={20} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Status;
