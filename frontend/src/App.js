import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, UserContext } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { EventProvider } from "./context/EventContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ToastContainer from "./components/ToastContainer";
import ConfirmDialog from "./components/ConfirmDialog";

// --- User-facing Pages ---
import HomePage from "./pages/HomePage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./pages/Dashboard";
import OrgDashboard from "./pages/OrgDashboard";
import OrgEventDetailsPage from "./pages/OrgEventDetailsPage"; // --- ADDED ---
import DiscoverEvents from "./pages/DiscoverEvents";
import MyEventsPage from "./pages/MyEventsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CheckInScanner from "./pages/CheckInScanner";

// --- Admin Pages ---
// --- Admin Pages ---
import AdminDashboard from "./admin/SuperAdminDashboard"; // --- CHANGED: Use new dashboard ---
import AdminProfilePage from "./admin/AdminProfilePage";
import AdminEventsPage from "./admin/EventsHeader";
import AdminUsersPage from "./admin/UsersPage";

// --- Main App CSS ---
import "./App.css";

// --- Global Components ---
import Footer from "./components/Footer";

// --- Route Protection Components ---

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(UserContext);
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }
  return currentUser ? children : <Navigate to="/login" replace />;
};

const OrgRoute = ({ children }) => {
  const { currentUser, loading } = useContext(UserContext);
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (currentUser.role === "org_admin" || currentUser.role === "super_admin") ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const AdminRoute = ({ children }) => { // This is SuperAdminRoute
  const { currentUser, loading } = useContext(UserContext);
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (currentUser.role === "admin" || currentUser.role === "super_admin") ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// --- AppRoutes Component ---
function AppRoutes() {
  // --- THIS IS THE FIX ---
  // Removed the extra space before the '='
  const { currentUser, setCurrentUser, loading } = useContext(UserContext);
  // --- END OF FIX ---

  // This is the new handleLogout function.
  // It calls setCurrentUser(null) from the context.
  const handleLogout = () => {
    localStorage.removeItem("igniteUserToken");
    sessionStorage.removeItem("igniteUserToken");
    setCurrentUser(null);
    window.location.href = '/login'; // Force reload to clear all state
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* --- Protected User Routes --- */}
      {/* All pages now receive the correct onLogout function */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <DiscoverEvents onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <ProtectedRoute>
            <MyEventsPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profilepage"
        element={
          <ProtectedRoute>
            <ProfilePage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* --- Protected Org Admin Routes --- */}
      <Route
        path="/org-dashboard"
        element={
          <OrgRoute>
            <OrgDashboard onLogout={handleLogout} />
          </OrgRoute>
        }
      />
      <Route
        path="/org/event/:id"
        element={
          <OrgRoute>
            <OrgEventDetailsPage onLogout={handleLogout} />
          </OrgRoute>
        }
      />
      <Route
        path="/org/scan/:id"
        element={
          <OrgRoute>
            <CheckInScanner onLogout={handleLogout} />
          </OrgRoute>
        }
      />

      {/* --- Protected Super Admin Routes --- */}
      <Route
        path="/admindashboard"
        element={
          <AdminRoute>
            <AdminDashboard onLogout={handleLogout} />
          </AdminRoute>
        }
      />
      <Route
        path="/adminprofilepage"
        element={
          <AdminRoute>
            <AdminProfilePage onLogout={handleLogout} />
          </AdminRoute>
        }
      />
      <Route
        path="/eventshandal"
        element={
          <AdminRoute>
            <AdminEventsPage onLogout={handleLogout} />
          </AdminRoute>
        }
      />
      <Route
        path="/userpage"
        element={
          <AdminRoute>
            <AdminUsersPage onLogout={handleLogout} />
          </AdminRoute>
        }
      />

      {/* --- Catch-all --- */}
      <Route
        path="*"
        element={
          <Navigate to={currentUser ? "/dashboard" : "/"} replace />
        }
      />
    </Routes>
  );
}



// --- Main App Component ---
function App() {
  return (
    // This wraps your entire app in the needed providers
    <ThemeProvider>
      <UserProvider>
        <ConfirmProvider>
          <EventProvider>
            <ToastProvider>
              <Router>
                <AppRoutes />
                <ConfirmDialog />
                <ToastContainer />
                <Footer />
              </Router>
            </ToastProvider>
          </EventProvider>
        </ConfirmProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;