import { FlaskConical } from 'lucide-react';

/**
 * DemoBanner – shown on pages that display hardcoded preview data
 * until the feature is connected to live Supabase data.
 */
export function DemoBanner({ feature }: { feature?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5 text-sm">
      <FlaskConical className="h-4 w-4 text-amber-500 flex-shrink-0" />
      <p className="text-amber-800">
        <span className="font-semibold">Demo-forhåndsvisning{feature ? ` – ${feature}` : ''}.</span>{' '}
        Data som vises her er eksempler. Dine egne data vil dukke opp her etter hvert som du bruker FlowPilot.
      </p>
    </div>
  );
}
