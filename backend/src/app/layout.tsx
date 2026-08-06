import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project AI API',
  description: 'REST API for Project AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
