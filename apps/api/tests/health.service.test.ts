import { describe, expect, it, vi } from 'vitest';
import { checkDatabase } from '../src/services/health.service.js';

describe('database health service', () => {
  it('reports up after a successful query', async () => {
    const database = { $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]) };

    await expect(checkDatabase(database as never)).resolves.toEqual({
      status: 'up',
    });
  });

  it('propagates a database connection failure', async () => {
    const database = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
    };

    await expect(checkDatabase(database as never)).rejects.toThrow(
      'connection refused',
    );
  });
});
