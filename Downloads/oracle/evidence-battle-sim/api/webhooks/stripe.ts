import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

const db = admin.firestore();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && session.customer && tier) {
          // Update user's subscription in Firestore
          await db.collection('users').doc(userId).update({
            'subscription.stripeCustomerId': session.customer,
            'subscription.stripeSubscriptionId': session.subscription || null,
            'subscription.tier': tier,
            'subscription.status': 'ACTIVE',
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`Subscription updated for user ${userId} to tier ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId and update subscription status
        const usersSnapshot = await db.collection('users')
          .where('subscription.stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            'subscription.status': subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Subscription updated for customer ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user and set subscription to CANCELED
        const usersSnapshot = await db.collection('users')
          .where('subscription.stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            'subscription.tier': 'FREE',
            'subscription.status': 'CANCELED',
            'subscription.cancelAtPeriodEnd': false,
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Subscription canceled for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and set subscription to PAST_DUE
        const usersSnapshot = await db.collection('users')
          .where('subscription.stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            'subscription.status': 'PAST_DUE',
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Payment failed for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
}
