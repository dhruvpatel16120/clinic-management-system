# Clinic Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://life-clinic-management-system.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

> 🚀 **Live Application**: [life-clinic-management-system.vercel.app](https://life-clinic-management-system.vercel.app)

A modern, secure clinic management system built with React, Firebase, and Tailwind CSS. Streamline your healthcare operations with role-based access control and comprehensive patient management.

## 🌟 Live Demo

Experience the application live at: **[life-clinic-management-system.vercel.app](https://life-clinic-management-system.vercel.app)**

### Test Accounts
- **Doctor**: Create a new account with Doctor role
- **Receptionist**: Create a new account with Receptionist role

## Features

- 🔐 **Secure Authentication** - Firebase Authentication with email/password
- 👥 **Role-Based Access** - Doctor and Receptionist roles with protected routes
- 📧 **Email Verification** - Automatic email verification after signup
- 🔒 **Password Reset** - Secure password reset functionality
- 💾 **Data Storage** - Firestore database for user data and roles
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for optimal development experience

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cms
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>)
   - Copy the config object

### 3. Environment Configuration

1. Copy `env.example.txt` to `.env`:
   ```bash
   cp env.example.txt .env
   ```

2. Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4. Firestore Security Rules

Update your Firestore security rules to allow authenticated access to the `staffData` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /staffData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read all staff data (for role checking)
    match /staffData/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Allow creation of new documents for authenticated users
    match /staffData/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Important**: These rules allow users to read all staff data for role verification while maintaining security for write operations. The `create` rule ensures new users can create their staff data documents.

### Email Verification

The system uses a simple and reliable approach for email verification:

**How it works:**
1. When a user signs up, Firebase automatically sends a verification email
2. When the user clicks the verification link in their email, Firebase Auth verifies their email
3. On the dashboard, users see their current verification status
4. If not verified, users can click "Check Again" to refresh their verification status

**Simple Logic:**
- The system directly reads the `emailVerified` status from Firebase Auth
- Users can manually refresh their verification status by clicking "Check Again"
- This triggers a user reload and page refresh to display the latest status
- No complex state management or Firestore syncing needed

This approach is much more reliable and straightforward than complex verification tracking systems.

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🌐 Deployment

This application is deployed on **Vercel** and is live at:
**[life-clinic-management-system.vercel.app](https://life-clinic-management-system.vercel.app)**

### Deployment Status
[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/life-clinic-management-system)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/life-clinic-management-system)

**Current Status**: ✅ **Live and Running**
**Last Deployed**: Today
**Environment**: Production

### Deploy Your Own

1. **Fork this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Configure environment variables in Vercel dashboard
3. **Set Environment Variables** in Vercel:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. **Deploy** - Vercel will automatically deploy your application

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── LogoutButton.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── firebase/           # Firebase configuration
│   └── config.js
├── pages/              # Application pages
│   ├── Doctor.jsx
│   ├── ForgotPasswordForm.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Receptionist.jsx
│   ├── Signup.jsx
│   └── VerifyEmail.jsx
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## Authentication Flow

1. **Signup**: Users create accounts with email, password, full name, and role
2. **Email Verification**: Firebase sends verification email automatically
3. **Login**: Users sign in with email and password
4. **Role-Based Access**: Users are redirected to appropriate dashboards based on their role
5. **Protected Routes**: Role-specific pages are protected from unauthorized access

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Features

- Email verification required for account activation
- Role-based access control
- Protected routes for authenticated users
- Secure password reset via email
- Firestore security rules for data protection

## Email Delivery Optimization

To prevent verification emails from going to spam:

1. **Configure Firebase Console**:
   - Go to Authentication → Settings → General
   - Add your domain to authorized domains
   - Customize email templates

2. **Set up Dynamic Links**:
   - Go to Engage → Dynamic Links
   - Add your domain (e.g., `your-project.page.link`)
   - Update `.env` with `VITE_FIREBASE_DYNAMIC_LINK_DOMAIN`

3. **Add DNS Records**:
   - SPF: `v=spf1 include:_spf.google.com ~all`
   - DKIM: Follow Firebase Console instructions
   - DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`

4. **See `FIREBASE_EMAIL_SETUP.md`** for detailed instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
