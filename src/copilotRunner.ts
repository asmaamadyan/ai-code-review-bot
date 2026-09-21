import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { writePromptLog, type PromptLogStatus } from './promptLogger';
import { parseReviewResponse, type CodeReview } from './reviewSchema';

export type CopilotExecutor = (
  prompt: string,
  timeoutMs: number,
  model: string,
) => Promise<string>;

type RunCopilotOptions = {
  executor?: CopilotExecutor;
  timeoutMs?: number;
  model?: string;
  logFilePath?: string;
};

type CopilotReviewResult = {
  requestId: string;
  review: CodeReview;
};

const maximumOutputSize = 2_000_000;

export const executeCopilot: CopilotExecutor = (prompt, timeoutMs, model) =>
  new Promise((resolve, reject) => {
    const childProcess = spawn(
      'copilot',
      [
        '--silent',
        '--no-ask-user',
        '--no-custom-instructions',
        '--no-color',
        '--no-remote',
        '--no-remote-export',
        `--model=${model}`,
      ],
      {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (callback: () => void): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      callback();
    };

    const timeout = setTimeout(() => {
      childProcess.kill('SIGTERM');

      finish(() => {
        reject(new Error(`Copilot timed out after ${timeoutMs} milliseconds.`));
      });
    }, timeoutMs);

    childProcess.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();

      if (stdout.length > maximumOutputSize) {
        childProcess.kill('SIGTERM');

        finish(() => {
          reject(
            new Error('Copilot response exceeded the maximum allowed size.'),
          );
        });
      }
    });

    childProcess.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    childProcess.once('error', (error) => {
      finish(() => {
        reject(new Error(`Unable to start Copilot CLI: ${error.message}`));
      });
    });

    childProcess.once('close', (exitCode) => {
      finish(() => {
        if (exitCode !== 0) {
          reject(
            new Error(stderr.trim() || `Copilot exited with code ${exitCode}.`),
          );

          return;
        }

        if (!stdout.trim()) {
          reject(new Error('Copilot returned an empty response.'));

          return;
        }

        resolve(stdout.trim());
      });
    });

    // Piping the prompt avoids command-line length limits for large diffs.
    childProcess.stdin.write(prompt);
    childProcess.stdin.end();
  });

export async function runCopilotReview(
  prompt: string,
  options: RunCopilotOptions = {},
): Promise<CopilotReviewResult> {
  const {
    executor = executeCopilot,
    timeoutMs = 120_000,
    model = 'auto',
    logFilePath,
  } = options;

  const requestId = randomUUID();
  const workflowRunId = process.env.GITHUB_RUN_ID ?? 'local-development';

  const startedAt = Date.now();

  let response: string | undefined;
  let status: PromptLogStatus = 'failed';

  try {
    response = await executor(prompt, timeoutMs, model);

    const review = parseReviewResponse(response);

    status = 'success';

    await writePromptLog(
      {
        requestId,
        workflowRunId,
        timestamp: new Date().toISOString(),
        model: `github-copilot-${model}`,
        status,
        durationMs: Date.now() - startedAt,
        prompt,
        response,
      },
      logFilePath,
    );

    return {
      requestId,
      review,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown Copilot error.';

    await writePromptLog(
      {
        requestId,
        workflowRunId,
        timestamp: new Date().toISOString(),
        model: `github-copilot-${model}`,
        status,
        durationMs: Date.now() - startedAt,
        prompt,
        response,
        error: errorMessage,
      },
      logFilePath,
    ).catch(() => undefined);

    throw error;
  }
}
