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

/**
 * Stripe secret keys are ASCII tokens. Extracting the token also protects
 * against labels, quotes and Unicode line separators accidentally pasted
 * into the Vercel value.
 */
export function requireStripeSecretKey(): string {
  const raw = process.env.STRIPE_SECRET_KEY || '';
  const match = raw.match(/sk_(?:test|live)_[A-Za-z0-9]+/);
  if (!match) throw new Error('Missing or invalid STRIPE_SECRET_KEY');
  return match[0];
}
