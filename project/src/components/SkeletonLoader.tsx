import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'dashboard' | 'form';
  count?: number;
  className?: string;
}

// =============================================================================
// SPECIFIC SKELETON VARIANTS
// =============================================================================

/**
 * Skeleton for KPI cards (square shape)
 */
export function SkeletonKPI() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-3"></div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton for charts (large rectangle, 350px height)
 */
export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-[350px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-end justify-around p-4">
        {/* Fake bar chart effect */}
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '60%' }}></div>
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '80%' }}></div>
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '45%' }}></div>
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '70%' }}></div>
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '55%' }}></div>
        <div className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '90%' }}></div>
      </div>
    </div>
  );
}

/**
 * Skeleton for list items with avatars (60px height per row)
 */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse" style={{ height: '60px' }}>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard-specific skeleton layout matching actual component structure
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
      </div>

      {/* KPI Grid - matches mobile carousel / desktop grid layout */}
      <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-6 pb-2 md:pb-0">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="snap-center min-w-[85vw] md:min-w-0">
            <SkeletonKPI />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (2 cols) */}
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>

        {/* Activity Feed (1 col) */}
        <div className="lg:col-span-1">
          <SkeletonList count={5} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// GENERIC SKELETON LOADER (original)
// =============================================================================

function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return <SkeletonDashboard />;

      case 'table':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return <SkeletonList count={count} />;

      case 'form':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              {Array.from({ length: count || 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
              <div className="flex space-x-3 pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
              </div>
            </div>
          </div>
        );

      default: // card
        return (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
}

export default SkeletonLoader;