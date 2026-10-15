import { describe, expect, it } from 'vitest';
import type { CharacterHighscoresHistoryDto, HealthStatusDto } from '@shared/api-contract';
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

  it('documents character highscores history with its shared DTO shape', () => {
    const history: CharacterHighscoresHistoryDto = { data: [], total: 0 };

    expect(Object.keys(history)).toEqual(['data', 'total']);
    expect(
      openApiDocument.paths['/api/character/{name}/highscores-history'].get.responses,
    ).toHaveProperty('200');
  });

  it('keeps health payload aligned with the shared DTO', () => {
    const health: HealthStatusDto = {
      status: 'ok',
      service: 'project-ai-backend',
      database: 'connected',
      timestamp: '2026-10-15T08:00:00.000Z',
    };

    expect(Object.keys(health).sort()).toEqual(['database', 'service', 'status', 'timestamp']);
    expect(openApiDocument.paths['/api/health'].get.responses).toHaveProperty('200');
  });
});
