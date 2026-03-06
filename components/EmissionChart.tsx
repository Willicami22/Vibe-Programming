"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface DataPoint {
  date: string;
  co2: number;
  label: string;
}

interface EmissionChartProps {
  data: DataPoint[];
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DataPoint;
  return (
    <div className="rounded border border-stone-200 bg-white px-3 py-2 text-sm shadow">
      <p className="font-medium text-stone-800">{d.label}</p>
      <p className="text-emerald-700">{d.co2} kg CO₂</p>
    </div>
  );
}

export function EmissionChart({ data }: EmissionChartProps) {
  if (data.length === 0) return null;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v} kg`}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="co2" fill="#059669" radius={[4, 4, 0, 0]} name="CO₂" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
