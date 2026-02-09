import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Show demo settings when no session
  if (!session) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and company settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your company details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input placeholder="Your Company AS" />
            </div>
            <div>
              <Label>Organization Number</Label>
              <Input placeholder="123 456 789" />
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Company Street 123, 0001 Oslo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>
              Bank account and invoice configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bank Account Number</Label>
              <Input placeholder="1234 56 78901" />
              <p className="text-xs text-muted-foreground mt-1">
                Used on invoice PDFs
              </p>
            </div>
            <div>
              <Label>KID Prefix</Label>
              <Input placeholder="2026" />
              <p className="text-xs text-muted-foreground mt-1">
                Prefix for auto-generated KID numbers
              </p>
            </div>
            <div>
              <Label>Invoice Email</Label>
              <Input placeholder="invoice@yourcompany.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan: Starter</p>
                <p className="text-sm text-muted-foreground">799 NOK/month - 14 days free trial</p>
              </div>
              <Button>Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyId = (session.user as any).companyId;
  const supabase = createAdminClient();

  const { data: company } = await supabase
    .from('leads_companies')
    .select('*')
    .eq('id', companyId)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and company settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Your company details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={company?.name || ''} disabled />
          </div>
          <div>
            <Label>Company Slug</Label>
            <Input value={company?.slug || ''} disabled />
            <p className="text-xs text-muted-foreground mt-1">
              Used in form URLs: /f/your-form-slug
            </p>
          </div>
          <div>
            <Label>Current Plan</Label>
            <Input value={company?.subscription_plan || 'None'} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage your subscription and billing
          </p>
          <Link href="/dashboard/billing">
            <Button>Manage Subscription</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
