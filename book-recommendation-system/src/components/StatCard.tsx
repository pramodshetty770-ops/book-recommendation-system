import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) => {
  const colorStyles: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: "bg-blue-50/70", icon: "text-blue-600", border: "border-blue-100" },
    amber: { bg: "bg-amber-50/70", icon: "text-amber-600", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50/70", icon: "text-emerald-600", border: "border-emerald-100" },
    indigo: { bg: "bg-indigo-50/70", icon: "text-indigo-600", border: "border-indigo-100" },
    purple: { bg: "bg-purple-50/70", icon: "text-purple-600", border: "border-purple-100" },
    rose: { bg: "bg-rose-50/70", icon: "text-rose-600", border: "border-rose-100" },
    slate: { bg: "bg-slate-100", icon: "text-slate-600", border: "border-slate-200" },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      id={id}
      className={`rounded-xl border ${style.border} bg-white p-4.5 shadow-xs transition-all hover:shadow-sm`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg} ${style.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="mt-2.5">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
};
