import type { Metadata } from 'next';
import { SwaggerUi } from './swagger-ui';

export const metadata: Metadata = {
  title: 'OmniFrame API Swagger',
  description: 'Swagger UI for OmniFrame backend REST endpoints',
};

export default function SwaggerPage() {
  return (
    <main>
      <SwaggerUi />
    </main>
  );
}
