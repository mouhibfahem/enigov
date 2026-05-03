import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentHomePage from './pages/StudentHomePage';
import DelegateDashboard from './pages/DelegateDashboard';
import ComplaintsPage from './pages/ComplaintsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import PollsPage from './pages/PollsPage';
import RegulationsPage from './pages/RegulationsPage';
import MessagingPage from './pages/MessagingPage';
import SettingsPage from './pages/SettingsPage';
import DecisionsPage from './pages/DecisionsPage';
import EventsPage from './pages/EventsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

const HomePage = () => {
    const { user } = useAuth();
    if (!user) return <LandingPage />;
    if (user.role === 'ROLE_DELEGUE') return <DelegateDashboard />;
    return <StudentHomePage />;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Home — public landing for guests, role-based dashboard for authed users */}
                <Route path="/" element={
                    <PageTransition><HomePage /></PageTransition>
                } />

                {/* Protected routes */}
                <Route path="/complaints" element={
                    <ProtectedRoute>
                        <PageTransition><ComplaintsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/announcements" element={
                    <ProtectedRoute>
                        <PageTransition><AnnouncementsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/polls" element={
                    <ProtectedRoute>
                        <PageTransition><PollsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/regulations" element={
                    <ProtectedRoute>
                        <PageTransition><RegulationsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/messaging" element={
                    <ProtectedRoute>
                        <PageTransition><MessagingPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <PageTransition><SettingsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/decisions" element={
                    <ProtectedRoute>
                        <PageTransition><DecisionsPage /></PageTransition>
                    </ProtectedRoute>
                } />
                <Route path="/events" element={
                    <ProtectedRoute>
                        <PageTransition><EventsPage /></PageTransition>
                    </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <AnimatedRoutes />
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
