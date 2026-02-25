# SPK College TechFest 2026 - Event Management Platform

A modern, production-ready full-stack web application for managing college technical festival events with role-based access control, real-time updates, and automated certificate generation.

> 📖 **For detailed user workflows and role-specific guides, see [USER_GUIDE.md](USER_GUIDE.md)**

## 🎯 How It Works

### For Participants:
1. **Register** directly on the website (no approval needed)
2. **Login** and browse available events
3. **Select & register** for events you want to participate in
4. **View dashboard** to track your registered events
5. **Download certificates** after event completion (once approved by Event Head)

### For Event Heads:
1. **Admin creates** your account with Event Head role
2. **Login** to view your assigned events
3. **Edit event details** (description and banner image)
4. **Start the event** (automatically posts announcement)
5. **Mark attendance** during events
6. **Select winners** (1st, 2nd, 3rd place)
7. **Auto-announce winners** when declared

### For Coordinators:
1. **Admin creates** your account with Coordinator role
2. **Oversee all events** across TechFest
3. **Post announcements** for all participants
4. **Approve winners** selected by Event Heads

### For Admins:
1. **Create events** for the TechFest
2. **Upload event banners** (file upload or URL)
3. **Create Coordinator & Event Head accounts**
4. **Assign Event Heads** to specific events
5. **Post announcements** to all participants
6. **Manage all users** and system settings
7. **Export data** and view analytics

---

## 🚀 Features

### 🆕 Latest Features (2026)
- **Official Certificate Design**: SPK College branded certificates with proper formatting
- **Image Upload**: Upload event banners directly from your computer (max 5MB)
- **Winner Selection**: Event heads can declare 1st, 2nd, and 3rd place winners
- **Auto-Announcements**: 
  - Event starts automatically post announcements
  - Winner declarations auto-post to announcements
- **Admin Announcements**: Custom announcements with priority levels (Low, Medium, High)
- **Event Controls**: Start/stop events with live status indicators

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
- Upload event banner images (file upload or URL)
- Post announcements with priority levels
- Assign coordinators and event heads
- Manage user roles
- View analytics and statistics
- Export participant data

#### Coordinator Dashboard
- View all events and registrations
- Post announcements
- Manage live event status
- Approve winners
- Monitor participant statistics

#### Event Head Dashboard
- Manage assigned events only
- Edit event details (description and banner)
- Upload event banner images
- Start event (triggers auto-announcement)
- View event participants
- Mark attendance
- Select winners (1st, 2nd, 3rd place)
- Auto-announce winners when declared

#### Participant Dashboard
- Create and edit pro (including live event updates)
- View winners
- Download auto-generated participation certificates (PDF with official SPK College format
- Check announcements
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
  eventHeadId: string | null
  eventHeadName: string | null
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
4. The user can now login and access coordinator features

#### Create Event Head:
1. Admin registers a new account OR creates one manually
2. In **Firestore** → `users` collection → find the user
3. Change `role` field to `"eventHead"`
4. Admin goes to **Dashboard** → **Edit Event**
5. Assign this user as Event Head for specific events
6. The user can now manage assigned events

#### Participants (Self-Registration):
- Participants can **directly create accounts** at `/register`
- They are automatically assigned `"participant"` role
- No admin approval needed
- They can immediately start registering for events

### Role Field Values

Use these exact values in Firestore:
- `"admin"` - Full system access
- `"coordinator"` - Event oversight and announcements
- `"eventHead"` - Manage assigned events
- `"participant"` - Register and participate in events

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
