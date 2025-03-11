import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="AI Learning Experience Studio for Imperial College Business School" />
        <meta name="theme-color" content="#003E74" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
