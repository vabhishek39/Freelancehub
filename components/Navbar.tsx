import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                FreelanceHub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/services" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Browse Services
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Pricing
            </Link>

            {session ? (
              <div className="flex items-center gap-4 ml-4 border-l pl-4">
                <Link
                  href={`/${session.role}`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <form action={logout}>
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 border-l pl-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
