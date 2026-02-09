import Link from 'next/link';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreBadge from './LeadScoreBadge';

function getLeadStatusBadge(status: 'NEW' | 'CONTACTED' | 'CUSTOMER' | 'REJECTED') {
  const styles = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    CUSTOMER: 'bg-green-100 text-green-800',
    REJECTED: 'bg-gray-100 text-gray-800'
  };
  
  const labels = {
    NEW: '🔵 New',
    CONTACTED: '🟡 Contacted',
    CUSTOMER: '🟢 Customer',
    REJECTED: '⚪ Rejected'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Define types locally since we removed Prisma
type LeadStatus = 'NEW' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'ARCHIVED';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type Lead = {
  id: string;
  formId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  status: LeadStatus;
  leadStatus?: 'NEW' | 'CONTACTED' | 'CUSTOMER' | 'REJECTED'; // New field
  createdAt: Date;
};

type Score = {
  id: string;
  leadId: string;
  totalScore: number;
  maxScore: number;
  riskLevel: RiskLevel;
  details: any;
  createdAt: Date;
};

type LeadWithScore = Lead & { score: Score | null };

export default function LeadTable({ leads }: { leads: LeadWithScore[] }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Customer
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Lead Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Score
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Created
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No leads yet. Share your intake form to start collecting
                  project inquiries.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {lead.customerName || 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {lead.customerEmail}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  {getLeadStatusBadge(lead.leadStatus || 'NEW')}
                </td>
                <td className="px-4 py-3">
                  {lead.score ? (
                    <LeadScoreBadge
                      riskLevel={lead.score.riskLevel}
                      score={lead.score.totalScore}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Not scored</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
