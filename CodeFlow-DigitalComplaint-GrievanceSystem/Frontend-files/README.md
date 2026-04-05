# CodeFlow — Digital Complaint & Grievance Analytics System

> A full-stack web application built with **React + Node.js + MongoDB Atlas** for college students and administrators.

---

## 🧾 Project Overview

**CodeFlow** is a complete, full-stack Grievance Management System designed for educational institutions. Students can submit, track, and review grievances, while admins can manage, prioritize, and resolve them through a structured workflow. All data is stored in a cloud MongoDB Atlas database via a real REST API backend.

This is a **college academic project** — clean, functional, and fully integrated.

---

## ✨ Features

### 👨‍🎓 For Students
- Register and login securely with college UID
- Submit grievances with category, priority, and description
- Submit anonymously with a separate tracking code (`ANON-YYYY-XXXX`)
- Real-time status tracking using unique grievance codes (`GRV-YYYY-XXXX`)
- View complete grievance history with status timeline and admin comments
- Internal mail communication with admin (Inbox / Sent / Compose)
- View institutional notices and policy guidelines
- Personal analytics dashboard (submitted / resolved / pending / category breakdown)
- In-app notifications when grievance status is updated

### 🛡️ For Administrators
- Dashboard overview with key metrics and system stats
- View and filter all grievances (by category, status, priority, search)
- Full grievance detail with status history, admin notes, and comments
- Update grievance status: `pending → processing → in-progress → resolved / rejected`
- Each update auto-notifies the student and logs to activity trail
- Manage all registered student accounts (view, block, restrict, remove)
- Create, edit, and delete institutional notices
- Manage guideline categories and rules
- Comprehensive analytics and insights dashboard with CSV export
- Full activity log — who did what, and when
- Internal mail communication with students

---

## 🛠️ Tech Stack

| Layer           | Technology                          |
|-----------------|--------------------------------------|
| Frontend        | React 19, Vite 7, React Router DOM 7 |
| Styling         | Tailwind CSS 3                       |
| HTTP Client     | Axios 1.13 (with JWT interceptor)    |
| State Mgmt      | React Context API                    |
| Icons           | React Icons 5                        |
| Date Utilities  | date-fns 4                           |
| Backend API     | Node.js + Express.js 5               |
| Database        | MongoDB Atlas (cloud), Mongoose 8    |
| Auth            | JWT (30-day tokens) + bcryptjs       |

---

## 📁 Frontend Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI: Button, Card, Modal, Navbar,
│   │                    #   Footer, Sidebar, SearchBar, Pagination,
│   │                    #   StatsCard, NotificationDropdown
│   ├── forms/           # Form components
│   └── layout/          # PublicLayout, AdminLayout, UserLayout
├── context/
│   ├── AuthContext.jsx        # User auth state (login/logout/updateUser)
│   ├── NotificationContext.jsx # In-app notifications state
│   └── ThemeContext.jsx        # Dark/light theme toggle
├── hooks/
│   ├── useAuth.js
│   ├── useNotifications.js
│   ├── useSearch.js            # Debounced search
│   └── useLocalStorage.js
├── pages/
│   ├── public/          # Home, About, Contact, FAQs, Login, Register
│   ├── admin/           # AdminDashboard, AllGrievances, GrievanceDetail,
│   │                    #   GrievanceReview, ListGrievances, CheckStatus,
│   │                    #   EditProfile, AccountActivity, InsightsDashboard,
│   │                    #   Mail, NoticeBoard, Guidelines
│   └── user/            # UserDashboard, GrievanceForm, AllGrievances,
│                         #   ListGrievances, GrievanceDetail, ReviewPage,
│                         #   CheckStatus, EditProfile, Insights,
│                         #   Mail, NoticeBoard, Guidelines
├── services/            # API service layer (authService, grievanceService,
│                        #   userService, mailService, noticeService,
│                        #   notificationService, guidelineService,
│                        #   activityLogService, adminService, api.js)
├── styles/              # Global styles
└── utils/               # Helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend server running (see `../Codeflow-Backend/`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the frontend root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

> ⚠️ The backend must be running first for API calls to work.

---

## 📜 Available Scripts

```bash
npm run dev       # Start Vite development server (HMR)
npm run build     # Build production bundle
npm run preview   # Preview production build locally
npm run lint      # Run ESLint checks
```

---

## 🔐 Authentication Flow

1. User registers or logs in → backend returns JWT token
2. Token stored in `localStorage` as `token`
3. Every Axios request auto-attaches `Authorization: Bearer <token>` via request interceptor
4. On 401 response → localStorage cleared → redirect to `/login`
5. `AuthContext` persists session across page refresh by reading from `localStorage`

---

## 🗺️ Route Structure

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/about` | About | Public |
| `/contact` | Contact | Public |
| `/faqs` | FAQs | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/admin` | AdminDashboard | Admin only |
| `/admin/grievances` | AllGrievances | Admin only |
| `/admin/grievances/:code` | GrievanceDetail | Admin only |
| `/admin/review/:code` | GrievanceReview | Admin only |
| `/admin/list` | ListGrievances | Admin only |
| `/admin/status` | CheckStatus | Admin only |
| `/admin/profile` | EditProfile | Admin only |
| `/admin/activity` | AccountActivity | Admin only |
| `/admin/insights` | InsightsDashboard | Admin only |
| `/admin/mail` | Mail | Admin only |
| `/admin/notices` | NoticeBoard | Admin only |
| `/admin/guidelines` | Guidelines | Admin only |
| `/user` | UserDashboard | Student only |
| `/user/submit` | GrievanceForm | Student only |
| `/user/grievances` | AllGrievances | Student only |
| `/user/list` | ListGrievances | Student only |
| `/user/grievance/:code` | GrievanceDetail | Student only |
| `/user/review/:code` | ReviewPage | Student only |
| `/user/status` | CheckStatus | Student only |
| `/user/profile` | EditProfile | Student only |
| `/user/insights` | Insights | Student only |
| `/user/mail` | Mail | Student only |
| `/user/notices` | NoticeBoard | Student only |
| `/user/guidelines` | Guidelines | Student only |

---

## 📄 Documentation

| File | Description |
|------|-------------|
| [PRD_CODEFLOW.md](./PRD_CODEFLOW.md) | Product Requirements Document (v2.0) |
| [SYSTEM_FLOW_DIAGRAMS.md](./SYSTEM_FLOW_DIAGRAMS.md) | System flow, sequence, and ER diagrams |
| [ARCHITECTURE_AND_USER_FLOW.md](./ARCHITECTURE_AND_USER_FLOW.md) | Architecture and user journey diagrams |
| [CODEFLOW_FINAL_REPORT.md](./CODEFLOW_FINAL_REPORT.md) | Full academic project report |

---

## 📄 License

Developed for academic purposes — college project.
