import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants";

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

// --- 2. CUSTOM DATE PICKER (The Solution) ---
const CustomDatePicker = ({ label, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const [view, setView] = useState("days"); // 'days' or 'years'
  const containerRef = useRef(null);

  // Parse current value or default to today
  const dateVal = value ? new Date(value) : new Date();

  // Internal state for navigation (browsing without selecting)
  const [navDate, setNavDate] = useState(dateVal);

  // Close on outside click
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

  // Update nav state when value changes externally
  useEffect(() => {
    if (value) setNavDate(new Date(value));
  }, [value]);

  const handleDayClick = (day) => {
    const newDate = new Date(navDate.getFullYear(), navDate.getMonth(), day);
    // Format YYYY-MM-DD for standard HTML input compatibility
    const isoDate = newDate.toISOString().split("T")[0];
    onChange({ target: { name: "dob", value: isoDate } });
    setShow(false);
  };

  const changeMonth = (offset) => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + offset, 1));
  };

  const changeYear = (year) => {
    setNavDate(new Date(year, navDate.getMonth(), 1));
    setView("days");
  };

  // Generate Year Range (1950 - Current Year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label className="text-sm font-medium text-zinc-400">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* INPUT TRIGGER */}
      <div
        onClick={() => setShow(!show)}
        className={`w-full bg-black border ${error ? "border-red-500" : "border-zinc-800 focus:border-blue-600"} 
        text-zinc-100 p-3 rounded-md outline-none cursor-pointer flex justify-between items-center transition-colors hover:border-zinc-600`}
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
        <span className="text-zinc-500">📅</span>
      </div>

      {/* ERROR MSG */}
      {error && <span className="text-red-500 text-xs">{error}</span>}

      {/* --- CUSTOM CALENDAR POPUP --- */}
      {show && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-[#09090b] border border-zinc-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            {view === "days" && (
              <button
                onClick={() => changeMonth(-1)}
                type="button"
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                ◀
              </button>
            )}

            <button
              onClick={() => setView(view === "days" ? "years" : "days")}
              type="button"
              className="font-bold text-white hover:bg-zinc-800 px-3 py-1 rounded transition-colors text-sm"
            >
              {months[navDate.getMonth()]} {navDate.getFullYear()} ▾
            </button>

            {view === "days" && (
              <button
                onClick={() => changeMonth(1)}
                type="button"
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                ▶
              </button>
            )}
          </div>

          {/* VIEW: DAYS */}
          {view === "days" && (
            <div>
              <div className="grid grid-cols-7 mb-2 text-center">
                {[
                  { key: "sun", label: "S" },
                  { key: "mon", label: "M" },
                  { key: "tue", label: "T" },
                  { key: "wed", label: "W" },
                  { key: "thu", label: "T" },
                  { key: "fri", label: "F" },
                  { key: "sat", label: "S" },
                ].map((d) => (
                  <span key={d.key} className="text-xs font-bold text-zinc-500">
                    {d.label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for start of month */}
                {Array.from({
                  length: getFirstDayOfMonth(
                    navDate.getMonth(),
                    navDate.getFullYear(),
                  ),
                }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {Array.from({
                  length: getDaysInMonth(
                    navDate.getMonth(),
                    navDate.getFullYear(),
                  ),
                }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    value &&
                    new Date(value).getDate() === day &&
                    new Date(value).getMonth() === navDate.getMonth() &&
                    new Date(value).getFullYear() === navDate.getFullYear();

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: YEARS */}
          {view === "years" && (
            <div className="h-64 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2 pr-1">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => changeYear(year)}
                  className={`py-2 rounded text-sm font-medium transition-colors
                    ${
                      navDate.getFullYear() === year
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 3. OTHER COMPONENTS ---

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  ...props
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
      className={`bg-black border ${error ? "border-red-500" : "border-zinc-800 focus:border-blue-600"} text-zinc-100 p-3 rounded-md outline-none focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-zinc-700 text-sm`}
      {...props}
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
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-black border border-zinc-800 text-zinc-100 p-3 rounded-md outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 appearance-none text-sm cursor-pointer"
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
      <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-600">
        ▼
      </div>
    </div>
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
    "Figma",
    "Next.js",
    "Express",
    "Angular",
  ];
  const toggleSkill = (skill) => {
    const currentArray = selectedSkills
      ? selectedSkills.split(",").filter((s) => s.trim() !== "")
      : [];
    const newSkills = currentArray.includes(skill)
      ? currentArray.filter((s) => s !== skill)
      : [...currentArray, skill];
    onChange({ target: { name: "skills", value: newSkills.join(",") } });
  };
  const currentArray = selectedSkills
    ? selectedSkills.split(",").filter((s) => s.trim() !== "")
    : [];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-400">
        Skills <span className="text-red-500">*</span>
      </label>
      <div className="bg-black border border-zinc-800 rounded-md p-3 min-h-[50px] relative">
        <div className="flex flex-wrap gap-2 mb-2">
          {currentArray.map((skill) => (
            <span
              key={skill}
              className="bg-blue-900/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs flex items-center gap-1"
            >
              {skill}{" "}
              <button
                type="button"
                onClick={() => toggleSkill(skill)}
                className="hover:text-white font-bold ml-1"
              >
                ×
              </button>
            </span>
          ))}
          {currentArray.length === 0 && (
            <span className="text-zinc-600 text-sm py-1">Select skills...</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left text-xs text-blue-500 hover:text-blue-400 mt-1 font-medium"
        >
          {isOpen ? "- Close List" : "+ Add Skills"}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-700 mt-2 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`text-left px-3 py-2 rounded text-xs transition-colors ${currentArray.includes(skill) ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                {skill} {currentArray.includes(skill) && "✓"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ResumeUploader = ({ onFileChange, file, error }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="flex flex-col gap-3 mb-6 bg-zinc-900/20 p-4 rounded-lg border border-zinc-800">
      <label className="text-sm font-medium text-zinc-300">
        Resume/CV <span className="text-red-500">*</span>
      </label>
      <div
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed ${error ? "border-red-500 bg-red-500/5" : "border-zinc-700 hover:border-zinc-500 bg-black"} rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors h-32 group`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) onFileChange(e.target.files[0]);
          }}
        />
        {file ? (
          <div className="flex items-center gap-3 text-green-400 bg-green-900/20 px-4 py-2 rounded-full border border-green-900">
            <span className="text-sm font-medium truncate max-w-[200px]">
              {file.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="text-zinc-500 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="text-2xl mb-2 text-zinc-600 group-hover:text-zinc-400">
              📄
            </span>
            <p className="text-sm text-zinc-400 font-medium">
              Click to upload resume
            </p>
            <p className="text-xs text-zinc-600 mt-1">PDF, DOCX (Max 5MB)</p>
          </>
        )}
      </div>
      {error && !file && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6 mt-8 pb-2 border-b border-zinc-800">
    <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
    {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
  </div>
);

// --- MAIN FORM ---

function FinalForm({ onSuccess }) {
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
    passingYear: "",
    university: "",
    specialization: "",
    cgpa: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
    currentCompany: "",
    currentPosition: "",
    experienceYears: "",
    noticePeriod: "",
    coverLetter: "",
    workAuthorization: "",
  });

  const validateField = (name, value) => {
    let error = "";
    if (
      ["firstName", "lastName", "email", "phone"].includes(name) &&
      !value.trim()
    )
      error = "Required";
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid email";
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation Logic (Check if user is logged in)
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Error: Unauthorized Access. Please Login First.");
      return;
    }

    const requiredFields = ["firstName", "lastName", "email", "phone"];
    let hasError = false;
    requiredFields.forEach((field) => {
      if (validateField(field, formData[field])) hasError = true;
    });

    if (!resumeFile) {
      setErrors((prev) => ({
        ...prev,
        resumeLink: "Please upload your resume",
      }));
      hasError = true;
    }

    if (hasError) return;

    setStatus("loading");

    // 2. Prepare FormData
    const formDataToSend = new FormData();
    formDataToSend.append(
      "fullName",
      `${formData.firstName} ${formData.lastName}`,
    );
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);

    // Combine complex data into experience field
    const fullProfileData = `EDU: ${formData.degree} | SKILLS: ${formData.skills} | EXP: ${formData.experienceYears}`;
    formDataToSend.append("experience", fullProfileData);

    if (resumeFile) formDataToSend.append("resume", resumeFile);

    try {
      await axios.post(`${API_URL}/api/jobs/apply`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus("success");
      // Redirect to status page via onSuccess prop
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setStatus("error");
      const errorMsg =
        err.response?.data?.msg || "Submission failed. Please check file size.";
      alert(errorMsg);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-zinc-950 flex flex-col items-center justify-center p-12 text-center h-full rounded-lg">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
          ✓
        </div>
        <h2 className="text-2xl font-semibold text-white">
          Application Received
        </h2>
        <p className="text-zinc-500 mt-2">Redirecting to status page...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 font-sans p-6 md:p-10 rounded-lg border border-zinc-800 shadow-xl max-w-5xl mx-auto">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Job Application</h1>
        <p className="text-zinc-400">Complete the form below to apply.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionHeader
          title="Personal Details"
          subtitle="Basic contact info."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            required
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <InputField
            required
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
          <InputField
            required
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            required
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={["Male", "Female", "Other"]}
          />

          {/* ✅ CUSTOM DATE PICKER (No More Native Calendar Issues) */}
          <CustomDatePicker
            label="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
          />
        </div>

        <div className="mt-4">
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="City, Country"
          />
        </div>
        <SectionHeader
          title="Resume / CV"
          subtitle="Upload your resume (PDF/DOCX)."
        />
        <ResumeUploader
          file={resumeFile}
          onFileChange={setResumeFile}
          error={errors.resumeLink}
        />
        <SectionHeader title="Education & Experience" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            options={["B.Tech", "B.Sc", "BCA", "MCA", "M.Tech", "MBA"]}
          />
          <InputField
            label="University / College"
            name="college"
            value={formData.college}
            onChange={handleChange}
          />
          <InputField
            label="Current Company"
            name="currentCompany"
            value={formData.currentCompany}
            onChange={handleChange}
          />
          <InputField
            label="Current Role"
            name="currentPosition"
            value={formData.currentPosition}
            onChange={handleChange}
          />
          <SelectField
            label="Total Experience"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
            options={[
              "Fresher",
              "0-1 Years",
              "1-3 Years",
              "3-5 Years",
              "5+ Years",
            ]}
          />
          <SelectField
            label="Notice Period"
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleChange}
            options={["Immediate", "15 Days", "30 Days", "60+ Days"]}
          />
        </div>
        <SectionHeader title="Skills & Web Presence" />
        <SkillSelector
          selectedSkills={formData.skills}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <InputField
            label="LinkedIn"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="linkedin.com/in/..."
          />
          <InputField
            label="GitHub"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="github.com/..."
          />
          <InputField
            label="Portfolio"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="yourwebsite.com"
          />
        </div>
        <div className="pt-8 mt-8 border-t border-zinc-800 flex justify-end gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-3 rounded-md text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {status === "loading" ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FinalForm;
