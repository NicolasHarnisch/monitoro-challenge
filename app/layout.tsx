import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/components/providers/ApolloProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Monitoro',
  description: 'Sistema de monitoramento e gestão de ordens de serviço de manutenção industrial.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col">
        <ApolloWrapper>
          <Toaster position="top-right" />
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
