import { Metadata } from 'next';
import './globals.css';
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
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        {/* Google Search Console verification - Uncomment and add your verification code */}
        <meta name="google-site-verification" content="j5Lw5f1rbcLiwar3-5KOphlKjESosNJ6SO2cw4dTpMQ" />
      </head>
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
