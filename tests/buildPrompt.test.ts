import { describe, expect, it } from 'vitest';

import { selectRelevantStandards } from '../src/buildPrompt';

const standards = `
# Code Review Engineering Standards

## Review principles

General review rules.

## Standards for all languages

Universal rules.

## TypeScript

TypeScript rules.

## React

React accessibility rules.

## Python

Python rules.

## Java

Java rules.

## Severity definitions

Severity rules.
`;

describe('selectRelevantStandards', () => {
  it('includes general and detected language standards', () => {
    const result = selectRelevantStandards(
      standards,
      ['TypeScript', 'Python'],
      ['src/App.ts', 'server/report.py'],
    );

    expect(result).toContain('General review rules.');
    expect(result).toContain('Universal rules.');
    expect(result).toContain('TypeScript rules.');
    expect(result).toContain('Python rules.');
    expect(result).toContain('Severity rules.');
    expect(result).not.toContain('Java rules.');
  });

  it('includes React standards for TSX files', () => {
    const result = selectRelevantStandards(
      standards,
      ['TypeScript'],
      ['src/App.tsx'],
    );

    expect(result).toContain('React accessibility rules.');
  });

  it('does not include React standards for ordinary TypeScript files', () => {
    const result = selectRelevantStandards(
      standards,
      ['TypeScript'],
      ['src/helper.ts'],
    );

    expect(result).not.toContain('React accessibility rules.');
  });
});
