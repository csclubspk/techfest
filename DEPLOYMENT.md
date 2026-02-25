# Deployment Guide - SPK TechFest 2026

## Quick Start Deployment

### Step 1: Firebase Setup

1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com/
   # Click "Add project"
   # Name it: spk-techfest-2026
   ```

2. **Enable Authentication**
   - Navigate to Authentication > Sign-in method
   - Enable Email/Password provider
   - Enable Google provider
   - Add authorized domains (your Netlify domain)

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose production mode
   - Select your region

4. **Deploy Security Rules**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login
   firebase login

   # Deploy rules
   firebase deploy --only firestore:rules
   ```

### Step 2: Update Firebase Config

1. Get your Firebase configuration:
   - Project Settings > Your Apps > Add App (Web)
   - Copy the config object

2. Update `src/config/firebase.ts`:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   ```

### Step 3: Netlify Deployment

#### Option A: Deploy via Git (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/techfest-reg.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub and authorize
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Click "Deploy site"

3. **Configure Environment Variables (if using .env)**
   - Go to Site settings > Environment variables
   - Add your Firebase variables:
     ```
     VITE_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID
     VITE_FIREBASE_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID
     ```

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

### Step 4: Post-Deployment Setup

1. **Update Firebase Authorized Domains**
   - Go to Firebase Console > Authentication > Settings
   - Add your Netlify domain to authorized domains
   - Format: `your-site.netlify.app`

2. **Create First Admin User**
   - Register a new account on your deployed site
   - Go to Firebase Console > Firestore Database
   - Find the user in `users` collection
   - Edit document and change `role` to `"admin"`

3. **Test All Features**
   - Login as admin
   - Create a test event
   - Register as participant (use another account)
   - Test all role functionalities

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Authentication providers enabled
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Firebase config updated in code
- [ ] Code pushed to GitHub
- [ ] Netlify site deployed
- [ ] Custom domain configured (optional)
- [ ] Firebase authorized domains updated
- [ ] First admin user created
- [ ] All features tested

## Optional: Custom Domain

### Netlify Custom Domain

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to update DNS records

### Firebase Custom Domain (if using Firebase Hosting)

```bash
firebase hosting:channel:deploy production --expires 7d
firebase hosting:channel:deploy production
```

## Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Monitoring & Analytics

1. **Netlify Analytics**
   - Enable in Site settings > Analytics

2. **Firebase Analytics**
   - Enable in Firebase Console > Analytics

3. **Error Tracking**
   - Check Netlify deploy logs
   - Monitor Firebase Console > Firestore

## Troubleshooting

### Build Fails on Netlify
- Check build logs in Netlify dashboard
- Verify all dependencies are in package.json
- Test build locally: `npm run build`

### Firebase Connection Issues
- Verify Firebase config is correct
- Check if authorized domains include Netlify domain
- Ensure Firestore is enabled and security rules are deployed

### Authentication Not Working
- Verify auth providers are enabled
- Check authorized domains in Firebase
- Clear browser cache and try again

### Security Rules Blocking Requests
- Check Firebase Console > Firestore > Rules
- Review the rules in `firestore.rules`
- Deploy rules: `firebase deploy --only firestore:rules`

## Support

For deployment issues:
1. Check Netlify deploy logs
2. Review Firebase Console for errors
3. Verify all configuration steps
4. Test locally before deploying

---

**Deployment Complete! 🎉**

Your TechFest platform is now live and ready to use!
