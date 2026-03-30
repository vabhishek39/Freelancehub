import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'client') redirect('/login');

  const subscription = db.prepare('SELECT * FROM subscriptions WHERE client_id = ?').get(session.id) as any;
  const unlockedContacts = db.prepare(`
    SELECT s.id, s.title, u.name as freelancer_name, f.phone, f.contact_email 
    FROM unlocked_contacts uc
    JOIN services s ON uc.service_id = s.id
    JOIN users u ON s.freelancer_id = u.id
    JOIN freelancer_profiles f ON u.id = f.user_id
    WHERE uc.client_id = ?
    ORDER BY uc.created_at DESC
  `).all(session.id) as any[];

  const isActive = subscription && new Date(subscription.expires_at) > new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Client Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Subscription Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your access to freelancer contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {isActive ? (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                  <p className="font-semibold">Active Plan: ₹{subscription.plan}/month</p>
                  <p className="text-sm mt-1">Expires: {new Date(subscription.expires_at).toLocaleDateString()}</p>
                </div>
                {subscription.plan === 299 && (
                  <p className="text-sm text-slate-600">
                    Unlocked: {subscription.unlocked_count} / 10 contacts
                  </p>
                )}
                {subscription.plan === 699 && (
                  <p className="text-sm text-slate-600">Unlimited contacts unlocked.</p>
                )}
                <Link href="/pricing" className="block mt-4">
                  <Button variant="outline" className="w-full">Upgrade Plan</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 text-slate-700 p-4 rounded-lg">
                  <p className="font-semibold">No Active Subscription</p>
                  <p className="text-sm mt-1">Subscribe to unlock freelancer contact details.</p>
                </div>
                <Link href="/pricing" className="block mt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">View Pricing</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unlocked Contacts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Unlocked Contacts</CardTitle>
            <CardDescription>Freelancers you have connected with</CardDescription>
          </CardHeader>
          <CardContent>
            {unlockedContacts.length === 0 ? (
              <p className="text-slate-500">You haven&apos;t unlocked any contacts yet.</p>
            ) : (
              <div className="space-y-4">
                {unlockedContacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{contact.freelancer_name}</h3>
                      <p className="text-sm text-slate-600">{contact.title}</p>
                    </div>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md w-full sm:w-auto">
                      <p><strong>Email:</strong> {contact.contact_email || 'Not provided'}</p>
                      <p><strong>Phone:</strong> {contact.phone || 'Not provided'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
