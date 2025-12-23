import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KPIData, ActivityItem } from '../types/dashboard';
import {
    getKPIData,
    getSalesDataByMonth,
    getLeadStatusDistribution,
    getJobStatusDistribution,
    getRecentActivity,
    getTeamMembers
} from '../lib/database';

interface DashboardDataState {
    kpiData: KPIData;
    salesData: any[];
    leadStatusData: any[];
    jobStatusData: any[];
    recentActivity: ActivityItem[];
    allTeamMembers: any[];
    loading: boolean;
    error: string | null;
}

interface UseDashboardDataReturn extends DashboardDataState {
    refresh: () => Promise<void>;
}

const initialKpiData: KPIData = {
    totalSales: 0,
    activeLeads: 0,
    activeJobs: 0,
    overdueInvoices: 0,
    error: null
};

export function useDashboardData(): UseDashboardDataReturn {
    const { user, organisationId, userProfile: authUserProfile, profileLoading } = useAuth();

    const [state, setState] = useState<DashboardDataState>({
        kpiData: initialKpiData,
        salesData: [],
        leadStatusData: [],
        jobStatusData: [],
        recentActivity: [],
        allTeamMembers: [],
        loading: true,
        error: null
    });

    const loadAllDashboardData = useCallback(async () => {
        if (!user) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!organisationId) {
                setState(prev => ({
                    ...prev,
                    error: 'Ingen organisation hittades för användaren.',
                    loading: false
                }));
                return;
            }

            const [
                kpiResult,
                salesByMonth,
                leadDistribution,
                jobDistribution,
                activityData,
                membersData,
            ] = await Promise.all([
                getKPIData(organisationId),
                getSalesDataByMonth(organisationId, 6),
                getLeadStatusDistribution(organisationId),
                getJobStatusDistribution(organisationId),
                getRecentActivity(organisationId, 8),
                getTeamMembers(organisationId),
            ]);

            if (kpiResult.error) throw new Error(kpiResult.error);
            if (membersData.error) throw new Error(membersData.error.message);

            setState({
                kpiData: kpiResult,
                salesData: salesByMonth,
                leadStatusData: leadDistribution,
                jobStatusData: jobDistribution,
                recentActivity: activityData,
                allTeamMembers: membersData.data || [],
                loading: false,
                error: null
            });
        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setState(prev => ({
                ...prev,
                error: err.message || 'Kunde inte ladda dashboard-data.',
                loading: false
            }));
        }
    }, [user, organisationId]);

    useEffect(() => {
        if (organisationId && !profileLoading) {
            loadAllDashboardData();
        }
    }, [organisationId, profileLoading, loadAllDashboardData]);

    return {
        ...state,
        refresh: loadAllDashboardData
    };
}

export default useDashboardData;
