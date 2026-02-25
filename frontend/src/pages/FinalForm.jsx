import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import added for navigation
import { API_URL } from "../constants";
import {
  FiShield,
  FiCpu,
  FiCheck,
  FiFileText,
  FiChevronRight,
  FiLogOut, // Added logout icon
} from "react-icons/fi";

// --- 1. UTILS (Helpers) ---
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

// --- 2. CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const [view, setView] = useState("days");
  const containerRef = useRef(null);
  const dateVal = value ? new Date(value) : new Date();
  const [navDate, setNavDate] = useState(dateVal);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShow(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) setNavDate(new Date(value));
  }, [value]);

  const handleDayClick = (day) => {
    const newDate = new Date(navDate.getFullYear(), navDate.getMonth(), day);
    const isoDate = newDate.toISOString().split("T")[0];
    onChange({ target: { name: "dob", value: isoDate } });
    setShow(false);
  };

  const changeMonth = (offset) =>
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + offset, 1));
  const changeYear = (year) => {
    setNavDate(new Date(year, navDate.getMonth(), 1));
    setView("days");
  };
  const years = Array.from(
    { length: 80 },
    (_, i) => new Date().getFullYear() - i,
  );

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label className="text-sm font-medium text-zinc-400">
        {label} <span className="text-red-500">*</span>
      </label>
      <div
        onClick={() => setShow(!show)}
        className={`w-full bg-black border ${error ? "border-red-500" : "border-zinc-800 focus:border-blue-600"} text-zinc-100 p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors hover:border-zinc-600`}
      >
        <span className={value ? "text-white" : "text-zinc-500"}>
          {value
            ? new Date(value).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Select Date of Birth"}
        </span>
        <span className="text-zinc-500 text-xs">📅</span>
      </div>
      {show && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-[#09090b] border border-zinc-700 rounded-xl shadow-2xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            {view === "days" && (
              <button
                onClick={() => changeMonth(-1)}
                type="button"
                className="p-1 hover:bg-zinc-800 rounded"
              >
                ◀
              </button>
            )}
            <button
              onClick={() => setView(view === "days" ? "years" : "days")}
              type="button"
              className="font-bold text-white hover:bg-zinc-800 px-3 py-1 rounded text-sm"
            >
              {months[navDate.getMonth()]} {navDate.getFullYear()} ▾
            </button>
            {view === "days" && (
              <button
                onClick={() => changeMonth(1)}
                type="button"
                className="p-1 hover:bg-zinc-800 rounded"
              >
                ▶
              </button>
            )}
          </div>
          {view === "days" ? (
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-bold text-zinc-500 text-center"
                >
                  {d}
                </span>
              ))}
              {Array.from({
                length: getFirstDayOfMonth(
                  navDate.getMonth(),
                  navDate.getFullYear(),
                ),
              }).map((_, i) => (
                <div key={i} />
              ))}
              {Array.from({
                length: getDaysInMonth(
                  navDate.getMonth(),
                  navDate.getFullYear(),
                ),
              }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(i + 1)}
                  className={`h-8 w-8 rounded-full text-xs transition-all ${value && new Date(value).getDate() === i + 1 && new Date(value).getMonth() === navDate.getMonth() ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => changeYear(y)}
                  className={`py-2 rounded text-xs ${navDate.getFullYear() === y ? "bg-blue-600" : "bg-zinc-900"}`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 3. INPUT FIELDS & SELECTORS ---
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-zinc-400">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-black border ${error ? "border-red-500" : "border-zinc-800 focus:border-blue-600"} text-zinc-100 p-3 rounded-md outline-none text-sm transition-colors`}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-zinc-400">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-black border border-zinc-800 text-zinc-100 p-3 rounded-md outline-none focus:border-blue-600 appearance-none text-sm cursor-pointer"
    >
      <option value="" disabled>
        Select...
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const SkillSelector = ({ selectedSkills, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const skillOptions = [
    "JavaScript",
    "React.js",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Git",
    "TypeScript",
  ];
  const currentArray = selectedSkills
    ? selectedSkills.split(",").filter((s) => s.trim() !== "")
    : [];

  const toggleSkill = (skill) => {
    const newSkills = currentArray.includes(skill)
      ? currentArray.filter((s) => s !== skill)
      : [...currentArray, skill];
    onChange({ target: { name: "skills", value: newSkills.join(",") } });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-400">
        Skills <span className="text-red-500">*</span>
      </label>
      <div className="bg-black border border-zinc-800 rounded-md p-3 relative">
        <div className="flex flex-wrap gap-2 mb-2">
          {currentArray.map((s) => (
            <span
              key={s}
              className="bg-blue-900/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] flex items-center gap-1"
            >
              {s}{" "}
              <button type="button" onClick={() => toggleSkill(s)}>
                ×
              </button>
            </span>
          ))}
          {currentArray.length === 0 && (
            <span className="text-zinc-600 text-sm">Select skills...</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-blue-500 uppercase font-bold tracking-widest"
        >
          {isOpen ? "- Close" : "+ Add Skills"}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-700 mt-2 rounded-md shadow-xl z-50 p-2 grid grid-cols-2 gap-1">
            {skillOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`text-left px-3 py-2 rounded text-[10px] ${currentArray.includes(s) ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN FORM COMPONENT ---
function FinalForm({ onSuccess }) {
  const navigate = useNavigate(); // Hook for navigation
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    degree: "",
    college: "",
    skills: "",
    experienceYears: "",
  });

  // Logout Function
  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    navigate("/login"); // Redirect to login
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Session expired. Login again.");
    if (!resumeFile)
      return setErrors({ ...errors, resumeLink: "Resume required" });

    setStatus("loading");
    const data = new FormData();
    data.append("fullName", `${formData.firstName} ${formData.lastName}`);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append(
      "experience",
      `EDU: ${formData.degree} | SKILLS: ${formData.skills} | EXP: ${formData.experienceYears}`,
    );
    data.append("resume", resumeFile);

    try {
      await axios.post(`${API_URL}/api/jobs/apply`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      setStatus("error");
      alert("Submission failed.");
    }
  };

  // --- REDIRECTION SUCCESS UI ---
  if (status === "success") {
    return (
      <div className="bg-black flex flex-col items-center justify-center p-12 text-center h-[500px] rounded-[2.5rem] border border-white/5">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-2 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 m-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <FiCheck className="text-white text-2xl" />
          </div>
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          Dossier_Indexed
        </h2>
        <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em] mt-4">
          Transmitting to Secure Node...
        </p>
        <div className="w-40 h-[1px] bg-zinc-800 overflow-hidden mt-6">
          <div className="w-full h-full bg-blue-600 animate-pulse" />
        </div>
      </div>
    );
  }

  // --- PROCESSING LOADING UI ---
  if (status === "loading") {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center bg-black rounded-[2.5rem] border border-white/5">
        <FiCpu className="text-blue-500 text-4xl animate-pulse mb-6" />
        <p className="text-xs font-mono uppercase tracking-[0.4em] opacity-40">
          Encrypting_Transmission...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 font-sans p-6 md:p-10 rounded-[2rem] border border-zinc-800 shadow-2xl max-w-5xl mx-auto">
      {/* --- UPDATED HEADER WITH LOGOUT --- */}
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Identity_Submission
          </h1>
          <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">
            Level 01: Global Talent Intake
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-red-500/10"
        >
          <FiLogOut size={14} /> Exit_Session
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            required
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <InputField
            required
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <InputField
            required
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            required
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <CustomDatePicker
            label="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
          />
          <SelectField
            label="Gender"
            name="gender"
            options={["Male", "Female", "Other"]}
            value={formData.gender}
            onChange={handleChange}
          />
        </div>

        <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
          <label className="text-sm font-medium text-zinc-400 mb-4 block">
            Resume_Archive (PDF/DOCX)
          </label>
          <input
            type="file"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="text-xs text-zinc-500 file:bg-blue-600 file:border-none file:text-white file:px-4 file:py-2 file:rounded-md file:mr-4 file:cursor-pointer"
          />
          {errors.resumeLink && (
            <p className="text-red-500 text-[10px] mt-2">{errors.resumeLink}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Highest Degree"
            name="degree"
            options={["B.Tech", "MCA", "M.Tech", "MBA"]}
            value={formData.degree}
            onChange={handleChange}
          />
          <SelectField
            label="Experience"
            name="experienceYears"
            options={["Fresher", "1-3 Years", "3-5 Years", "5+ Years"]}
            value={formData.experienceYears}
            onChange={handleChange}
          />
        </div>

        <SkillSelector
          selectedSkills={formData.skills}
          onChange={handleChange}
        />

        <div className="flex justify-end pt-6 border-t border-zinc-900">
          <button
            type="submit"
            className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}

export default FinalForm;
