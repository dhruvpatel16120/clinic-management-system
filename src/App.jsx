import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Doctor from './pages/doctor/Doctor'
import Receptionist from './pages/receptionist/Receptionist'
import DoctorAppointments from './pages/doctor/appointment/Appointments'
import ReceptionistAppointments from './pages/receptionist/appointment/Appointments'
import Signup from './pages/auth/Signup'
import ForgotPasswordForm from './pages/auth/ForgotPasswordForm'
import VerifyEmail from './pages/auth/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'

// Doctor Prescription Pages
import DoctorPrescriptions from './pages/doctor/prescriptions/Prescriptions'
import CreatePrescription from './pages/doctor/prescriptions/CreatePrescription'
import ViewPrescription from './pages/doctor/prescriptions/ViewPrescription'
import Medicines from './pages/doctor/prescriptions/Medicines'

// Receptionist Prescription Pages
import ReceptionistPrescriptions from './pages/receptionist/prescriptions/Prescriptions'
import ReceptionistViewPrescription from './pages/receptionist/prescriptions/ViewPrescription'
import TokenManagement from './pages/receptionist/token/TokenManagement'
import TokenQueue from './pages/doctor/token/TokenQueue'
import TokenDisplay from './components/TokenDisplay'

// Receptionist Billing Pages
import BillingDashboard from './pages/receptionist/billing/BillingDashboard'
import CreateInvoice from './pages/receptionist/billing/CreateInvoice'
import InvoiceList from './pages/receptionist/billing/InvoiceList'
import PaymentProcessing from './pages/receptionist/billing/PaymentProcessing'
import PaymentHistory from './pages/receptionist/billing/PaymentHistory'
import InvoicePdfGenerator from './pages/receptionist/billing/InvoicePdfGenerator'
import Reports from './pages/receptionist/billing/Reports'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/:role" element={<Signup />} />
      <Route path="/queue" element={<TokenDisplay />} />
      
      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <Doctor />
        </ProtectedRoute>
      } />
      <Route path="/doctor/appointments" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorAppointments />
        </ProtectedRoute>
      } />
      <Route path="/doctor/tokens" element={
        <ProtectedRoute requiredRole="doctor">
          <TokenQueue />
        </ProtectedRoute>
      } />
      
      {/* Doctor Prescription Routes */}
      <Route path="/doctor/prescriptions" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorPrescriptions />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/create" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/create/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/view/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <ViewPrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/edit/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/medicines" element={
        <ProtectedRoute requiredRole="doctor">
          <Medicines />
        </ProtectedRoute>
      } />
      
      {/* Receptionist Routes */}
      <Route path="/receptionist" element={
        <ProtectedRoute requiredRole="receptionist">
          <Receptionist />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/appointments" element={
        <ProtectedRoute requiredRole="receptionist">
          <ReceptionistAppointments />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/tokens" element={
        <ProtectedRoute requiredRole="receptionist">
          <TokenManagement />
        </ProtectedRoute>
      } />
      
      {/* Receptionist Prescription Routes */}
      <Route path="/receptionist/prescriptions" element={
        <ProtectedRoute requiredRole="receptionist">
          <ReceptionistPrescriptions />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/prescriptions/view/:id" element={
        <ProtectedRoute requiredRole="receptionist">
          <ReceptionistViewPrescription />
        </ProtectedRoute>
      } />
      
      {/* Receptionist Billing Routes */}
      <Route path="/receptionist/billing" element={
        <ProtectedRoute requiredRole="receptionist">
          <BillingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/create" element={
        <ProtectedRoute requiredRole="receptionist">
          <CreateInvoice />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/invoices" element={
        <ProtectedRoute requiredRole="receptionist">
          <InvoiceList />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/payments" element={
        <ProtectedRoute requiredRole="receptionist">
          <PaymentProcessing />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/history" element={
        <ProtectedRoute requiredRole="receptionist">
          <PaymentHistory />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/invoices/:id" element={
        <ProtectedRoute requiredRole="receptionist">
          <InvoicePdfGenerator />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/invoices/:id/download" element={
        <ProtectedRoute requiredRole="receptionist">
          <InvoicePdfGenerator />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/invoices/:id/edit" element={
        <ProtectedRoute requiredRole="receptionist">
          <CreateInvoice />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/billing/reports" element={
        <ProtectedRoute requiredRole="receptionist">
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
