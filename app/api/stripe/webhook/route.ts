// Keep the legacy Stripe endpoint working, but use the single canonical handler.
export { dynamic, POST } from '../../webhooks/stripe/route';
