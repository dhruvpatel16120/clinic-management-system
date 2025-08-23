# Clinic Management System

A modern, secure clinic management system built with React, Firebase, and Tailwind CSS.

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

1. Copy `.env.example` to `.env`:
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
    match /staffData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

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
