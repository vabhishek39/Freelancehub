import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'FreelanceHub - Hire Top Freelancers',
  description: 'The premier marketplace for top freelance talent.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                FreelanceHub
              </span>
              <span className="text-sm text-slate-500 ml-4">© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <Link href="/about" className="hover:text-blue-600">About Us</Link>
              <Link href="/contact" className="hover:text-blue-600">Contact</Link>
              <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600">Terms & Conditions</Link>
              <Link href="#" className="hover:text-blue-600">Disclaimer</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
