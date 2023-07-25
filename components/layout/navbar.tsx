import { signOut, useSession } from "next-auth/react";
import Link from 'next/link';

export default function Navbar({
  setSidebarOpen
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const { data: session, status } = useSession();

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
          <>
            <Link href={`/${session.username}`}>
              {session.user.name}
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-white border-red-600 w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4"
            >
              Log out
            </button>
          </>
        ) : (
          <Link href="/login">
            <div className="w-36 h-8 py-1 text-white bg-black hover:bg-white border-black border rounded-md text-sm transition-all">
              Log in
            </div>
          </Link>
        ))}
    </nav>
  );
}
