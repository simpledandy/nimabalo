import { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: "Nimabalo",
  description: "Savollaringizga javob toping",
  icons: {
    icon: "../public/favicon.svg",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
