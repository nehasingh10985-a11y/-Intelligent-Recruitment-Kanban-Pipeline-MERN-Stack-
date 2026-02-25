import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import CandidateView from "./CandidateView"; // Table View wala component
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMoon,
  FiSun,
  FiLogOut,
  FiMenu,
  FiX,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pipeline");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Failed to parse user data:", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <div className="h-screen bg-black" />;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${darkMode ? "bg-[#050505] text-white" : "bg-zinc-50 text-zinc-900"}`}
    >
      {/* --- RESPONSIVE NAVBAR --- */}
      <nav
        className={`sticky top-0 z-[100] w-full border-b backdrop-blur-md ${darkMode ? "bg-black/50 border-zinc-800/50" : "bg-white/80 border-zinc-200"}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-500/10 transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg">
                V
              </div>
              <span className="font-black tracking-tighter text-lg hidden xs:block italic uppercase">
                Veridia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all ${darkMode ? "bg-zinc-900 border-zinc-800 text-yellow-400" : "bg-white border-zinc-200 text-zinc-600"}`}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="hidden md:flex p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        {/* --- DESKTOP SIDEBAR (Static for LG screens) --- */}
        {user.role === "admin" && (
          <aside className="hidden lg:flex flex-col w-64 p-6 border-r border-zinc-800/50 space-y-2">
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4 pl-4">
              Management
            </p>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${activeTab === "pipeline" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-zinc-500/10 opacity-50"}`}
            >
              <FiPieChart size={18} /> Admin Pipeline
            </button>
            <button
              onClick={() => setActiveTab("candidate-view")}
              className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${activeTab === "candidate-view" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-zinc-500/10 opacity-50"}`}
            >
              <FiUsers size={18} /> Candidate Pool
            </button>
          </aside>
        )}

        {/* --- MOBILE SIDEBAR (Drawer) --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className={`fixed inset-y-0 left-0 w-72 z-[200] p-6 flex flex-col ${darkMode ? "bg-zinc-950 border-r border-zinc-800" : "bg-white"}`}
              >
                <div className="flex justify-between items-center mb-10 pl-2">
                  <span className="font-black italic uppercase tracking-tighter">
                    Navigation
                  </span>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <FiX size={24} />
                  </button>
                </div>
                <div className="space-y-3 flex-1">
                  <button
                    onClick={() => {
                      setActiveTab("pipeline");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold ${activeTab === "pipeline" ? "bg-blue-600 text-white" : "opacity-50"}`}
                  >
                    <FiPieChart /> Admin Pipeline
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("candidate-view");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold ${activeTab === "candidate-view" ? "bg-blue-600 text-white" : "opacity-50"}`}
                  >
                    <FiUsers /> Candidate View
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-auto p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {user.role === "admin" ? (
                activeTab === "pipeline" ? (
                  <AdminPanel darkMode={darkMode} />
                ) : (
                  <CandidateView darkMode={darkMode} />
                )
              ) : (
                <CandidateView darkMode={darkMode} user={user} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
