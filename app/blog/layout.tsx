import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlowPilot Blogg – CRM og vekstguider for norske SMB-bedrifter',
  description:
    'Praktiske guider om CRM, automatisering, salg og digital markedsføring for norske service- og håndverksbedrifter.',
  openGraph: {
    title: 'FlowPilot Blogg',
    description: 'Praktiske guider for norske SMB-bedrifter',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
