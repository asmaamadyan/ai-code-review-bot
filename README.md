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
  predefined language list, then applies the general repository engineering
  standards.
- Review failures produce a safe fallback comment, and failures before review
  generation produce a prominent comment linking directly to the failed
  workflow run. Errors remain visible in the workflow logs and evidence
  artifact.

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

## Language detection demonstration

[examples/](examples) contains intentionally flawed files in five languages,
and [examples/diffs/multi-language.diff](examples/diffs/multi-language.diff) is
a ready-made diff covering all of them:

| Example file | Language |
| --- | --- |
| [examples/DemoComponent.tsx](examples/DemoComponent.tsx) | TypeScript / React |
| [examples/report.py](examples/report.py) | Python |
| [examples/OrderService.java](examples/OrderService.java) | Java |
| [examples/inventory.go](examples/inventory.go) | Go |
| [examples/schema.sql](examples/schema.sql) | SQL |

Run a full review against that diff:

```sh
DIFF_PATH=examples/diffs/multi-language.diff npm run review:local
```

Expected behavior: all five paths are listed under `Changed files:` in the
prompt, and Copilot reports the language it detected for each finding in
`review.md`, without a predefined language list.

Regenerate the diff after changing an example file:

```sh
: > examples/diffs/multi-language.diff
for file in examples/DemoComponent.tsx examples/report.py \
  examples/OrderService.java examples/inventory.go examples/schema.sql; do
  git diff --no-index -- /dev/null "$file" >> examples/diffs/multi-language.diff
done
```

[examples/diffs/no-file-headers.diff](examples/diffs/no-file-headers.diff)
covers the detection edge case where a diff has hunks but no
`diff --git` headers, so no changed file is detected and the prompt lists no
files.

## Production error handling demonstration

These commands intentionally exercise the input failure paths without a
successful Copilot call:

```sh
DIFF_PATH=/tmp/missing-pull-request.diff npm run review:local
DIFF_PATH=examples/diffs/empty.diff npm run review:local
```

Expected error messages on standard error:

| Demo input | Error message |
| --- | --- |
| Missing diff file | `AI code review failed: ENOENT: no such file or directory, open '…'` |
| [examples/diffs/empty.diff](examples/diffs/empty.diff) (whitespace only) | `AI code review failed: The pull-request diff is empty.` |
| Diff larger than 200000 characters | `AI code review failed: The pull-request diff exceeds 200000 characters.` |
| Copilot CLI not authenticated or missing | `AI code review failed: …` with the Copilot CLI error text |

Build the oversized-diff input with:

```sh
{ printf 'diff --git a/examples/huge.ts b/examples/huge.ts\n+'; \
  head -c 200001 /dev/zero | tr '\0' 'x'; printf '\n'; } > /tmp/oversized.diff
DIFF_PATH=/tmp/oversized.diff npm run review:local
```

In every case:

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
