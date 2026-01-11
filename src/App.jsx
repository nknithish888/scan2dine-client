import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/user/Navbar';
import Hero from './components/user/Hero';
import HowItWorks from './components/user/HowItWorks';
import Features from './components/user/Features';
import Benefits from './components/user/Benefits';
import RestaurantOwner from './components/user/RestaurantOwner';
import Pricing from './components/user/Pricing';
import Testimonials from './components/user/Testimonials';
import FAQ from './components/user/FAQ';
import CTA from './components/user/CTA';
import Footer from './components/user/Footer';
import Login from './components/auth/Login';
import SuperAdminDashboard from './components/superadmin/Dashboard';
import RestaurantDetailsPage from './components/superadmin/RestaurantDetailsPage';
import RestaurantDashboard from './components/Restarunt/Dashboard';
import CustomerMenu from './components/customer/CustomerMenu';
import CustomerFeedback from './components/customer/CustomerFeedback';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  // Protected Route helper with role check
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <div className="App">
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={
          <>
            <Navbar onLoginClick={() => setShowLogin(true)} />
            <Hero />
            <HowItWorks />
            <Features />
            <Benefits />
            <RestaurantOwner />
            <Pricing />
            <Testimonials />
            <FAQ />
            <CTA />
            <Footer />
            {showLogin && <Login onClose={() => setShowLogin(false)} />}
          </>
        } />

        {/* Public Customer Menu Route (QR Code Destination) */}
        <Route path="/menu/:restaurantSlug/:tableNumber" element={<CustomerMenu />} />

        {/* Public Feedback Route */}
        <Route path="/feedback/:restaurantSlug" element={<CustomerFeedback />} />

        {/* SuperAdmin Dashboard */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* SuperAdmin Restaurant Details */}
        <Route
          path="/superadmin/restaurants/:id"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <RestaurantDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Restaurant Dashboard with Nested Routes */}
        <Route
          path="/restaurant/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

