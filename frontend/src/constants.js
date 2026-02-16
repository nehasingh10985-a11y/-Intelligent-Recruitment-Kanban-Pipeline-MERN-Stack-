// Clean URL Logic
const RAW_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Ensure URL doesn't end with / to avoid double slashes in paths like //api/jobs
export const API_URL = RAW_URL.endsWith("/") ? RAW_URL.slice(0, -1) : RAW_URL;
