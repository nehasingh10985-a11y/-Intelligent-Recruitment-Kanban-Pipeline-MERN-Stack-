import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FinalForm from "./FinalForm";
import { API_URL } from "../constants";

// --- ✅ FINAL ROBUST LINK CLEANER ---
const getResumeUrl = (link) => {
  if (!link) return null;

  // 1. Agar link already http/https hai, toh wahi return karo
  if (link.startsWith("http") || link.startsWith("https")) {
    if (link.includes("drive.google.com") && link.includes("/view")) {
      return link.replace("/view", "/preview");
    }
    return link;
  }

  // 2. Decode URL (remove %20 etc)
  let cleanName = decodeURIComponent(link);

  // 3. Remove "File:", "file://", "C:\Path" etc from START
  // Regex Explanation:
  // ^       -> Start of string
  // (?:     -> Non-capturing group
  // file:\/\/ -> Matches "file://"
  // |       -> OR
  // File:\ * -> Matches "File:" followed by optional spaces
  // |       -> OR
  // .*[\/\\] -> Matches any folder path like "C:/Users/"
  // )
  cleanName = cleanName
    .replace(/^(?:file:\/\/|File:\s*|file:\s*|.*[\/\\])/i, "")
    .trim();

  // 4. Remove "(Uploaded)" or similar from END
  // Regex Explanation:
  // \s* -> Optional space
  // \(      -> Opening bracket
  // uploaded -> The word "uploaded"
  // \)      -> Closing bracket
  // $       -> End of string
  // i       -> Case insensitive (Uploaded/uploaded match karega)
  cleanName = cleanName.replace(/\s*\(uploaded\)$/i, "").trim();

  // 5. Return Clean URL
  return `${API_URL}/uploads/${cleanName}`;
};

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "??";

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-zinc-800 text-zinc-300 border-zinc-700";
    case "Reviewed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Hired":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "Rejected":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-zinc-800 text-zinc-300";
  }
};

const getStepStatus = (currentStatus, stepIndex) => {
  const statusMap = { Pending: 1, Reviewed: 2, Hired: 3, Rejected: 3 };
  const currentStep = statusMap[currentStatus] || 1;
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "upcoming";
};
const getCandidateTheme = (status) => {
  switch (status) {
    case "Hired":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        bar: "bg-emerald-500",
      };
    case "Rejected":
      return {
        text: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        bar: "bg-rose-500",
      };
    case "Interview":
      return {
        text: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        bar: "bg-violet-500",
      };
    default:
      return {
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        bar: "bg-blue-500",
      };
  }
};
// ==========================================
// 1. ADMIN PANEL
// ==========================================
const AdminPanel = ({ darkMode }) => {
  const [columns, setColumns] = useState({
    Pending: [],
    Reviewed: [],
    Hired: [],
    Rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingResume, setViewingResume] = useState(null);

  // Fetch all applications for admin panel
  const fetchApplications = async () => {
    try {
      const res = await api.get("/api/jobs/all-applications");
      const applications = res.data;

      // Group applications by status
      const newColumns = {
        Pending: applications.filter((app) => app.status === "Pending"),
        Reviewed: applications.filter((app) => app.status === "Reviewed"),
        Hired: applications.filter((app) => app.status === "Hired"),
        Rejected: applications.filter((app) => app.status === "Rejected"),
      };
      setColumns(newColumns);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await api.delete(`/api/jobs/delete/${id}`);
        // Refresh list after delete
        fetchApplications();
      } catch (err) {
        alert("Error deleting application");
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onDragEnd = async (result) => {
    if (searchTerm || !result.destination) return;
    const { source, destination, draggableId } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const startColumn = [...columns[source.droppableId]];
    const finishColumn = [...columns[destination.droppableId]];
    const [movedItem] = startColumn.splice(source.index, 1);

    movedItem.status = destination.droppableId;
    finishColumn.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: startColumn,
      [destination.droppableId]: finishColumn,
    });

    try {
      await api.put(`/api/jobs/update-status/${draggableId}`, {
        status: destination.droppableId,
      });
    } catch (err) {
      fetchApplications();
    }
  };
  const stats = {
    total: Object.values(columns).flat().length,
    hired: columns.Hired?.length || 0,
    pending: columns.Pending?.length || 0,
    reviewed: columns.Reviewed?.length || 0,
  };

  if (loading)
    return <div className="text-zinc-500 p-6">Loading Pipeline...</div>;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2
            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Pipeline
          </h2>
          <p className="text-xs opacity-60">Manage candidates</p>
        </div>
        <input
          type="text"
          placeholder="Filter candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`border px-4 py-2 rounded-lg text-sm w-full sm:w-64 focus:outline-none transition-colors ${darkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-blue-500" : "bg-white border-gray-300 text-black focus:border-blue-500"}`}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className={`p-4 rounded-xl border ${darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">
            Total Pipeline
          </p>
          <p
            className={`text-2xl font-black ${darkMode ? "text-white" : "text-zinc-900"}`}
          >
            {stats.total}
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${darkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">
            Hired
          </p>
          <p
            className={`text-2xl font-black ${darkMode ? "text-white" : "text-zinc-900"}`}
          >
            {stats.hired}
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${darkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
            Pending Review
          </p>
          <p
            className={`text-2xl font-black ${darkMode ? "text-white" : "text-zinc-900"}`}
          >
            {stats.pending}
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${darkMode ? "bg-rose-500/5 border-rose-500/20" : "bg-rose-50 border-rose-200"}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">
            Rejection Rate
          </p>
          <p
            className={`text-2xl font-black ${darkMode ? "text-white" : "text-zinc-900"}`}
          >
            {stats.total > 0
              ? Math.round((columns.Rejected.length / stats.total) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-y-auto pb-20 pr-2 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(columns).map(([columnId, columnApps]) => {
              const filteredApps = columnApps.filter((app) =>
                app.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
              );
              return (
                <div
                  key={columnId}
                  className={`flex flex-col rounded-xl border min-h-[300px] ${darkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-gray-50 border-gray-200"}`}
                >
                  <div
                    className={`p-4 border-b flex justify-between items-center rounded-t-xl ${darkMode ? "border-zinc-800 bg-zinc-900/50" : "border-gray-200 bg-gray-100"}`}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {columnId}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-gray-200 text-gray-600"}`}
                    >
                      {filteredApps.length}
                    </span>
                  </div>
                  <Droppable
                    droppableId={columnId}
                    isDropDisabled={!!searchTerm}
                  >
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-3 transition-colors ${snapshot.isDraggingOver ? (darkMode ? "bg-zinc-800/30" : "bg-gray-100") : ""}`}
                      >
                        {filteredApps.map((app, index) => (
                          <Draggable
                            key={app._id}
                            draggableId={app._id}
                            index={index}
                            isDragDisabled={!!searchTerm}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 p-4 rounded-lg border shadow-sm group relative ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"}`}
                              >
                                {/* --- DELETE BUTTON (Top Right Corner) --- */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Dragging na shuru ho isliye
                                    handleDelete(app._id);
                                  }}
                                  className="absolute top-2 right-2 text-zinc-500 hover:text-red-500 transition-colors"
                                  title="Delete Application"
                                >
                                  🗑️
                                </button>

                                <div className="font-bold text-sm mb-1">
                                  {app.fullName}
                                </div>
                                <div className="text-xs opacity-60 mb-3">
                                  {app.phone}
                                </div>
                                <button
                                  onClick={() =>
                                    setViewingResume(
                                      getResumeUrl(app.resumeLink),
                                    )
                                  }
                                  className="text-[10px] w-full py-1.5 bg-blue-500/10 text-blue-500 rounded font-medium hover:bg-blue-500/20"
                                >
                                  View Resume
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
      {/* VIEW RESUME MODAL */}
      {viewingResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
              <h3 className="font-bold text-white">Resume Preview</h3>
              <div className="flex gap-4">
                <a
                  href={viewingResume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400 hover:underline"
                >
                  Open Original ↗
                </a>
                <button
                  onClick={() => setViewingResume(null)}
                  className="text-zinc-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 bg-zinc-950 relative">
              <iframe
                src={viewingResume}
                className="w-full h-full border-0"
                title="Resume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. CANDIDATES LIST
// ==========================================
const CandidatesTable = ({ darkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/jobs/all-applications");
        setCandidates(res.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2
            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Candidates List
          </h2>
          <p
            className={`text-xs opacity-60 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            View and manage all applications
          </p>
        </div>
        <input
          placeholder="Search candidates..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`px-4 py-2 rounded-lg text-sm border outline-none w-full md:w-64 transition-colors ${darkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-blue-500" : "bg-white border-gray-300 text-black focus:border-blue-500"}`}
        />
      </div>

      {/* 👇👇👇 MAIN FIX HERE (Removed 'hidden md:block', Added 'overflow-x-auto') 👇👇👇 */}
      <div
        className={`flex-1 overflow-x-auto border rounded-xl ${darkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}
      >
        <div className="min-w-[800px]">
          {" "}
          {/* Ensures table doesn't squish on mobile */}
          <table
            className={`w-full text-left text-sm ${darkMode ? "text-zinc-400" : "text-gray-600"}`}
          >
            <thead
              className={`uppercase text-xs sticky top-0 z-10 ${darkMode ? "bg-zinc-950 text-zinc-500" : "bg-gray-50 text-gray-500"}`}
            >
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${darkMode ? "divide-zinc-800" : "divide-gray-100"}`}
            >
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className={`transition-colors group ${darkMode ? "hover:bg-zinc-800/40" : "hover:bg-gray-50"}`}
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${darkMode ? "bg-zinc-800 text-zinc-300" : "bg-gray-200 text-gray-700"}`}
                      >
                        {getInitials(c.fullName)}
                      </div>
                      <span
                        className={darkMode ? "text-white" : "text-gray-900"}
                      >
                        {c.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <div className="flex flex-col">
                      <span>{c.email}</span>
                      <span className="opacity-50">{c.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.resumeLink ? (
                      <a
                        href={getResumeUrl(c.resumeLink)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline text-xs font-bold"
                      >
                        View ↗
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD SHELL
// ==========================================
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myApplication, setMyApplication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const fetchMyApplication = async (token) => {
    try {
      const res = await api.get("/api/jobs/my-application");
      setMyApplication(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setMyApplication(null);
      }
    }
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (parsedUser.role === "candidate") fetchMyApplication(token);
  }, [navigate]);

  if (!user)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );

  // --- CANDIDATE VIEW ---
  // 👇👇👇 REPLACE THIS CANDIDATE BLOCK 👇👇👇
  // 👇👇👇 REPLACE THIS CANDIDATE BLOCK 👇👇👇
  if (user.role === "candidate") {
    // 1. Progress Steps
    const steps = ["Applied", "Review", "Interview", "Decision"];
    let activeStep = 0;

    // 2. Determine Active Step & Color
    let statusColor = "blue"; // Default
    if (myApplication) {
      if (myApplication.status === "Hired") {
        activeStep = 4;
        statusColor = "emerald";
      } else if (myApplication.status === "Rejected") {
        activeStep = 4;
        statusColor = "red";
      } else if (myApplication.status === "Interview") {
        activeStep = 3;
        statusColor = "violet";
      } else if (myApplication.status === "Reviewed") {
        activeStep = 2;
        statusColor = "blue";
      } else {
        activeStep = 1;
        statusColor = "amber";
      }
    }

    // 3. Dynamic Styles based on Dark Mode
    const bgClass = darkMode
      ? "bg-[#09090b] text-zinc-100"
      : "bg-gray-50 text-gray-900";
    const cardClass = darkMode
      ? "bg-zinc-900 border-zinc-800"
      : "bg-white border-gray-200 shadow-sm";
    const textMuted = darkMode ? "text-zinc-500" : "text-gray-500";
    const borderClass = darkMode ? "border-zinc-800" : "border-gray-200";

    return (
      <div
        className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${bgClass}`}
      >
        {/* --- Navbar --- */}
        <nav
          className={`w-full border-b ${borderClass} px-8 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
            >
              V
            </div>
            <span className="font-bold text-lg tracking-tight">TechNova</span>
          </div>

          <div className="flex items-center gap-4">
            {/* 🌗 Dark/Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all ${darkMode ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className={`text-xs font-bold uppercase tracking-widest hover:underline ${textMuted}`}
            >
              Sign Out
            </button>
          </div>
        </nav>

        {/* --- Main Content --- */}
        <div className="flex-1 flex flex-col items-center p-6 sm:p-10 max-w-5xl mx-auto w-full">
          {!myApplication ? (
            // Empty State
            !showForm ? (
              <div
                className={`my-auto text-center border border-dashed rounded-2xl p-12 w-full max-w-lg ${borderClass} ${darkMode ? "bg-zinc-900/30" : "bg-white"}`}
              >
                <h2 className="text-2xl font-bold mb-2">
                  No Active Application
                </h2>
                <p className={`${textMuted} mb-8`}>
                  Start your journey with us today.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className={`px-8 py-2.5 rounded-lg font-bold transition-transform hover:scale-105 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                >
                  Apply Now
                </button>
              </div>
            ) : (
              <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                <button
                  onClick={() => setShowForm(false)}
                  className={`mb-6 text-sm flex items-center gap-2 hover:underline ${textMuted}`}
                >
                  ← Cancel
                </button>
                <div className={`p-8 rounded-2xl border ${cardClass}`}>
                  <FinalForm
                    onSuccess={() => {
                      setShowForm(false);
                      fetchMyApplication(localStorage.getItem("token"));
                      navigate("/status");
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            // ✅ MINIMALIST DASHBOARD GRID
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 1. Header Card */}
              <div
                className={`md:col-span-3 border p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${cardClass}`}
              >
                <div>
                  <h1 className="text-3xl font-bold mb-1 tracking-tight">
                    {myApplication.fullName}
                  </h1>
                  <p
                    className={`text-sm font-mono uppercase tracking-wider ${textMuted}`}
                  >
                    ID: #{myApplication._id.slice(-6)} • Software Engineer
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest 
                       ${
                         myApplication.status === "Hired"
                           ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                           : myApplication.status === "Rejected"
                             ? "bg-red-100 text-red-700 border-red-200"
                             : myApplication.status === "Interview"
                               ? "bg-violet-100 text-violet-700 border-violet-200"
                               : "bg-blue-100 text-blue-700 border-blue-200"
                       }`}
                >
                  {myApplication.status}
                </div>
              </div>

              {/* 2. Timeline Card */}
              <div
                className={`md:col-span-2 border p-8 rounded-2xl flex flex-col justify-center ${cardClass}`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-8 ${textMuted}`}
                >
                  Application Status
                </h3>

                <div className="relative px-2">
                  {/* Background Line */}
                  <div
                    className={`absolute top-[11px] left-0 w-full h-[2px] rounded-full ${darkMode ? "bg-zinc-800" : "bg-gray-200"}`}
                  ></div>
                  {/* Active Line */}
                  <div
                    className={`absolute top-[11px] left-0 h-[2px] rounded-full transition-all duration-1000 
                          ${statusColor === "emerald" ? "bg-emerald-500" : statusColor === "red" ? "bg-red-500" : statusColor === "violet" ? "bg-violet-500" : "bg-blue-500"}`}
                    style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                  ></div>

                  <div className="flex justify-between relative z-10">
                    {steps.map((step, i) => {
                      const completed = i + 1 <= activeStep;
                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center gap-3"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-[10px] font-bold
                                      ${
                                        completed
                                          ? statusColor === "emerald"
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : statusColor === "red"
                                              ? "bg-red-500 border-red-500 text-white"
                                              : statusColor === "violet"
                                                ? "bg-violet-500 border-violet-500 text-white"
                                                : "bg-blue-500 border-blue-500 text-white"
                                          : darkMode
                                            ? "bg-zinc-900 border-zinc-700 text-zinc-500"
                                            : "bg-white border-gray-300 text-gray-400"
                                      }`}
                          >
                            {completed ? "✓" : i + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${completed ? (darkMode ? "text-white" : "text-black") : textMuted}`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Resume & Info Card */}
              <div
                className={`md:col-span-1 border p-6 rounded-2xl flex flex-col gap-6 ${cardClass}`}
              >
                <div>
                  <h3
                    className={`text-xs font-bold uppercase tracking-widest mb-3 ${textMuted}`}
                  >
                    Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={textMuted}>Email</span>
                      <span
                        className="truncate max-w-[120px]"
                        title={myApplication.email}
                      >
                        {myApplication.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textMuted}>Phone</span>
                      <span>{myApplication.phone}</span>
                    </div>
                  </div>
                </div>

                <div className={`pt-4 border-t ${borderClass}`}>
                  <h3
                    className={`text-xs font-bold uppercase tracking-widest mb-3 ${textMuted}`}
                  >
                    Documents
                  </h3>
                  {myApplication.resumeLink ? (
                    <a
                      href={getResumeUrl(myApplication.resumeLink)}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-colors border
                             ${darkMode ? "bg-white text-black hover:bg-zinc-200 border-transparent" : "bg-black text-white hover:bg-gray-800 border-transparent"}`}
                    >
                      <span>View Resume</span> ↗
                    </a>
                  ) : (
                    <div
                      className={`w-full py-2.5 rounded-lg text-center text-sm font-medium cursor-not-allowed ${darkMode ? "bg-zinc-800 text-zinc-500" : "bg-gray-100 text-gray-400"}`}
                    >
                      No Resume
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // --- ADMIN VIEW ---
  return (
    <div
      className={`min-h-screen font-sans flex flex-col md:flex-row h-screen overflow-hidden transition-colors duration-300 ${darkMode ? "bg-black text-zinc-300" : "bg-gray-100 text-gray-800"}`}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-200"}`}
      >
        <div
          className={`h-16 flex items-center justify-between px-6 border-b ${darkMode ? "border-zinc-800" : "border-gray-200"}`}
        >
          <span
            className={`font-bold text-xl ${darkMode ? "text-white" : "text-black"}`}
          >
            Moon
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-2xl opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("overview");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "overview" ? (darkMode ? "bg-zinc-800 text-white" : "bg-gray-200 text-black") : "opacity-60 hover:opacity-100 hover:bg-zinc-500/10"}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => {
              setActiveTab("candidates");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "candidates" ? (darkMode ? "bg-zinc-800 text-white" : "bg-gray-200 text-black") : "opacity-60 hover:opacity-100 hover:bg-zinc-500/10"}`}
          >
            Candidates
          </button>
        </div>
        <div
          className={`absolute bottom-0 w-full p-4 border-t ${darkMode ? "border-zinc-800" : "border-gray-200"}`}
        >
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full text-center px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header
          className={`h-16 border-b flex items-center justify-between px-4 md:px-6 backdrop-blur-md shrink-0 transition-colors duration-300 ${darkMode ? "border-zinc-800 bg-black/50" : "border-gray-300 bg-white/80"}`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden text-2xl p-1 rounded hover:bg-zinc-500/10 ${darkMode ? "text-white" : "text-black"}`}
            >
              ☰
            </button>
            <h1
              className={`text-lg font-bold capitalize ${darkMode ? "text-white" : "text-gray-800"}`}
            >
              {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all ${darkMode ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-4 md:p-6 w-full relative">
          {activeTab === "overview" ? (
            <AdminPanel darkMode={darkMode} />
          ) : (
            <CandidatesTable darkMode={darkMode} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
