import React, { ReactNode } from "react";

interface ChartCardProps {
  id: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  id,
  title,
  subtitle,
  action,
  children,
  className = "",
}) => {
  return (
    <div
      id={id}
      className={`flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative min-h-[220px] w-full flex-1 min-w-0">{children}</div>
    </div>
  );
};
