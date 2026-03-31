# 🗄️ CodeFlow Database Schema (MongoDB Atlas)

> This document explains the data structure and collections used in the CodeFlow system.

---

## 🏛️ Database Overview
- **Database Name:** `codeflow`
- **Hosted on:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose (Node.js)

---

## 📦 Collections

### 1. `users`
Stores all registered accounts (Students and Admins).
- `fullName`: (String) Full name of the user.
- `email`: (String) Primary identifier, used for login.
- `password`: (String) Hashed using bcrypt.
- `role`: (String) `student` or `admin`.
- `uid`: (String) College ID / Roll Number.
- `status`: (String) `active`, `blocked`, `restricted`, or `removed`.
- `phone`/`dept`/`roll`: (Strings) Optional profile details.

### 2. `grievances`
The core collection storing all submitted complaints.
- `grievanceCode`: (String) Unique ID (e.g., `GRV-2026-XXXX` or `ANON-2026-XXXX`).
- `category`: (String) `academic`, `facility`, `hostel`, `other`, etc.
- `subject`: (String) Brief title.
- `description`: (String) Detailed complaint.
- `isAnonymous`: (Boolean) True if student identity is hidden.
- `submittedBy`: (ObjectId) Reference to User (null if anonymous).
- `status`: (String) `pending`, `processing`, `in-progress`, `resolved`, `rejected`.
- `priority`: (String) `low`, `medium`, `high`.
- `statusHistory`: (Array) Timeline of status changes.
- `comments`: (Array) Thread of updates from Admin or User.

### 3. `messages`
Internal mail system logs.
- `fromEmail`: (String) Sender email.
- `toEmail`: (String) Recipient email.
- `subject`: (String) Mail subject.
- `body`: (String) Content.
- `read`: (Boolean) Status of message.

### 4. `notifications`
In-app alerts for users.
- `userEmail`: (String) Recipient email.
- `title`: (String) Alert title.
- `message`: (String) Notification body.
- `read`: (Boolean) Read status.
- `relatedGrievance`: (String) Tracking code reference.

### 5. `notices`
Institutional announcements.
- `title`/`content`: (Strings) Notice text.
- `category`: (String) e.g., `events`, `exams`, `holiday`.
- `priority`: (String) `low`, `medium`, `urgent`.

### 6. `guidelines`
Policy documentation rules.
- `title`: (String) Category title (e.g., "Hostel Rules").
- `rules`: (Array) List of specific rules (subtitle + text).

### 7. `activitylogs`
Full audit trail for transparency.
- `type`: (String) Action type (e.g., `LOGIN`, `SUBMIT_GRIEVANCE`).
- `performedBy`: (String) Email of the user who did the action.
- `description`: (String) Human-readable action log.

---

## 🔗 Relationships
- **Users → Grievances:** One-to-Many (One student can have multiple grievances).
- **Users → Messages:** One-to-Many (Sender/Receiver links).
- **Grievances → Notifications:** Trigger-based (Grievance update triggers a notification).
- **Users → ActivityLogs:** One-to-Many (Action tracking).

---

## 🛡️ Security Note
- **Passwords** are never stored in plain text (bcrypt).
- **Anonymous Grievances** truly hide the `submittedBy` field in the database for privacy.
- **Access Control** is enforced at the API level (JWT) based on the `role` field.
