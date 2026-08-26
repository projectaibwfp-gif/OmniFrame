'use client';

import type { ReactElement } from 'react';
import SwaggerUI from 'swagger-ui-react';

export function SwaggerUi(): ReactElement {
  return <SwaggerUI url='/api/openapi' docExpansion='list' defaultModelsExpandDepth={0} />;
}
