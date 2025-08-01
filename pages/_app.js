import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const noLayoutPages = ['/auth/login', '/auth/signup']; // Layout istemediğin sayfalar

  const shouldWrapWithLayout = !noLayoutPages.includes(router.pathname);

  return (
    <SessionProvider session={session}>
      {shouldWrapWithLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}