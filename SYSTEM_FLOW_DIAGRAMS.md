# Code Flow - System Flow Diagrams

This document contains comprehensive flow diagrams showing how different sections of the Code Flow grievance management system work and interact with each other.

## Table of Contents
1. [Complete System Overview](#1-complete-system-overview)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [Student Grievance Submission Flow](#3-student-grievance-submission-flow)
4. [Admin Grievance Review Flow](#4-admin-grievance-review-flow)
5. [Notification System Flow](#5-notification-system-flow)
6. [Mail Communication Flow](#6-mail-communication-flow)
7. [Data Storage Architecture](#7-data-storage-architecture)
8. [Component Interaction Flow](#8-component-interaction-flow)

---

## 1. Complete System Overview

This diagram shows all major sections and how they connect:

```mermaid
flowchart TB
    subgraph Users["👥 Users"]
        GUEST[Guest User]
        STUDENT[Student]
        ADMIN[Admin]
    end
    
    subgraph Public["🌐 Public Section"]
        HOME[Home Page]
        ABOUT[About]
        CONTACT[Contact]
        FAQ[FAQs]
        LOGIN[Login]
        REGISTER[Register]
    end
    
    subgraph StudentSection["🎓 Student Dashboard"]
        SDASH[Dashboard]
        SUBMIT[Submit Grievance]
        MYGRIEV[My Grievances]
        TRACK[Track Status]
        SMAIL[Mail]
        SNOTICE[Notice Board]
        SGUIDE[Guidelines]
        SPROFILE[Profile]
        SINSIGHT[Insights]
    end
    
    subgraph AdminSection["👨‍💼 Admin Dashboard"]
        ADASH[Dashboard]
        ALLGRIEV[All Grievances]
        REVIEW[Review Grievance]
        ACTIVITY[Account Activity]
        AMAIL[Mail]
        ANOTICE[Manage Notices]
        AGUIDE[Manage Guidelines]
        APROFILE[Profile]
        AINSIGHT[Analytics]
    end
    
    subgraph Services["⚙️ Service Layer"]
        AUTH_SRV[authService]
        GRIEV_SRV[grievanceService]
        USER_SRV[userService]
        MAIL_SRV[mailService]
        GUIDE_SRV[guidelineService]
    end
    
    subgraph Contexts["🔄 State Management"]
        AUTH_CTX[AuthContext]
        NOTIF_CTX[NotificationContext]
        THEME_CTX[ThemeContext]
    end
    
    subgraph Storage["💾 Data Storage"]
        LS[(localStorage)]
    end
    
    GUEST --> Public
    STUDENT --> Public
    ADMIN --> Public
    
    LOGIN --> AUTH_SRV
    REGISTER --> AUTH_SRV
    
    STUDENT --> StudentSection
    ADMIN --> AdminSection
    
    StudentSection --> Services
    AdminSection --> Services
    
    Services --> Contexts
    Services --> Storage
    Contexts --> Storage
    
    AUTH_SRV --> AUTH_CTX
    GRIEV_SRV --> NOTIF_CTX
    
    style Users fill:#e1f5ff
    style Public fill:#fff4e6
    style StudentSection fill:#e8f5e9
    style AdminSection fill:#fce4ec
    style Services fill:#f3e5f5
    style Contexts fill:#fff9c4
    style Storage fill:#ffccbc
```

**What this shows:**
- Three user types: Guest, Student, Admin
- Public pages accessible to everyone
- Student dashboard with 9 main features
- Admin dashboard with 9 management features
- Service layer handling business logic
- Context providers managing global state
- localStorage as the data persistence layer

---

## 2. User Authentication Flow

Shows how users register, login, and access protected routes:

```mermaid
flowchart TD
    START([User Opens App]) --> CHECK{Authenticated?}
    
    CHECK -->|No| PUBLIC[Show Public Pages]
    CHECK -->|Yes| ROLE{Check Role}
    
    PUBLIC --> CHOICE{User Action}
    CHOICE -->|Register| REG_FORM[Registration Form]
    CHOICE -->|Login| LOGIN_FORM[Login Form]
    
    REG_FORM --> VALIDATE_REG{Valid Data?}
    VALIDATE_REG -->|No| REG_ERROR[Show Errors]
    REG_ERROR --> REG_FORM
    VALIDATE_REG -->|Yes| CREATE_USER[Create User Account]
    CREATE_USER --> SAVE_USER[Save to localStorage.users]
    SAVE_USER --> LOGIN_FORM
    
    LOGIN_FORM --> VALIDATE_LOGIN{Valid Credentials?}
    VALIDATE_LOGIN -->|No| LOGIN_ERROR[Show Error]
    LOGIN_ERROR --> LOGIN_FORM
    VALIDATE_LOGIN -->|Yes| CREATE_SESSION[Create Session]
    
    CREATE_SESSION --> SAVE_SESSION[Save currentUser & authToken]
    SAVE_SESSION --> SET_CONTEXT[Update AuthContext]
    SET_CONTEXT --> ROLE
    
    ROLE -->|Student| STUDENT_DASH[Student Dashboard]
    ROLE -->|Admin| ADMIN_DASH[Admin Dashboard]
    
    STUDENT_DASH --> STUDENT_FEATURES[Access Student Features]
    ADMIN_DASH --> ADMIN_FEATURES[Access Admin Features]
    
    STUDENT_FEATURES --> LOGOUT{Logout?}
    ADMIN_FEATURES --> LOGOUT
    
    LOGOUT -->|Yes| CLEAR_SESSION[Clear Session Data]
    CLEAR_SESSION --> PRESERVE[Preserve Grievance Data]
    PRESERVE --> PUBLIC
    
    LOGOUT -->|No| CONTINUE[Continue Using App]
    
    style START fill:#4caf50
    style PUBLIC fill:#fff4e6
    style STUDENT_DASH fill:#e8f5e9
    style ADMIN_DASH fill:#fce4ec
    style CREATE_SESSION fill:#81c784
    style CLEAR_SESSION fill:#ef5350
```

**Key Points:**
- AuthContext checks localStorage on app load
- Registration creates user in `users` array
- Login creates session with `currentUser` and `authToken`
- Role-based routing to Student or Admin dashboard
- Logout preserves grievance data, only clears session

---

## 3. Student Grievance Submission Flow

Complete flow from submission to tracking:

```mermaid
flowchart TD
    START([Student Clicks Submit]) --> FORM[Grievance Form Page]
    
    FORM --> FILL[Fill Form Details]
    FILL --> DETAILS[Enter: Category, Subject,<br/>Description, Evidence]
    
    DETAILS --> ANON{Anonymous<br/>Submission?}
    
    ANON -->|Yes| ANON_DATA[Remove Personal Info]
    ANON -->|No| KEEP_DATA[Keep Personal Info]
    
    ANON_DATA --> SUBMIT[Click Submit]
    KEEP_DATA --> SUBMIT
    
    SUBMIT --> VALIDATE{Form Valid?}
    VALIDATE -->|No| SHOW_ERROR[Show Validation Errors]
    SHOW_ERROR --> FILL
    
    VALIDATE -->|Yes| CALL_SERVICE[Call grievanceService.submitGrievance]
    
    CALL_SERVICE --> GEN_CODE[Generate Tracking Code]
    GEN_CODE --> CODE_TYPE{Anonymous?}
    
    CODE_TYPE -->|Yes| ANON_CODE[ANON-2026-XXXX]
    CODE_TYPE -->|No| REG_CODE[GRV-2026-XXXX]
    
    ANON_CODE --> CREATE_OBJ[Create Grievance Object]
    REG_CODE --> CREATE_OBJ
    
    CREATE_OBJ --> ADD_META[Add: ID, Status=Pending,<br/>Timestamp, History]
    
    ADD_META --> SAVE_TYPE{Anonymous?}
    
    SAVE_TYPE -->|Yes| SAVE_ANON[Save to anonGrievances]
    SAVE_TYPE -->|No| SAVE_REG[Save to grievanceDatabase<br/>by category]
    
    SAVE_ANON --> SAVE_CHECK[Save to checkStatusGrievances]
    SAVE_REG --> SAVE_CHECK
    
    SAVE_CHECK --> NOTIFY_ADMIN[Create Admin Notification]
    NOTIFY_ADMIN --> SAVE_NOTIF[Save to notifications_admin@email]
    
    SAVE_NOTIF --> SUCCESS[Show Success Message]
    SUCCESS --> DISPLAY_CODE[Display Tracking Code]
    
    DISPLAY_CODE --> OPTIONS{Student Action}
    
    OPTIONS -->|View Details| DETAIL_PAGE[Grievance Detail Page]
    OPTIONS -->|Track Status| TRACK_PAGE[Check Status Page]
    OPTIONS -->|View All| LIST_PAGE[My Grievances List]
    OPTIONS -->|Dashboard| DASH[Return to Dashboard]
    
    style START fill:#4caf50
    style FORM fill:#e3f2fd
    style ANON_CODE fill:#ffb74d
    style REG_CODE fill:#64b5f6
    style SUCCESS fill:#81c784
    style NOTIFY_ADMIN fill:#ff8a65
```

**What Happens:**
1. Student fills form with category, subject, description
2. Chooses anonymous or identified submission
3. System generates unique tracking code
4. Grievance saved to appropriate database
5. Admin receives notification
6. Student gets tracking code for future reference

---


## 4. Admin Grievance Review Flow

How admins review and update grievances:

```mermaid
flowchart TD
    START([Admin Opens Dashboard]) --> DASH[Admin Dashboard]
    
    DASH --> VIEW_STATS[View Statistics:<br/>Total, Pending, In Progress,<br/>Resolved, Rejected]
    
    VIEW_STATS --> ACTION{Admin Action}
    
    ACTION -->|View All| ALL_GRIEV[All Grievances Page]
    ACTION -->|By Category| CAT_LIST[Category List Page]
    ACTION -->|Search Code| SEARCH[Check Status Page]
    
    ALL_GRIEV --> FILTER[Filter by:<br/>Status, Category, Date]
    CAT_LIST --> SELECT_CAT[Select Category]
    SEARCH --> ENTER_CODE[Enter Tracking Code]
    
    FILTER --> GRIEV_LIST[Display Grievance List]
    SELECT_CAT --> GRIEV_LIST
    ENTER_CODE --> FIND{Found?}
    
    FIND -->|No| NOT_FOUND[Show Not Found]
    FIND -->|Yes| GRIEV_DETAIL[Grievance Detail Page]
    
    GRIEV_LIST --> CLICK[Click on Grievance]
    CLICK --> GRIEV_DETAIL
    
    GRIEV_DETAIL --> SHOW_INFO[Display:<br/>- Student Info<br/>- Category & Subject<br/>- Description<br/>- Evidence<br/>- Current Status<br/>- History]
    
    SHOW_INFO --> ADMIN_ACTION{Admin Action}
    
    ADMIN_ACTION -->|Review| REVIEW_PAGE[Grievance Review Page]
    ADMIN_ACTION -->|Add Comment| COMMENT[Add Comment]
    ADMIN_ACTION -->|Back| GRIEV_LIST
    
    REVIEW_PAGE --> UPDATE_FORM[Update Form]
    UPDATE_FORM --> FIELDS[Change:<br/>- Status<br/>- Priority<br/>- Admin Notes<br/>- Review Comments]
    
    FIELDS --> SAVE[Click Save]
    SAVE --> CALL_UPDATE[Call grievanceService.updateStatus]
    
    CALL_UPDATE --> UPDATE_DB[Update in Database]
    UPDATE_DB --> ADD_HISTORY[Add to History Array]
    ADD_HISTORY --> UPDATE_CHECK[Update checkStatusGrievances]
    UPDATE_CHECK --> NOTIF_STUDENT[Create Student Notification]
    
    NOTIF_STUDENT --> SAVE_NOTIF[Save to notifications_student@email]
    SAVE_NOTIF --> SUCCESS[Show Success Message]
    
    SUCCESS --> NEXT{Next Action}
    NEXT -->|Review Another| GRIEV_LIST
    NEXT -->|Dashboard| DASH
    NEXT -->|Analytics| INSIGHTS[Insights Dashboard]
    
    COMMENT --> SAVE_COMMENT[Save Comment to Grievance]
    SAVE_COMMENT --> GRIEV_DETAIL
    
    style START fill:#4caf50
    style DASH fill:#fce4ec
    style REVIEW_PAGE fill:#fff9c4
    style SUCCESS fill:#81c784
    style NOTIF_STUDENT fill:#ff8a65
```

**Admin Workflow:**
1. View dashboard with statistics
2. Browse grievances (all, by category, or search)
3. Click on grievance to see full details
4. Open review page to update status/priority
5. Add admin notes and review comments
6. Save changes - updates database and history
7. Student receives notification of status change

---

## 5. Notification System Flow

How notifications are created and displayed:

```mermaid
flowchart TD
    subgraph Events["📢 Notification Triggers"]
        E1[Student Submits Grievance]
        E2[Admin Updates Status]
        E3[New Notice Posted]
        E4[New Guideline Added]
        E5[New Mail Received]
    end
    
    subgraph Creation["🔔 Notification Creation"]
        E1 --> CREATE_ADMIN[Create Admin Notification]
        E2 --> CREATE_STUDENT[Create Student Notification]
        E3 --> CREATE_ALL[Create Notification for All]
        E4 --> CREATE_ALL
        E5 --> CREATE_RECIPIENT[Create Recipient Notification]
        
        CREATE_ADMIN --> ADMIN_NOTIF[Notification Object:<br/>- title<br/>- message<br/>- type<br/>- grievanceCode<br/>- url<br/>- read: false<br/>- time]
        
        CREATE_STUDENT --> STUDENT_NOTIF[Notification Object:<br/>- title<br/>- message<br/>- type<br/>- grievanceCode<br/>- url<br/>- read: false<br/>- time]
        
        CREATE_ALL --> ALL_NOTIF[Notification Object]
        CREATE_RECIPIENT --> RECIP_NOTIF[Notification Object]
    end
    
    subgraph Storage["💾 Storage"]
        ADMIN_NOTIF --> SAVE_ADMIN[Save to<br/>notifications_admin@email]
        STUDENT_NOTIF --> SAVE_STUDENT[Save to<br/>notifications_student@email]
        ALL_NOTIF --> SAVE_ALL[Save to all user<br/>notification arrays]
        RECIP_NOTIF --> SAVE_RECIP[Save to recipient<br/>notification array]
    end
    
    subgraph Display["📱 Display"]
        SAVE_ADMIN --> LOAD[NotificationContext Loads]
        SAVE_STUDENT --> LOAD
        SAVE_ALL --> LOAD
        SAVE_RECIP --> LOAD
        
        LOAD --> COUNT[Count Unread]
        COUNT --> BADGE[Update Badge Number]
        
        BADGE --> USER_CLICK{User Clicks<br/>Notification Icon}
        
        USER_CLICK -->|Yes| DROPDOWN[Show Notification Dropdown]
        DROPDOWN --> LIST[Display Notification List]
        
        LIST --> CLICK_NOTIF{Click Notification}
        CLICK_NOTIF -->|Yes| MARK_READ[Mark as Read]
        MARK_READ --> NAVIGATE[Navigate to URL]
        NAVIGATE --> PAGE[Open Related Page]
        
        CLICK_NOTIF -->|No| CLOSE[Close Dropdown]
    end
    
    style Events fill:#e3f2fd
    style Creation fill:#fff9c4
    style Storage fill:#ffccbc
    style Display fill:#c8e6c9
```

**Notification Flow:**
1. **Trigger**: Event occurs (submission, update, new notice, etc.)
2. **Creation**: System creates notification object with details
3. **Storage**: Saved to user-specific localStorage key
4. **Display**: NotificationContext loads and counts unread
5. **Badge**: Shows unread count on notification icon
6. **Interaction**: User clicks to view, mark as read, and navigate

---

## 6. Mail Communication Flow

Internal messaging between students and admins:

```mermaid
flowchart TD
    START([User Opens Mail]) --> ROLE{User Role}
    
    ROLE -->|Student| STUDENT_MAIL[Student Mail Page]
    ROLE -->|Admin| ADMIN_MAIL[Admin Mail Page]
    
    STUDENT_MAIL --> S_VIEW[View Inbox]
    ADMIN_MAIL --> A_VIEW[View Inbox]
    
    S_VIEW --> S_LIST[Display Mail List:<br/>- From Admin<br/>- Subject<br/>- Date<br/>- Read/Unread]
    
    A_VIEW --> A_LIST[Display Mail List:<br/>- From Students<br/>- Subject<br/>- Date<br/>- Read/Unread]
    
    S_LIST --> S_ACTION{Student Action}
    A_LIST --> A_ACTION{Admin Action}
    
    S_ACTION -->|Read Mail| S_OPEN[Open Mail Detail]
    S_ACTION -->|Compose| S_COMPOSE[Compose New Mail]
    
    A_ACTION -->|Read Mail| A_OPEN[Open Mail Detail]
    A_ACTION -->|Compose| A_COMPOSE[Compose New Mail]
    A_ACTION -->|Reply| A_REPLY[Reply to Student]
    
    S_OPEN --> S_MARK[Mark as Read]
    A_OPEN --> A_MARK[Mark as Read]
    
    S_MARK --> S_DISPLAY[Display:<br/>- From<br/>- Subject<br/>- Body<br/>- Date<br/>- Attachments]
    
    A_MARK --> A_DISPLAY[Display:<br/>- From<br/>- Subject<br/>- Body<br/>- Date<br/>- Related Grievance]
    
    S_COMPOSE --> S_FORM[Fill Form:<br/>- To: Admin<br/>- Subject<br/>- Message<br/>- Related Grievance]
    
    A_COMPOSE --> A_FORM[Fill Form:<br/>- To: Student Email<br/>- Subject<br/>- Message<br/>- Related Grievance]
    
    A_REPLY --> A_FORM
    
    S_FORM --> S_SEND[Click Send]
    A_FORM --> A_SEND[Click Send]
    
    S_SEND --> VALIDATE_S{Valid?}
    A_SEND --> VALIDATE_A{Valid?}
    
    VALIDATE_S -->|No| S_ERROR[Show Errors]
    VALIDATE_A -->|No| A_ERROR[Show Errors]
    
    S_ERROR --> S_FORM
    A_ERROR --> A_FORM
    
    VALIDATE_S -->|Yes| CREATE_MAIL_S[Create Mail Object]
    VALIDATE_A -->|Yes| CREATE_MAIL_A[Create Mail Object]
    
    CREATE_MAIL_S --> SAVE_MAIL[Save to mailDatabase]
    CREATE_MAIL_A --> SAVE_MAIL
    
    SAVE_MAIL --> NOTIF_RECIP[Create Notification<br/>for Recipient]
    
    NOTIF_RECIP --> SAVE_NOTIF[Save Notification]
    SAVE_NOTIF --> SUCCESS[Show Success]
    
    SUCCESS --> BACK{Go Back}
    BACK --> S_VIEW
    BACK --> A_VIEW
    
    style STUDENT_MAIL fill:#e8f5e9
    style ADMIN_MAIL fill:#fce4ec
    style SAVE_MAIL fill:#ffccbc
    style SUCCESS fill:#81c784
```

**Mail System:**
- Students can send mail to admin
- Admins can send mail to specific students
- Admins can reply to student mails
- All mails stored in `mailDatabase`
- Recipients get notifications
- Read/unread status tracking

---


## 7. Data Storage Architecture

Complete localStorage structure and relationships:

```mermaid
flowchart TB
    subgraph LocalStorage["💾 localStorage"]
        subgraph Auth["🔐 Authentication"]
            USERS[users<br/>Array of all registered users]
            CURRENT[currentUser<br/>Active session user object]
            TOKEN[authToken<br/>Session token]
            LOGIN_TIME[loginTime<br/>Login timestamp]
        end
        
        subgraph Grievances["📋 Grievances"]
            GRIEV_DB[grievanceDatabase<br/>Object with category keys:<br/>- academic<br/>- hostel<br/>- infrastructure<br/>- harassment<br/>- other]
            ANON_DB[anonGrievances<br/>Array of anonymous grievances]
            CHECK_DB[checkStatusGrievances<br/>Array for quick status lookup]
            RECENT[recentGrievance<br/>Last submitted grievance]
        end
        
        subgraph Communication["💬 Communication"]
            MAIL_DB[mailDatabase<br/>Array of all mails]
            NOTIF[notifications_email<br/>Per-user notification arrays]
        end
        
        subgraph Content["📰 Content"]
            NOTICES[notices<br/>Array of notice board posts]
            ADMIN_NOTICES[admin_notices<br/>Admin-specific notices]
            GUIDELINES[guidelines<br/>Array of guideline documents]
            GUIDE_DB[guidelines_db<br/>Alternative guideline storage]
        end
    end
    
    subgraph Operations["⚙️ Operations"]
        AUTH_OPS[Authentication Operations:<br/>- Register: Add to users<br/>- Login: Set currentUser & token<br/>- Logout: Clear session, keep data<br/>- Update: Modify currentUser & users]
        
        GRIEV_OPS[Grievance Operations:<br/>- Submit: Add to grievanceDatabase or anonGrievances<br/>- Update: Modify in database, add to history<br/>- Search: Query by code in checkStatusGrievances<br/>- Stats: Aggregate from all databases]
        
        MAIL_OPS[Mail Operations:<br/>- Send: Add to mailDatabase<br/>- Read: Mark as read<br/>- List: Filter by sender/recipient]
        
        NOTIF_OPS[Notification Operations:<br/>- Create: Add to notifications_email<br/>- Read: Mark notification as read<br/>- Count: Count unread notifications<br/>- Clear: Remove old notifications]
        
        CONTENT_OPS[Content Operations:<br/>- Create: Add to notices/guidelines<br/>- Update: Modify existing entry<br/>- Delete: Remove from array<br/>- Publish: Make visible to users]
    end
    
    Auth --> AUTH_OPS
    Grievances --> GRIEV_OPS
    Communication --> MAIL_OPS
    Communication --> NOTIF_OPS
    Content --> CONTENT_OPS
    
    subgraph DataFlow["🔄 Data Flow"]
        GRIEV_OPS -.->|Creates| NOTIF_OPS
        MAIL_OPS -.->|Creates| NOTIF_OPS
        CONTENT_OPS -.->|Creates| NOTIF_OPS
        AUTH_OPS -.->|Validates| GRIEV_OPS
        AUTH_OPS -.->|Validates| MAIL_OPS
    end
    
    style Auth fill:#e3f2fd
    style Grievances fill:#fff9c4
    style Communication fill:#c8e6c9
    style Content fill:#f3e5f5
    style Operations fill:#ffccbc
```

**Storage Structure:**

### Authentication Keys
- `users` - All registered users (array)
- `currentUser` - Active session user (object)
- `authToken` - Session token (string)
- `loginTime` - Login timestamp (ISO string)

### Grievance Keys
- `grievanceDatabase` - Organized by category (object)
  ```json
  {
    "academic": [...],
    "hostel": [...],
    "infrastructure": [...],
    "harassment": [...],
    "other": [...]
  }
  ```
- `anonGrievances` - Anonymous submissions (array)
- `checkStatusGrievances` - Quick lookup (array)
- `recentGrievance` - Last submission (object)

### Communication Keys
- `mailDatabase` - All mails (array)
- `notifications_<email>` - Per-user notifications (array)

### Content Keys
- `notices` - Notice board posts (array)
- `admin_notices` - Admin notices (array)
- `guidelines` - Guidelines (array)
- `guidelines_db` - Alternative storage (array)

---

## 8. Component Interaction Flow

How React components interact with services and contexts:

```mermaid
flowchart TB
    subgraph UI["🎨 UI Components"]
        PAGE[Page Component<br/>e.g., GrievanceForm]
        COMMON[Common Components<br/>Button, Card, Modal]
        LAYOUT[Layout Component<br/>UserLayout/AdminLayout]
    end
    
    subgraph Contexts["🔄 Context Providers"]
        AUTH_CTX[AuthContext<br/>- user<br/>- isAuthenticated<br/>- login/logout<br/>- updateUser]
        
        NOTIF_CTX[NotificationContext<br/>- notifications<br/>- unreadCount<br/>- markAsRead<br/>- clearAll]
        
        THEME_CTX[ThemeContext<br/>- theme<br/>- toggleTheme]
    end
    
    subgraph Hooks["🪝 Custom Hooks"]
        USE_AUTH[useAuth<br/>Access AuthContext]
        USE_NOTIF[useNotifications<br/>Access NotificationContext]
        USE_STORAGE[useLocalStorage<br/>localStorage helper]
        USE_SEARCH[useSearch<br/>Search functionality]
    end
    
    subgraph Services["⚙️ Services"]
        AUTH_SRV[authService<br/>- login<br/>- register<br/>- validateToken]
        
        GRIEV_SRV[grievanceService<br/>- submitGrievance<br/>- getUserGrievances<br/>- getGrievanceByCode<br/>- updateStatus<br/>- getStatistics]
        
        USER_SRV[userService<br/>- updateProfile<br/>- getUserActivity]
        
        MAIL_SRV[mailService<br/>- sendMail<br/>- getMails<br/>- markAsRead]
        
        GUIDE_SRV[guidelineService<br/>- getGuidelines<br/>- createGuideline<br/>- updateGuideline]
    end
    
    subgraph Storage["💾 Storage"]
        LS[(localStorage)]
    end
    
    PAGE --> USE_AUTH
    PAGE --> USE_NOTIF
    PAGE --> USE_STORAGE
    PAGE --> USE_SEARCH
    
    USE_AUTH --> AUTH_CTX
    USE_NOTIF --> NOTIF_CTX
    
    PAGE --> COMMON
    LAYOUT --> PAGE
    LAYOUT --> AUTH_CTX
    LAYOUT --> THEME_CTX
    
    PAGE --> Services
    
    AUTH_SRV --> AUTH_CTX
    GRIEV_SRV --> NOTIF_CTX
    MAIL_SRV --> NOTIF_CTX
    
    Services --> LS
    Contexts --> LS
    USE_STORAGE --> LS
    
    LS -.->|Read on mount| Contexts
    Contexts -.->|Provide state| PAGE
    Services -.->|Return data| PAGE
    PAGE -.->|Render| COMMON
    
    style UI fill:#e3f2fd
    style Contexts fill:#fff9c4
    style Hooks fill:#c8e6c9
    style Services fill:#f3e5f5
    style Storage fill:#ffccbc
```

**Component Interaction:**

1. **Page Component** (e.g., GrievanceForm)
   - Uses custom hooks to access contexts
   - Calls service functions for data operations
   - Renders common components

2. **Custom Hooks**
   - `useAuth` - Access user state and auth functions
   - `useNotifications` - Access notifications
   - `useLocalStorage` - Direct localStorage access
   - `useSearch` - Search and filter functionality

3. **Context Providers**
   - Wrap entire app in App.jsx
   - Provide global state to all components
   - Update when localStorage changes

4. **Services**
   - Handle business logic
   - Interact with localStorage
   - Return promises (simulating API calls)
   - Trigger context updates

5. **Data Flow**
   - User interacts with Page Component
   - Component calls Service function
   - Service updates localStorage
   - Service updates Context (if needed)
   - Context notifies subscribed components
   - Components re-render with new data

---

## 9. Complete User Journey Map

End-to-end journey for both student and admin:

```mermaid
flowchart TD
    START([User Visits Website]) --> LANDING[Landing Page]
    
    LANDING --> NEW{New User?}
    
    NEW -->|Yes| REGISTER[Register Account]
    NEW -->|No| LOGIN[Login]
    
    REGISTER --> SELECT_ROLE[Select Role:<br/>Student or Admin]
    SELECT_ROLE --> FILL_REG[Fill Registration Form]
    FILL_REG --> CREATE_ACC[Account Created]
    CREATE_ACC --> LOGIN
    
    LOGIN --> AUTH[Authenticate]
    AUTH --> ROLE_CHECK{Role?}
    
    ROLE_CHECK -->|Student| S_DASH[Student Dashboard]
    ROLE_CHECK -->|Admin| A_DASH[Admin Dashboard]
    
    subgraph StudentJourney["🎓 Student Journey"]
        S_DASH --> S_OPTIONS{Choose Action}
        
        S_OPTIONS -->|Submit| S_FORM[Fill Grievance Form]
        S_OPTIONS -->|View| S_LIST[View My Grievances]
        S_OPTIONS -->|Track| S_TRACK[Track Status]
        S_OPTIONS -->|Mail| S_MAIL[Check Mail]
        S_OPTIONS -->|Notices| S_NOTICE[View Notices]
        S_OPTIONS -->|Guidelines| S_GUIDE[Read Guidelines]
        S_OPTIONS -->|Profile| S_PROFILE[Edit Profile]
        S_OPTIONS -->|Insights| S_INSIGHT[View Analytics]
        
        S_FORM --> S_SUBMIT[Submit Grievance]
        S_SUBMIT --> S_CODE[Get Tracking Code]
        S_CODE --> S_NOTIF[Receive Confirmation]
        
        S_LIST --> S_DETAIL[View Grievance Detail]
        S_DETAIL --> S_STATUS[Check Current Status]
        S_STATUS --> S_HISTORY[View History]
        
        S_TRACK --> S_ENTER[Enter Tracking Code]
        S_ENTER --> S_RESULT[View Status Result]
        
        S_MAIL --> S_INBOX[View Inbox]
        S_INBOX --> S_READ[Read Mail]
        S_READ --> S_REPLY[Reply to Admin]
        
        S_NOTIF --> S_WAIT[Wait for Admin Review]
        S_WAIT --> S_UPDATE[Receive Status Update]
        S_UPDATE --> S_DASH
    end
    
    subgraph AdminJourney["👨‍💼 Admin Journey"]
        A_DASH --> A_OPTIONS{Choose Action}
        
        A_OPTIONS -->|Review| A_ALL[View All Grievances]
        A_OPTIONS -->|Category| A_CAT[Browse by Category]
        A_OPTIONS -->|Search| A_SEARCH[Search by Code]
        A_OPTIONS -->|Activity| A_ACTIVITY[User Activity]
        A_OPTIONS -->|Mail| A_MAIL[Check Mail]
        A_OPTIONS -->|Notices| A_NOTICE[Manage Notices]
        A_OPTIONS -->|Guidelines| A_GUIDE[Manage Guidelines]
        A_OPTIONS -->|Analytics| A_INSIGHT[View Analytics]
        
        A_ALL --> A_FILTER[Filter Grievances]
        A_FILTER --> A_SELECT[Select Grievance]
        A_SELECT --> A_DETAIL[View Full Details]
        
        A_DETAIL --> A_REVIEW[Open Review Page]
        A_REVIEW --> A_UPDATE[Update Status/Priority]
        A_UPDATE --> A_NOTES[Add Admin Notes]
        A_NOTES --> A_SAVE[Save Changes]
        
        A_SAVE --> A_NOTIF_S[Notify Student]
        A_NOTIF_S --> A_NEXT{Next Action}
        
        A_NEXT -->|Another| A_ALL
        A_NEXT -->|Dashboard| A_DASH
        
        A_MAIL --> A_INBOX[View Inbox]
        A_INBOX --> A_READ[Read Mail]
        A_READ --> A_REPLY[Reply to Student]
        
        A_NOTICE --> A_CREATE_N[Create Notice]
        A_CREATE_N --> A_PUBLISH[Publish to Students]
        
        A_GUIDE --> A_CREATE_G[Create Guideline]
        A_CREATE_G --> A_PUBLISH_G[Publish Guideline]
        
        A_INSIGHT --> A_STATS[View Statistics]
        A_STATS --> A_REPORTS[Generate Reports]
    end
    
    S_DASH --> LOGOUT{Logout?}
    A_DASH --> LOGOUT
    
    LOGOUT -->|Yes| CLEAR[Clear Session]
    LOGOUT -->|No| CONTINUE[Continue]
    
    CLEAR --> LANDING
    
    style START fill:#4caf50
    style StudentJourney fill:#e8f5e9
    style AdminJourney fill:#fce4ec
    style LOGOUT fill:#ef5350
```

**Complete Journey:**

### Student Path:
1. Register/Login → Student Dashboard
2. Submit grievance → Get tracking code
3. View submitted grievances
4. Track status updates
5. Receive notifications when admin updates
6. Communicate via mail
7. View notices and guidelines
8. Check personal analytics

### Admin Path:
1. Login → Admin Dashboard
2. View all grievances with statistics
3. Filter by category, status, date
4. Select and review grievance
5. Update status, priority, add notes
6. Student receives notification
7. Manage mail communication
8. Publish notices and guidelines
9. Monitor user activity
10. View system-wide analytics

---

## 10. Service Layer Detailed Flow

How each service interacts with data:

```mermaid
flowchart LR
    subgraph AuthService["🔐 authService"]
        A1[login] --> A1A[Validate credentials]
        A1A --> A1B[Create session]
        A1B --> A1C[Update AuthContext]
        
        A2[register] --> A2A[Validate data]
        A2A --> A2B[Create user]
        A2B --> A2C[Save to users array]
        
        A3[logout] --> A3A[Clear session]
        A3A --> A3B[Preserve data]
    end
    
    subgraph GrievService["📋 grievanceService"]
        G1[submitGrievance] --> G1A[Generate code]
        G1A --> G1B[Create object]
        G1B --> G1C[Save to DB]
        G1C --> G1D[Notify admin]
        
        G2[getUserGrievances] --> G2A[Get user email]
        G2A --> G2B[Filter grievances]
        G2B --> G2C[Return array]
        
        G3[getGrievanceByCode] --> G3A[Search in DB]
        G3A --> G3B[Search in anon DB]
        G3B --> G3C[Return grievance]
        
        G4[updateStatus] --> G4A[Find grievance]
        G4A --> G4B[Update fields]
        G4B --> G4C[Add to history]
        G4C --> G4D[Notify student]
        
        G5[getStatistics] --> G5A[Aggregate data]
        G5A --> G5B[Calculate metrics]
        G5B --> G5C[Return stats]
    end
    
    subgraph UserService["👤 userService"]
        U1[updateProfile] --> U1A[Validate data]
        U1A --> U1B[Update currentUser]
        U1B --> U1C[Update users array]
        
        U2[getUserActivity] --> U2A[Get user grievances]
        U2A --> U2B[Count by status]
        U2B --> U2C[Return activity]
    end
    
    subgraph MailService["💬 mailService"]
        M1[sendMail] --> M1A[Create mail object]
        M1A --> M1B[Save to mailDatabase]
        M1B --> M1C[Notify recipient]
        
        M2[getMails] --> M2A[Filter by user]
        M2A --> M2B[Sort by date]
        M2B --> M2C[Return mails]
        
        M3[markAsRead] --> M3A[Find mail]
        M3A --> M3B[Update read status]
    end
    
    subgraph GuideService["📚 guidelineService"]
        GL1[getGuidelines] --> GL1A[Read from storage]
        GL1A --> GL1B[Return array]
        
        GL2[createGuideline] --> GL2A[Create object]
        GL2A --> GL2B[Save to storage]
        GL2B --> GL2C[Notify users]
        
        GL3[updateGuideline] --> GL3A[Find guideline]
        GL3A --> GL3B[Update fields]
        GL3B --> GL3C[Save changes]
    end
    
    AuthService --> LS[(localStorage)]
    GrievService --> LS
    UserService --> LS
    MailService --> LS
    GuideService --> LS
    
    style AuthService fill:#e3f2fd
    style GrievService fill:#fff9c4
    style UserService fill:#c8e6c9
    style MailService fill:#f3e5f5
    style GuideService fill:#ffe0b2
```

---

## Summary

This document provides comprehensive flow diagrams showing:

1. **System Overview** - All sections and their connections
2. **Authentication** - Registration, login, and session management
3. **Grievance Submission** - Complete student submission flow
4. **Admin Review** - How admins process grievances
5. **Notifications** - Creation, storage, and display
6. **Mail System** - Internal communication flow
7. **Data Storage** - localStorage structure and operations
8. **Component Interaction** - React components, hooks, contexts, and services
9. **User Journey** - End-to-end paths for students and admins
10. **Service Layer** - Detailed service function flows

These diagrams can be used for:
- Understanding system architecture
- Onboarding new team members
- Documentation for faculty review
- Planning future enhancements
- Debugging and troubleshooting

---

**Note**: All diagrams use Mermaid syntax and will render properly in GitHub, VS Code with Mermaid extension, or any Markdown viewer that supports Mermaid diagrams.
