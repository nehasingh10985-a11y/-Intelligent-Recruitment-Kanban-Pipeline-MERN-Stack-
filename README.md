# Intelligent Recruitment & Kanban Pipeline (MERN Stack)

A comprehensive Job Portal and Applicant Tracking System (ATS) designed to streamline the hiring process. This project features a futuristic UI, role-based authentication, and a dynamic Kanban board for candidate management.

## 🚀 Core Features

- **Role-Based Access Control:** Secure separate dashboards for Admins (Recruiters) and Candidates.
- **Kanban Recruitment Pipeline:** Interactive Drag-and-Drop system to manage candidate stages (Pending, Reviewed, Interview, Hired, Rejected).
- **Real-time Analytics:** Automated calculation of hiring stats, success rates, and pipeline volume via StatCards.
- **Smart Resume Hub:** Multer-powered uploads (PDF/DOC/DOCX, 10MB limit) with ImageKit cloud optimization and secure file filtering.
- **Debounced Search:** Optimized filtering across candidate names in dashboard.
- **Interview Scheduling:** Modal-based scheduling when dragging candidates to Interview stage (date/time/meeting link).
- **Enhanced Candidate Forms:** Custom date picker, multi-skill selector, full profile submission with logout integration.

## 🛠 Tech Stack

### Frontend

- **React.js + Vite** (High-performance build tool)
- **Tailwind CSS** (Modern Glassmorphism UI)
- **Framer Motion** (Production-ready animations)
- **@hello-pangea/dnd** (Professional Drag & Drop logic)

### Backend

- **Node.js & Express.js**
- **MongoDB Atlas** (Scalable Cloud Database with text indexes)
- **JWT (JSON Web Tokens)** (State-of-the-art authentication)
- **Multer + ImageKit** (Secure file uploads and CDN delivery)

## 📦 Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd "Intelligent Recruitment & Kanban Pipeline"
```

### 2. Backend Configuration

```bash
cd backend
npm install
# Copy .env.example to .env and configure
npm run dev  # Development server
npm start    # Production
npm run seed # Populate test data
```

### 3. Frontend Configuration

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables (backend/.env)

```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
PORT=5000
```

## 🌐 Key API Endpoints

- `GET /api/jobs/all-applications` - Fetch all applications for dashboard
- `PUT /api/jobs/update-status/:id` - Update candidate status
- `DELETE /api/jobs/delete/:id` - Remove candidate
- `PUT /api/jobs/schedule-interview/:id` - Schedule interview details
- `POST /api/jobs/apply` - Submit candidate application with resume

## 📈 Recent Updates

- **Admin Dashboard**: Full Kanban with stats, search, drag-drop, interview modals.
- **Application Model**: Added interview scheduling fields, search indexes.
- **Upload Middleware**: File type/size validation, memory storage.
- **FinalForm**: Production-ready form with custom UI components.

## 🛡 Security & Optimization

- **Protected Routes**: JWT + role middleware.
- **File Security**: Strict MIME validation, size limits.
- **Performance**: Debounced search, optimized fetches, CDN delivery.

```
