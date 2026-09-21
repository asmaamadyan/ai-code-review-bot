import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCopilotReview, type CopilotExecutor } from '../src/copilotRunner';

const validResponse = JSON.stringify({
  summary: 'One performance issue was found.',
  riskLevel: 'medium',
  findings: [
    {
      severity: 'medium',
      category: 'performance',
      language: 'TypeScript',
      file: 'src/App.tsx',
      line: 12,
      title: 'Repeated calculation',
      explanation: 'The calculation runs during every render.',
      suggestedFix: 'Memoize the calculation.',
      confidence: 0.9,
    },
  ],
  positives: ['Clear component naming.'],
});

async function createLogFile(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'copilot-runner-'));

  return path.join(directory, 'prompt-log.jsonl');
}

describe('runCopilotReview', () => {
  it('returns a validated review and logs success', async () => {
    const logFile = await createLogFile();

    const executor: CopilotExecutor = async () => validResponse;

    const result = await runCopilotReview('Review this diff.', {
      executor,
      logFilePath: logFile,
    });

    expect(result.review.riskLevel).toBe('medium');

    const log = await readFile(logFile, 'utf8');
    const entry = JSON.parse(log.trim());

    expect(entry.status).toBe('success');
    expect(entry.response).toBe(validResponse);
  });

  it('rejects invalid responses and logs failure', async () => {
    const logFile = await createLogFile();

    const executor: CopilotExecutor = async () => 'invalid JSON';

    await expect(
      runCopilotReview('Review this diff.', {
        executor,
        logFilePath: logFile,
      }),
    ).rejects.toThrow('invalid JSON');

    const log = await readFile(logFile, 'utf8');
    const entry = JSON.parse(log.trim());

    expect(entry.status).toBe('failed');
    expect(entry.error).toContain('invalid JSON');
  });

  it('logs timeout failures', async () => {
    const logFile = await createLogFile();

    const executor: CopilotExecutor = async () => {
      throw new Error('Copilot timed out.');
    };

    await expect(
      runCopilotReview('Review this diff.', {
        executor,
        logFilePath: logFile,
      }),
    ).rejects.toThrow('Copilot timed out.');

    const log = await readFile(logFile, 'utf8');
    const entry = JSON.parse(log.trim());

    expect(entry.status).toBe('failed');
    expect(entry.error).toBe('Copilot timed out.');
  });
});
