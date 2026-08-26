import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import 'swagger-ui-react/swagger-ui.css';

export const metadata: Metadata = {
  title: 'Project AI API',
  description: 'REST API for Project AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): ReactElement {
  return (
    <html lang='pl'>
      <body>{children}</body>
    </html>
  );
}
