import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { subscribe } from '@/app/actions/subscriptions';

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-slate-600">
          Choose the plan that fits your hiring needs. Subscribe to unlock direct contact details of top freelancers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <Card className="relative flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-8 pt-10">
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Basic Plan</CardTitle>
            <CardDescription className="text-slate-500">Perfect for occasional hiring</CardDescription>
            <div className="mt-6 flex items-baseline justify-center gap-x-2">
              <span className="text-5xl font-extrabold tracking-tight text-slate-900">₹299</span>
              <span className="text-sm font-semibold leading-6 text-slate-500">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4 text-sm leading-6 text-slate-600">
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Unlock up to 10 freelancer contacts
              </li>
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Access to full portfolios
              </li>
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Standard support
              </li>
              <li className="flex gap-x-3 text-slate-400">
                <XCircle className="h-6 w-5 flex-none" aria-hidden="true" />
                Unlimited contact unlocks
              </li>
            </ul>
          </CardContent>
          <CardFooter className="px-8 pb-10">
            {session?.role === 'client' ? (
              <form action={async () => {
                'use server';
                await subscribe(299);
              }} className="w-full">
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg">
                  Subscribe Now
                </Button>
              </form>
            ) : (
              <Link href="/login" className="w-full">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg">
                  Log in to Subscribe
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative flex flex-col border-blue-200 shadow-xl shadow-blue-100/50 ring-2 ring-blue-600">
          <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-center text-sm font-semibold text-white shadow-sm">
            Most Popular
          </div>
          <CardHeader className="text-center pb-8 pt-10">
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Pro Plan</CardTitle>
            <CardDescription className="text-slate-500">For agencies and heavy recruiters</CardDescription>
            <div className="mt-6 flex items-baseline justify-center gap-x-2">
              <span className="text-5xl font-extrabold tracking-tight text-slate-900">₹699</span>
              <span className="text-sm font-semibold leading-6 text-slate-500">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4 text-sm leading-6 text-slate-600">
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                <span className="font-semibold text-slate-900">Unlimited</span> freelancer contact unlocks
              </li>
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Access to full portfolios
              </li>
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Priority 24/7 support
              </li>
              <li className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Early access to new features
              </li>
            </ul>
          </CardContent>
          <CardFooter className="px-8 pb-10">
            {session?.role === 'client' ? (
              <form action={async () => {
                'use server';
                await subscribe(699);
              }} className="w-full">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-sm">
                  Subscribe Now
                </Button>
              </form>
            ) : (
              <Link href="/login" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-sm">
                  Log in to Subscribe
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
