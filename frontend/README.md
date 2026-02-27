# Intelligent Recruitment & Kanban Pipeline (MERN Stack)

A comprehensive Job Portal and Applicant Tracking System (ATS) designed to streamline the hiring process. This project features a futuristic UI, role-based authentication, and a dynamic Kanban board for candidate management.

## 🚀 Core Features

- **Role-Based Access Control:** Secure separate dashboards for Admins (Recruiters) and Candidates.
- **Kanban Recruitment Pipeline:** Interactive Drag-and-Drop system to manage candidate stages (Pending, Reviewed, Interview, Hired).
- **Real-time Analytics:** Automated calculation of hiring stats, success rates, and pipeline volume.
- **Smart Resume Hub:** Integrated document previewer with robust path-cleaning logic for cross-OS compatibility.
- **Debounced Search:** Optimized filtering system to handle high-volume data without performance lag.

## 🛠 Tech Stack

### Frontend

- **React.js + Vite** (High-performance build tool)
- **Tailwind CSS** (Modern Glassmorphism UI)
- **Framer Motion** (Production-ready animations)
- **@hello-pangea/dnd** (Professional Drag & Drop logic)

### Backend

- **Node.js & Express.js**
- **MongoDB Atlas** (Scalable Cloud Database)
- **JWT (JSON Web Tokens)** (State-of-the-art authentication)
- **Multer** (Secure File System management)

## 📦 Quick Start

### 1. Clone the repository

```
bash
git clone https://github.com/nehasingh10985-a11y/-Intelligent-Recruitment-Kanban-Pipeline-MERN-Stack-.git

cd -Intelligent-Recruitment-Kanban-Pipeline-MERN-Stack-
```

### 2. Backend Configuration

```
bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
# Create a .env file and add:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start the server (production)
npm start

# OR start the server (development with auto-reload)
npm run dev
```

### 3. Frontend Configuration

```
bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛡 Security & Optimization

- **Route Guarding:** Protected routes ensured by JWT validation.
- **API Strategy:** Centralized API management using environment variables.
- **UI/UX:** Responsive design optimized for both Desktop and Mobile users.

## ☁️ Cloud File Integration (ImageKit)

The system is integrated with **ImageKit.io** to handle high-performance file uploads. Instead of saving resumes locally, the application uses a cloud-first approach:

- **Memory Buffering:** Files are processed in-memory using `Multer` and streamed directly to the cloud, reducing server disk usage.
- **Dynamic Optimization:** Resumes and documents are delivered via ImageKit's global CDN for faster access by recruiters.
- **Secure Handling:** Private API keys are managed via environment variables to ensure secure cloud communication.
