# User Guide - SPK TechFest 2026

## 🎯 Complete User Workflows

### 👤 Participant Flow

#### 1. Registration & Login
1. Visit the TechFest website
2. Click **"Register"** button
3. Fill in your details:
   - Full Name
   - Email Address
   - Password
4. Click **"Create Account"**
5. You'll be automatically logged in with **Participant** role

#### 2. Browse & Register for Events
1. Go to **"Events"** page from the navigation
2. Browse available events or use search/filters
3. Click on any event to view details
4. Click **"Register for Event"** button
5. Confirmation will appear - you're now registered!

#### 3. View Your Dashboard
1. Click **"Dashboard"** in the navigation
2. You'll see:
   - **Registered Events**: All events you've signed up for
   - **Event Status**: Whether registration is approved
   - **Announcements**: Latest updates from coordinators
   - **Certificates**: Available after event heads approve

#### 4. Download Certificates
1. Go to your **Dashboard**
2. After the event and approval by Event Head:
   - Certificates section will show available certificates
3. Click **"Download Certificate"** for any completed event
4. PDF certificate will be generated with your name and event details

---

### 🎪 Event Head Flow

#### 1. Getting Your Account
- **Admin creates your account** with Event Head role
- You'll receive login credentials
- Login at: `yourdomain.com/login`

#### 2. View Assigned Events
1. Login to your dashboard
2. You'll see only the events assigned to you by admin
3. Each event card shows:
   - Event details
   - Number of participants registered
   - Participant list

#### 3. Manage Participants
1. Click on your event
2. View **"Participants"** section
3. See all registered participants:
   - Name
   - Email
   - Registration date
   - Attendance status

#### 4. Mark Attendance
1. During/after the event
2. Go to participant list
3. Check the **"Attended"** checkbox for participants who showed up
4. This enables them to receive certificates

#### 5. Select Winners
1. After event completion
2. Go to your event dashboard
3. Click **"Select Winners"**
4. Choose participants for:
   - 🥇 1st Place
   - 🥈 2nd Place
   - 🥉 3rd Place
5. Submit for coordinator approval

#### 6. Generate Reports
1. View event statistics:
   - Total registrations
   - Attendance rate
   - Winners selected
2. Export participant data if needed

---

### 🎯 Coordinator Flow

#### 1. Getting Your Account
- **Admin creates your account** with Coordinator role
- Login with provided credentials

#### 2. View All Events
1. Access your coordinator dashboard
2. See **all events** across the TechFest
3. Monitor:
   - Event status (Live/Upcoming)
   - Registration counts
   - Event head assignments

#### 3. Post Announcements
1. Click **"Post Announcement"**
2. Fill in:
   - Title
   - Message content
   - Priority (Low/Medium/High)
3. Click **"Post"**
4. All participants will see this on their dashboards

#### 4. Approve Winners
1. Event heads submit winner selections
2. You review winner submissions
3. Approve or reject based on:
   - Fair competition
   - Attendance verification
   - Event completion
4. Once approved, winners appear on Winners page

#### 5. Manage Event Status
1. Mark events as **"Live"** during the event
2. Update event status as needed
3. Monitor real-time registrations

#### 6. View Statistics
1. Overall TechFest metrics
2. Event-wise participation
3. Registration trends
4. Winner approvals pending

---

### 👑 Admin Flow

#### 1. Initial Setup
1. First user registers normally
2. Go to **Firebase Console** → **Firestore Database**
3. Find your user in `users` collection
4. Change `role` field to `"admin"`
5. Refresh the app - you now have admin access

#### 2. Create Events
1. Go to **Dashboard**
2. Click **"Create Event"**
3. Fill in details:
   - Event title
   - Description
   - Rules and eligibility
   - Date, time, location
   - Category
   - Maximum participants
4. Optionally assign an Event Head
5. Click **"Create Event"**

#### 3. Create User Accounts

##### Create Coordinator:
1. Dashboard → **"Manage Users"** (or directly in Firebase)
2. Register a new account
3. In Firestore, change their `role` to `"coordinator"`
4. Share login credentials with them

##### Create Event Head:
1. Register a new account
2. Change `role` to `"eventHead"` in Firestore
3. Go to **"Edit Event"**
4. Assign this user as Event Head for specific events
5. Share login credentials

##### Participants:
- Participants create their own accounts
- OR admin can create accounts and set `role` to `"participant"`

#### 4. Manage Events
1. **Edit Events**: Update any event details
2. **Delete Events**: Remove cancelled events
3. **Assign Event Heads**: Change event head assignments
4. **View All Registrations**: See who registered for what

#### 5. Manage Users
1. View all users in the system
2. Change user roles when needed
3. Assign/remove event head responsibilities
4. Monitor user activity

#### 6. View Analytics
1. Overall TechFest statistics
2. Event performance metrics
3. User registration trends
4. Export data for reporting

#### 7. Export Data
1. Download participant lists
2. Export event registrations
3. Generate reports for college management

---

## 🔄 Complete Event Lifecycle

### Phase 1: Setup (Admin)
1. ✅ Admin creates the event
2. ✅ Assigns Event Head
3. ✅ Event appears on Events page

### Phase 2: Registration (Participants)
1. ✅ Participants browse events
2. ✅ Register for events they want
3. ✅ See confirmation in dashboard

### Phase 3: Before Event (Event Head)
1. ✅ Event Head reviews registrations
2. ✅ Prepares participant list
3. ✅ Coordinator posts announcements

### Phase 4: During Event (Event Head)
1. ✅ Event Head marks attendance
2. ✅ Participants compete
3. ✅ Results are recorded

### Phase 5: After Event (Event Head)
1. ✅ Event Head selects winners
2. ✅ Submits for approval

### Phase 6: Approval (Coordinator)
1. ✅ Coordinator reviews winners
2. ✅ Approves winners
3. ✅ Winners appear on Winners page

### Phase 7: Certificates (Participants)
1. ✅ Attended participants can download certificates
2. ✅ Certificates include:
   - Participant name
   - Event name
   - Date
   - Verification ID

---

## 🔐 Role Permissions Summary

| Feature | Participant | Event Head | Coordinator | Admin |
|---------|-------------|------------|-------------|-------|
| Register for events | ✅ | ✅ | ✅ | ✅ |
| View all events | ✅ | ✅ | ✅ | ✅ |
| Create account | ✅ Self | ❌ | ❌ | ✅ Others |
| View own dashboard | ✅ | ✅ | ✅ | ✅ |
| Download certificates | ✅ Own | ❌ | ❌ | ❌ |
| Mark attendance | ❌ | ✅ Assigned | ❌ | ✅ |
| Select winners | ❌ | ✅ Assigned | ❌ | ✅ |
| Approve winners | ❌ | ❌ | ✅ | ✅ |
| Post announcements | ❌ | ❌ | ✅ | ✅ |
| Create events | ❌ | ❌ | ❌ | ✅ |
| Assign event heads | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Edit/delete events | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ Own events | ✅ All | ✅ All |
| Export data | ❌ | ❌ | ❌ | ✅ |

---

## 📱 Quick Access Links

### For Everyone:
- **Home**: Browse and learn about TechFest
- **Events**: View all available events
- **Announcements**: Stay updated with latest news
- **Winners**: See competition results
- **Profile**: Manage your account

### Role-Specific:
- **Participant Dashboard**: Your registered events & certificates
- **Event Head Dashboard**: Manage assigned events & participants
- **Coordinator Dashboard**: Oversee all events & post updates
- **Admin Dashboard**: Full system control & management

---

## ❓ Common Questions

### Can participants choose which events to join?
✅ Yes! Participants can browse all events and register for any event they're interested in.

### Who approves participant registrations?
Event registrations are automatic. Event Heads verify attendance during the event itself.

### How do certificates work?
Certificates are automatically available for download once:
1. Event is completed
2. Event Head marks you as "Attended"
3. You download from your dashboard

### Can Event Heads create events?
No, only Admins can create events. Event Heads are assigned to manage specific events.

### Can Coordinators assign Event Heads?
No, only Admins can assign Event Heads to events.

### How are winners displayed?
After Event Head selection and Coordinator approval, winners appear on the public Winners page with podium display.

---

## 🚀 Getting Started Quickly

### I'm a Participant:
1. Click **"Register"** on homepage
2. Create your account
3. Go to **"Events"**
4. Click **"Register"** on events you like
5. Check **"Dashboard"** for updates

### I'm an Event Head:
1. Login with credentials provided by admin
2. Go to **"Dashboard"**
3. Click on your assigned event
4. Manage participants and mark attendance
5. Select winners after event

### I'm a Coordinator:
1. Login with credentials provided by admin
2. Monitor all events from dashboard
3. Post announcements for participants
4. Approve winner selections
5. View overall statistics

### I'm an Admin:
1. Create events for TechFest
2. Create coordinator and event head accounts
3. Assign event heads to events
4. Monitor overall system
5. Export data as needed

---

**Need Help?** Contact the development team or check [README.md](README.md) for technical details.

**Happy TechFesting! 🎉**
