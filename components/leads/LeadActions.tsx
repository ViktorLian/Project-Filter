'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Define LeadStatus locally since we removed Prisma
type LeadStatus = 'NEW' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export default function LeadActions({
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
