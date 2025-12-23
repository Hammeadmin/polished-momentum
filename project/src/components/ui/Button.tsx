import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'accent';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    accent: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md hover:shadow-lg focus:ring-amber-500'
};

const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl'
};

function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const classes = [
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
            {!loading && icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
}

export default Button;
