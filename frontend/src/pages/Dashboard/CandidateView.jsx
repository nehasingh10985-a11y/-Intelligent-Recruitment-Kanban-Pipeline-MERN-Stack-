import React, { useState, useEffect } from "react";
import api from "../../api";
import { API_URL } from "../../constants";
import {
  FiMail,
  FiBriefcase,
  FiFileText,
  FiSearch,
  FiEye,
  FiUser,
} from "react-icons/fi";

const CandidateView = ({ darkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/api/jobs/all-applications");
        setCandidates(res.data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredData = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      c.email.toLowerCase().includes(filter.toLowerCase()),
  );

  const getResumeUrl = (link) => {
    if (!link) return "#";
    return link.startsWith("http") ? link : `${API_URL}/${link}`;
  };

  const getStatusStyle = (status) => {
    const base =
      "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ";
    switch (status) {
      case "Hired":
        return (
          base +
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        );
      case "Rejected":
        return base + "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return (
          base +
          "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        );
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center font-mono opacity-50 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="animate-pulse tracking-widest text-xs uppercase">
          Syncing_Candidate_Pool...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <FiUser size={24} />
            </div>
            Candidate_Pool
          </h2>
          <p className="text-[10px] font-mono opacity-40 tracking-[0.2em] uppercase mt-2">
            Veridia Intelligence System // {candidates.length}{" "}
            Registered_Profiles
          </p>
        </div>

        <div className="relative w-full md:w-96 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 group-focus-within:opacity-100 transition-all" />
          <input
            type="text"
            placeholder="Search by identity or mail..."
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-sm outline-none transition-all duration-300
              ${
                darkMode
                  ? "bg-zinc-900/50 border-zinc-800 text-white focus:bg-zinc-900 focus:border-blue-500/50"
                  : "bg-white border-zinc-200 text-zinc-900 shadow-sm focus:border-blue-400"
              }`}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div
        className={`overflow-hidden rounded-[2.5rem] border transition-all duration-500
        ${
          darkMode
            ? "bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm"
            : "bg-white border-zinc-100 shadow-2xl shadow-zinc-200/50"
        }`}
      >
        {/* MOBILE CARDS */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {filteredData.map((c) => (
            <div
              key={c._id}
              className={`p-6 rounded-3xl border ${
                darkMode
                  ? "bg-zinc-900/40 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold uppercase">
                    {c.fullName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-lg tracking-tight leading-none">
                      {c.fullName}
                    </h4>
                    <p className="text-[10px] opacity-40 font-mono mt-1">
                      {c.email}
                    </p>
                  </div>
                </div>
                <span className={getStatusStyle(c.status)}>{c.status}</span>
              </div>

              <div
                className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 ${
                  darkMode
                    ? "bg-zinc-950/50 border-zinc-800"
                    : "bg-white border-zinc-200"
                }`}
              >
                <FiBriefcase className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Experience: {c.experience}
                </span>
              </div>

              <a
                href={getResumeUrl(c.resumeLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg"
              >
                <FiEye size={14} /> View Dossier
              </a>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${
                  darkMode
                    ? "border-zinc-800 text-zinc-500"
                    : "border-zinc-100 text-zinc-400"
                }`}
              >
                <th className="px-8 py-6">Identity & Contact</th>
                <th className="px-8 py-6">Professional_Exp</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/10">
              {filteredData.map((c) => (
                <tr
                  key={c._id}
                  className={`group transition-all duration-300 ${
                    darkMode ? "hover:bg-white/5" : "hover:bg-zinc-50"
                  }`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          darkMode
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {c.fullName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">
                          {c.fullName}
                        </span>
                        <span className="text-[10px] opacity-40 flex items-center gap-1.5 mt-1 lowercase font-mono">
                          <FiMail size={10} className="text-blue-500" />{" "}
                          {c.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${
                        darkMode
                          ? "bg-zinc-800/50 border-zinc-700/50"
                          : "bg-zinc-100 border-zinc-200"
                      }`}
                    >
                      {c.experience}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={getStatusStyle(c.status)}>{c.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <a
                      href={getResumeUrl(c.resumeLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95
                        ${
                          darkMode
                            ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                            : "bg-zinc-900 text-white shadow-lg shadow-zinc-300"
                        }`}
                    >
                      <FiFileText size={12} /> Dossier
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredData.length === 0 && (
          <div className="p-32 text-center opacity-20 flex flex-col items-center gap-4">
            <FiSearch size={48} className="animate-bounce" />
            <p className="text-xs font-mono uppercase tracking-[0.4em]">
              No_Records_Matched_Query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateView;
