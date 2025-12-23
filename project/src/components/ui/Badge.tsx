import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-blue-600 text-white border-blue-600'
};

const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
    primary: 'bg-white'
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs'
};

function Badge({
    variant = 'neutral',
    size = 'md',
    dot = false,
    children,
    className = ''
}: BadgeProps) {
    return (
        <span className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} mr-1.5`} />
            )}
            {children}
        </span>
    );
}

export default Badge;
