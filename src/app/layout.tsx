import { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import ClientRoot from '@/components/ClientRoot';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nimabalo.uz'),
  title: "Nimabalo",
  description: "Savollaringizga javob toping",
  keywords: [
    "questions",
    "answers",
    "anonymous",
    "Nimabalo",
    "Q&A",
    "community",
  ],
  openGraph: {
    title: "Nimabalo",
    description: "Savollaringizga javob toping",
    url: "https://nimabalo.uz/",
    siteName: "Nimabalo",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Nimabalo Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="Nimabalo" />
        <meta property="og:description" content="Savollaringizga javob toping" />
        <meta property="og:image" content="/logo.svg" />
        <meta property="og:url" content="https://nimabalo.com/" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
