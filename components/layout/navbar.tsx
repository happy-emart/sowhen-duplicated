import { signIn, useSession, signOut } from "next-auth/react";
import { useState } from 'react';
import { LoadingDots } from '@/components/icons';
// import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({
  setSidebarOpen
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <nav
      className="absolute right-0 w-full flex items-center justify-between md:justify-end px-4 h-16"
      aria-label="Navbar"
    >
      <button
        type="button"
        className="inline-flex md:hidden items-center justify-center rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-0"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
      </button>
      {status !== 'loading' &&
        (session?.user ? (
          <Link href={`/${session.username}`}>
          </Link>
        ) : (
          <>
            <button
              disabled={loading}
              onClick={() => {
                setLoading(true);
                signIn('github', { callbackUrl: `/profile` });
              }}
              className={`${
                loading
                  ? 'bg-gray-200 border-gray-300'
                  : 'bg-black hover:bg-white border-black'
              } w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all`}
            >
              {loading ? <LoadingDots color="gray" /> : 'Log in with GitHub'}
            </button>
            <button
              disabled={loading}
              onClick={() => {
                setLoading(true);
                signIn('google', { callbackUrl: `/profile` });
              }}
              className={`${
                loading
                  ? 'bg-gray-200 border-gray-300'
                  : 'bg-red-600 hover:bg-white border-red-600'
              } w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4`}
            >
              {loading ? <LoadingDots color="gray" /> : 'Log in with Google'}
            </button>
          </>
        ))}
    </nav>
  );
}
