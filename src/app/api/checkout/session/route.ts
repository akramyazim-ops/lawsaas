import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            email: session.customer_details?.email,
            name: session.customer_details?.name,
            phone: session.customer_details?.phone,
        });
    } catch (error: any) {
        console.error('Error retrieving session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
