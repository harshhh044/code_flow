# PRD: CodeFlow — Digital Complaint & Grievance Analytics System

## 1. Document Control

| Field           | Value                                      |
|-----------------|--------------------------------------------|
| Product Name    | CodeFlow                                   |
| Document Type   | Product Requirements Document (PRD)        |
| Version         | 2.0 (Full Stack — Complete)                |
| Date            | March 6, 2026                              |
| Prepared For    | Faculty Review / Academic Submission       |
| Status          | ✅ Completed — Frontend + Backend + Database |

---

## 2. Product Summary

**CodeFlow** is a full-stack, web-based Digital Complaint & Grievance Analytics System designed for college institutions. It allows students to submit, track, and monitor grievances, while admins can review, update, prioritize, and resolve them through a structured workflow backed by a real REST API and a cloud-hosted MongoDB Atlas database.

This is a college project built for academic evaluation — clean, functional, and fully integrated (not a prototype).

---

## 3. Problem Statement

Students face unclear, unstructured grievance processes:
- No visibility into grievance status after submission
- No centralized record of complaints
- No accountability or audit trail for admin actions
- No analytics or reporting for institutional insights

Admin teams lack:
- A structured way to categorize and prioritize complaints
- Communication tools (mail) integrated with grievances
- Metrics and analytics for decision support

---

## 4. Product Goals

1. Centralize grievance submission and management on a real backend
2. Provide real-time status tracking via unique grievance codes
3. Support both anonymous and identified grievance reporting
4. Enable admin analytics (category breakdown, priority heatmaps, status trends)
5. Maintain full audit trail via activity logs stored in MongoDB
6. Provide in-app messaging between students and admins
7. Deliver notice board and guideline management for institutional communication

---

## 5. Tech Stack (Final Implementation)

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Frontend      | React 19.2.0, React Router v7.13.0, Vite 7.3.1, TailwindCSS 3.4.19 |
| HTTP Client   | Axios 1.13.5 (with JWT interceptor)             |
| Backend       | Node.js, Express.js 5.2.1                       |
| Database      | MongoDB Atlas (cloud), Mongoose 8.23.0 ORM      |
| Auth          | JWT (jsonwebtoken 9.0.3) + bcryptjs 3.0.3       |
| State         | React Context API (Auth, Theme, Notification)   |
| Icons         | React Icons 5.5.0                               |
| Date Utils    | date-fns 4.1.0                                  |
| Dev Tools     | nodemon 3.1.14, ESLint, Vite HMR                |

---

## 6. User Roles & Access

| Role    | Access Level                                         |
|---------|------------------------------------------------------|
| Guest   | Public pages only (Home, About, Contact, FAQs)       |
| Student | Authenticated — submit/track grievances, mail, notices, insights |
| Admin   | Authenticated — full grievance management, user management, analytics, notices, guidelines |

---

## 7. Application Modules

### 7.1 Authentication Module
- User registration with: Full Name, Email, Password, UID, Role
- Login with email + password → returns JWT token
- JWT stored in `localStorage`, auto-attached to every API request via Axios interceptor
- Route protection via `ProtectedRoute` component with role-based redirect
- Session persistence across browser refresh
- Password hashing with bcryptjs (10 salt rounds)
- Token expiry: 30 days

### 7.2 Grievance Submission (Student)
- Form fields: Category, Subject, Description, Incident Date, Priority, Anonymous toggle
- Auto-generated unique grievance code format: `GRV-YYYY-XXXX` or `ANON-YYYY-XXXX`
- On submit: grievance saved to MongoDB, admin notification auto-created, activity log recorded
- Categories: Academic, Facility, Hostel, Billing, General, Other
- Priority levels: Low, Medium, High, Urgent
- Status workflow: Pending → Processing → In-Progress → Resolved/Rejected

### 7.3 Grievance Management (Admin)
- View all grievances with filters (category, status, priority, search)
- Grievance detail page with full history, comments, and admin notes
- Status update workflow: `pending → processing → in-progress → resolved / rejected`
- Each status change appended to `statusHistory` array with timestamp and admin email
- On status change: student notification auto-created in MongoDB
- Priority modification capability
- Admin notes and resolution text fields
- Comment thread for communication

### 7.4 Status Tracking
- Both Student and Admin can check grievance status by entering the unique code
- Full status history timeline displayed per grievance
- Real-time status updates
- Timestamp for each status change
- Admin details for each update

### 7.5 Mail Module
- Internal messaging between students and admins
- Inbox / Sent views per user
- Support query flag (`isSupportQuery`)
- Mark as read, delete message functionalities
- Message composition with subject and body
- Recipient selection (admin to student, student to admin)

### 7.6 Notice Board
- Admin: Create, update, delete notices with category and priority
- Categories: General, Academic, Facility, Billing, Events, Exams, Holiday
- Priority levels: Low, Medium, High, Urgent
- Student/Public: View all active notices sorted newest-first
- Expiry date support per notice
- Rich text content support

### 7.7 Guidelines Module
- Admin: Create guideline categories, add/delete rules within each category
- Student/Public: View all active guidelines
- Each category has icon, color, and nested rules
- Rule structure: subtitle + description
- Categories: Hostel Rules, Library Rules, Exam Guidelines, Code of Conduct, etc.

### 7.8 Notification Center
- In-app notifications stored in MongoDB per user email
- Triggered automatically on: grievance submission (admin), status update (student)
- Mark as read, mark all as read
- Bell icon with unread count in layout
- Notification types: Grievance Submitted, Status Updated, New Message
- Related grievance code linking

### 7.9 Analytics / Insights Dashboard
- **Admin Insights**: 
  - Total grievances, pending count, resolution rate
  - Category breakdown (pie chart data)
  - Priority distribution
  - Status trends over time
  - Anonymous vs identified ratio
  - Average resolution time
  - Monthly submission trends
- **Student Insights**: 
  - Personal grievance stats — submitted, resolved, pending
  - Category breakdown of own grievances
  - Status distribution
  - Resolution timeline
- CSV export, print report functionality

### 7.10 Account Activity (Admin)
- View all registered users (student accounts)
- User detail panel with grievance history and login activity
- Update user status: active / blocked / restricted / removed
- Full activity log browser (by user email or global)
- User statistics: total grievances, resolved count, pending count
- Last login timestamp
- Account creation date

### 7.11 Profile Management
- Edit Full Name, Phone, Department, Roll Number
- Available to both students and admins
- Profile update triggers activity log
- View own UID and email (read-only)
- Last login information display

---

## 8. API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| GET | `/api/auth/me` | Private | Get current logged-in user |

### Grievance Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/grievances` | Student | Submit new grievance |
| GET | `/api/grievances` | Admin | Get all grievances with filters |
| GET | `/api/grievances/my` | Student | Get my own grievances |
| GET | `/api/grievances/stats` | Admin | Get statistics and counts |
| GET | `/api/grievances/:code` | Private | Get grievance by tracking code |
| PUT | `/api/grievances/:code/status` | Admin | Update status / priority / notes |
| POST | `/api/grievances/:code/comment` | Private | Add a comment to a grievance |

### User Management Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all registered users |
| GET | `/api/users/:id` | Admin | Get single user by ID |
| PUT | `/api/users/:id/status` | Admin | Update user status |
| PUT | `/api/users/profile` | Private | Update own profile |

### Messaging Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/messages` | Private | Send a message |
| GET | `/api/messages/inbox` | Private | Get inbox messages |
| GET | `/api/messages/sent` | Private | Get sent messages |
| PUT | `/api/messages/:id/read` | Private | Mark message as read |
| DELETE | `/api/messages/:id` | Private | Delete a message |

### Notification Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications` | Private | Get all notifications |
| PUT | `/api/notifications/:id/read` | Private | Mark single notification as read |
| PUT | `/api/notifications/read-all` | Private | Mark all notifications as read |

### Notice Board Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notices` | Public | Get all active notices |
| POST | `/api/notices` | Admin | Create a new notice |
| PUT | `/api/notices/:id` | Admin | Update a notice |
| DELETE | `/api/notices/:id` | Admin | Delete a notice |

### Guidelines Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/guidelines` | Public | Get all active guidelines |
| POST | `/api/guidelines` | Admin | Create new guideline category |
| POST | `/api/guidelines/:id/rules` | Admin | Add rule to a category |
| DELETE | `/api/guidelines/:categoryId/rules/:ruleId` | Admin | Delete a rule |

### Activity Log Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/activity-logs` | Admin | Get all activity logs (paginated) |
| GET | `/api/activity-logs/user/:email` | Admin | Get logs for a specific user |
| GET | `/api/activity-logs/summary/:email` | Admin | Get activity summary for a user |
| DELETE | `/api/activity-logs/cleanup` | Admin | Cleanup old log entries |

---

## 9. Database Collections (MongoDB Atlas)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | Registered users — students and admins | fullName, email, password (hashed), role, uid, status, dept, roll, phone |
| `grievances` | All grievance records with status history, comments | grievanceCode, userId, userEmail, userName, isAnonymous, category, subject, description, status, priority, statusHistory, comments, adminNotes |
| `messages` | Internal mail between users | fromEmail, toEmail, subject, body, read, isSupportQuery, sentAt |
| `notifications` | In-app notifications per user email | userEmail, title, message, read, relatedGrievance, type, createdAt |
| `notices` | Institutional notice board entries | title, content, category, priority, isActive, expiryDate, createdBy |
| `guidelines` | Policy guidelines with category/rule structure | title, icon, color, rules (array of subtitle + description), isActive |
| `activitylogs` | Full audit trail of all system actions | type, performedBy, description, metadata, ipAddress, timestamp |

---

## 10. Key User Stories

### Student User Stories
- As a student, I can register with my college UID and log in securely
- As a student, I can submit a grievance with category, priority, and description, and get a unique tracking code
- As a student, I can submit a grievance anonymously without revealing my identity
- As a student, I can track my grievance status at any time using the tracking code
- As a student, I can view the full status history and admin comments for each grievance
- As a student, I can send and receive messages from admin
- As a student, I can view institutional notices and guidelines
- As a student, I can see personal analytics of my submitted grievances
- As a student, I receive in-app notifications when my grievance status changes
- As a student, I can update my profile information (name, phone, department, roll number)
- As a student, I can view all my submitted grievances in one place
- As a student, I can add comments to my grievances

### Admin User Stories
- As an admin, I can view all grievances with filters (category, status, priority, search)
- As an admin, I can update grievance status, priority, and add admin notes
- As an admin, I can add comments to a grievance visible to the student
- As an admin, I can view and manage all registered student accounts
- As an admin, I can block, restrict, or remove a student account
- As an admin, I can publish and manage institutional notices
- As an admin, I can manage guidelines categories and rules
- As an admin, I can view comprehensive analytics and export/print reports
- As an admin, I can view full activity logs (who did what, when)
- As an admin, I receive in-app notifications when a new grievance is submitted
- As an admin, I can search for any grievance by tracking code
- As an admin, I can view detailed user activity and grievance history
- As an admin, I can send messages to students
- As an admin, I can view statistics on resolution rates and pending grievances

---

## 11. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| Responsive UI | Desktop and mobile friendly via TailwindCSS utility classes |
| Security | JWT-based auth, bcrypt password hashing (10 rounds), role-based guards |
| Audit Trail | Every key action logged to `activitylogs` collection with timestamp |
| Error Handling | Global 401 handler in Axios interceptor, controller try/catch blocks |
| Scalability | Cloud DB (MongoDB Atlas), stateless REST API, horizontal scaling ready |
| Performance | Axios timeout (10s), database indexing on grievanceCode and email |
| Simplicity | Clean, straightforward code — college project scope |
| Maintainability | Modular architecture, separation of concerns (MVC pattern) |
| Usability | Intuitive UI, minimal learning curve, consistent design system |
| Availability | 24/7 access via web browser, no downtime for submissions |

---

## 12. Frontend Route Structure

### Public Routes
| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | Home | Public | Landing page with system overview |
| `/about` | About | Public | About the system and institution |
| `/contact` | Contact | Public | Contact information and support |
| `/faqs` | FAQs | Public | Frequently asked questions |
| `/login` | Login | Public | User authentication page |
| `/register` | Register | Public | New user registration |

### Admin Routes (Protected - Admin Only)
| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/admin` | AdminDashboard | Admin | Overview dashboard with stats |
| `/admin/grievances` | AllGrievances | Admin | All grievances with filters |
| `/admin/grievances/:code` | GrievanceDetail | Admin | Detailed grievance view |
| `/admin/review/:code` | GrievanceReview | Admin | Grievance review panel |
| `/admin/list` | ListGrievances | Admin | Alternate list view |
| `/admin/status` | CheckStatus | Admin | Check any grievance status |
| `/admin/profile` | EditProfile | Admin | Edit admin profile |
| `/admin/activity` | AccountActivity | Admin | User management and activity logs |
| `/admin/insights` | InsightsDashboard | Admin | Analytics and reports |
| `/admin/mail` | Mail | Admin | Internal messaging system |
| `/admin/notices` | NoticeBoard | Admin | Manage institutional notices |
| `/admin/guidelines` | Guidelines | Admin | Manage policy guidelines |

### Student Routes (Protected - Student Only)
| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/user` | UserDashboard | Student | Student dashboard with quick stats |
| `/user/submit` | GrievanceForm | Student | Submit new grievance |
| `/user/grievances` | AllGrievances | Student | View all my grievances |
| `/user/list` | ListGrievances | Student | Alternate list view |
| `/user/grievance/:code` | GrievanceDetail | Student | Detailed grievance view |
| `/user/review/:code` | ReviewPage | Student | Grievance review page |
| `/user/status` | CheckStatus | Student | Check grievance status by code |
| `/user/profile` | EditProfile | Student | Edit student profile |
| `/user/insights` | Insights | Student | Personal analytics dashboard |
| `/user/mail` | Mail | Student | Internal messaging system |
| `/user/notices` | NoticeBoard | Student | View institutional notices |
| `/user/guidelines` | Guidelines | Student | View policy guidelines |

---

## 13. Success Metrics

### Quantitative Metrics
- Total grievances submitted in deployment
- Resolution rate (Resolved / Total grievances) — Target: >80%
- Average grievance turnaround time (submit → resolve) — Target: <7 days
- Pending backlog count at any point in time — Target: <20%
- Category-wise grievance distribution
- Anonymous vs identified submission ratio
- User account growth and activity
- System uptime — Target: >99%
- Average response time — Target: <2 seconds

### Qualitative Metrics
- Student satisfaction with grievance process — Target: >85%
- Admin efficiency improvement — Target: 40% reduction in manual work
- Transparency perception — Target: >90% students feel informed
- Ease of use rating — Target: >4/5 stars
- System adoption rate — Target: >90% of students registered

---

## 14. Security Features

### Authentication & Authorization
- JWT token-based authentication (30-day expiry)
- bcryptjs password hashing (10 salt rounds)
- Role-based access control (student, admin)
- Protected routes with middleware validation
- Automatic token refresh on page reload

### Data Protection
- Anonymous grievance submission (no user data stored)
- Password never stored in plain text
- Sensitive data excluded from API responses
- CORS enabled for controlled access
- Environment variables for sensitive configuration

### Audit & Compliance
- Complete activity log for all actions
- Timestamp for every database operation
- User action tracking (who did what, when)
- IP address logging (optional)
- Data retention policies

---

## 15. Future Enhancements (Out of Scope for v2.0)

### Potential Features
- Email notifications (in addition to in-app)
- SMS alerts for critical updates
- File attachment support for grievances
- Advanced analytics with charts and graphs
- Multi-language support
- Mobile native applications (iOS, Android)
- Integration with existing ERP systems
- AI-based grievance categorization
- Automated escalation for pending grievances
- Parent/guardian access portal
- Feedback and rating system
- Grievance resolution SLA tracking
- Department-wise assignment
- Bulk operations for admins

---

## 16. Deployment Considerations

### Development Environment
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `npm run dev` (nodemon on port 5000)
- Database: MongoDB Atlas (cloud-hosted)

### Production Deployment
- Frontend: Build with `npm run build`, serve static files
- Backend: Run with `npm start`, use PM2 for process management
- Environment: Set `NODE_ENV=production`
- HTTPS: Use SSL/TLS certificates
- Hosting: Vercel/Netlify (frontend), Heroku/Railway (backend)

---

## 17. Conclusion

CodeFlow v2.0 is a fully integrated academic project demonstrating a real-world grievance management system. It is built with a React frontend, a Node.js/Express REST API backend, and MongoDB Atlas as the cloud database. The system covers authentication, grievance lifecycle, admin workflows, messaging, notifications, analytics, and audit logging — all in a clean, maintainable codebase appropriate for a college submission.

The project successfully addresses the problem of inefficient grievance handling in educational institutions by providing a transparent, accessible, and user-friendly digital platform. With comprehensive features for both students and administrators, CodeFlow demonstrates the practical application of modern web development technologies in solving real-world problems.

---

**Document Version:** 2.0  
**Last Updated:** March 6, 2026  
**Status:** Complete and Ready for Deployment
