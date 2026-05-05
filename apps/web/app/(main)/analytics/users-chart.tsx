"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", users: 200 },
  { month: "Feb", users: 400 },
  { month: "Mar", users: 300 },
  { month: "Apr", users: 600 },
];

export default function UsersChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="users" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}