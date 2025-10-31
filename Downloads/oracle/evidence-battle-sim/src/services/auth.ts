import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserSubscription, UserStats } from '../types';

/**
 * Create a new user with email and password
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    // Create user document in Firestore with free tier
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName || firebaseUser.displayName || undefined,
      subscription: {
        userId: firebaseUser.uid,
        tier: 'FREE',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        battlesUsedThisMonth: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      stats: {
        userId: firebaseUser.uid,
        totalBattles: 0,
        totalObjections: 0,
        sustainedObjections: 0,
        overruledObjections: 0,
        rulesCited: {},
        lastActive: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      'subscription.createdAt': serverTimestamp(),
      'subscription.updatedAt': serverTimestamp(),
      'stats.lastActive': serverTimestamp()
    });

    return newUser;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLoginAt: serverTimestamp()
    });

    // Fetch and return user data
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user can start a new battle based on subscription
 */
export async function canUserStartBattle(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const user = userDoc.data() as User;
    const { subscription } = user;

    // Check subscription status
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    // Free tier: check battle limit
    if (subscription.tier === 'FREE') {
      const limit = 5; // Free tier limit
      if (subscription.battlesUsedThisMonth >= limit) {
        return {
          allowed: false,
          reason: `You've reached your free tier limit of ${limit} battles per month. Upgrade to Pro for unlimited battles!`
        };
      }
    }

    // Pro and Premium have unlimited battles
    return { allowed: true };
  } catch (error) {
    console.error('Error checking battle eligibility:', error);
    return { allowed: false, reason: 'Error checking subscription status' };
  }
}

/**
 * Increment battle usage count for user
 */
export async function incrementBattleUsage(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const user = userDoc.data() as User;
    await updateDoc(userRef, {
      'subscription.battlesUsedThisMonth': user.subscription.battlesUsedThisMonth + 1,
      'subscription.updatedAt': serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing battle usage:', error);
    throw error;
  }
}
