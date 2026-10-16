import React from 'react';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  user?: string;
  role?: string;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  iconColor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  return (
    <div className={`space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border-subtle ${className}`}>
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start gap-3 pl-1 group">
          {/* Dot / Icon */}
          <div
            className={`w-7 h-7 rounded-full bg-surface-card border-2 flex items-center justify-center flex-shrink-0 z-10 ${
              event.iconColor ? event.iconColor : 'border-secondary text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {event.icon || 'circle'}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 bg-surface-container-low/50 rounded-lg p-3 border border-border-subtle/70 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <span className="font-title-md text-[14px] font-bold text-primary">
                {event.title}
              </span>
              <span className="font-data-mono text-[11px] text-on-surface-variant">
                {event.timestamp}
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {event.description}
            </p>

            {(event.user || event.role || event.badge) && (
              <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between gap-2 text-[11px]">
                {event.user && (
                  <span className="text-on-surface font-medium">
                    By: <strong>{event.user}</strong> {event.role ? `(${event.role})` : ''}
                  </span>
                )}
                {event.badge && (
                  <span className={`px-2 py-0.5 rounded font-bold ${event.badgeColor || 'bg-surface-card text-on-surface'}`}>
                    {event.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
