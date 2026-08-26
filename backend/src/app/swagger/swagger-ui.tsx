'use client';

import SwaggerUI from 'swagger-ui-react';

export function SwaggerUi() {
  return <SwaggerUI url='/api/openapi' docExpansion='list' defaultModelsExpandDepth={0} />;
}
