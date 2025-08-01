import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

// FontAwesome config
config.autoAddCss = false;

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