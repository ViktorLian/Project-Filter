'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define types locally since we removed Prisma
type User = {
  id: string;
  name: string | null;
  email: string;
};

type Note = {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  createdAt: Date;
};

type NoteWithUser = Note & { user: User };

export default function LeadNotes({
  leadId,
  notes,
}: {
  leadId: string;
  notes: NoteWithUser[];
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function addNote() {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, content }),
      });

      if (res.ok) {
        setContent('');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note about this lead..."
            rows={3}
          />
          <Button onClick={addNote} disabled={loading || !content.trim()}>
            {loading ? 'Adding...' : 'Add Note'}
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet. Add one to track your communication.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-3 bg-slate-50 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{note.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-700">{note.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
