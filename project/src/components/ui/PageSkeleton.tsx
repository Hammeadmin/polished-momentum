import React from 'react';

type SkeletonType = 'table' | 'cards' | 'form' | 'detail' | 'list';

interface PageSkeletonProps {
    type?: SkeletonType;
    rows?: number;
    columns?: number;
    className?: string;
}

const SkeletonBox = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

function PageSkeleton({ type = 'table', rows = 5, columns = 4, className = '' }: PageSkeletonProps) {
    if (type === 'cards') {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <SkeletonBox className="h-5 w-32" />
                            <SkeletonBox className="h-6 w-16 rounded-full" />
                        </div>
                        <SkeletonBox className="h-4 w-full" />
                        <SkeletonBox className="h-4 w-3/4" />
                        <div className="pt-4 border-t flex items-center justify-between">
                            <SkeletonBox className="h-4 w-20" />
                            <SkeletonBox className="h-8 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'form') {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-6 space-y-6 ${className}`}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <SkeletonBox className="h-4 w-24" />
                        <SkeletonBox className="h-10 w-full rounded-lg" />
                    </div>
                ))}
                <div className="flex justify-end gap-3 pt-4">
                    <SkeletonBox className="h-10 w-24 rounded-lg" />
                    <SkeletonBox className="h-10 w-32 rounded-lg" />
                </div>
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div className={`space-y-6 ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <SkeletonBox className="h-8 w-48" />
                        <SkeletonBox className="h-4 w-32" />
                    </div>
                    <div className="flex gap-3">
                        <SkeletonBox className="h-10 w-24 rounded-lg" />
                        <SkeletonBox className="h-10 w-24 rounded-lg" />
                    </div>
                </div>
                {/* Content cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between py-2">
                                <SkeletonBox className="h-4 w-24" />
                                <SkeletonBox className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                        <SkeletonBox className="h-5 w-24" />
                        <SkeletonBox className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className={`bg-white rounded-lg shadow-sm border divide-y ${className}`}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SkeletonBox className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <SkeletonBox className="h-4 w-32" />
                                <SkeletonBox className="h-3 w-24" />
                            </div>
                        </div>
                        <SkeletonBox className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    // Default: table
    return (
        <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
            {/* Table header */}
            <div className="bg-gray-50 px-6 py-3 border-b flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <SkeletonBox key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Table rows */}
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="px-6 py-4 flex gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <SkeletonBox
                                key={colIndex}
                                className={`h-4 flex-1 ${colIndex === 0 ? 'max-w-[150px]' : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PageSkeleton;
