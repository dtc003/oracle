import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Return session details
    res.status(200).json({
      tier: session.metadata?.tier,
      email: session.customer_email,
      customerId: session.customer,
      subscriptionId: session.subscription,
      status: session.payment_status
    });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve session' });
  }
}
