// src/components/AppRoutes.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types/database';
import LoadingSpinner from './LoadingSpinner';

// Import Layouts
import Layout from './Layout';
import WorkerLayout from './WorkerLayout';
import SalesLayout from './SalesLayout';

// Lazy-loaded heavy pages for code splitting
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Invoices = React.lazy(() => import('../pages/Invoices'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Documents = React.lazy(() => import('../pages/Documents'));
const Reports = React.lazy(() => import('../pages/Reports'));

// Regular imports for lighter pages
import WorkerDashboard from '../pages/WorkerDashboard';
import SalesDashboard from '../pages/SalesDashboard';
import WorkerSchedule from '../pages/WorkerSchedule';
import WorkerTimesheet from '../pages/WorkerTimesheet';
import WorkerProfile from '../pages/WorkerProfile';
import Customers from '../pages/Customers';
import Quotes from '../pages/Quotes';
import Orders from '../pages/Orders';
import Calendar from '../pages/Calendar';
import Team from '../pages/Team';
import Analytics from '../pages/Analytics';
import Communications from '../pages/Communications';
import Payroll from '../pages/Payroll';
import Intranet from '../pages/Intranet';
import Leads from '../pages/Leads';
import Ordrar from '../pages/Ordrar';

export default function AppRoutes() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    const fetchUserRole = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
      } else {
        setRole(data.role as UserRole);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Worker Routes
  if (role === 'worker') {
    return (
      <WorkerLayout>
        <Routes>
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/worker-schedule" element={<WorkerSchedule />} />
          <Route path="/worker-timesheet" element={<WorkerTimesheet />} />
          <Route path="/worker-profile" element={<WorkerProfile />} />
          <Route path="*" element={<Navigate to="/worker-dashboard" replace />} />
        </Routes>
      </WorkerLayout>
    );
  }

  // Sales Routes
  if (role === 'sales') {
    return (
      <SalesLayout>
        <Routes>
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/Säljtunnel" element={<Orders />} />
          <Route path="/kommunikation" element={<Communications />} />
          <Route path="/kunder" element={<Customers />} />
          <Route path="/offerter" element={<Quotes />} />
          <Route path="/Orderhantering" element={<Ordrar />} />
          <Route path="/kalender" element={<Calendar />} />
          <Route path="*" element={<Navigate to="/sales-dashboard" replace />} />
        </Routes>
      </SalesLayout>
    );
  }

  // Admin and other roles (default)
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Säljtunnel" element={<Orders />} />
          <Route path="/Orderhantering" element={<Ordrar />} />
          <Route path="/kunder" element={<Customers />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/offerter" element={<Quotes />} />
          <Route path="/kalender" element={<Calendar />} />
          <Route path="/fakturor" element={<Invoices />} />
          <Route path="/team" element={<Team />} />
          <Route path="/installningar" element={<Settings />} />
          <Route path="/analys" element={<Analytics />} />
          <Route path="/kommunikation" element={<Communications />} />
          <Route path="/lonehantering" element={<Payroll />} />
          <Route path="/dokument" element={<Documents />} />
          <Route path="/rapporter" element={<Reports />} />
          <Route path="/intranat" element={<Intranet />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}