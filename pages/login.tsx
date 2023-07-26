import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { LoadingDots } from '@/components/icons';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <div>
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
            } w-full h-8 py-2 text-white hover:text-black border rounded-md text-sm transition-all`}
          >
            {loading ? <LoadingDots color="gray" /> : 'GitHub으로 로그인'}
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
            } w-full h-8 py-2 text-white hover:text-black border rounded-md text-sm transition-all mt-4`}
          >
            {loading ? <LoadingDots color="gray" /> : 'Google로 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
