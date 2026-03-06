# CodeFlow Frontend Setup Guide

## 🎯 Overview

Your CodeFlow frontend is now fully configured to work with the backend API. All services have been updated to use the backend instead of localStorage.

---

## ✅ What's Been Updated

### 1. API Configuration (`src/services/api.js`)
- ✅ Uses environment variables for API URL
- ✅ Automatic JWT token injection on all requests
- ✅ Auto-redirect to login on 401 errors
- ✅ 10-second timeout for requests
- ✅ Global error handling

### 2. Services Updated to Use Backend API
- ✅ `authService.js` - Login, register, logout
- ✅ `grievanceService.js` - Submit, view, update grievances
- ✅ `userService.js` - User management
- ✅ `notificationService.js` - Notifications
- ✅ `mailService.js` - Internal messaging
- ✅ `noticeService.js` - Notice board
- ✅ `guidelineService.js` - Guidelines management
- ✅ `activityLogService.js` - Activity tracking (Admin)

### 3. Environment Configuration
- ✅ `.env` file created with API URL
- ✅ Configurable for different environments

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd CodeFlow-frontend
npm install
```

### Step 2: Verify Environment Configuration

Check `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CodeFlow
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
```

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on: `http://localhost:5173` (or next available port)

### Step 4: Verify Backend is Running

Make sure your backend is running:
```bash
# In Codeflow-Backend directory
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running in development mode on port 5000
```

---

## 🧪 Testing the Integration

### Test 1: Register a New User

1. Open browser: `http://localhost:5173`
2. Click "Register" or go to `/register`
3. Fill in the form:
   - Full Name: Test Student
   - Email: student@test.com
   - Password: student123
   - Role: Student
   - UID: STU001
4. Click "Register"
5. You should be logged in and redirected to dashboard

**What happens behind the scenes:**
- Frontend sends POST to `http://localhost:5000/api/auth/register`
- Backend creates user in MongoDB Atlas
- Backend returns JWT token
- Frontend stores token in localStorage
- Activity log created automatically

### Test 2: Login

1. Go to `/login`
2. Enter credentials:
   - Email: student@test.com
   - Password: student123
3. Click "Login"
4. You should be redirected to student dashboard

**What happens:**
- Frontend sends POST to `http://localhost:5000/api/auth/login`
- Backend verifies credentials
- Backend returns JWT token
- Frontend stores token and user data
- Activity log created

### Test 3: Submit a Grievance

1. Login as student
2. Go to "Submit Grievance" or `/user/submit`
3. Fill in the form:
   - Category: Academic
   - Subject: Test Issue
   - Description: This is a test grievance
   - Priority: Medium
4. Click "Submit"
5. You should see success message with tracking code

**What happens:**
- Frontend sends POST to `http://localhost:5000/api/grievances`
- Backend creates grievance in MongoDB
- Backend creates notifications for all admins
- Backend creates activity log
- Frontend displays tracking code

### Test 4: Admin Reviews Grievance

1. Login as admin (admin@codeflow.com / admin123)
2. Go to "All Grievances" or `/admin/grievances`
3. You should see the submitted grievance
4. Click on it to view details
5. Update status to "In Progress"
6. Add admin notes

**What happens:**
- Frontend sends PUT to `http://localhost:5000/api/grievances/:code/status`
- Backend updates grievance
- Backend creates notification for student
- Backend creates activity log
- Student will see notification

### Test 5: Check Notifications

1. Click on notification bell icon
2. You should see notifications
3. Click on a notification to mark as read

**What happens:**
- Frontend sends GET to `http://localhost:5000/api/notifications`
- Backend returns user's notifications
- Click sends PUT to mark as read

---

## 📊 API Integration Details

### Authentication Flow

```
User Login
    ↓
Frontend: authService.login(email, password)
    ↓
POST /api/auth/login
    ↓
Backend: Verify credentials
    ↓
Backend: Generate JWT token
    ↓
Backend: Create activity log
    ↓
Response: { success: true, token, user data }
    ↓
Frontend: Store token in localStorage
    ↓
Frontend: Store user in localStorage
    ↓
Frontend: Redirect to dashboard
```

### Authenticated Requests

```
User Action (e.g., Submit Grievance)
    ↓
Frontend: grievanceService.submitGrievance(data)
    ↓
API Interceptor: Add "Authorization: Bearer TOKEN"
    ↓
POST /api/grievances
    ↓
Backend: Verify JWT token
    ↓
Backend: Check user role
    ↓
Backend: Create grievance
    ↓
Backend: Create notifications
    ↓
Backend: Create activity log
    ↓
Response: { success: true, data: grievance }
    ↓
Frontend: Display success message
```

---

## 🔧 Configuration Options

### Change API URL

Edit `.env` file:
```env
# For production
VITE_API_URL=https://your-backend-domain.com/api

# For local development
VITE_API_URL=http://localhost:5000/api
```

### Change Request Timeout

Edit `src/services/api.js`:
```javascript
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000 // Change to 15 seconds
});
```

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Cause:** Backend is not running or CORS issue

**Solution:**
1. Check backend is running: `http://localhost:5000/`
2. Check backend logs for errors
3. Verify CORS is enabled in backend (already configured)

### Issue: "401 Unauthorized"

**Cause:** Token expired or invalid

**Solution:**
1. Logout and login again
2. Check token in localStorage (DevTools → Application → Local Storage)
3. Token expires after 30 days

### Issue: "Cannot read properties of undefined"

**Cause:** API response structure mismatch

**Solution:**
1. Check backend response format
2. Check service file is handling response correctly
3. Look at browser console for detailed error

### Issue: Frontend shows old localStorage data

**Cause:** Mixed localStorage and API data

**Solution:**
1. Clear localStorage: DevTools → Application → Local Storage → Clear All
2. Logout and login again
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 📝 Development Workflow

### 1. Start Backend
```bash
cd Codeflow-Backend
npm run dev
```

### 2. Start Frontend
```bash
cd CodeFlow-frontend
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

### 4. Test Features
- Register users
- Login
- Submit grievances
- Update status (admin)
- Check notifications
- Send messages
- View activity logs (admin)

### 5. Check Logs
- **Frontend:** Browser console (F12)
- **Backend:** Terminal where `npm run dev` is running
- **Database:** MongoDB Atlas dashboard

---

## 🎨 Frontend Structure

```
CodeFlow-frontend/
├── src/
│   ├── services/
│   │   ├── api.js                    # Axios instance with interceptors
│   │   ├── authService.js            # Authentication
│   │   ├── grievanceService.js       # Grievance management
│   │   ├── userService.js            # User management
│   │   ├── notificationService.js    # Notifications
│   │   ├── mailService.js            # Messaging
│   │   ├── noticeService.js          # Notices
│   │   ├── guidelineService.js       # Guidelines
│   │   └── activityLogService.js     # Activity logs
│   ├── context/
│   │   ├── AuthContext.jsx           # Auth state management
│   │   ├── NotificationContext.jsx   # Notification state
│   │   └── ThemeContext.jsx          # Theme state
│   ├── pages/
│   │   ├── public/                   # Public pages
│   │   ├── user/                     # Student pages
│   │   └── admin/                    # Admin pages
│   └── components/
│       ├── common/                   # Reusable components
│       └── layout/                   # Layout components
├── .env                              # Environment variables
└── package.json                      # Dependencies
```

---

## 🔐 Security Features

### 1. JWT Token Management
- Token stored in localStorage
- Automatically added to all API requests
- Auto-logout on token expiration

### 2. Protected Routes
- Role-based access control
- Automatic redirect to login if not authenticated
- Separate routes for student/admin

### 3. Error Handling
- Global error interceptor
- User-friendly error messages
- Automatic token cleanup on 401

---

## 📊 Data Flow

### localStorage Usage (Minimal)
- `token` - JWT authentication token
- `currentUser` - Current user data (for UI display)

### Backend API (Primary Data Source)
- All grievances
- All users
- All notifications
- All messages
- All notices
- All guidelines
- All activity logs

**Note:** localStorage is now only used for authentication state. All data comes from backend API.

---

## 🚀 Production Deployment

### 1. Build Frontend
```bash
npm run build
```

This creates optimized production build in `dist/` folder.

### 2. Update Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=CodeFlow
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
```

### 3. Deploy
Deploy `dist/` folder to:
- **Vercel** - Automatic deployment from GitHub
- **Netlify** - Drag and drop or GitHub integration
- **GitHub Pages** - Static hosting
- **AWS S3 + CloudFront** - Scalable hosting

### 4. Update Backend CORS
Update backend `server.js` to allow your production domain:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## ✅ Verification Checklist

Before using the application:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] MongoDB Atlas is connected
- [ ] Can access `http://localhost:5173`
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can submit a grievance
- [ ] Can view notifications
- [ ] Admin can see all grievances
- [ ] Admin can update grievance status
- [ ] Activity logs are being created

---

## 📞 Support

If you encounter issues:

1. **Check Backend Logs:** Terminal where backend is running
2. **Check Frontend Console:** Browser DevTools (F12)
3. **Check Network Tab:** See API requests/responses
4. **Check MongoDB:** Login to Atlas dashboard
5. **Clear Cache:** Logout, clear localStorage, login again

---

## 🎉 You're Ready!

Your CodeFlow application is now fully integrated:
- ✅ Frontend connected to backend
- ✅ All services using API
- ✅ Authentication working
- ✅ Data persisting in MongoDB
- ✅ Notifications working
- ✅ Activity logging enabled

**Start using your application!** 🚀

---

**Last Updated:** March 5, 2026  
**Version:** 1.0.0  
**Status:** PRODUCTION READY ✅
