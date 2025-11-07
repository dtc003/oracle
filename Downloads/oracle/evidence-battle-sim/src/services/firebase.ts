import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { BattleSession, CaseData, UserStats } from '../types';

// Firebase configuration (loaded from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log config to verify environment variables are loaded (only in dev)
if (import.meta.env.DEV) {
  console.log('Firebase config loaded:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  });
}

// Verify all required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing Firebase configuration:', {
    apiKey: firebaseConfig.apiKey ? 'present' : 'MISSING',
    authDomain: firebaseConfig.authDomain ? 'present' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'present' : 'MISSING'
  });
  throw new Error('Firebase configuration is incomplete. Please check environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collections
const COLLECTIONS = {
  USERS: 'users',
  BATTLE_SESSIONS: 'battleSessions',
  CASE_DATA: 'caseData',
  USER_STATS: 'userStats'
};

// Authentication helpers
export async function signInAnonymousUser(): Promise<User> {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Case Data operations
export async function saveCaseData(userId: string, caseData: Omit<CaseData, 'id'>): Promise<string> {
  const caseRef = doc(collection(db, COLLECTIONS.CASE_DATA));
  const caseId = caseRef.id;

  const caseWithId: CaseData = {
    ...caseData,
    id: caseId,
    userId,
    createdAt: caseData.createdAt || new Date()
  };

  await setDoc(caseRef, {
    ...caseWithId,
    createdAt: Timestamp.fromDate(caseWithId.createdAt)
  });

  return caseId;
}

export async function getCaseData(caseId: string): Promise<CaseData | null> {
  const caseRef = doc(db, COLLECTIONS.CASE_DATA, caseId);
  const caseSnap = await getDoc(caseRef);

  if (!caseSnap.exists()) {
    return null;
  }

  const data = caseSnap.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate()
  } as CaseData;
}

export async function getUserCases(userId: string): Promise<CaseData[]> {
  const casesQuery = query(
    collection(db, COLLECTIONS.CASE_DATA),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(casesQuery);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate()
    } as CaseData;
  });
}

// Battle Session operations
export async function saveBattleSession(session: BattleSession): Promise<void> {
  const sessionRef = doc(db, COLLECTIONS.BATTLE_SESSIONS, session.id);

  const sessionData = {
    ...session,
    startTime: Timestamp.fromDate(session.startTime),
    endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null,
    transcript: session.transcript.map(entry => ({
      ...entry,
      timestamp: Timestamp.fromDate(entry.timestamp)
    })),
    objectionBattles: session.objectionBattles.map(battle => ({
      objection: {
        ...battle.objection,
        timestamp: Timestamp.fromDate(battle.objection.timestamp)
      },
      counterArgument: {
        ...battle.counterArgument,
        timestamp: Timestamp.fromDate(battle.counterArgument.timestamp)
      },
      ruling: {
        ...battle.ruling,
        timestamp: Timestamp.fromDate(battle.ruling.timestamp)
      }
    })),
    caseData: session.caseData ? {
      ...session.caseData,
      createdAt: Timestamp.fromDate(session.caseData.createdAt)
    } : null,
    scenario: session.scenario ? {
      ...session.scenario,
      createdAt: Timestamp.fromDate(session.scenario.createdAt),
      caseData: {
        ...session.scenario.caseData,
        createdAt: Timestamp.fromDate(session.scenario.caseData.createdAt)
      }
    } : null
  };

  await setDoc(sessionRef, sessionData);
}

export async function getBattleSession(sessionId: string): Promise<BattleSession | null> {
  const sessionRef = doc(db, COLLECTIONS.BATTLE_SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return null;
  }

  const data = sessionSnap.data();
  return {
    ...data,
    startTime: data.startTime.toDate(),
    endTime: data.endTime ? data.endTime.toDate() : undefined,
    transcript: data.transcript.map((entry: any) => ({
      ...entry,
      timestamp: entry.timestamp.toDate()
    })),
    objectionBattles: data.objectionBattles.map((battle: any) => ({
      objection: {
        ...battle.objection,
        timestamp: battle.objection.timestamp.toDate()
      },
      counterArgument: {
        ...battle.counterArgument,
        timestamp: battle.counterArgument.timestamp.toDate()
      },
      ruling: {
        ...battle.ruling,
        timestamp: battle.ruling.timestamp.toDate()
      }
    })),
    caseData: data.caseData ? {
      ...data.caseData,
      createdAt: data.caseData.createdAt.toDate()
    } : undefined,
    scenario: data.scenario ? {
      ...data.scenario,
      createdAt: data.scenario.createdAt.toDate(),
      caseData: {
        ...data.scenario.caseData,
        createdAt: data.scenario.caseData.createdAt.toDate()
      }
    } : undefined
  } as BattleSession;
}

export async function getUserBattleSessions(userId: string): Promise<BattleSession[]> {
  const sessionsQuery = query(
    collection(db, COLLECTIONS.BATTLE_SESSIONS),
    where('userId', '==', userId),
    orderBy('startTime', 'desc')
  );

  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      startTime: data.startTime.toDate(),
      endTime: data.endTime ? data.endTime.toDate() : undefined,
      transcript: data.transcript.map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp.toDate()
      })),
      objectionBattles: data.objectionBattles.map((battle: any) => ({
        objection: {
          ...battle.objection,
          timestamp: battle.objection.timestamp.toDate()
        },
        counterArgument: {
          ...battle.counterArgument,
          timestamp: battle.counterArgument.timestamp.toDate()
        },
        ruling: {
          ...battle.ruling,
          timestamp: battle.ruling.timestamp.toDate()
        }
      })),
      caseData: data.caseData ? {
        ...data.caseData,
        createdAt: data.caseData.createdAt.toDate()
      } : undefined,
      scenario: data.scenario ? {
        ...data.scenario,
        createdAt: data.scenario.createdAt.toDate(),
        caseData: {
          ...data.scenario.caseData,
          createdAt: data.scenario.caseData.createdAt.toDate()
        }
      } : undefined
    } as BattleSession;
  });
}

// User Stats operations
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const statsRef = doc(db, COLLECTIONS.USER_STATS, userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    return null;
  }

  const data = statsSnap.data();
  return {
    ...data,
    lastActive: data.lastActive.toDate()
  } as UserStats;
}

export async function updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
  const statsRef = doc(db, COLLECTIONS.USER_STATS, userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    // Create new stats document
    const newStats: UserStats = {
      userId,
      totalBattles: 0,
      totalObjections: 0,
      sustainedObjections: 0,
      overruledObjections: 0,
      rulesCited: {},
      lastActive: new Date(),
      ...stats
    };

    await setDoc(statsRef, {
      ...newStats,
      lastActive: Timestamp.fromDate(newStats.lastActive)
    });
  } else {
    // Update existing stats
    const updateData: any = { ...stats };
    if (stats.lastActive) {
      updateData.lastActive = Timestamp.fromDate(stats.lastActive);
    }
    await updateDoc(statsRef, updateData);
  }
}

export async function incrementUserStats(
  userId: string,
  field: keyof Omit<UserStats, 'userId' | 'rulesCited' | 'lastActive'>,
  amount: number = 1
): Promise<void> {
  const statsRef = doc(db, COLLECTIONS.USER_STATS, userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    await updateUserStats(userId, {
      [field]: amount,
      lastActive: new Date()
    });
  } else {
    const currentStats = statsSnap.data() as UserStats;
    await updateDoc(statsRef, {
      [field]: (currentStats[field] as number || 0) + amount,
      lastActive: Timestamp.fromDate(new Date())
    });
  }
}

export async function incrementRuleCitation(userId: string, ruleNumber: string): Promise<void> {
  const statsRef = doc(db, COLLECTIONS.USER_STATS, userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    await updateUserStats(userId, {
      rulesCited: { [ruleNumber]: 1 },
      lastActive: new Date()
    });
  } else {
    const currentStats = statsSnap.data() as UserStats;
    const rulesCited = currentStats.rulesCited || {};
    rulesCited[ruleNumber] = (rulesCited[ruleNumber] || 0) + 1;

    await updateDoc(statsRef, {
      rulesCited,
      lastActive: Timestamp.fromDate(new Date())
    });
  }
}
