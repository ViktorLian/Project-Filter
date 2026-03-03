'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LeadStatus = 'NEW' | 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'CONTACTED';

export default function LeadActions({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: LeadStatus) {
    setLoading(true);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const st = (currentStatus || 'NEW').toUpperCase();

  return (
    <div className="flex gap-2 flex-wrap">
      {st !== 'ACCEPTED' && (
        <button
          onClick={() => updateStatus('ACCEPTED')}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          ✓ Aksepter
        </button>
      )}
      {st !== 'CONTACTED' && (
        <button
          onClick={() => updateStatus('CONTACTED')}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          Kontaktet
        </button>
      )}
      {st !== 'REJECTED' && (
        <button
          onClick={() => updateStatus('REJECTED')}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          Avvis
        </button>
      )}
    </div>
  );
}

  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: LeadStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== 'ACCEPTED' && (
        <Button
          size="sm"
          onClick={() => updateStatus('ACCEPTED')}
          disabled={loading}
          variant="default"
        >
          Accept
        </Button>
      )}
      {currentStatus !== 'REJECTED' && (
        <Button
          size="sm"
          onClick={() => updateStatus('REJECTED')}
          disabled={loading}
          variant="destructive"
        >
          Reject
        </Button>
      )}
      {currentStatus === 'NEW' && (
        <Button
          size="sm"
          onClick={() => updateStatus('REVIEWED')}
          disabled={loading}
          variant="outline"
        >
          Mark Reviewed
        </Button>
      )}
    </div>
  );
}
