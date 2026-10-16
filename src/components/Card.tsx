import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerIcon?: string;
  headerIconColor?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  headerIcon,
  headerIconColor = 'text-primary',
  noPadding = false,
}) => {
  return (
    <div className={`bg-surface-card rounded-lg border border-border-subtle shadow-sm overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="px-space-md py-space-sm bg-surface-container-low/60 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {headerIcon && (
              <span className={`material-symbols-outlined text-[20px] ${headerIconColor}`}>
                {headerIcon}
              </span>
            )}
            <div>
              {typeof title === 'string' ? (
                <h3 className="font-title-md text-title-md text-primary font-bold leading-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="flex items-center gap-2 flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-space-md'}>{children}</div>
    </div>
  );
};
