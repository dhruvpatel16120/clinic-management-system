# 📚 Life Clinic Management System - Technical Documentation

> Comprehensive technical documentation for the Life Clinic Management System

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Component Documentation](#component-documentation)
7. [State Management](#state-management)
8. [Routing System](#routing-system)
9. [Security Implementation](#security-implementation)
10. [Deployment Guide](#deployment-guide)
11. [Troubleshooting](#troubleshooting)
12. [Performance Optimization](#performance-optimization)
13. [Testing Strategy](#testing-strategy)
14. [Contributing Guidelines](#contributing-guidelines)

## 🏗️ System Overview

The Life Clinic Management System is a full-stack web application built with modern web technologies. It provides comprehensive healthcare management capabilities including patient management, appointment scheduling, prescription management, billing, and role-based access control.

### Key Features
- **Multi-role Authentication**: Doctor and Receptionist roles
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first approach
- **Secure Data Handling**: Firebase security rules
- **PDF Generation**: Invoices and prescriptions
- **Token Management**: Patient queue system

## 🏛️ Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Components (Pages, Components, Hooks)              │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Custom Hooks, Context Providers, Utility Functions       │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase SDK, Firestore Operations, Authentication       │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth, Firestore, Vercel Hosting                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router DOM v7
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🚀 Installation & Setup Guide

### Prerequisites
Before setting up the Life Clinic Management System, ensure you have the following:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Firebase account** - [Create here](https://console.firebase.google.com/)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **Internet**: Required for Firebase services and package installation
- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

### Step-by-Step Installation

#### 1. **Clone the Repository**
```bash
# Clone the main repository
git clone https://github.com/dhruvpatel16120/clinic-management-system.git

# Navigate to project directory
cd clinic-management-system

# Verify the clone
ls -la
```

#### 2. **Install Dependencies**
```bash
# Install all required packages
npm install

# Verify installation
npm list --depth=0
```

**Expected Output**: You should see all dependencies listed without errors.

#### 3. **Firebase Project Setup**

##### 3.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `life-clinic-management-system`
4. Enable Google Analytics (optional but recommended)
5. Click **"Create project"**

##### 3.2 Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **"Email/Password"**
3. Enable **"Email/Password"** provider
4. Click **"Save"**

##### 3.3 Enable Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (for development)
3. Select location closest to your users
4. Click **"Done"**

##### 3.4 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **"</>"** (Web app icon)
4. Register app with nickname: `clinic-management-web`
5. Copy the configuration object

#### 4. **Environment Configuration**

##### 4.1 Create Environment File
```bash
# Copy the example environment file
cp env.example.txt .env

# Open the file for editing
nano .env  # Linux/Mac
# OR
notepad .env  # Windows
```

##### 4.2 Update Environment Variables
Replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Important**: Never commit your `.env` file to version control!

#### 5. **Firebase Security Rules Configuration**

##### 5.1 Access Firestore Rules
1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Staff data access control
    match /staffData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Appointments access control
    match /appointments/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // Prescriptions access control
    match /prescriptions/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.doctorId == request.auth.uid);
    }
    
    // Medicines access control
    match /medicines/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Invoices access control
    match /invoices/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
    }
  }
}
```

##### 5.2 Publish Rules
1. Click **"Publish"** button
2. Wait for confirmation message
3. Verify rules are active

#### 6. **Database Indexes Setup**

##### 6.1 Create Composite Indexes
Firebase may require composite indexes for complex queries. Create these in **Firestore Database** → **Indexes**:

```javascript
// Collection: appointments
// Fields: appointmentDate (Ascending), doctorName (Ascending)

// Collection: prescriptions  
// Fields: doctorId (Ascending), createdAt (Descending)

// Collection: invoices
// Fields: createdAt (Descending), status (Ascending)
```

#### 7. **Run the Application**

##### 7.1 Development Mode
```bash
# Start development server
npm run dev

# Expected output:
# VITE v7.1.2  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

##### 7.2 Access the Application
1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the home page

#### 8. **First-Time Setup**

##### 8.1 Create Admin Account
1. Click **"Sign Up"** on the home page
2. Choose **"Doctor"** or **"Receptionist"** role
3. Fill in your details:
   - Full Name: `Admin User`
   - Email: `admin@clinic.com`
   - Password: `Admin123!`
4. Click **"Create Account"**

##### 8.2 Verify Email
1. Check your email for verification link
2. Click the verification link
3. Return to the application
4. Click **"Check Again"** to verify status

##### 8.3 Access Dashboard
1. Login with your credentials
2. You'll be redirected to your role-specific dashboard
3. Verify all features are working

### Troubleshooting Installation

#### Common Issues & Solutions

##### Issue 1: "Module not found" errors
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

##### Issue 2: Firebase connection errors
- Verify environment variables are correct
- Check Firebase project is active
- Ensure Firestore is enabled
- Verify security rules are published

##### Issue 3: Port already in use
```bash
# Solution: Use different port
npm run dev -- --port 3000
```

##### Issue 4: Build errors
```bash
# Solution: Check Node.js version
node --version  # Should be 16+

# Update dependencies
npm update
npm run build
```

### Production Deployment

#### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

#### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Verification Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Firebase project created and configured
- [ ] Environment variables set correctly
- [ ] Security rules published
- [ ] Application runs on localhost
- [ ] Can create and verify user account
- [ ] Can access role-specific dashboard
- [ ] All features working properly

---

## 🔐 Authentication System

### Authentication Flow
1. **User Registration**
   - User provides email, password, full name, and role
   - Firebase creates user account
   - Verification email sent automatically
   - User data stored in Firestore

2. **User Login**
   - Email/password authentication
   - Role verification from Firestore
   - JWT token management
   - Redirect to role-specific dashboard

3. **Session Management**
   - Persistent authentication state
   - Automatic token refresh
   - Secure logout functionality

### Role-Based Access Control
```javascript
// Example of role verification
const { userRole } = useAuth();

if (userRole === 'doctor') {
  // Doctor-specific functionality
} else if (userRole === 'receptionist') {
  // Receptionist-specific functionality
}
```

### Protected Routes Implementation
```javascript
<ProtectedRoute requiredRole="doctor">
  <Doctor />
</ProtectedRoute>
```

## 🗄️ Database Schema

### Collections Structure

#### 1. staffData Collection
```javascript
{
  uid: "string",           // Firebase Auth UID
  fullName: "string",      // User's full name
  email: "string",         // User's email
  role: "string",          // "doctor" or "receptionist"
  createdAt: "timestamp",  // Account creation time
  updatedAt: "timestamp"   // Last update time
}
```

#### 2. appointments Collection
```javascript
{
  id: "string",                    // Auto-generated ID
  patientName: "string",           // Patient's full name
  patientPhone: "string",          // Patient's phone number
  patientEmail: "string",          // Patient's email
  appointmentDate: "string",       // YYYY-MM-DD format
  appointmentTime: "string",       // HH:MM format
  doctorName: "string",            // Assigned doctor
  doctorId: "string",              // Doctor's UID
  status: "string",                // "pending", "confirmed", "completed"
  tokenNumber: "number",           // Queue token number
  notes: "string",                 // Additional notes
  createdAt: "timestamp",          // Creation time
  updatedAt: "timestamp"           // Last update time
}
```

#### 3. prescriptions Collection
```javascript
{
  id: "string",                    // Auto-generated ID
  patientId: "string",             // Patient identifier
  patientName: "string",           // Patient's full name
  patientAge: "string",            // Patient's age
  patientGender: "string",         // Patient's gender
  patientPhone: "string",          // Patient's phone
  patientEmail: "string",          // Patient's email
  prescriptionDate: "string",      // YYYY-MM-DD format
  diagnosis: "string",             // Medical diagnosis
  symptoms: "string",              // Patient symptoms
  medicines: [                     // Array of medicines
    {
      name: "string",              // Medicine name
      dosage: "string",            // Dosage instructions
      frequency: "string",         // How often to take
      duration: "string",          // Duration of treatment
      instructions: "string"       // Special instructions
    }
  ],
  instructions: "string",          // General instructions
  followUpDate: "string",          // Follow-up appointment date
  status: "string",                // "active", "completed", "cancelled"
  notes: "string",                 // Additional notes
  doctorId: "string",              // Prescribing doctor's UID
  createdAt: "timestamp",          // Creation time
  updatedAt: "timestamp"           // Last update time
}
```

#### 4. medicines Collection
```javascript
{
  id: "string",                    // Auto-generated ID
  name: "string",                  // Medicine name
  genericName: "string",           // Generic name
  category: "string",              // Medicine category
  dosageForm: "string",            // Tablet, syrup, injection, etc.
  strength: "string",              // Strength/dosage
  manufacturer: "string",          // Manufacturing company
  description: "string",           // Medicine description
  sideEffects: "string",           // Potential side effects
  contraindications: "string",     // When not to use
  createdAt: "timestamp",          // Creation time
  updatedAt: "timestamp"           // Last update time
}
```

#### 5. invoices Collection
```javascript
{
  id: "string",                    // Auto-generated ID
  invoiceNumber: "string",         // Unique invoice number
  patientName: "string",           // Patient's name
  patientPhone: "string",          // Patient's phone
  patientEmail: "string",          // Patient's email
  appointmentId: "string",         // Related appointment ID
  items: [                         // Array of billed items
    {
      description: "string",       // Item description
      quantity: "number",          // Quantity
      unitPrice: "number",         // Price per unit
      total: "number"              // Total for this item
    }
  ],
  subtotal: "number",              // Subtotal amount
  tax: "number",                   // Tax amount
  totalAmount: "number",           // Total amount
  paymentMethod: "string",         // "cash", "card", "online"
  status: "string",                // "pending", "paid", "cancelled"
  paymentDate: "timestamp",        // Payment completion time
  notes: "string",                 // Additional notes
  createdBy: "string",             // Receptionist's UID
  createdAt: "timestamp",          // Creation time
  updatedAt: "timestamp"           // Last update time
}
```

## 🔌 API Reference

### Firebase Operations

#### Authentication Operations
```javascript
// Sign up new user
import { createUserWithEmailAndPassword } from 'firebase/auth';
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// Sign in existing user
import { signInWithEmailAndPassword } from 'firebase/auth';
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Sign out user
import { signOut } from 'firebase/auth';
await signOut(auth);

// Send password reset email
import { sendPasswordResetEmail } from 'firebase/auth';
await sendPasswordResetEmail(auth, email);
```

#### Firestore Operations
```javascript
// Add document
import { addDoc, collection } from 'firebase/firestore';
const docRef = await addDoc(collection(db, 'collectionName'), data);

// Get document
import { getDoc, doc } from 'firebase/firestore';
const docSnap = await getDoc(doc(db, 'collectionName', 'documentId'));

// Update document
import { updateDoc, doc } from 'firebase/firestore';
await updateDoc(doc(db, 'collectionName', 'documentId'), updateData);

// Delete document
import { deleteDoc, doc } from 'firebase/firestore';
await deleteDoc(doc(db, 'collectionName', 'documentId'));

// Query documents
import { query, where, orderBy, onSnapshot } from 'firebase/firestore';
const q = query(collection(db, 'collectionName'), where('field', '==', 'value'));
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Handle real-time updates
});
```

### Custom Hooks

#### useAuth Hook
```javascript
const { currentUser, userRole, loading } = useAuth();

// Returns:
// currentUser: Firebase user object or null
// userRole: "doctor" | "receptionist" | null
// loading: boolean indicating auth state loading
```

#### useFirestore Hook (Custom)
```javascript
// Example of custom hook for Firestore operations
const useFirestore = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName]);

  return { data, loading, error };
};
```

## 🧩 Component Documentation

### Core Components

#### 1. ProtectedRoute Component
```javascript
// Purpose: Route protection based on user role
// Props: requiredRole (string), children (ReactNode)
// Usage: Wraps routes that require specific roles

<ProtectedRoute requiredRole="doctor">
  <Doctor />
</ProtectedRoute>
```

#### 2. LogoutButton Component
```javascript
// Purpose: Handles user logout
// Features: Confirmation dialog, redirect to home
// Styling: Responsive button with hover effects
```

#### 3. EmailVerificationStatus Component
```javascript
// Purpose: Displays email verification status
// Features: Real-time status checking, manual refresh
// Integration: Firebase Auth emailVerified property
```

#### 4. TokenDisplay Component
```javascript
// Purpose: Public display of current patient queue
// Features: Real-time updates, responsive design
// Access: Public route (no authentication required)
```

### Page Components

#### Doctor Dashboard
- **Real-time Statistics**: Live appointment and patient counts
- **Quick Actions**: Navigation to key features
- **Recent Activity**: Latest appointments and prescriptions

#### Receptionist Dashboard
- **Overview Statistics**: Appointments, prescriptions, billing
- **Quick Access**: Token management, appointment scheduling
- **Recent Updates**: Latest patient registrations

#### Billing Dashboard
- **Financial Overview**: Revenue, pending payments, payment methods
- **Invoice Management**: Create, view, edit invoices
- **Payment Processing**: Track payment status and history

## 🎯 State Management

### Context Providers

#### AuthContext
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication state management
  // Role verification from Firestore
  // User session persistence
};
```

### State Patterns

#### Local State Management
```javascript
const [formData, setFormData] = useState({
  patientName: '',
  patientPhone: '',
  appointmentDate: '',
  // ... other fields
});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

#### Real-time Data Synchronization
```javascript
useEffect(() => {
  const q = query(collection(db, 'appointments'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAppointments(appointments);
  });

  return unsubscribe;
}, []);
```

## 🛣️ Routing System

### Route Structure
```javascript
// Public Routes
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/queue" element={<TokenDisplay />} />

// Protected Doctor Routes
<Route path="/doctor" element={
  <ProtectedRoute requiredRole="doctor">
    <Doctor />
  </ProtectedRoute>
} />

// Protected Receptionist Routes
<Route path="/receptionist" element={
  <ProtectedRoute requiredRole="receptionist">
    <Receptionist />
  </ProtectedRoute>
} />
```

### Route Protection Logic
```javascript
const ProtectedRoute = ({ requiredRole, children }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  
  return children;
};
```

## 🔒 Security Implementation

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Staff data access control
    match /staffData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Appointments access control
    match /appointments/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // Prescriptions access control
    match /prescriptions/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.doctorId == request.auth.uid);
    }
  }
}
```

### Authentication Security
- **Email Verification**: Required for account activation
- **Password Requirements**: Firebase default security
- **Session Management**: Secure token handling
- **Role Verification**: Server-side role validation

### Data Validation
```javascript
// Example of input validation
const validatePatientData = (data) => {
  const errors = {};
  
  if (!data.patientName?.trim()) {
    errors.patientName = 'Patient name is required';
  }
  
  if (!data.patientPhone?.trim()) {
    errors.patientPhone = 'Phone number is required';
  }
  
  if (!data.appointmentDate) {
    errors.appointmentDate = 'Appointment date is required';
  }
  
  return errors;
};
```

## 🚀 Deployment Guide

### Vercel Deployment

#### 1. Environment Setup
```bash
# Required environment variables
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 2. Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

#### 3. Deployment Steps
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy automatically on push to main branch

### Firebase Configuration

#### 1. Project Setup
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Configure security rules
5. Set up authorized domains

#### 2. Security Rules Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Errors
```javascript
// Error: User not found
// Solution: Check if user exists in Firestore staffData collection

// Error: Role verification failed
// Solution: Ensure user document has correct role field
```

#### 2. Firestore Permission Errors
```javascript
// Error: Missing or insufficient permissions
// Solution: Check Firestore security rules
// Ensure user is authenticated and has proper access
```

#### 3. Real-time Updates Not Working
```javascript
// Issue: Data not updating in real-time
// Solution: Check onSnapshot listeners
// Ensure proper cleanup in useEffect
```

#### 4. Build Errors
```bash
# Error: Module not found
npm install
npm run build

# Error: Environment variables not loaded
# Ensure .env file exists and variables are prefixed with VITE_
```

### Performance Issues

#### 1. Slow Loading
- Implement pagination for large datasets
- Use Firestore indexes for complex queries
- Optimize component re-renders

#### 2. Memory Leaks
- Clean up onSnapshot listeners
- Unsubscribe from real-time updates
- Use proper dependency arrays in useEffect

## ⚡ Performance Optimization

### Code Splitting
```javascript
// Lazy load components
const Doctor = lazy(() => import('./pages/doctor/Doctor'));
const Receptionist = lazy(() => import('./pages/receptionist/Receptionist'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Doctor />
</Suspense>
```

### Firestore Optimization
```javascript
// Use indexes for complex queries
// Limit query results
const q = query(
  collection(db, 'appointments'),
  where('doctorName', '==', doctorName),
  orderBy('appointmentDate'),
  limit(50)
);

// Implement pagination
const q = query(
  collection(db, 'appointments'),
  orderBy('createdAt', 'desc'),
  startAfter(lastDoc),
  limit(20)
);
```

### React Optimization
```javascript
// Memoize expensive calculations
const memoizedStats = useMemo(() => {
  return calculateStats(appointments);
}, [appointments]);

// Use callback for event handlers
const handleSubmit = useCallback((data) => {
  submitData(data);
}, []);
```

## 🧪 Testing Strategy

### Testing Levels

#### 1. Unit Testing
- Component rendering tests
- Hook functionality tests
- Utility function tests

#### 2. Integration Testing
- Authentication flow tests
- Data flow tests
- Route protection tests

#### 3. End-to-End Testing
- User journey tests
- Role-based access tests
- Data persistence tests

### Testing Tools
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking

### Test Examples
```javascript
// Component test example
import { render, screen } from '@testing-library/react';
import Doctor from './Doctor';

test('renders doctor dashboard', () => {
  render(<Doctor />);
  expect(screen.getByText(/Doctor Dashboard/i)).toBeInTheDocument();
});

// Hook test example
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

test('useAuth returns correct initial state', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.currentUser).toBeNull();
  expect(result.current.userRole).toBeNull();
});
```

## 🤝 Contributing Guidelines

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create feature branch
5. Make changes and test
6. Submit pull request

### Code Standards
- **ESLint**: Follow project linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Consider adding type safety
- **Testing**: Include tests for new features

### Pull Request Process
1. **Description**: Clear description of changes
2. **Testing**: Ensure all tests pass
3. **Documentation**: Update relevant documentation
4. **Review**: Address review comments
5. **Merge**: Maintain clean commit history

### Commit Message Format
```
type(scope): description

feat(auth): add password reset functionality
fix(billing): resolve invoice calculation error
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): simplify data fetching logic
test(auth): add authentication flow tests
```

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/dhruvpatel16120/clinic-management-system/issues)
- **Documentation**: This file and README.md
- **Live Demo**: [life-clinic-management-system.vercel.app](https://life-clinic-management-system.vercel.app)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

*Last updated: Augest 2025*
*Version: 1.0.0*
