"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

// Validated categorical slots (CVD-safe on white): 1 = blue, 2 = orange.
const SERIES_1 = "#2a78d6";
const SERIES_2 = "#eb6834";
const GRID = "#e5e7eb";
const AXIS_TEXT = "#64748b";
const SURFACE = "#ffffff";

const axisProps = { tick: { fill: AXIS_TEXT, fontSize: 12 }, tickLine: false, axisLine: { stroke: GRID } } as const;

const rm = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });

export function RevenueByMonthChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} width={72} tickFormatter={(v: number) => rm.format(v)} />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.15)" }}
          formatter={(v) => [rm.format(Number(v)), "Revenue"]}
        />
        <Bar dataKey="revenue" name="Revenue" fill={SERIES_1} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaidVsPendingChart({ data }: { data: { course: string; paid: number; pending: number }[] }) {
  const height = Math.max(160, data.length * 48 + 60);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" allowDecimals={false} {...axisProps} />
        <YAxis type="category" dataKey="course" width={170} {...axisProps} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(148,163,184,0.15)" }} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span style={{ color: AXIS_TEXT }}>{value}</span>}
        />
        <Bar dataKey="paid" name="Paid" stackId="s" fill={SERIES_1} stroke={SURFACE} strokeWidth={2} maxBarSize={24}>
          <LabelList dataKey="paid" position="insideLeft" fill="#ffffff" fontSize={11} formatter={hideZero} />
        </Bar>
        <Bar
          dataKey="pending"
          name="Pending"
          stackId="s"
          fill={SERIES_2}
          stroke={SURFACE}
          strokeWidth={2}
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
        >
          <LabelList dataKey="pending" position="insideRight" fill="#ffffff" fontSize={11} formatter={hideZero} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EnrolmentsByCategoryChart({ data }: { data: { category: string; students: number }[] }) {
  const height = Math.max(160, data.length * 40 + 20);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 8, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="category" width={80} {...axisProps} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(148,163,184,0.15)" }} formatter={(v) => [v, "Paid students"]} />
        <Bar dataKey="students" fill={SERIES_1} radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList dataKey="students" position="right" fill={AXIS_TEXT} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function hideZero(value: unknown) {
  return Number(value) > 0 ? String(value) : "";
}
