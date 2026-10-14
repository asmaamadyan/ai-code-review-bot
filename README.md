# AI Code Review Bot

An automated pull-request reviewer that runs GitHub Copilot CLI against the
pull-request diff, validates the response, and posts a structured review as a
pull-request comment.

## What is delivered

- Every Copilot interaction is appended to `logs/prompt-log.jsonl` with a
  request ID, workflow run ID, model, duration, prompt, response or error, and
  status.
- The workflow runs type checking and the full test suite with coverage before
  invoking Copilot.
- CI uploads `logs/prompt-log.jsonl`, `review.md`, and `coverage/` as the
  `ai-code-review-evidence-<run-id>` artifact.
- Copilot output is parsed and validated with Zod before it can be posted.
- Copilot identifies the programming languages from the changed code without a
  predefined language list or repository-provided language standards.
- Failed reviews produce a safe fallback comment, write a non-zero exit code,
  and remain visible in the workflow logs and evidence artifact.

## Local development

Requirements: Node.js 22 or later, npm, and the GitHub Copilot CLI for a live
review run.

```sh
npm ci
npm run typecheck
npm test
npm run coverage
```

The HTML coverage report is written to `coverage/index.html`. The JSONL prompt
log is written to `logs/prompt-log.jsonl` when a review is run.

## Run a local review

Put a pull-request diff in `pull-request.diff`, then run:

```sh
npm run review:local
```

The generated comment is written to `review.md`. Paths and the model can be
overridden with `DIFF_PATH`, `REVIEW_OUTPUT_PATH`, and `COPILOT_MODEL`.

## Production error handling demonstration

This command intentionally exercises the input failure path without calling
Copilot:

```sh
DIFF_PATH=/tmp/missing-pull-request.diff npm run review:local
```

Expected behavior:

- the command exits with status `1`;
- `review.md` is still created with the automated-review failure comment;
- no fabricated review is posted;
- the CI workflow still posts the fallback comment and uploads available
  evidence because the Copilot step uses `continue-on-error: true` and the
  artifact step uses `if: always()`.

For a Copilot-side failure, the same behavior is covered by the timeout and
invalid-response tests in [tests/copilotRunner.test.ts](tests/copilotRunner.test.ts).

## CI workflow

Pull requests from branches in this repository run
[.github/workflows/ai-code-review.yml](.github/workflows/ai-code-review.yml).
Fork pull requests are skipped because the workflow must not execute repository
code with write-capable credentials from an untrusted fork.
