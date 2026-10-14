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
