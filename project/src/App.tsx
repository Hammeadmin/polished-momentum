import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineIndicator from './components/OfflineIndicator';
import QuoteAcceptance from './pages/QuoteAcceptance';
import AppRoutes from './components/AppRoutes';

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
