'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { name: string; value: number; color: string }[];
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

export function LeadStatusDonut({ data }: Props) {
  const hasData = data.some(d => d.value > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Ingen leads enda
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.filter(d => d.value > 0)}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.filter(d => d.value > 0).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            formatter={((value: number, name: string) => [value, name]) as any}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
