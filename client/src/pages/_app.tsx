import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Calendar App</title>
        <meta name="description" content="A modern calendar application" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#1890ff" />
      </Head>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <LayoutWrapper>
          <Component {...pageProps} />
        </LayoutWrapper>
      </ConfigProvider>
    </>
  );
}
