/**
 * Dashboard Types
 * Extracted from Dashboard.tsx for better modularity
 */

export interface KPIData {
  totalSales: number;
  activeLeads: number;
  activeJobs: number;
  overdueInvoices: number;
  error?: string | null;
}

export interface ActivityItem {
  id: string;
  type: 'lead' | 'quote' | 'job' | 'invoice';
  title: string;
  subtitle: string;
  time: string;
  status: string;
  user?: string;
}

export interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

export interface ActivityDetailModalProps {
  activity: ActivityItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// KPI Card configuration interface
export interface KPICardConfig {
  name: string;
  subtitle: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sparklineColor: string;
  formatter: (value: number) => string;
}

// Quick action configuration interface
export interface QuickActionConfig {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  shortcut: string;
}
