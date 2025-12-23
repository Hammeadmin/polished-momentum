import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import OfflineIndicator from './components/OfflineIndicator';
import FloatingActionButton from './components/FloatingActionButton';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Calendar from './pages/Calendar';
import Invoices from './pages/Invoices';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Communications from './pages/Communications';
import QuoteAcceptance from './pages/QuoteAcceptance';
import Payroll from './pages/Payroll';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import AppRoutes from './components/AppRoutes'; // Import the new AppRoutes component

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <OfflineIndicator />
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/quote-accept/:token" element={<QuoteAcceptance />} />

            {/* All protected routes are now handled by AppRoutes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppRoutes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;