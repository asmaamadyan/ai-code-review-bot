import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export type PromptLogStatus = 'success' | 'failed';

export type PromptLogEntry = {
  requestId: string;
  workflowRunId: string;
  timestamp: string;
  model: string;
  status: PromptLogStatus;
  durationMs: number;
  prompt: string;
  response?: string;
  error?: string;
};

export async function writePromptLog(
  entry: PromptLogEntry,
  logFilePath = path.resolve(process.cwd(), 'logs/prompt-log.jsonl'),
): Promise<void> {
  await mkdir(path.dirname(logFilePath), {
    recursive: true,
  });

  await appendFile(logFilePath, `${JSON.stringify(entry)}\n`, 'utf8');
}
