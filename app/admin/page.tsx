import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateServiceStatus } from '@/app/actions/services';
import { Badge } from '@/components/ui/badge';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login');

  const pendingServices = db.prepare(`
    SELECT s.*, u.name as freelancer_name 
    FROM services s 
    JOIN users u ON s.freelancer_id = u.id 
    WHERE s.status = 'pending' 
    ORDER BY s.created_at DESC
  `).all() as any[];

  const allServices = db.prepare(`
    SELECT s.*, u.name as freelancer_name 
    FROM services s 
    JOIN users u ON s.freelancer_id = u.id 
    ORDER BY s.created_at DESC
  `).all() as any[];

  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
    totalFreelancers: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'freelancer'").get() as { count: number },
    totalClients: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get() as { count: number },
    activeSubscriptions: db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE expires_at > datetime('now')").get() as { count: number },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Freelancers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalFreelancers.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClients.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Subs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSubscriptions.count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>
      {pendingServices.length === 0 ? (
        <p className="text-slate-500 mb-12">No pending services to approve.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pendingServices.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>by {service.freelancer_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{service.description}</p>
                <div className="flex gap-2">
                  <form action={async () => {
                    'use server';
                    await updateServiceStatus(service.id, 'approved');
                  }} className="flex-1">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Approve</Button>
                  </form>
                  <form action={async () => {
                    'use server';
                    await updateServiceStatus(service.id, 'rejected');
                  }} className="flex-1">
                    <Button type="submit" variant="destructive" className="w-full">Reject</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Services */}
      <h2 className="text-2xl font-bold mb-6">All Services</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Freelancer</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allServices.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{service.title}</td>
                <td className="px-6 py-4">{service.freelancer_name}</td>
                <td className="px-6 py-4">₹{service.price}</td>
                <td className="px-6 py-4">
                  <Badge variant={service.status === 'approved' ? 'default' : service.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {service.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
