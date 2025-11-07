import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail, tier } = req.body;

    if (!priceId || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe checkout session
    // Allow anonymous users - they'll create account after payment
    const sessionConfig: any = {
      client_reference_id: userId || 'anonymous',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      // Redirect to signup page after payment (not success page)
      success_url: `${req.headers.origin || 'http://localhost:5173'}/signup-after-payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/pricing`,
      metadata: {
        userId: userId || 'anonymous',
        tier
      }
    };

    // Only add customer_email if user is logged in
    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
