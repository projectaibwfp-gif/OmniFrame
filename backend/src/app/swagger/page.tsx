import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { SwaggerUi } from './swagger-ui';

export const metadata: Metadata = {
  title: 'OmniFrame API Swagger',
  description: 'Swagger UI for OmniFrame backend REST endpoints',
};

export default function SwaggerPage(): ReactElement {
  return (
    <main>
      <SwaggerUi />
    </main>
  );
}
