import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Layouts & Protection
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute.jsx';

// Public & Marketing Pages
import HomePage from './pages/public/HomePage.jsx';
import ServicesPage from './pages/public/ServicesPage.jsx';
import DriversPage from './pages/public/DriversPage.jsx';
import ProviderDetailPage from './pages/public/ProviderDetailPage.jsx';
import DriverDetailPage from './pages/public/DriverDetailPage.jsx';
import HowItWorksPage from './pages/public/HowItWorksPage.jsx';
import BecomeProviderPage from './pages/public/BecomeProviderPage.jsx';
import PostTaskPage from './pages/public/PostTaskPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Customer Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage.jsx';
import BookingsPage from './pages/customer/BookingsPage.jsx';
import BookingDetailPage from './pages/customer/BookingDetailPage.jsx';
import VehiclesPage from './pages/customer/VehiclesPage.jsx';
import FavoritesPage from './pages/customer/FavoritesPage.jsx';
import MessagesPage from './pages/customer/MessagesPage.jsx';
import ProfilePage from './pages/customer/ProfilePage.jsx';

// Provider Pages
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage.jsx';
import ProviderServicesPage from './pages/provider/ProviderServicesPage.jsx';
import ProviderQuotesPage from './pages/provider/ProviderQuotesPage.jsx';
import ProviderAvailabilityPage from './pages/provider/ProviderAvailabilityPage.jsx';
import ProviderEarningsPage from './pages/provider/ProviderEarningsPage.jsx';

// Driver Pages (Drive My Vehicle)
import DriverDashboardPage from './pages/driver/DriverDashboardPage.jsx';
import DriverProfilePage from './pages/driver/DriverProfilePage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminProvidersPage from './pages/admin/AdminProvidersPage.jsx';
import AdminDriversPage from './pages/admin/AdminDriversPage.jsx';
import AdminVerificationPage from './pages/admin/AdminVerificationPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <ScrollToTop />
            <Routes>
              {/* Public & Customer Facing Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:categorySlug" element={<ServicesPage />} />
                <Route path="/providers/:id" element={<ProviderDetailPage />} />
                <Route path="/drivers" element={<DriversPage />} />
                <Route path="/drivers/:id" element={<DriverDetailPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/become-provider" element={<BecomeProviderPage />} />
                <Route path="/post-task" element={<PostTaskPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Customer Private Hub */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout role="customer" />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<CustomerDashboardPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingDetailPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:conversationId" element={<MessagesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Service Provider Hub */}
              <Route
                path="/provider"
                element={
                  <RoleRoute allowedRoles={['provider', 'admin']}>
                    <DashboardLayout role="provider" />
                  </RoleRoute>
                }
              >
                <Route path="dashboard" element={<ProviderDashboardPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="services" element={<ProviderServicesPage />} />
                <Route path="quotes" element={<ProviderQuotesPage />} />
                <Route path="availability" element={<ProviderAvailabilityPage />} />
                <Route path="earnings" element={<ProviderEarningsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Driver Hub (Drive My Vehicle) */}
              <Route
                path="/driver"
                element={
                  <RoleRoute allowedRoles={['driver', 'admin']}>
                    <DashboardLayout role="driver" />
                  </RoleRoute>
                }
              >
                <Route path="dashboard" element={<DriverDashboardPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="availability" element={<DriverProfilePage />} />
                <Route path="earnings" element={<ProviderEarningsPage />} />
                <Route path="profile" element={<DriverProfilePage />} />
              </Route>

              {/* Admin Central Management */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout role="admin" />
                  </RoleRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="providers" element={<AdminProvidersPage />} />
                <Route path="drivers" element={<AdminDriversPage />} />
                <Route path="verification" element={<AdminVerificationPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
