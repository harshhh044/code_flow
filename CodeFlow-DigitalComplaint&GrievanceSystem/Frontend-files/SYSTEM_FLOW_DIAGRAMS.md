# CodeFlow — System Flow Diagrams

> **Project**: CodeFlow — Digital Complaint & Grievance Analytics System  
> **Version**: 1.0 (Full Stack — React + Node.js + MongoDB Atlas)  
> **Date**: March 8, 2026  
> **Status**: ✅ Complete and Production-Ready

This document contains comprehensive flow diagrams showing how different sections of the CodeFlow grievance management system work and interact with each other.

## Table of Contents
1. [Overall System Architecture Flow](#1-overall-system-architecture-flow)
2. [Authentication System Flow](#2-authentication-system-flow)
3. [Grievance Submission Flow](#3-grievance-submission-flow)
4. [Admin Grievance Review Flow](#4-admin-grievance-review-flow)
5. [Notification Flow](#5-notification-flow)
6. [Internal Mail System Flow](#6-internal-mail-system-flow)
7. [Activity Log Flow](#7-activity-log-flow)
8. [Frontend Context & State Management](#8-frontend-context--state-management)
9. [Role-Based Route Access Flow](#9-role-based-route-access-flow)
10. [Data Persistence Model](#10-data-persistence-model)

---

## 1. Overall System Architecture Flow

```mermaid
flowchart TD
    subgraph CLIENT["🌐 Client Layer — Browser"]
        REACT["React 19 SPA\n(Vite Build)"]
        AXIOS["Axios HTTP Client\n(JWT Interceptor)"]
        CTX["React Context API\nAuth / Theme / Notifications"]
    end

    subgraph BACKEND["⚙️ Backend Layer — Node.js + Express"]
        SERVER["Express Server\nPort 5000"]

        subgraph MW["Middleware"]
            CORS["CORS"]
            JSON["JSON Body Parser"]
            AUTH_MW["JWT Auth Middleware\n(protect + authorize)"]
        end

        subgraph ROUTES["Routes"]
            R_AUTH["/api/auth"]
            R_GRIEV["/api/grievances"]
            R_USERS["/api/users"]
            R_MAIL["/api/messages"]
            R_NOTIF["/api/notifications"]
            R_NOTICE["/api/notices"]
            R_GUIDE["/api/guidelines"]
            R_LOG["/api/activity-logs"]
        end

        subgraph CTRL["Controllers"]
            C_AUTH["authController"]
            C_GRIEV["grievanceController"]
            C_USER["userController"]
            C_MAIL["mailController"]
            C_NOTIF["notificationController"]
            C_NOTICE["noticeController"]
            C_GUIDE["guidelineController"]
            C_LOG["activityLogController"]
        end
    end

    subgraph DB["🗄️ Database Layer — MongoDB Atlas"]
        M_USER["users"]
        M_GRIEV["grievances"]
        M_MSG["messages"]
        M_NOTIF["notifications"]
        M_NOTICE["notices"]
        M_GUIDE["guidelines"]
        M_LOG["activitylogs"]
    end

    REACT --> AXIOS
    AXIOS -->|"Bearer Token\nHTTP Request"| SERVER
    SERVER --> CORS --> JSON --> AUTH_MW
    AUTH_MW --> ROUTES
    R_AUTH --> C_AUTH --> M_USER
    R_GRIEV --> C_GRIEV --> M_GRIEV
    R_USERS --> C_USER --> M_USER
    R_MAIL --> C_MAIL --> M_MSG
    R_NOTIF --> C_NOTIF --> M_NOTIF
    R_NOTICE --> C_NOTICE --> M_NOTICE
    R_GUIDE --> C_GUIDE --> M_GUIDE
    R_LOG --> C_LOG --> M_LOG
    C_GRIEV -.->|"auto-creates"| M_NOTIF
    C_GRIEV -.->|"auto-creates"| M_LOG
    C_AUTH -.->|"auto-creates"| M_LOG
    C_USER -.->|"auto-creates"| M_LOG
    SERVER -->|"JSON Response"| AXIOS
    AXIOS --> CTX --> REACT
```

---

## 2. Authentication System Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant FE as React Frontend
    participant API as Express API
    participant DB as MongoDB Atlas

    U->>FE: Fill Register/Login form
    FE->>API: POST /api/auth/register OR /api/auth/login
    API->>DB: Query users collection
    DB-->>API: User document

    alt Login Success
        API->>API: bcrypt.compare(password, hash)
        API->>API: jwt.sign({id}, JWT_SECRET, 30d)
        API->>DB: Update lastLogin timestamp
        API->>DB: Insert ActivityLog (user_login)
        API-->>FE: { success, user data, token }
        FE->>FE: localStorage.setItem('token', token)
        FE->>FE: localStorage.setItem('currentUser', userData)
        FE->>FE: AuthContext.login(userData, token)
        FE-->>U: Redirect to /admin or /user dashboard
    else Login Failed
        API-->>FE: 401 { success: false, error }
        FE-->>U: Show error message
    end

    Note over FE,API: Every subsequent API call sends<br/>Authorization: Bearer {token}<br/>via Axios request interceptor

    alt 401 on any request
        API-->>FE: 401 Unauthorized
        FE->>FE: Clear localStorage
        FE-->>U: Redirect to /login
    end
```

---

## 3. Grievance Submission Flow

```mermaid
flowchart TD
    A([Student logged in]) --> B[Navigate to /user/submit]
    B --> C[Fill GrievanceForm\nCategory / Subject / Description\nPriority / Incident Date]
    C --> D{Anonymous?}

    D -->|Yes| E[Flag isAnonymous = true\nCode prefix: ANON-YYYY-XXXX]
    D -->|No| F[Attach userId, userEmail, userName\nCode prefix: GRV-YYYY-XXXX]

    E --> G[POST /api/grievances\nBearer Token]
    F --> G

    G --> H{Auth Middleware}
    H -->|Invalid Token| I[401 Error → Redirect Login]
    H -->|Role = student ✓| J[grievanceController.submitGrievance]

    J --> K[Auto-generate grievanceCode]
    J --> L[Save to MongoDB grievances collection]
    J --> M[Find all admin users]
    M --> N[Create Notification for each admin\nin notifications collection]

    J -->|Not anonymous| O[Insert ActivityLog\ngrievance_submitted]

    L --> P[201 Response with grievance data]
    P --> Q[Frontend shows success\n+ Tracking Code]
    Q --> R([Student sees confirmation\nRedirected to My Grievances])
```

---

## 4. Admin Grievance Review Flow

```mermaid
flowchart TD
    A([Admin logged in]) --> B[Admin Dashboard\n/admin]
    B --> C{Choose action}

    C -->|All Grievances| D[GET /api/grievances\nAdmin only]
    D --> E[View list with\nfilters / search / pagination]
    E --> F[Click on grievance]
    F --> G[GET /api/grievances/:code\nGrievanceDetail page]

    G --> H{Admin Action}

    H -->|Update Status| I[PUT /api/grievances/:code/status\nNew status + adminNotes + priority]
    I --> J[Append to statusHistory array]
    I --> K{Grievance not anonymous?}
    K -->|Yes| L[Create Notification for student]
    K -->|No| M[Skip notification]
    I --> N[Insert ActivityLog\ngrievance_status_updated]

    H -->|Add Comment| O[POST /api/grievances/:code/comment]
    O --> P[Append to comments array]
    P --> Q[Comment visible to student\non their GrievanceDetail page]

    H -->|Review Panel| R[Navigate to /admin/review/:code]
    R --> S[Full case report\nStatus history timeline\nAdmin notes panel]

    C -->|Check Status| T[GET /api/grievances/:code\nCheckStatus page]
    T --> U[Display status + history\nto admin]
```

---

## 5. Notification Flow

```mermaid
flowchart LR
    subgraph TRIGGERS["Auto-Trigger Points"]
        T1["Student submits grievance"]
        T2["Admin updates status"]
    end

    subgraph BACKEND["Backend Creates Notification"]
        N1["INSERT notifications\nuserEmail = admin@...\ntitle, message, type, url"]
        N2["INSERT notifications\nuserEmail = student@...\ntitle, message, type, url"]
    end

    subgraph FRONTEND["Frontend Polling / Load"]
        GET["GET /api/notifications\n(per logged-in user email)"]
        BELL["Bell icon shows\nunread count badge"]
        DROP["NotificationDropdown\nshows list"]
        READ["PUT /api/notifications/:id/read\nor /read-all"]
    end

    T1 --> N1
    T2 --> N2
    N1 --> GET
    N2 --> GET
    GET --> BELL --> DROP --> READ
```

---

## 6. Internal Mail System Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as React
    participant API as Express API
    participant DB as MongoDB

    S->>FE: Open /user/mail → Compose
    FE->>API: POST /api/messages\n{ from, fromEmail, to, toEmail, subject, body }
    API->>DB: Insert Message document
    DB-->>API: Saved message
    API-->>FE: 201 Success
    FE-->>S: Message sent confirmation

    Note over S,DB: Admin reads inbox

    FE->>API: GET /api/messages/inbox
    API->>DB: Find messages where toEmail = req.user.email
    DB-->>API: Message array
    API-->>FE: Message list
    FE-->>S: Shows inbox with unread count

    S->>FE: Click message → Mark as read
    FE->>API: PUT /api/messages/:id/read
    API->>DB: Set read = true
    DB-->>API: Updated message
    API-->>FE: Success
```

---

## 7. Activity Log Flow

```mermaid
flowchart TD
    subgraph ACTIONS["Actions That Trigger Logs"]
        A1["User Register"]
        A2["User Login"]
        A3["Grievance Submitted"]
        A4["Grievance Status Updated"]
        A5["User Status Updated by Admin"]
        A6["Profile Updated"]
    end

    subgraph LOG["ActivityLogController.createActivityLog"]
        L["INSERT activitylogs\ntype / performedBy / description\ntargetUser / metadata / timestamp"]
    end

    subgraph ADMIN_VIEW["Admin Views Logs"]
        V1["GET /api/activity-logs\nAll logs paginated"]
        V2["GET /api/activity-logs/user/:email\nPer-user logs"]
        V3["GET /api/activity-logs/summary/:email\nUser activity summary"]
        V4["DELETE /api/activity-logs/cleanup\nClean old logs"]
    end

    A1 & A2 & A3 & A4 & A5 & A6 --> L
    L --> V1
    L --> V2
    L --> V3
    V1 & V2 & V3 --> V4
```

---

## 8. Frontend Context & State Management

```mermaid
flowchart TD
    subgraph PROVIDERS["React Provider Tree (main.jsx)"]
        TP["ThemeProvider\n(dark/light mode)"]
        AP["AuthProvider\n(user, isAuthenticated, login, logout)"]
        NP["NotificationProvider\n(notifications, unread count)"]
    end

    subgraph PAGES["Pages & Components"]
        PL["PublicLayout"]
        AL["AdminLayout"]
        UL["UserLayout"]
    end

    subgraph HOOKS["Custom Hooks"]
        H1["useAuth()\n→ user, login, logout, isAdmin"]
        H2["useNotifications()\n→ notifications, unread"]
        H3["useSearch()\n→ debounced search"]
        H4["useLocalStorage()\n→ persist helper"]
    end

    subgraph GUARD["Route Guard"]
        RG["ProtectedRoute\n→ checks isAuthenticated + role\n→ redirects if not allowed"]
    end

    TP --> AP --> NP --> RG
    RG --> PL & AL & UL
    AP --> H1
    NP --> H2
    AL & UL --> H1 & H2 & H3
```

---

## 9. Role-Based Route Access Flow

```mermaid
flowchart TD
    USER([Browser Request]) --> RL{Route?}

    RL -->|"/ /about /contact /faqs\n/login /register"| PUB[Public Page\nNo auth required]

    RL -->|"/admin/*"| CHKA{isAuthenticated?}
    CHKA -->|No| LOGIN_A[Redirect to /login]
    CHKA -->|Yes| CHKB{role === admin?}
    CHKB -->|No| HOME_A[Redirect to /]
    CHKB -->|Yes| ADMIN_P[Render Admin Page]

    RL -->|"/user/*"| CHKC{isAuthenticated?}
    CHKC -->|No| LOGIN_U[Redirect to /login]
    CHKC -->|Yes| CHKD{role === student?}
    CHKD -->|No| HOME_U[Redirect to /]
    CHKD -->|Yes| USER_P[Render User Page]

    RL -->|"*"| CATCH[Redirect to /]
```

---

## 10. Data Persistence Model

```mermaid
erDiagram
    USERS {
        ObjectId _id
        String fullName
        String email
        String password
        String role
        String uid
        String dept
        String roll
        String phone
        String status
        Date lastLogin
    }

    GRIEVANCES {
        ObjectId _id
        String grievanceCode
        ObjectId userId
        String userEmail
        String userName
        Boolean isAnonymous
        String category
        String subject
        String description
        Date incidentDate
        String priority
        String status
        Array statusHistory
        String adminNotes
        String resolution
        Array comments
        Array attachments
    }

    MESSAGES {
        ObjectId _id
        String from
        String fromEmail
        String to
        String toEmail
        String subject
        String body
        Boolean read
        Boolean starred
        Boolean isSupportQuery
    }

    NOTIFICATIONS {
        ObjectId _id
        String userEmail
        String title
        String message
        String type
        Boolean read
        String relatedGrievance
        String url
    }

    NOTICES {
        ObjectId _id
        String title
        String content
        String category
        String postedBy
        String priority
        Boolean isActive
        Date expiresAt
    }

    GUIDELINES {
        ObjectId _id
        String title
        String icon
        String color
        Array rules
        Boolean isActive
        String createdBy
    }

    ACTIVITYLOGS {
        ObjectId _id
        String type
        String performedBy
        String description
        String targetUser
        Mixed metadata
    }

    USERS ||--o{ GRIEVANCES : "submits"
    USERS ||--o{ MESSAGES : "sends/receives"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITYLOGS : "appears in"
    GRIEVANCES ||--o{ NOTIFICATIONS : "triggers"
    GRIEVANCES ||--o{ ACTIVITYLOGS : "triggers"
```
