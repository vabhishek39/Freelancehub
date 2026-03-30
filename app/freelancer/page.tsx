import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createService, updateFreelancerProfile } from '@/app/actions/services';
import { Badge } from '@/components/ui/badge';

export default async function FreelancerDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'freelancer') redirect('/login');

  const profile = db.prepare('SELECT * FROM freelancer_profiles WHERE user_id = ?').get(session.id) as any;
  const services = db.prepare('SELECT * FROM services WHERE freelancer_id = ? ORDER BY created_at DESC').all(session.id) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Freelancer Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Update your contact details and portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              'use server';
              await updateFreelancerProfile(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} placeholder="Tell clients about yourself..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input id="portfolio_url" name="portfolio_url" type="url" defaultValue={profile?.portfolio_url || ''} placeholder="https://yourportfolio.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ''} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" defaultValue={profile?.contact_email || ''} placeholder="contact@example.com" />
              </div>
              <Button type="submit">Save Profile</Button>
            </form>
          </CardContent>
        </Card>

        {/* Create Service Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Service</CardTitle>
            <CardDescription>List a new service for clients to hire you</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              'use server';
              await createService(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input id="title" name="title" placeholder="I will build a full-stack website..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Detailed description of what you offer..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" min="0" step="1" placeholder="5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (comma separated)</Label>
                <Input id="features" name="features" placeholder="Responsive Design, SEO, 3 Revisions" required />
              </div>
              <Button type="submit" className="w-full">Create Listing</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Your Services */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Your Services</h2>
        {services.length === 0 ? (
          <p className="text-slate-500">You haven&apos;t created any services yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant={service.status === 'approved' ? 'default' : service.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                  <CardDescription>₹{service.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-3">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
