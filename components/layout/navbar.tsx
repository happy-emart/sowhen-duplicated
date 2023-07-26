import { signOut, useSession } from "next-auth/react";
import BlurImage from '../blur-image';
import Link from 'next/link';

export default function Navbar({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const { data: session, status } = useSession();

  return (
    <nav
      className="absolute right-0 w-full flex items-center justify-between md:justify-end px-4 h-16"
      aria-label="Navbar"
      style={{ minHeight: '40px'}}
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
          <div className="flex items-center">
            <div className="relative group h-10 w-10 rounded-full overflow-hidden hidden cu:block">
              <BlurImage
                src={session.user.image as string}
                alt={session.user.name as string} 
                width={40}
                height={40}
                className="max-h-full max-w-full"  // ensure the image does not exceed the parent div size
              />
            </div>
            <Link href={`/${session.username}`} className="hidden cu:block">
              <span className="ml-2">{session.user.name}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-600 hover:bg-white border-red-600 w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4"
            >
              Log out
            </button>
          </div>
        ) : null
        )}
    </nav>
  );
}
