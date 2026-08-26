import type { ReactElement } from 'react';

export default function HomePage(): ReactElement {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '3rem' }}>
      <h1>Project AI API</h1>
      <p>
        REST API działa. Sprawdź <code>/api/health</code> lub <code>/api/products</code>.
      </p>
      <p>
        Dokumentacja Swagger jest dostępna pod <code>/swagger</code>, a specyfikacja JSON pod{' '}
        <code>/api/openapi</code>.
      </p>
    </main>
  );
}
