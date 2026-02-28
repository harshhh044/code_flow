# Code Flow - Grievance Management System

A modern, responsive web-based grievance management system built for college students and administrators. This prototype enables transparent grievance submission, tracking, and resolution workflows.

## Features

### For Students
- Submit grievances with detailed incident information
- Anonymous grievance submission option
- Real-time status tracking with unique tracking codes
- View all submitted grievances by category
- Internal mail communication with admin
- Access to guidelines and notice board
- Personal dashboard with insights and analytics

### For Administrators
- Comprehensive grievance review dashboard
- Category-wise grievance filtering and management
- Status update workflow (Pending → In Progress → Resolved/Rejected)
- Priority assignment and internal notes
- User activity monitoring
- Analytics and insights dashboard
- Mail communication with students
- Notice board and guidelines management

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router DOM 7.13.0
- **Styling**: Tailwind CSS 3.4.19
- **Icons**: React Icons 5.5.0
- **HTTP Client**: Axios 1.13.5
- **Date Utilities**: date-fns 4.1.0
- **State Management**: React Context API
- **Data Persistence**: localStorage (prototype)

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components (Public, Admin, User)
├── context/             # React Context providers
│   ├── AuthContext.jsx
│   ├── NotificationContext.jsx
│   └── ThemeContext.jsx
├── hooks/               # Custom React hooks
├── pages/
│   ├── public/          # Public pages (Home, Login, Register, etc.)
│   ├── admin/           # Admin dashboard and features
│   └── user/            # Student dashboard and features
├── services/            # Business logic and API services
├── styles/              # Global styles and CSS variables
└── utils/               # Helper functions and constants
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codeflow-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

- **Guest**: Access to public pages (Home, About, Contact, FAQs)
- **Student**: Full access to grievance submission and tracking features
- **Admin**: Access to grievance review, management, and analytics

## Key Features Implementation

### Authentication & Authorization
- Role-based access control (RBAC)
- Protected routes for student and admin dashboards
- Session persistence across browser sessions

### Grievance Management
- Auto-generated unique tracking codes (GRV-YYYY-XXXX format)
- Anonymous submission support (ANON-YYYY-XXXX format)
- Category-based organization
- Status history tracking
- File attachment support (planned)

### Data Persistence
Current prototype uses localStorage with the following keys:
- `users` - User accounts database
- `currentUser` - Active session data
- `authToken` - Authentication token
- `grievanceDatabase` - Category-organized grievances
- `anonGrievances` - Anonymous grievances
- `checkStatusGrievances` - Status tracking data
- `notifications_<email>` - User-specific notifications

## Documentation

- [Product Requirements Document (PRD)](./PRD_CODEFLOW.md)
- [Architecture & User Flow](./ARCHITECTURE_AND_USER_FLOW.md)

## Future Enhancements

### Planned Backend Integration
- Node.js + Express.js API
- MongoDB/PostgreSQL database
- JWT authentication with refresh tokens
- File upload with cloud storage (Multer + AWS S3/Cloudinary)
- Real-time notifications (Socket.IO)
- Email/SMS notification services
- Audit logs and action history

## Contributing

This is a group project. To contribute:

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request for team review

## License

This project is developed for academic purposes.

## Team

[Add your team member names and roles here]

## Acknowledgments

Built as part of [Your College/Course Name] project requirements.
