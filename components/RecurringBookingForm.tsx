'use client';
import { useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';

interface RecurringBookingFormProps {
  customerId?: string;
  customerName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SERVICE_TYPES = [
  'Rengjøring',
  'Vindusvask',
  'Vedlikehold',
  'Hagearbeid',
  'Snørydding',
  'Kontormøte',
  'Konsultasjon',
  'Service',
  'Annet',
];

const INTERVAL_UNITS = [
  { value: 'days', label: 'Dager' },
  { value: 'weeks', label: 'Uker' },
  { value: 'months', label: 'Måneder' },
];

export function RecurringBookingForm({ customerId, customerName, onSuccess, onCancel }: RecurringBookingFormProps) {
  const [form, setForm] = useState({
    serviceType: '',
    customServiceType: '',
    intervalValue: 1,
    intervalUnit: 'months',
    firstDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const serviceType = form.serviceType === 'Annet' ? form.customServiceType : form.serviceType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !form.firstDate) {
      setError('Fyll ut tjenestetype og første dato.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          serviceType,
          intervalValue: form.intervalValue,
          intervalUnit: form.intervalUnit,
          firstDate: form.firstDate,
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Noe gikk galt');
      }
      setSuccess(true);
      onSuccess?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CalendarClock className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-900 text-lg">Fast oppdrag opprettet!</h3>
        <p className="text-slate-500 text-sm mt-1">
          {serviceType} er satt opp med {form.intervalValue} {INTERVAL_UNITS.find(u => u.value === form.intervalUnit)?.label.toLowerCase()} mellomrom.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Lukk
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 text-base">
          Sett opp fast oppdrag{customerName ? ` for ${customerName}` : ''}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">Bookinger opprettes automatisk basert på intervallet du velger.</p>
      </div>

      {/* Service type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Tjenestetype *</label>
        <select
          value={form.serviceType}
          onChange={e => setForm({ ...form, serviceType: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          required
        >
          <option value="">Velg type...</option>
          {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {form.serviceType === 'Annet' && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Beskriv tjeneste *</label>
          <input
            value={form.customServiceType}
            onChange={e => setForm({ ...form, customServiceType: e.target.value })}
            placeholder="F.eks. Fjernhjelp"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>
      )}

      {/* Interval */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Intervall *</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="365"
            value={form.intervalValue}
            onChange={e => setForm({ ...form, intervalValue: parseInt(e.target.value) || 1 })}
            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 text-center"
          />
          <select
            value={form.intervalUnit}
            onChange={e => setForm({ ...form, intervalUnit: e.target.value })}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            {INTERVAL_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Neste booking planlegges automatisk {form.intervalValue} {INTERVAL_UNITS.find(u => u.value === form.intervalUnit)?.label.toLowerCase()} etter forrige.
        </p>
      </div>

      {/* First date */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Første dato *</label>
        <input
          type="date"
          value={form.firstDate}
          onChange={e => setForm({ ...form, firstDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Notater (valgfritt)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="F.eks. ring 30 min før ankomst"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
          {loading ? 'Oppretter...' : 'Opprett fast oppdrag'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Avbryt
          </button>
        )}
      </div>
    </form>
  );
}
