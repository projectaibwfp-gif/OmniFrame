import { describe, expect, it } from 'vitest';
import { errorResponse } from './api-response';
import { openApiDocument } from './openapi';

describe('API error contract', () => {
  it('keeps runtime error shape aligned with OpenAPI', async () => {
    const response = errorResponse('Invalid request', 400, 'VALIDATION_FAILED');

    expect(await response.json()).toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid request',
      },
    });
    expect(openApiDocument.components.schemas.ErrorResponse).toEqual({
      type: 'object',
      required: ['error'],
      properties: {
        error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    });
  });

  it('documents user collection and user detail as separate endpoints', () => {
    expect(openApiDocument.paths['/api/users'].get.summary).toBe('Returns paginated user list.');
    expect(openApiDocument.paths['/api/users/{googleId}'].get.summary).toBe(
      'Returns one user by Google ID.',
    );
  });
});
