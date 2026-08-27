export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'OmniFrame API',
    version: '1.0.0',
    description: 'Dokumentacja endpointow backendu OmniFrame (Next.js App Router).',
  },
  servers: [{ url: '/', description: 'Current deployment' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Dashboard' },
    { name: 'Referrals' },
    { name: 'TibiaData' },
    { name: 'Cron' },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'omniframe.session',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/openapi': {
      get: {
        tags: ['Health'],
        summary: 'Returns OpenAPI JSON specification for this backend.',
        responses: {
          200: { description: 'OpenAPI document' },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Checks API and database connection state.',
        responses: {
          200: { description: 'Service is healthy' },
          503: { description: 'Database unavailable' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Returns dashboard metrics and recent activity.',
        responses: {
          200: { description: 'Dashboard payload' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Returns users list or user filtered by google_id query param.',
        responses: {
          200: { description: 'Users payload' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Manual Google user upsert.',
        responses: {
          200: { description: 'User upserted' },
        },
      },
    },
    '/api/auth/state': {
      get: {
        tags: ['Auth'],
        summary: 'Returns login state token for Google auth flow.',
        responses: {
          200: { description: 'State generated' },
        },
      },
    },
    '/api/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Verifies Google token and creates session cookies.',
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Token invalid' },
          403: { description: 'Invalid login state' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Returns current session user.',
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: 'Session payload' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Updates current user profile data.',
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refreshes session cookies from refresh token.',
        responses: {
          200: { description: 'Session refreshed' },
          401: { description: 'Refresh failed' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clears auth cookies and logs user out.',
        responses: {
          200: { description: 'Session cleared' },
        },
      },
    },
    '/api/referrals/capture': {
      post: {
        tags: ['Referrals'],
        summary: 'Captures first referral code to cookie.',
        responses: {
          200: { description: 'Referral captured or skipped' },
        },
      },
    },
    '/api/boostable-bosses': {
      get: {
        tags: ['TibiaData'],
        summary: 'Returns boostable bosses snapshot from TibiaData.',
        responses: {
          200: { description: 'Bosses payload' },
        },
      },
    },
    '/api/creatures': {
      get: {
        tags: ['TibiaData'],
        summary: 'Returns boostable creatures snapshot from TibiaData.',
        responses: {
          200: { description: 'Creatures payload' },
        },
      },
    },
    '/api/character/{name}': {
      get: {
        tags: ['TibiaData'],
        summary: 'Returns TibiaData character details and lookup history.',
        parameters: [
          {
            name: 'name',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Character payload' },
          404: { description: 'Character not found' },
        },
      },
    },
    '/api/highscores-snapshots': {
      get: {
        tags: ['TibiaData'],
        summary: 'Returns highscores snapshots with pagination and filtering.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 200 },
          },
          { name: 'world', in: 'query', schema: { type: 'string' } },
          { name: 'sortDir', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          200: { description: 'Highscores snapshots page' },
        },
      },
    },
    '/api/cron/highscores': {
      post: {
        tags: ['Cron'],
        summary: 'Runs highscores ingestion for configured worlds.',
        responses: {
          200: { description: 'Cron ingestion completed' },
        },
      },
    },
  },
} as const;
