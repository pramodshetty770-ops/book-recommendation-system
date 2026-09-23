import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CoverageChartProps {
  coveragePercentage: number;
  totalBooks: number;
}

export const CoverageChart: React.FC<CoverageChartProps> = ({
  coveragePercentage,
  totalBooks,
}) => {
  const coveredCount = Math.round((coveragePercentage / 100) * totalBooks);
  const uncoveredCount = Math.max(0, totalBooks - coveredCount);

  const data = [
    { name: "Recommended in Top-K", value: coveredCount, color: "#10b981" },
    { name: "Unrecommended Catalog", value: uncoveredCount, color: "#cbd5e1" },
  ];

  return (
    <div className="flex h-64 flex-col items-center justify-center">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
              formatter={(value: any, name: string) => [
                `${value} books (${((value / totalBooks) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{coveragePercentage}%</span>
          <span className="text-[11px] text-slate-500">Coverage</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Active ({coveredCount} books)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
          <span className="text-slate-600">Long Tail ({uncoveredCount} books)</span>
        </div>
      </div>
    </div>
  );
};
