# Quick Setup Guide - SPK TechFest 2026

> 📖 **New to the system?** Check [USER_GUIDE.md](USER_GUIDE.md) for complete workflows and how each role works!

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure Firebase (2 min)

1. **Open** `src/config/firebase.ts`
2. **Replace** the placeholder values with your Firebase credentials:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}
```

**Where to get these values:**
- Go to https://console.firebase.google.com
- Select your project (or create one)
- Click the gear icon ⚙️ > Project Settings
- Scroll down to "Your apps" section
- Click the web app icon (`</>`)
- Copy the config values

### Step 3: Run Development Server (1 min)
```bash
npm run dev
```

Your app will be available at: http://localhost:5173

### Step 4: Create Admin Account (1 min)

1. **Open** http://localhost:5173/register in your browser
2. **Register** a new account
3. **Go to** Firebase Console > Firestore Database
4. **Find** your user in the `users` collection
5. **Click** on the document
6. **Edit** the `role` field and change it to `"admin"`
7. **Save** and refresh your app

## ✅ Quick Verification

- [ ] Can you see the landing page?
- [ ] Can you register/login?
- [ ] Can you access the dashboard?
- [ ] (Admin) Can you create an event?
- [ ] Can you register for an event?

## 🎯 Default Test Accounts

After creating your first admin, you can create these test accounts:

**How to create accounts:**
1. Go to `/register` and create account
2. Find user in Firebase Firestore > `users` collection
3. Edit the `role` field to desired role
4. Save and the user will have that role

**Suggested test accounts:**
1. **Admin**: admin@spk.edu (role: `"admin"`)
2. **Coordinator**: coordinator@spk.edu (role: `"coordinator"`)
3. **Event Head**: eventhead@spk.edu (role: `"eventHead"`)
4. **Participant**: student@spk.edu (role: `"participant"`)

**Note**: Participants can create their own accounts directly - no admin setup needed!

## 📁 Project Structure

```
techfest-reg/
├── src/
│   ├── components/        # Reusable components
│   │   ├── dashboards/   # Role-specific dashboards
│   │   ├── EventCard.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/             # Firebase initialization
│   │   └── firebase.ts
│   ├── config/          # Configuration files
│   │   └── firebase.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── certificateGenerator.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── firestore.rules      # Firestore security rules
├── firebase.json        # Firebase config
└── package.json         # Dependencies

```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Firebase
firebase login          # Login to Firebase
firebase deploy         # Deploy everything
firebase deploy --only firestore:rules  # Deploy Firestore rules
firebase deploy --only hosting          # Deploy hosting
```

## 🎨 Features Overview

### For Participants
- Register with email or Google
- Browse and search events
- Register for events
- View announcements
- Check winners
- Download certificates
- Manage profile

### For Event Heads
- View assigned events
- Add event details
- View participants list
- Mark attendance
- Select winners

### For Coordinators
- View all events
- Post announcements
- Manage event status
- Approve winners
- View statistics

### For Admins
- Full system control
- Create/edit/delete events
- Assign roles
- Manage users
- View analytics
- Export data

## 🐛 Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password auth in Firebase Console
- Go to Authentication > Sign-in method > Enable Email/Password

### "Missing or insufficient permissions"
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Check if your user has the correct role in Firestore

### "Network error" or "CORS error"
- Check Firebase configuration in `src/config/firebase.ts`
- Verify Firebase project is active
- Check internet connection

### Dev server not starting
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run dev` again

### Build errors
- Check TypeScript errors: `npm run build`
- Fix any type errors shown
- Ensure all imports are correct

## 📚 Next Steps

1. **Customize branding**: Update college name, colors, and logo
2. **Add events**: Create your TechFest events as admin
3. **Invite users**: Share registration link with students
4. **Deploy**: Follow instructions in DEPLOYMENT.md
5. **Test thoroughly**: Try all features before going live

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update Firebase config with production credentials
- [ ] Deploy Firestore security rules
- [ ] Test all user roles
- [ ] Verify email authentication works
- [ ] Test Google OAuth
- [ ] Check mobile responsiveness
- [ ] Test certificate generation
- [ ] Review security rules
- [ ] Set up backups
- [ ] Configure custom domain
- [ ] Enable Firebase Analytics

## 💡 Tips

- Use Chrome DevTools for debugging
- Check Firebase Console for real-time data
- Monitor Firestore usage in Firebase Console
- Keep security rules strict
- Test on mobile devices
- Use meaningful event titles and descriptions
- Add detailed event information and rules
- Post announcements regularly

## 🆘 Need Help?

1. Check README.md for detailed documentation
2. Review DEPLOYMENT.md for deployment guide
3. Check Firebase Console for errors
4. Review browser console for client errors
5. Verify security rules are deployed

---

**Happy Building! 🎉**

Now you're ready to manage an amazing TechFest!
