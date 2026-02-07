'use client';

import { useEffect, useState } from 'react';

type Lead = { id: string; created_at: string };
type Invoice = { id: string; amount: number; status: string; created_at: string };

export default function DashboardOverview() {
  const [health, setHealth] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then((r) => r.json()),
      fetch('/api/cashflow/health').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
    ]).then(([l, c, i]) => {
      setLeads(l.leads || []);
      setInvoices(i.invoices || []);
      setHealth(c.health);
      setIncome(c.income);
      setExpense(c.expense);
    });
  }, []);

  const outstanding = invoices.filter((i) => i.status !== 'PAID').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Oversikt</h1>
        <span
          className={`px-3 py-1 rounded text-sm ${
            health === 'GREEN'
              ? 'bg-green-100 text-green-800'
              : health === 'YELLOW'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          Økonomi: {health}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Leads (30 dager)" value={leads.length} />
        <Stat title="Inntekt" value={`${income} kr`} />
        <Stat title="Utgifter" value={`${expense} kr`} />
        <Stat title="Ubetalte fakturaer" value={outstanding} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {acceptedLeads || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Forms
              </span>
              <span className="font-medium">{formCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Rejected Leads
              </span>
              <span className="font-medium">{rejectedLeads || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {formCount === 0 && (
              <p className="text-muted-foreground">
                📝 Create your first intake form to start collecting leads
              </p>
            )}
            {formCount > 0 && (newLeads || 0) === 0 && (
              <p className="text-muted-foreground">
                📤 Share your form URL to start receiving project inquiries
              </p>
            )}
            {(newLeads || 0) > 0 && (
              <p className="text-emerald-600 font-medium">
                ✅ You&apos;re all set! New leads are coming in.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
