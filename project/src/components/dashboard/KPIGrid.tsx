import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Briefcase, Receipt } from 'lucide-react';
import { KPIData } from '../../types/dashboard';
import { formatSEK } from '../../utils/formatting';
import { KPI } from '../../locales/sv';
import AnimatedCounter from './AnimatedCounter';

// Mini Sparkline Component
function MiniSparkline({ data, color = '#2563EB' }: { data: number[]; color?: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 60;
        const y = 20 - ((value - min) / range) * 20;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="60" height="20" className="opacity-60">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
}

interface KPIGridProps {
    data: KPIData;
}

export default function KPIGrid({ data }: KPIGridProps) {
    // Calculate percentage changes (mock data for demo)
    const getPercentageChange = (type: string) => {
        const changes: Record<string, number> = {
            totalSales: 12,
            activeLeads: 8,
            activeJobs: 5,
            overdueInvoices: -15
        };
        return changes[type] || 0;
    };

    // Generate sparkline data
    const generateSparklineData = (baseValue: number) => {
        return Array.from({ length: 7 }, () =>
            baseValue + (Math.random() - 0.5) * baseValue * 0.3
        );
    };

    const kpiCards = [
        {
            name: KPI.TOTAL_SALES,
            subtitle: KPI.TOTAL_SALES_DESC,
            value: data.totalSales,
            change: getPercentageChange('totalSales'),
            changeType: getPercentageChange('totalSales') >= 0 ? 'positive' as const : 'negative' as const,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            sparklineColor: '#10B981',
            formatter: (value: number) => formatSEK(value)
        },
        {
            name: KPI.ACTIVE_LEADS,
            subtitle: KPI.ACTIVE_LEADS_DESC,
            value: data.activeLeads,
            change: getPercentageChange('activeLeads'),
            changeType: getPercentageChange('activeLeads') >= 0 ? 'positive' as const : 'negative' as const,
            icon: TrendingUp,
            color: 'from-blue-500 to-indigo-600',
            sparklineColor: '#3B82F6',
            formatter: (value: number) => value.toString()
        },
        {
            name: KPI.ACTIVE_JOBS,
            subtitle: KPI.ACTIVE_JOBS_DESC,
            value: data.activeJobs,
            change: getPercentageChange('activeJobs'),
            changeType: getPercentageChange('activeJobs') >= 0 ? 'positive' as const : 'negative' as const,
            icon: Briefcase,
            color: 'from-purple-500 to-violet-600',
            sparklineColor: '#8B5CF6',
            formatter: (value: number) => value.toString()
        },
        {
            name: KPI.OVERDUE_INVOICES,
            subtitle: KPI.OVERDUE_INVOICES_DESC,
            value: data.overdueInvoices,
            change: getPercentageChange('overdueInvoices'),
            changeType: getPercentageChange('overdueInvoices') >= 0 ? 'negative' as const : 'positive' as const,
            icon: Receipt,
            color: 'from-red-500 to-rose-600',
            sparklineColor: '#EF4444',
            formatter: (value: number) => value.toString()
        }
    ];

    return (
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
            {kpiCards.map((card, index) => {
                const Icon = card.icon;
                const sparklineData = generateSparklineData(card.value);

                return (
                    <div
                        key={card.name}
                        className="snap-center min-w-[85vw] md:min-w-0 premium-card hover-glow p-6 group flex-shrink-0"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-right">
                                    <MiniSparkline data={sparklineData} color={card.sparklineColor} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium font-secondary mb-1">{card.name}</p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs font-secondary mb-3">{card.subtitle}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white font-primary">
                                    <AnimatedCounter
                                        end={card.value}
                                        formatter={card.formatter}
                                        duration={1500 + index * 200}
                                    />
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  ${card.changeType === 'positive'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    }
                `}>
                                    {card.changeType === 'positive' ? (
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3 mr-1" />
                                    )}
                                    {Math.abs(card.change)}%
                                </div>
                                <span className="text-gray-500 dark:text-gray-500 text-xs font-secondary">vs förra månaden</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
