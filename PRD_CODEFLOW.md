# PRD: Code Flow (Prototype)

## 1. Document Control
- Product Name: Code Flow
- Document Type: Product Requirements Document (PRD)
- Version: 1.0 (Prototype)
- Date: February 26, 2026
- Prepared For: Faculty Review

## 2. Product Summary
Code Flow is a prototype web-based grievance management system for college students and administrators. It enables students to submit and track grievances, and enables admins to review, classify, and resolve them through a transparent workflow.

## 3. Problem Statement
Students often face unclear grievance processes, delayed responses, and lack of status visibility. Admin teams need a structured, trackable, and category-wise system to process complaints efficiently.

## 4. Product Goals
- Centralize grievance submission and management.
- Improve transparency via real-time status and tracking codes.
- Support anonymous and identified reporting.
- Improve admin decision support through analytics.
- Maintain data persistence across user sessions.

## 5. Product Type
This implementation is a Prototype (frontend-first, localStorage-backed).

## 6. Stakeholders
- Primary Users: Students
- Operational Users: Admin/Grievance Cell
- Review Stakeholders: Faculty / Institution Leadership

## 7. User Roles
- Student
- Admin
- Guest (public pages only)

## 8. Core Functional Requirements
1. User registration and login with role-based access.
2. Protected routes for student and admin dashboards.
3. Grievance submission form with category, incident details, evidence, and desired resolution.
4. Anonymous grievance submission option.
5. Auto-generated grievance tracking code.
6. Student grievance views: dashboard, category list, detail page, status check.
7. Admin grievance views: all grievances, category filter, case detail, review panel.
8. Admin status update workflow: Pending / In Progress / Resolved / Rejected.
9. Internal notes and review comments by admin.
10. Mail module for student-admin communication.
11. Notice board module.
12. Guidelines module.
13. Notification center for grievance/notices/guidelines events.
14. Account activity view with complaint count per user.

## 9. Non-Functional Requirements
- Responsive UI (desktop/mobile).
- Clear visual hierarchy for student/admin panels.
- Fast local interactions (no network dependency in prototype).
- Local persistence across logout/login.
- Basic error tolerance for malformed local storage.

## 10. Current Data Storage Model (Prototype)
Key localStorage entities in current implementation:

### Core Storage Keys
- `users` - User accounts database (all registered users)
- `currentUser` - Active session user data
- `authToken` - Authentication token for session
- `loginTime` - Timestamp of last login

### Grievance Storage
- `grievanceDatabase` - Category-organized grievances (object with category keys)
- `anonGrievances` - Anonymous grievances array
- `checkStatusGrievances` - Status tracking data for quick lookup

### Communication & Notifications
- `notifications_<userEmail>` - User-specific notification arrays
- `mails` / `mailDatabase` - Internal mail system data
- `notices` / `admin_notices` - Notice board entries
- `guidelines` / `guidelines_db` - Guidelines and policy documents

### Additional Data
- `recentGrievance` - Last submitted grievance (for immediate access)
- `loginTime` - Session timestamp tracking

## 11. Key User Stories
- As a student, I can file a grievance and get a tracking code.
- As a student, I can track my grievance status anytime.
- As a student, I can submit sensitive complaints anonymously.
- As an admin, I can review all grievances category-wise.
- As an admin, I can update status, priority, and review comments.
- As an admin, I can monitor metrics and user complaint activity.

## 12. Success Metrics (Prototype Evaluation)
- Total grievances submitted in testing cycle.
- Resolution ratio (Resolved / Total).
- Average review/update turnaround time.
- Pending backlog at review checkpoints.
- Category-wise grievance distribution.

## 13. Limitations (Prototype Stage)
- No production backend/database yet.
- Browser-local data only.
- Not multi-tenant or centralized across devices.
- Key naming consistency improvements required in some modules.

## 14. Future Scope (Planned Backend)
Planned migration to Node.js backend for production readiness.

### Proposed Backend Stack
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (Mongoose) or PostgreSQL (Prisma)
- Auth: JWT + refresh tokens
- File Handling: Multer + cloud storage
- Realtime: Socket.IO for live status updates

### Planned Backend Capabilities
1. Centralized persistent database.
2. Secure API layer for all modules.
3. Role-based authorization middleware.
4. Audit logs and action history.
5. Email/SMS notification services.
6. Deployment-ready architecture with monitoring.

## 15. Conclusion
Code Flow currently demonstrates a complete grievance workflow as a prototype and is suitable for academic presentation and functional evaluation. The next phase is backend integration using Node.js for scalability, security, and production deployment.
