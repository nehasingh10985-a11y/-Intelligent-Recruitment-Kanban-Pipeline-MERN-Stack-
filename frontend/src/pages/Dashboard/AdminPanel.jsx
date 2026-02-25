import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import api from "../../api";
import StatCard from "./StatCard";
import PipelineColumn from "./PipelineColumn";
import { motion, AnimatePresence } from "framer-motion";

const AdminPanel = ({ darkMode }) => {
  const [columns, setColumns] = useState({
    Pending: [],
    Reviewed: [],
    Hired: [],
    Rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await api.get("/api/jobs/all-applications");
      const apps = res.data;
      setColumns({
        Pending: apps.filter((app) => app.status === "Pending"),
        Reviewed: apps.filter((app) => app.status === "Reviewed"),
        Hired: apps.filter((app) => app.status === "Hired"),
        Rejected: apps.filter((app) => app.status === "Rejected"),
      });
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (appId) => {
    if (!window.confirm("Kyan aap is candidate ko delete karna chahte hain?"))
      return;

    try {
      await api.delete(`/api/jobs/delete/${appId}`);
      setColumns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((status) => {
          updated[status] = updated[status].filter((app) => app._id !== appId);
        });
        return updated;
      });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Candidate delete nahi ho paya. Backend check karein.");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    const startCol = [...columns[source.droppableId]];
    const endCol = [...columns[destination.droppableId]];
    const [movedItem] = startCol.splice(source.index, 1);
    movedItem.status = destination.droppableId;
    endCol.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: startCol,
      [destination.droppableId]: endCol,
    });

    try {
      await api.put(`/api/jobs/update-status/${draggableId}`, {
        status: destination.droppableId,
      });
    } catch (err) {
      fetchApplications();
    }
  };

  const filteredColumns = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return Object.keys(columns).reduce((acc, key) => {
      acc[key] = columns[key].filter((app) =>
        app.fullName.toLowerCase().includes(query),
      );
      return acc;
    }, {});
  }, [columns, searchTerm]);

  if (loading)
    return (
      <div className="p-10 font-mono opacity-50 animate-pulse">
        REMOVING_RECORDS...
      </div>
    );

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">
          Admin_Pipeline
        </h2>
        <input
          type="text"
          placeholder="Filter by name..."
          className={`w-full sm:w-64 px-4 py-2 rounded-xl border outline-none text-sm transition-all
            ${darkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-blue-500" : "bg-white border-zinc-200"}`}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total"
          count={Object.values(columns).flat().length}
          type="blue"
          darkMode={darkMode}
        />
        <StatCard
          label="Reviewing"
          count={columns.Reviewed.length}
          type="amber"
          darkMode={darkMode}
        />
        <StatCard
          label="Hired"
          count={columns.Hired.length}
          type="emerald"
          darkMode={darkMode}
        />
        <StatCard
          label="Rejected"
          count={columns.Rejected.length}
          type="rose"
          darkMode={darkMode}
        />
      </div>

      {/* Kanban Board Area */}
      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <motion.div
            layout
            className="flex lg:grid lg:grid-cols-4 gap-4 min-w-max lg:min-w-full"
          >
            <AnimatePresence mode="popLayout">
              {Object.keys(filteredColumns).map((id) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-[280px] lg:w-full"
                >
                  <PipelineColumn
                    id={id}
                    apps={filteredColumns[id]}
                    darkMode={darkMode}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </DragDropContext>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
