import { RiskLevel } from '@prisma/client';

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  LOW: { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-800' },
  MEDIUM: { label: 'Medium Risk', className: 'bg-amber-100 text-amber-800' },
  HIGH: { label: 'High Risk', className: 'bg-red-100 text-red-800' },
};

export default function LeadScoreBadge({
  riskLevel,
  score,
}: {
  riskLevel: RiskLevel;
  score: number;
}) {
  const config = riskConfig[riskLevel];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{score}</span>
    </div>
  );
}
