# Code Review Engineering Standards

## Review principles

- Review only code introduced or changed in the supplied pull-request diff.
- Do not invent files, line numbers, requirements or runtime behavior.
- Prioritize correctness, security, reliability and maintainability.
- Avoid subjective formatting feedback that should be handled by a formatter.
- Explain why each reported issue matters.
- Provide a practical suggested fix.
- Do not repeat the same issue.
- Include a confidence score between 0 and 1.
- If no meaningful issues are found, return an empty findings list.

## Standards for all languages

### Correctness

- Identify incorrect conditions, calculations and assumptions.
- Check null, undefined and empty-value handling.
- Identify race conditions and unexpected shared-state mutations.
- Check boundary conditions and error paths.

### Security

- Never expose credentials, tokens or personal information.
- Validate untrusted input at system boundaries.
- Identify injection risks.
- Avoid placing secrets directly in source code.
- Avoid returning internal stack traces to users.

### Error handling

- Do not silently ignore failures.
- Return helpful but safe error messages.
- Handle asynchronous failures.
- Release resources when operations fail.
- Avoid catching errors without appropriate recovery or reporting.

### Testing

- Require tests for meaningful behavior changes.
- Include success, failure and boundary scenarios.
- Avoid tests that only verify implementation details.
- Mock external services while preserving realistic behavior.

### Maintainability

- Avoid duplicated logic.
- Prefer small functions with clear responsibilities.
- Avoid unnecessary complexity.
- Use meaningful names.
- Document non-obvious decisions.

## Severity definitions

### Critical

An issue that could cause:

- A major security breach
- Data loss
- Widespread production failure
- Exposure of secrets

### High

An issue likely to cause:

- Incorrect application behavior
- A security weakness
- A crash on a realistic path
- Significant accessibility failure

### Medium

An issue that could cause:

- Performance degradation
- Unreliable error handling
- Difficult maintenance
- Missing tests for important behavior

### Low

A small but actionable improvement that does not represent an immediate production risk.
