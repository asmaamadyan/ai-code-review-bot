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

## TypeScript and JavaScript

- Avoid unnecessary `any` types.
- Validate API input at the backend boundary.
- Await asynchronous operations or intentionally handle their promises.
- Avoid unsafe type assertions.
- Do not mutate values that should remain immutable.
- Clean up subscriptions, timers and observers.
- Avoid unsafe or unnecessarily complex regular expressions.

## React

- Check hook dependency arrays.
- Identify expensive work performed during every render.
- Avoid unnecessary state when a value can be derived.
- Clean up effects that create subscriptions, timers or observers.
- Use stable keys for rendered lists.
- Provide accessible labels for interactive controls.
- Ensure interactive elements work with a keyboard.
- Maintain a logical heading hierarchy.
- Avoid multiple primary H1 headings on the same page.

## Python

- Avoid mutable default arguments.
- Use specific exception types.
- Do not use bare `except` statements.
- Use context managers for files and managed resources.
- Avoid blocking operations inside asynchronous functions.
- Validate external input.
- Avoid global mutable state.

## Java

- Handle nullable values explicitly.
- Close resources safely.
- Avoid catching overly broad exceptions.
- Validate request data at controller boundaries.
- Avoid unsafe shared mutable state.
- Use suitable collection types.
- Avoid blocking calls inside asynchronous operations.

## C#

- Respect nullable reference types.
- Dispose managed resources using `using`.
- Avoid `.Result` and `.Wait()` on asynchronous operations.
- Validate request models.
- Pass cancellation tokens through asynchronous operations.
- Avoid catching `Exception` unless it is logged or correctly translated.
- Avoid unsafe shared mutable state.

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
