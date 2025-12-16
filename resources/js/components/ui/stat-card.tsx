import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantStyles = {
  default: 'bg-card text-card-foreground',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border p-6 shadow-sm transition-all hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-sm opacity-60 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={cn(
                  'text-sm ml-1',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
};
