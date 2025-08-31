import { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: "Nimabalo",
  description: "Savollaringizga javob toping",
  icons: {
    icon: "/favicon.svg",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <NavBar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
