import React from "react";
import { FiUsers, FiSearch, FiCheckCircle, FiXCircle } from "react-icons/fi";

const StatCard = ({ label, count, type, darkMode }) => {
  const config = {
    blue: {
      bg: "from-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-500",
      icon: <FiUsers />,
    },
    amber: {
      bg: "from-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-500",
      icon: <FiSearch />,
    },
    emerald: {
      bg: "from-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-500",
      icon: <FiCheckCircle />,
    },
    rose: {
      bg: "from-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-500",
      icon: <FiXCircle />,
    },
  };

  const theme = config[type] || config.blue;

  return (
    <div
      className={`relative overflow-hidden p-3 md:p-5 rounded-2xl border transition-all duration-300
      ${theme.border} ${darkMode ? "bg-zinc-900/40 backdrop-blur-md" : "bg-white shadow-sm"}`}
    >
      {/* Subtle Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-20 ${theme.bg} to-transparent`}
      />

      <div className="relative z-10 flex flex-col gap-2 md:gap-4">
        <div className="flex justify-between items-center">
          <div
            className={`p-1.5 md:p-2.5 rounded-xl ${darkMode ? "bg-zinc-900" : "bg-zinc-50"} ${theme.text} border ${theme.border}`}
          >
            {theme.icon}
          </div>
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.text.replace("text", "bg")}`}
          />
        </div>

        <div>
          <p
            className={`text-[9px] md:text-[11px] font-bold uppercase tracking-wider opacity-50 ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {label}
          </p>
          <h3
            className={`text-xl md:text-3xl font-black tracking-tighter ${darkMode ? "text-white" : "text-zinc-900"}`}
          >
            {count}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
