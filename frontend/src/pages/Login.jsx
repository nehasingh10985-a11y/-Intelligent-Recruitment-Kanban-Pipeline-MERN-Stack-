import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL } from "../constants";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ DARK MODE STATE (Default: Dark)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check LocalStorage for theme preference on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setIsDarkMode(false);
  }, []);

  // Theme Toggle Function
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Step 1: Login Request
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token, user } = res.data;

      // Credentials save karein
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // --- 🛡️ ADMIN vs USER REDIRECTION LOGIC ---
      if (user.role === "admin") {
        // ✅ Agar Admin hai toh seedha Admin Dashboard par bhejein
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        // ✅ Agar normal User hai toh Application Check karein
        try {
          const appRes = await axios.get(`${API_URL}/api/jobs/my-application`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (appRes.data && appRes.data._id) {
            // Form bhara hua hai -> Status Page
            setTimeout(() => navigate("/status"), 500);
          } else {
            // Form nahi bhara -> Application Form
            setTimeout(
              () =>
                navigate("/apply", { state: { info: "incomplete_dossier" } }),
              500,
            );
          }
        } catch (err) {
          // Application nahi mili (404) -> Application Form
          setTimeout(
            () => navigate("/apply", { state: { info: "incomplete_dossier" } }),
            500,
          );
        }
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setStatus("error");
      setErrorMsg(err.response?.data?.msg || "Authentication Failed");
    }
  };
  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-500 
        ${isDarkMode ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* --- 1. TOGGLE BUTTON (Top Right) --- */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 
          ${isDarkMode ? "bg-zinc-900 text-yellow-400 hover:bg-zinc-800" : "bg-white text-blue-600 hover:bg-gray-100"}`}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      {/* --- 2. ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 bg-[size:24px_24px] transition-all duration-500 
            ${
              isDarkMode
                ? "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"
                : "bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]"
            }`}
        ></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- 3. MAIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10 p-4"
      >
        <div
          className={`relative backdrop-blur-xl border rounded-3xl p-8 shadow-2xl overflow-hidden transition-colors duration-300
            ${isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white/70 border-white"}`}
        >
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 mb-4"
            >
              <span className="font-bold text-xl text-white">V</span>
            </motion.div>
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Welcome Back
            </motion.h2>
            <p
              className={`text-sm mt-2 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
            >
              Enter your credentials to access the portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              delay={0.5}
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@company.com"
              icon="mail"
              value={formData.email}
              onChange={handleChange}
              isDarkMode={isDarkMode}
            />

            {/* Password Field with Toggle */}
            <InputField
              delay={0.6}
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              value={formData.password}
              onChange={handleChange}
              isDarkMode={isDarkMode}
            />

            {/* Error Message */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === "loading"}
              className={`group relative w-full font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden
                ${isDarkMode ? "bg-white text-black hover:shadow-blue-500/20" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"}`}
            >
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === "loading" ? "Signing In..." : "Sign In"}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p
              className={`text-xs ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo Credentials Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className={`mt-8 pt-6 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
          >
            <div
              className={`rounded-lg p-3 border flex justify-between items-center text-xs transition-colors duration-300
                ${isDarkMode ? "bg-black/30 border-zinc-800/50 text-zinc-500" : "bg-gray-50 border-gray-200 text-gray-500"}`}
            >
              <div>
                <span
                  className={`block font-bold mb-1 ${isDarkMode ? "text-zinc-400" : "text-gray-700"}`}
                >
                  Admin Demo
                </span>
                <span className="font-mono">admin@veridia.com</span>
              </div>
              <div className="text-right">
                <span
                  className={`block font-bold mb-1 ${isDarkMode ? "text-zinc-400" : "text-gray-700"}`}
                >
                  Pass
                </span>
                <span className="font-mono">admin123</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// --- REUSABLE INPUT COMPONENT (Responsive to Theme) ---
const InputField = ({
  label,
  name,
  type,
  placeholder,
  icon,
  value,
  onChange,
  delay,
  isDarkMode,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: delay }}
      className="space-y-1.5"
    >
      <label
        className={`text-xs font-medium ml-1 transition-colors ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}
      >
        {label}
      </label>
      <div
        className={`relative group transition-all duration-300 ${isFocused ? "scale-[1.01]" : "scale-100"}`}
      >
        {/* Left Icon */}
        <div
          className={`absolute left-3.5 top-3.5 transition-colors duration-300 ${isFocused ? "text-blue-500" : isDarkMode ? "text-zinc-600" : "text-gray-400"}`}
        >
          {icon === "mail" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          )}
          {icon === "lock" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        {/* Input Field (Dynamic Colors) */}
        <input
          required
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={isPassword ? "current-password" : "off"}
          className={`w-full text-sm rounded-xl border py-3.5 pl-11 pr-12 outline-none transition-all duration-300
              ${
                isDarkMode
                  ? "bg-zinc-900/50 text-white border-zinc-800 placeholder:text-zinc-700 focus:border-blue-500/50"
                  : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }
              ${isFocused && isDarkMode ? "shadow-[0_0_20px_rgba(59,130,246,0.1)]" : ""}
            `}
        />

        {/* Show/Hide Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3.5 top-3.5 transition-colors focus:outline-none ${isDarkMode ? "text-zinc-600 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Login;
