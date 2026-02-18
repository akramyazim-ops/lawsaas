import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        if (userId && plan) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    plan: plan,
                    billing_interval: session.metadata.interval || 'month'
                })
                .eq('id', userId);

            if (error) {
                console.error('Error updating profile:', error);
                return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
