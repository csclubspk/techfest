# SPK College TechFest 2026 - Event Management Platform

A modern, production-ready full-stack web application for managing college technical festival events with role-based access control, real-time updates, and automated certificate generation.

> 📖 **For detailed user workflows and role-specific guides, see [USER_GUIDE.md](USER_GUIDE.md)**

## 🎯 How It Works

### For Participants:
1. **Register** directly on the website (no approval needed)
2. **Login** and browse available events
3. **Select & register** for events you want to participate in
4. **View dashboard** to see all registered events with details
5. **Download individual certificates** for each event you attended

### For Event Heads:
1. **Admin creates** your account with Event Head role
2. **Login** to view your assigned events
3. **Edit event details** (description and banner image)
4. **Start the event** (automatically posts announcement)
5. **Mark attendance** during events
6. **Select winners** (1st, 2nd, 3rd place)
7. **End the event** (automatically posts completion announcement)
8. **Auto-announce winners** when declared

### For Coordinators:
1. **Admin creates** your account with Coordinator role
2. **Admin assigns** you to a department (IT, CS, DS, or General)
3. **Login** to view events in your department
4. **Create events** within your assigned department
5. **Manage event details** (description, banner, date, location)
6. **Assign event heads** from your department to events
7. **Post announcements** for all participants
8. **Edit or delete events** in your department

### For Admins:
1. **Create events** for the TechFest
2. **Assign departments** to events (IT, CS, DS, or General)
3. **Upload event banners** (file upload or URL)
4. **Create Coordinator & Event Head accounts**
5. **Assign departments** to coordinators and event heads
6. **Manage announcements** (Create, Edit, Delete)
7. **Export participant data** to CSV/Excel
8. **Manage all users** with separated staff and participant views
9. **View analytics** and system statistics
10. **Full control** over all departments and events

---

## 🚀 Features

### 🆕 Latest Features (2026)
- **Department Organization**: Events organized by departments (IT, CS, DS, General)
- **Coordinator Event Creation**: Coordinators can create and manage events in their department
- **Department-Based Access Control**: Separate management of events by department
- **Department Filtering**: Filter events by department on the events page
- **Official Certificate Design**: SPK College branded certificates with proper formatting
- **Individual Event Certificates**: Download participation certificates for each event separately
- **Image Upload**: Upload event banners directly from your computer (max 5MB)
- **Winner Selection**: Event heads can declare 1st, 2nd, and 3rd place winners
- **Event Controls**: Start and end events with automatic announcements
- **Auto-Announcements**: 
  - Event starts automatically post announcements
  - Event ends automatically post announcements
  - Winner declarations auto-post to announcements
- **Admin Announcement CRUD**: Create, edit, and delete announcements with priority levels
- **Export Participants**: Download all participant data in CSV format (Excel compatible)
- **Organized User Management**: Separate views for staff (coordinators/event heads) and participants

### Authentication & Authorization
- **Firebase Authentication** (Email/Password + Google OAuth)
- **Role-Based Access Control** with 4 user roles:
  - **Admin**: Full system control
  - **Coordinator**: High-level event management
  - **Event Head**: Manage assigned events
  - **Participant**: Student registration and certificates

### Core Functionality

#### Admin Dashboard
- Create, edit, and delete events
- Assign departments to events (IT, CS, DS, General)
- Upload event banner images (file upload or URL)
- **CRUD operations on announcements** (Create, Read, Update, Delete)
- Edit announcement priority and content
- View all announcements with timestamps
- **Export all participants to CSV/Excel**
- Assign coordinators and event heads to departments
- Assign event heads to specific events
- Manage user roles and departments
- **Separated user management** (Staff vs Participants)
- View analytics and statistics

#### Coordinator Dashboard
- View events in assigned department only
- **Create events** within own department
- **Edit and delete events** in own department
- Upload event banner images
- **Assign event heads** from own department to events
- Post announcements for all participants
- Manage live event status
- Monitor participant statistics for department events

#### Event Head Dashboard
- View assigned events in own department
- **Start event** (triggers auto-announcement)
- **End event** (triggers completion announcement)
- Edit event details (description and banner)
- Upload event banner images
- View event participants
- Mark attendance
- Select winners (1st, 2nd, 3rd place)
- Auto-announce winners when declared

#### Participant Dashboard
- View all registered events with complete details
- Filter events by department
- See event banners, date, time, and location
- Track attendance status for each event
- **Download individual certificates** for each attended event
- View live event indicators
- Check announcements (including live event updates)
- View winners
- Download auto-generated participation certificates (PDF)

### Public Pages
- **Landing Page**: Branding, countdown, featured events
- **Events Listing**: Grid view with search and filters
- **Event Details**: Full event information with registration
- **Announcements**: Real-time updates via Firestore listeners
- **Winners**: Event-wise podium display
- **Profile**: Manage account and download certificates

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Firebase Authentication**
- **Cloud Firestore** (Real-time database)
- **Cloud Storage** (Event banner images)
- **Firestore Security Rules** (Role-based access)

### Libraries
- **jsPDF** for certificate generation
- **date-fns** for date formatting
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase account
- Netlify account (for deployment)

### Setup Instructions

1. **Clone and Install Dependencies**
```bash
cd techfest-reg
npm install
```

2. **Firebase Configuration**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project: "spk-techfest-2026"
   
   c. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable Email/Password
      - Enable Google

   d. Create Firestore Database:
      - Go to Firestore Database
      - Click "Create database"
      - Start in production mode
      - Choose your location

   e. Enable Cloud Storage:
      - Go to Storage in Firebase Console
      - Click "Get Started"
      - Start in production mode
      - Choose your location (same as Firestore)

   f. Get your Firebase config:
      - Go to Project Settings > Your Apps
      - Click "Add app" > Web
      - Copy the configuration

   g. Update `src/config/firebase.ts` with your Firebase credentials

3. **Environment Variables (Optional)**

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Deploy Security Rules**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Firestore and Storage)
firebase init

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules
```

**Note:** If you get permission errors during deployment:
1. Go to Firebase Console > Storage
2. Click on "Rules" tab
3. Manually copy the rules from `storage.rules` file
4. Publish the rules

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Netlify Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy on Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Build settings are auto-detected from `netlify.toml`
   - Add environment variables in Netlify dashboard
   - Deploy!

### Firebase Hosting (Alternative)

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 📊 Firestore Collections Structure

### users
```typescript
{
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: 'admin' | 'coordinator' | 'eventHead' | 'participant'
  department?: 'IT' | 'CS' | 'DS' | 'General'  // For coordinators and event heads
  createdAt: Timestamp
}
```

### events
```typescript
{
  title: string
  description: string
  banner: string | null
  rules: string[]
  eligibility: string
  maxParticipants: number
  currentParticipants: number
  eventDate: Timestamp
  eventTime: string
  location: string
  category: string
  department: 'IT' | 'CS' | 'DS' | 'General'
  eventHeadId: string | null
  eventHeadName: string | null
  coordinatorId: string | null
  coordinatorName: string | null
  isLive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### registrations
```typescript
{
  eventId: string
  eventTitle: string
  userId: string
  userName: string
  userEmail: string
  userPhoto: string | null
  registeredAt: Timestamp
  attended: boolean
  certificateId: string | null
}
```

### announcements
```typescript
{
  title: string
  content: string
  author: string
  authorId: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
}
```

### winners
```typescript
{
  eventId: string
  eventTitle: string
  position: 1 | 2 | 3
  userId: string
  userName: string
  userPhoto: string | null
  approvedBy: string
  approvedAt: Timestamp
}
```

## 🎨 UI/UX Features

- **Dark Tech Theme** with neon blue/purple accents
- **Glassmorphism** effects throughout
- **Smooth Animations** with Framer Motion
- **Mobile-First** responsive design
- **Real-time Updates** via Firestore listeners
- **Toast Notifications** for user feedback
- **Loading States** for better UX
- **Form Validation** with proper error handling

## 🔒 Security Features

- Role-based Firestore security rules
- Protected routes with authentication checks
- File upload validation (size, type)
- Secure role assignment (admin-only)
- Prevention of duplicate registrations
- Input sanitization and validation

## 📝 User Account Creation

### Creating Your First Admin

After deploying the application:

1. **Register the first user** at `yoursite.com/register`
2. Go to **Firebase Console** > **Firestore Database**
3. Find the user in the `users` collection
4. Edit the document and change `role` to `"admin"`
5. Save and refresh the app - you now have admin access!

### Creating Other User Roles (Admin Only)

#### Create Coordinator:
1. Admin registers a new account OR creates one manually
2. In **Firestore** → `users` collection → find the user
3. Change `role` field to `"coordinator"`
4. Add `department` field with value: `"IT"`, `"CS"`, `"DS"`, or `"General"`
5. OR use the Admin Dashboard to assign role and department
6. The coordinator can now login and create/manage events in their department

#### Create Event Head:
1. Admin registers a new account OR creates one manually
2. In **Firestore** → `users` collection → find the user
3. Change `role` field to `"eventHead"`
4. Add `department` field with value: `"IT"`, `"CS"`, `"DS"`, or `"General"`
5. OR use the Admin Dashboard to assign role and department
6. Admin or Coordinator assigns this event head to specific events
7. The event head can now manage assigned events in their department

#### Participants (Self-Registration):
- Participants can **directly create accounts** at `/register`
- They are automatically assigned `"participant"` role
- No admin approval needed
- They can immediately start registering for events

### Role Field Values

Use these exact values in Firestore:
- `"admin"` - Full system access (no department needed)
- `"coordinator"` - Event oversight and creation for assigned department
  - Required: `department` field: `"IT"`, `"CS"`, `"DS"`, or `"General"`
- `"eventHead"` - Manage assigned events within department
  - Required: `department` field: `"IT"`, `"CS"`, `"DS"`, or `"General"`
- `"participant"` - Register and participate in events (no department needed)

### Department Organization

The platform now supports departmental organization:
- **IT** - Information Technology Department
- **CS** - Computer Science Department  
- **DS** - Data Science Department
- **General** - Cross-departmental or college-wide events

**Department Access Control:**
- Coordinators can only create and manage events in their assigned department
- Event heads can only be assigned to events in their department
- Participants can view and register for events across all departments
- Admins have full access to all departments

## 🚧 Future Enhancements

- Email notifications
- Payment integration
- QR code attendance system
- Event analytics dashboard
- Live event streaming
- Mobile app (React Native)
- Export data to Excel
- Bulk user import
- Advanced certificate templates
- Event feedback system

## 📄 License

This project is created for SPK College TechFest 2026.

## 🤝 Support

For issues or questions, contact the development team or create an issue in the repository.

## 🎉 Acknowledgments

Built with modern web technologies for an enhanced user experience at SPK College TechFest 2026.

---

**Happy Coding! 🚀**
