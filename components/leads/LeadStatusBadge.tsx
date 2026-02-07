// Define LeadStatus locally since we removed Prisma
type LeadStatus = 'NEW' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'ARCHIVED';

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  NEW: { label: 'New', className: 'bg-blue-100 text-blue-800' },
  REVIEWED: { label: 'Reviewed', className: 'bg-slate-100 text-slate-800' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-800',
  },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-200 text-slate-700' },
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
