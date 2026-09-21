import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildReviewPrompt } from './buildPrompt';
import { runCopilotReview } from './copilotRunner';
import { formatReviewComment } from './formatReview';

const maximumDiffSize = 200_000;

function createFailureComment(): string {
  return `
<!-- ai-code-review-bot -->

## 🤖 AI Code Review

⚠️ The automated review could not be completed.

The pull-request code has not been changed. Check the GitHub Actions logs and prompt-log artifact for more information, then retry the workflow.

---

<sub>AI feedback is supplementary and does not replace human review.</sub>
`.trim();
}

async function main(): Promise<void> {
  const diffPath = path.resolve(process.env.DIFF_PATH ?? 'pull-request.diff');

  const reviewOutputPath = path.resolve(
    process.env.REVIEW_OUTPUT_PATH ?? 'review.md',
  );

  try {
    const diff = await readFile(diffPath, 'utf8');

    if (!diff.trim()) {
      throw new Error('The pull-request diff is empty.');
    }

    if (diff.length > maximumDiffSize) {
      throw new Error(
        `The pull-request diff exceeds ${maximumDiffSize} characters.`,
      );
    }

    const prompt = await buildReviewPrompt(diff);

    const result = await runCopilotReview(prompt, {
      model: process.env.COPILOT_MODEL ?? 'auto',
      timeoutMs: 120_000,
    });

    const reviewComment = formatReviewComment(result.review, result.requestId);

    await mkdir(path.dirname(reviewOutputPath), {
      recursive: true,
    });

    await writeFile(reviewOutputPath, `${reviewComment}\n`, 'utf8');

    console.log(
      `Review completed successfully. Request ID: ${result.requestId}`,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown code-review error.';

    console.error(`AI code review failed: ${errorMessage}`);

    await mkdir(path.dirname(reviewOutputPath), {
      recursive: true,
    });

    await writeFile(reviewOutputPath, `${createFailureComment()}\n`, 'utf8');

    process.exitCode = 1;
  }
}

await main();
