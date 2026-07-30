import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ManageProfile from './pages/ManageProfile';
import ManagePassword from './pages/ManagePassword';
import Measurements from './pages/Measurements';
import OrderForm from './pages/OrderForm';
import UploadDP from './pages/UploadDP';
import OrderDetail from './pages/OrderDetail';
import GoogleCallback from './pages/GoogleCallback';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-bg font-body selection:bg-primary/30 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/complete-profile" element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              } />

              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <ManageProfile />
                </ProtectedRoute>
              } />
              <Route path="/profile/password" element={
                <ProtectedRoute>
                  <ManagePassword />
                </ProtectedRoute>
              } />
              <Route path="/profile/measurements" element={
                <ProtectedRoute>
                  <Measurements />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/pesanan/buat" element={
                <ProtectedRoute>
                  <OrderForm />
                </ProtectedRoute>
              } />

              <Route path="/pesanan/:id/upload-dp" element={
                <ProtectedRoute>
                  <UploadDP />
                </ProtectedRoute>
              } />

              <Route path="/pesanan/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />

              <Route path="/track" element={<Track />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
