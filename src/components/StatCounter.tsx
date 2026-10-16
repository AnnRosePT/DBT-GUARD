import React from 'react';

interface StatCounterProps {
  title?: string;
  label?: string;
  subtitle?: string;
  trend?: string;
  value?: string | number;
  count?: string | number;
  valueColor?: string;
  color?: string;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  topBorderColor?: string;
  bottomText?: React.ReactNode;
  bottomAction?: {
    label: string;
    onClick: () => void;
  };
  onClick?: () => void;
  ariaLabel?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  title,
  label,
  subtitle,
  trend,
  value,
  count,
  valueColor,
  color,
  badge,
  badgeColor = 'bg-status-ready-bg text-status-ready',
  icon = 'analytics',
  iconBg,
  iconColor,
  topBorderColor,
  bottomText,
  bottomAction,
  onClick,
  ariaLabel,
}) => {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || trend;
  const displayValue = value !== undefined ? value : count !== undefined ? count : 0;

  // Derive styling colors if color shorthand is provided
  let calculatedValueColor = valueColor || 'text-primary';
  let calculatedIconBg = iconBg || 'bg-surface-container-high';
  let calculatedIconColor = iconColor || 'text-primary';
  let calculatedTopBorder = topBorderColor;

  if (color === 'error') {
    if (!valueColor) calculatedValueColor = 'text-status-error';
    if (!iconBg) calculatedIconBg = 'bg-status-error-bg';
    if (!iconColor) calculatedIconColor = 'text-status-error';
    if (!topBorderColor) calculatedTopBorder = 'border-t-4 border-t-status-error';
  } else if (color === 'warning') {
    if (!valueColor) calculatedValueColor = 'text-status-warning';
    if (!iconBg) calculatedIconBg = 'bg-status-warning-bg';
    if (!iconColor) calculatedIconColor = 'text-status-warning';
    if (!topBorderColor) calculatedTopBorder = 'border-t-4 border-t-status-warning';
  } else if (color === 'ready' || color === 'success') {
    if (!valueColor) calculatedValueColor = 'text-status-ready';
    if (!iconBg) calculatedIconBg = 'bg-status-ready-bg';
    if (!iconColor) calculatedIconColor = 'text-status-ready';
    if (!topBorderColor) calculatedTopBorder = 'border-t-4 border-t-status-ready';
  } else if (color === 'primary' || color === 'secondary') {
    if (!valueColor) calculatedValueColor = 'text-primary';
    if (!iconBg) calculatedIconBg = 'bg-primary/10';
    if (!iconColor) calculatedIconColor = 'text-primary';
    if (!topBorderColor) calculatedTopBorder = 'border-t-4 border-t-primary';
  }

  return (
    <div
      onClick={onClick}
      aria-label={ariaLabel || displayTitle}
      className={`bg-surface-card rounded-xl p-space-md border border-border-subtle shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden ${
        calculatedTopBorder || ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            {displayTitle}
          </span>
          {displaySubtitle && (
            <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              {displaySubtitle}
            </span>
          )}
        </div>
        <div
          className={`w-9 h-9 rounded-lg ${calculatedIconBg} flex items-center justify-center ${calculatedIconColor} flex-shrink-0 shadow-2xs`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${calculatedValueColor}`}>
          {displayValue}
        </span>
        {badge && (
          <span className={`font-label-sm text-[11px] font-bold px-2 py-0.5 rounded-full border border-black/5 whitespace-nowrap ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {(bottomText || bottomAction) && (
        <div className="mt-3 pt-2 border-t border-border-subtle/70 flex items-center justify-between text-xs font-medium">
          {bottomText && <div className="text-on-surface-variant text-[11px]">{bottomText}</div>}
          {bottomAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                bottomAction.onClick();
              }}
              className="text-secondary hover:text-primary hover:underline font-bold text-[11px] ml-auto transition-colors"
            >
              {bottomAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
