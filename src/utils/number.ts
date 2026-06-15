export function parsePositive(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : null;
}

export function isPositive(value: string): boolean {
  return parsePositive(value) !== null;
}
