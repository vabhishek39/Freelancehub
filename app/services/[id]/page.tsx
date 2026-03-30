import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Unlock, User } from 'lucide-react';
import Link from 'next/link';
import { unlockContact } from '@/app/actions/subscriptions';

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const service = db.prepare(`
    SELECT s.*, u.name as freelancer_name, f.bio, f.portfolio_url, f.phone, f.contact_email 
    FROM services s 
    JOIN users u ON s.freelancer_id = u.id 
    JOIN freelancer_profiles f ON u.id = f.user_id
    WHERE s.id = ? AND s.status = 'approved'
  `).get(id) as any;

  if (!service) {
    redirect('/services');
  }

  const features = JSON.parse(service.features);

  let isUnlocked = false;
  let canUnlock = false;
  let subscription = null;

  if (session && session.role === 'client') {
    const unlocked = db.prepare('SELECT id FROM unlocked_contacts WHERE client_id = ? AND service_id = ?').get(session.id, id);
    if (unlocked) {
      isUnlocked = true;
    } else {
      subscription = db.prepare('SELECT * FROM subscriptions WHERE client_id = ?').get(session.id) as any;
      if (subscription && new Date(subscription.expires_at) > new Date()) {
        if (subscription.plan === 699 || (subscription.plan === 299 && subscription.unlocked_count < 10)) {
          canUnlock = true;
        }
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{service.title}</h1>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{service.freelancer_name}</span>
              </div>
              <span>•</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm">
                ₹{service.price}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{service.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-4">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-blue-200 shadow-lg shadow-blue-100/50">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100">
              <CardTitle className="text-2xl text-center">Contact Freelancer</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center space-y-4">
                  <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Log in as a client to view contact details.</p>
                  <Link href="/login" className="block">
                    <Button className="w-full">Log in to Unlock</Button>
                  </Link>
                </div>
              ) : session.role !== 'client' ? (
                <div className="text-center space-y-4">
                  <p className="text-slate-600">Only clients can unlock contact details.</p>
                </div>
              ) : isUnlocked ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <Unlock className="h-5 w-5" />
                    <span className="font-semibold">Contact Unlocked</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                      <p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-md border">{service.contact_email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Phone Number</p>
                      <p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-md border">{service.phone || 'Not provided'}</p>
                    </div>
                    {service.portfolio_url && (
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Portfolio</p>
                        <a href={service.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {service.portfolio_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : canUnlock ? (
                <div className="text-center space-y-6">
                  <Lock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-slate-600">You have an active subscription. Unlock this contact now.</p>
                  <form action={async () => {
                    'use server';
                    await unlockContact(service.id);
                  }}>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12">
                      <Unlock className="mr-2 h-5 w-5" /> Unlock Contact
                    </Button>
                  </form>
                  {subscription?.plan === 299 && (
                    <p className="text-xs text-slate-500">
                      This will use 1 of your remaining {10 - subscription.unlocked_count} unlocks.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Subscribe to a plan to unlock freelancer contact details.</p>
                  <Link href="/pricing" className="block">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12">
                      View Pricing Plans
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About the Freelancer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 text-sm leading-relaxed">{service.bio || 'No bio provided.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
