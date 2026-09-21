import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { writePromptLog } from '../src/promptLogger';

describe('writePromptLog', () => {
  it('records every AI interaction as JSONL', async () => {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), 'code-review-log-'),
    );

    const logFile = path.join(temporaryDirectory, 'prompt-log.jsonl');

    await writePromptLog(
      {
        requestId: 'request-123',
        workflowRunId: 'run-456',
        timestamp: '2026-09-21T10:00:00.000Z',
        model: 'github-copilot-auto',
        status: 'success',
        durationMs: 250,
        prompt: 'Review this diff.',
        response: '{"summary":"Review complete"}',
      },
      logFile,
    );

    await writePromptLog(
      {
        requestId: 'request-789',
        workflowRunId: 'run-456',
        timestamp: '2026-09-21T10:01:00.000Z',
        model: 'github-copilot-auto',
        status: 'failed',
        durationMs: 1000,
        prompt: 'Review another diff.',
        error: 'Copilot timed out.',
      },
      logFile,
    );

    const contents = await readFile(logFile, 'utf8');
    const entries = contents
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));

    expect(entries).toHaveLength(2);

    expect(entries[0]).toMatchObject({
      requestId: 'request-123',
      status: 'success',
      model: 'github-copilot-auto',
    });

    expect(entries[1]).toMatchObject({
      requestId: 'request-789',
      status: 'failed',
      error: 'Copilot timed out.',
    });
  });
});
