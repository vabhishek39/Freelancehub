import db from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function ServicesPage() {
  const services = db.prepare(`
    SELECT s.*, u.name as freelancer_name, f.bio, f.portfolio_url 
    FROM services s 
    JOIN users u ON s.freelancer_id = u.id 
    JOIN freelancer_profiles f ON u.id = f.user_id
    WHERE s.status = 'approved' 
    ORDER BY s.created_at DESC
  `).all() as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Browse Freelance Services
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Find the perfect professional for your next project.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-lg text-slate-500">No services available at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    ₹{service.price}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2 leading-tight">{service.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-slate-900">{service.freelancer_name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(service.features).slice(0, 3).map((feature: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs text-slate-500">{feature}</Badge>
                  ))}
                  {JSON.parse(service.features).length > 3 && (
                    <Badge variant="outline" className="text-xs text-slate-500">+{JSON.parse(service.features).length - 3} more</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Link href={`/services/${service.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
