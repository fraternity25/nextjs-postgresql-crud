// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/users');
    } else if (status === 'unauthenticated') {
      router.replace('/auth');
    }
  }, [status]);

  return null;
}
