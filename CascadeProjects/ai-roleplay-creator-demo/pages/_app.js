import React from 'react';
import Head from 'next/head';

// Basic App component to ensure proper page initialization
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Learning Experience Studio | Imperial College Business School</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
