import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { plan, userId, userEmail, interval = 'month' } = await req.json();

        if (!plan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Define monthly prices in cents (MYR)
        const basePrices: Record<string, number> = {
            starter: 19900,   // RM 199.00
            growth: 59900,    // RM 599.00
            pro_firm: 149900, // RM 1,499.00
        };

        if (basePrices[plan] === undefined) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Calculate amount based on interval (Annual gives 2 months free = 10x monthly price)
        const unitAmount = interval === 'year'
            ? basePrices[plan] * 10
            : basePrices[plan];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // 14-day trial requires card info upfront
            line_items: [
                {
                    price_data: {
                        currency: 'myr',
                        product_data: {
                            name: `${plan.toUpperCase()} Plan Subscription`,
                            description: `Professional legal suite access for ${plan} tier. 14-day free trial included.`,
                        },
                        unit_amount: unitAmount,
                        recurring: {
                            interval: interval === 'year' ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: 14,
            },
            phone_number_collection: {
                enabled: true,
            },
            billing_address_collection: 'required',
            success_url: userId
                ? `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`
                : `${req.headers.get('origin')}/register?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&interval=${interval}`,
            cancel_url: `${req.headers.get('origin')}/pricing`,
            customer_email: userEmail || undefined,
            metadata: {
                userId: userId,
                plan: plan,
                interval: interval,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
