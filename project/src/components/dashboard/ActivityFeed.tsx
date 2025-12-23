import React from 'react';
import { Activity, TrendingUp, FileText, Briefcase, Receipt } from 'lucide-react';
import { ActivityItem } from '../../types/dashboard';
import {
    getStatusLabel,
    getStatusColorClass,
    getStatusCategory
} from '../../utils/statusMaps';

interface ActivityFeedProps {
    activities: ActivityItem[];
    onActivityClick: (activity: ActivityItem) => void;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'lead': return TrendingUp;
        case 'quote': return FileText;
        case 'job': return Briefcase;
        case 'invoice': return Receipt;
        default: return Activity;
    }
};

const getActivityColor = (type: string, status: string) => {
    switch (type) {
        case 'lead':
            if (status === 'won') return 'text-green-600 bg-green-100';
            if (status === 'lost') return 'text-red-600 bg-red-100';
            return 'text-blue-600 bg-blue-100';
        case 'quote':
            if (status === 'accepted') return 'text-green-600 bg-green-100';
            if (status === 'declined') return 'text-red-600 bg-red-100';
            return 'text-purple-600 bg-purple-100';
        case 'job':
            if (status === 'completed') return 'text-green-600 bg-green-100';
            if (status === 'in_progress') return 'text-blue-600 bg-blue-100';
            return 'text-orange-600 bg-orange-100';
        case 'invoice':
            if (status === 'paid') return 'text-green-600 bg-green-100';
            if (status === 'overdue') return 'text-red-600 bg-red-100';
            return 'text-blue-600 bg-blue-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

// Get dot color based on status category
const getStatusDotColor = (status: string): string => {
    const category = getStatusCategory(status);
    switch (category) {
        case 'success': return 'bg-green-500';
        case 'danger': return 'bg-red-500';
        case 'info': return 'bg-blue-500';
        case 'warning': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

// Get badge color based on status category
const getStatusBadgeColor = (status: string): string => {
    const category = getStatusCategory(status);
    switch (category) {
        case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'danger': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
};

const getSwedishRelativeTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just nu';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}v`;
};

export default function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
    return (
        <div className="lg:col-span-1 premium-card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center font-primary">
                    <Activity className="w-6 h-6 mr-3 text-green-500" />
                    Senaste Aktiviteter
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Klicka på en aktivitet för att visa detaljer
                </p>
            </div>

            <div className="p-4">
                {activities.length > 0 ? (
                    <div className="relative max-h-96 overflow-y-auto pr-2">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800"></div>

                        <div className="space-y-6 relative">
                            {activities.map((activity) => {
                                const Icon = getActivityIcon(activity.type);
                                const colorClasses = getActivityColor(activity.type, activity.status);

                                return (
                                    <div
                                        key={activity.id}
                                        className="group relative flex items-start space-x-4 cursor-pointer"
                                        onClick={() => onActivityClick(activity)}
                                    >
                                        {/* Timeline Node */}
                                        <div className="relative z-10 flex-shrink-0">
                                            {/* Status Dot */}
                                            <div className={`absolute -left-2 top-3 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusDotColor(activity.status)} shadow-sm group-hover:scale-125 transition-transform duration-200`}></div>

                                            {/* User Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                                {activity.user ? activity.user.split(' ').map(n => n[0]).join('').toUpperCase() : 'S'}
                                            </div>

                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Activity Content */}
                                        <div className="flex-1 min-w-0 bg-card-background-light dark:bg-card-background-dark rounded-xl p-4 border border-card-border-light dark:border-card-border-dark group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses} group-hover:scale-110 transition-transform duration-200`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {activity.user && `av ${activity.user}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                        {getSwedishRelativeTime(activity.time)}
                                                    </span>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(activity.status)}`}>
                                                        {getStatusLabel(activity.status)}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {activity.subtitle}
                                            </p>

                                            {/* Hover Action Hint */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                                                    <span>Klicka för att öppna detaljer</span>
                                                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Timeline End Indicator */}
                        <div className="relative flex justify-center mt-6">
                            <div className="absolute left-8 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                            <span className="bg-card-background-light dark:bg-card-background-dark px-4 py-2 text-xs text-gray-500 dark:text-gray-400 rounded-full border border-card-border-light dark:border-card-border-dark ml-12">
                                Äldre aktiviteter
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <p className="font-secondary">Ingen aktivitet att visa</p>
                    </div>
                )}
            </div>
        </div>
    );
}
