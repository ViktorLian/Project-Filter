'use client';

import { useEffect, useState } from 'react';
import { Webhook, Check, Loader2, Send } from 'lucide-react';

export default function WebhookSettings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/webhooks/new-lead')
      .then((r) => r.json())
      .then((data) => {
        setWebhookUrl(data.webhook_url ?? '');
        setWebhookSecret(data.webhook_secret ?? '');
        setEnabled(data.webhook_enabled ?? false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/webhooks/new-lead', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl, webhook_secret: webhookSecret, webhook_enabled: enabled }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhooks/new-lead', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTestResult(`✅ Test sendt! HTTP ${data.status}`);
      } else {
        setTestResult(`❌ Feil: ${data.error}`);
      }
    } catch {
      setTestResult('❌ Kunne ikke nå webhook-URL.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Webhook className="h-5 w-5 text-slate-600" />
        <h2 className="font-semibold text-slate-800">Webhook for nye leads</h2>
      </div>
      <p className="text-xs text-slate-500">
        Få et automatisk POST-kall til din egen URL hver gang et nytt lead kommer inn.
        Nyttig for Zapier, Make, egne systemer osv.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hemmelig nøkkel (X-Lead-Secret header)</label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Valgfri — valideres i din receiver"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm text-slate-700">{enabled ? 'Aktiv' : 'Deaktivert'}</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saving ? 'Lagrer…' : saved ? 'Lagret!' : 'Lagre'}
        </button>

        <button
          onClick={handleTest}
          disabled={testing || !webhookUrl}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {testing ? 'Sender…' : 'Test webhook'}
        </button>
      </div>

      {testResult && (
        <p className="text-xs font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{testResult}</p>
      )}
    </div>
  );
}
