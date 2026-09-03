import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import SessionProvider from '@/components/providers/SessionProvider';
import SubscriptionRequired from '@/components/billing/SubscriptionRequired';
import { getSubscriptionStatus } from '@/lib/subscription';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const companyId = (session.user as any).companyId as string | undefined;
  const subscription = companyId
    ? await getSubscriptionStatus(companyId)
    : { hasAccess: false };

  // This check runs on the server. Hiding navigation alone is not a paywall.
  if (!subscription.hasAccess) {
    return (
      <SessionProvider>
        <SubscriptionRequired />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
