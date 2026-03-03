'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Note = {
  id: string;
  lead_id: string;
  user_id?: string;
  content: string;
  created_at: string;
};

export default function LeadNotes({ leadId, notes }: { leadId: string; notes: Note[] }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function addNote() {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, content }),
      });
      if (res.ok) {
        setContent('');
        router.refresh();
      } else {
        const j = await res.json();
        setError(j.error || 'Feil ved lagring');
      }
    } catch (e) {
      setError('Nettverksfeil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-800 mb-4">Notater</h2>

      {/* Add note */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Legg til et notat om denne leaden..."
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        <button
          onClick={addNote}
          disabled={loading || !content.trim()}
          className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Lagrer...' : 'Legg til notat'}
        </button>
      </div>

      {/* Note list */}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Ingen notater ennÃ¥. Legg til ett for Ã¥ spore kommunikasjonen.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600">Notat</span>
                <span className="text-xs text-slate-400">
                  {new Date(note.created_at).toLocaleString('nb-NO')}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

