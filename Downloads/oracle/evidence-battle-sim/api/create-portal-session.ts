import Stripe from 'stripe';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get user's Stripe customer ID from Firestore
    // Note: You'll need to initialize Firebase admin here
    // For now, we'll return an error if no customer ID is found

    // TODO: Fetch user data from Firestore to get stripeCustomerId
    // const userDoc = await getDoc(doc(db, 'users', userId));
    // const stripeCustomerId = userDoc.data()?.subscription?.stripeCustomerId;

    // For now, return error - this needs Firebase Admin setup
    return res.status(400).json({
      error: 'Customer portal requires Stripe customer ID. Please contact support.'
    });

    // Once you have the customer ID:
    // const session = await stripe.billingPortal.sessions.create({
    //   customer: stripeCustomerId,
    //   return_url: `${req.headers.origin || 'http://localhost:5173'}/account`
    // });
    //
    // res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
}
