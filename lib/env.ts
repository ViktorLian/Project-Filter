/**
 * Reads an environment variable after removing invisible copy/paste
 * characters and surrounding whitespace.
 *
 * Never logs or exposes the value.
 */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const cleaned = value.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\u2060\uFEFF]/g, '').trim();
  return cleaned || undefined;
}

export function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
