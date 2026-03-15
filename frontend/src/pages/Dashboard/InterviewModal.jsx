import React, { useState } from "react";
import { motion } from "framer-motion";

const InterviewModal = ({ candidate, onClose, onSchedule }) => {
  const [schedule, setSchedule] = useState({ date: "", time: "", link: "" });

  const handleSchedule = () => {
    if (!schedule.date || !schedule.time) {
      alert("Please select both date and time");
      return;
    }
    onSchedule(schedule);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
      >
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-blue-500 mb-2">
          Initialize_Protocol
        </h3>
        <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-6">
          Candidate: {candidate?.fullName || "Unknown"}
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
              Temporal_Date
            </label>
            <input
              type="date"
              value={schedule.date}
              onChange={(e) =>
                setSchedule({ ...schedule, date: e.target.value })
              }
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
              Synchronized_Time
            </label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) =>
                setSchedule({ ...schedule, time: e.target.value })
              }
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
              Meeting_Link (Optional)
            </label>
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={schedule.link}
              onChange={(e) =>
                setSchedule({ ...schedule, link: e.target.value })
              }
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 text-white placeholder-zinc-600"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-all"
          >
            Abort
          </button>
          <button
            onClick={handleSchedule}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
          >
            Confirm_Session
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewModal;
