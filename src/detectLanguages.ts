export const supportedLanguages = {
  TypeScript: ['.ts', '.tsx'],
  JavaScript: ['.js', '.jsx'],
  Python: ['.py'],
  Java: ['.java'],
  'C#': ['.cs'],
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

export function extractChangedFiles(diff: string): string[] {
  const files = new Set<string>();

  for (const line of diff.split('\n')) {
    const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);

    if (match?.[2]) {
      files.add(match[2]);
    }
  }

  return [...files];
}

export function detectLanguages(diff: string): SupportedLanguage[] {
  const changedFiles = extractChangedFiles(diff);
  const detectedLanguages = new Set<SupportedLanguage>();

  for (const file of changedFiles) {
    for (const [language, extensions] of Object.entries(supportedLanguages) as [
      SupportedLanguage,
      readonly string[],
    ][]) {
      if (extensions.some((extension) => file.endsWith(extension))) {
        detectedLanguages.add(language);
      }
    }
  }

  return [...detectedLanguages];
}
