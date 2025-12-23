import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  RefreshCw,
  Settings,
  Briefcase
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import IntranetDashboard from '../components/IntranetDashboard';
import TaskDashboardWidget from '../components/TaskDashboardWidget';
import TaskDetailModal from '../components/TaskDetailModal';
import { formatSEK } from '../utils/formatting';
import { getSalesTaskById } from '../lib/leads';
import { getGreeting } from '../locales/sv';

// Import extracted dashboard components
import {
  WeatherWidget,
  ActivityDetailModal,
  KPIGrid,
  SalesChart,
  ActivityFeed,
  QuickActions
} from '../components/dashboard';

// Import custom hook
import { useDashboardData } from '../hooks/useDashboardData';

// Import types
import { ActivityItem } from '../types/dashboard';

const capitalize = (s: string | null | undefined) => {
  if (typeof s !== 'string' || s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Custom tooltip for job status chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-xl p-3 shadow-lg">
        <p className="text-gray-900 dark:text-white font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-700 dark:text-gray-300 text-sm">
            {entry.name}: {entry.name === 'Försäljning' ? formatSEK(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { user, userProfile: authUserProfile, profileLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Use the extracted data fetching hook
  const {
    kpiData,
    salesData,
    leadStatusData,
    jobStatusData,
    recentActivity,
    allTeamMembers,
    loading,
    error,
    refresh
  } = useDashboardData();

  // Widget visibility state
  const [widgets, setWidgets] = useState({
    kpis: true,
    salesChart: true,
    leadDistribution: true,
    activityFeed: true,
    tasks: true,
    jobStatus: true,
    intranet: true,
  });

  const toggleWidget = (widgetName: string) => {
    setWidgets(prev => ({ ...prev, [widgetName]: !prev[widgetName] }));
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handle opening task modal from URL
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && allTeamMembers.length > 0) {
      const openTaskFromNotification = async () => {
        const { data: taskData, error } = await getSalesTaskById(taskId);
        if (error) {
          console.error("Could not fetch task from notification:", error);
        } else {
          setSelectedTask(taskData);
        }
        searchParams.delete('taskId');
        setSearchParams(searchParams);
      };
      openTaskFromNotification();
    }
  }, [searchParams, user, allTeamMembers]);

  const getSwedishGreeting = () => {
    const hour = currentTime.getHours();
    return getGreeting(hour);
  };

  const getSwedishTime = () => {
    const weekday = capitalize(currentTime.toLocaleString('sv-SE', { weekday: 'long', timeZone: 'Europe/Stockholm' }));
    const day = currentTime.getDate();
    const month = capitalize(currentTime.toLocaleString('sv-SE', { month: 'long', timeZone: 'Europe/Stockholm' }));
    const year = currentTime.getFullYear();
    const time = currentTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' });

    return `${weekday} ${day} ${month} ${year} ${time}`;
  };

  const handleActivityClick = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const closeActivityModal = () => {
    setSelectedActivity(null);
    setShowActivityModal(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Översikt av din verksamhet"
          icon={BarChart3}
        />
        <SkeletonLoader type="dashboard" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Översikt av din verksamhet"
          icon={BarChart3}
        />
        <EmptyState
          type="general"
          title="Kunde inte ladda dashboard"
          description={error}
          actionText="Försök igen"
          onUpdate={refresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="premium-card p-8 animate-fade-in">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold ...">
              {getSwedishGreeting()},{" "}
              {authUserProfile?.full_name?.split(" ")[0] ||
                user?.email?.split("@")[0] ||
                "Användare"}
              ! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-secondary flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {getSwedishTime()}
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-500 font-secondary">
              Här är en översikt av din verksamhet idag
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <WeatherWidget />
            <button
              onClick={refresh}
              className="inline-flex items-center justify-center px-6 py-4 border border-card-border-light dark:border-card-border-dark rounded-2xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-card-background-light dark:bg-card-background-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Uppdatera
            </button>
          </div>
        </div>
      </div>

      {/* Customization Menu */}
      <div className="flex justify-end">
        <div className="group relative">
          <button className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="w-4 h-4 mr-2" />
            Anpassa vyn
          </button>
          <div className="absolute right-0 mt-2 w-56 bg-card-background-light dark:bg-card-background-dark rounded-md shadow-lg p-2 z-20 hidden group-hover:block border border-card-border-light dark:border-card-border-dark">
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.kpis} onChange={() => toggleWidget('kpis')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa KPI-kort</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.salesChart} onChange={() => toggleWidget('salesChart')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Försäljningsgraf</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.leadDistribution} onChange={() => toggleWidget('leadDistribution')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Lead-fördelning</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.intranet} onChange={() => toggleWidget('intranet')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Intranät</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.tasks} onChange={() => toggleWidget('tasks')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Uppgifter</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.activityFeed} onChange={() => toggleWidget('activityFeed')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Aktivitetsflöde</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <input type="checkbox" checked={widgets.jobStatus} onChange={() => toggleWidget('jobStatus')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
              <span>Visa Jobb-status</span>
            </label>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {widgets.kpis && <KPIGrid data={kpiData} />}

      {/* Charts Section */}
      {widgets.salesChart && (
        <SalesChart salesData={salesData} leadStatusData={leadStatusData} />
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        {/* Column 1: Intranet Widget */}
        {widgets.intranet && (
          <div className="lg:col-span-1">
            <IntranetDashboard />
          </div>
        )}

        {/* Column 2: Task Widget */}
        {widgets.tasks && (
          <div className="lg:col-span-1">
            <TaskDashboardWidget onTaskClick={setSelectedTask} />
          </div>
        )}

        {/* Column 3: Activity Feed */}
        {widgets.activityFeed && (
          <ActivityFeed
            activities={recentActivity}
            onActivityClick={handleActivityClick}
          />
        )}

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Job Status Overview */}
      {widgets.jobStatus && jobStatusData.length > 0 && (
        <div className="premium-card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-primary flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-blue-500" />
              Jobb-status översikt
            </h3>
            <div className="text-gray-600 dark:text-gray-400 text-sm font-secondary">
              Totalt {jobStatusData.reduce((sum: number, item: any) => sum + item.antal, 0)} jobb
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={jobStatusData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="name"
                className="stroke-gray-500 dark:stroke-gray-400"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="stroke-gray-500 dark:stroke-gray-400" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} />
              <Bar dataKey="antal" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={showActivityModal}
        onClose={closeActivityModal}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        members={allTeamMembers}
        onClose={() => setSelectedTask(null)}
        onUpdate={refresh}
      />
    </div>
  );
}

export default Dashboard;