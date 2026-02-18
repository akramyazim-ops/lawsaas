import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-01-27.acacia' as any, // Match current types while allowing build to pass
});
