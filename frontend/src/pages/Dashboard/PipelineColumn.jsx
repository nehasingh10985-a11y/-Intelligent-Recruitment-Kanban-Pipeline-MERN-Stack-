import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { FiFileText, FiTrash2 } from "react-icons/fi";
import { API_URL } from "../../constants";

const PipelineColumn = ({ id, apps, darkMode, onDelete }) => {
  // Resume URL fix karne ke liye helper
  const getResumeUrl = (link) => {
    if (!link) return "#";
    return link.startsWith("http") ? link : `${API_URL}/${link}`;
  };

  return (
    <div
      className={`flex flex-col rounded-[2rem] border h-full min-h-[400px] transition-all duration-500
      ${darkMode ? "bg-zinc-950/40 border-zinc-800/50" : "bg-zinc-50 border-zinc-200"}`}
    >
      <div
        className={`p-4 border-b-2 flex justify-between items-center rounded-t-[2rem]
        ${id === "Hired" ? "border-emerald-500/30" : id === "Rejected" ? "border-rose-500/30" : "border-blue-500/30"}`}
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          {id}
        </h3>
        <span className="text-[10px] bg-zinc-800/50 px-2 py-0.5 rounded-lg font-bold">
          {apps.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-3 flex-1 transition-colors duration-300 ${
              snapshot.isDraggingOver ? "bg-blue-500/5" : ""
            }`}
          >
            {apps.map((app, index) => (
              <Draggable key={app._id} draggableId={app._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group mb-3 p-4 rounded-2xl border transition-all duration-300 ease-out
                      ${
                        snapshot.isDragging
                          ? "scale-105 rotate-[2deg] shadow-2xl bg-blue-500/10 border-blue-500 z-50 ring-4 ring-blue-500/10"
                          : "shadow-sm border-transparent hover:border-zinc-700/50"
                      }
                      ${
                        darkMode
                          ? "bg-zinc-900 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 truncate pr-2">
                        <h4 className="text-sm font-bold truncate tracking-tight">
                          {app.fullName}
                        </h4>
                        <p className="text-[9px] font-mono opacity-30 mt-1 uppercase tracking-widest">
                          REF_{app._id.slice(-4)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(app._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <a
                      href={getResumeUrl(app.resumeLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                        ${
                          darkMode
                            ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200"
                        }`}
                    >
                      <FiFileText size={12} className="text-blue-500" /> View
                      Resume
                    </a>
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
};

export default PipelineColumn;
