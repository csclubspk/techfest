# SPK College TechFest 2026 - Event Management Platform

A modern, production-ready full-stack web application for managing college technical festival events with role-based access control, real-time updates, and automated certificate generation.

## 🚀 Features

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
- Assign coordinators and event heads
- Manage user roles
- View analytics and statistics
- Export participant data
- Post announcements
- Approve winners

#### Coordinator Dashboard
- View all events and registrations
- Post announcements
- Manage live event status
- Approve winners
- Monitor participant statistics

#### Event Head Dashboard
- Manage assigned events only
- Add/edit event details
- Upload event banners (Firebase Storage)
- View event participants
- Mark attendance
- Select winners (1st, 2nd, 3rd place)

#### Participant Dashboard
- Create and edit profile
- Upload profile photo
- Register for multiple events
- View registered events
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
- **Firebase Storage** (File uploads)
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

   e. Enable Storage:
      - Go to Storage
      - Click "Get started"
      - Start in production mode

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
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Deploy Security Rules**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

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

## 📝 Creating Admin User

After first user registration, manually update their role in Firestore:

1. Go to Firebase Console > Firestore Database
2. Find the user in the `users` collection
3. Edit the document and change `role` to `"admin"`
4. Save changes

Alternatively, create a Cloud Function for admin creation (recommended for production).

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
