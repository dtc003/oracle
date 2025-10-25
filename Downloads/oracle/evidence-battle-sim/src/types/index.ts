// Ruleset types
export type RulesetType = 'FRE' | 'MOCK_TRIAL';

export interface Rule {
  number: string;
  title: string;
  text: string;
  commonObjections: string[];
}

export interface Ruleset {
  type: RulesetType;
  name: string;
  description: string;
  rules: Rule[];
}

// Examination modes
export type ExaminationMode = 'SCRIPTED' | 'CASE_BASED' | 'AI_GENERATED';
export type ExaminationType = 'DIRECT' | 'CROSS';
export type CaseType = 'CIVIL' | 'CRIMINAL';

// Courtroom roles
export type CourtRole = 'EXAMINING_COUNSEL' | 'WITNESS' | 'OPPOSING_COUNSEL' | 'JUDGE';

// Transcript and dialogue
export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  role: CourtRole;
  speaker: string; // "Examining Counsel", "Witness", "You (Opposing Counsel)", "Judge"
  content: string;
  type: 'QUESTION' | 'ANSWER' | 'OBJECTION' | 'ARGUMENT' | 'RULING' | 'STATEMENT';
}

// Objection flow
export type ObjectionState = 'NONE' | 'OBJECTION_MADE' | 'ARGUING' | 'RULED';

export interface Objection {
  id: string;
  timestamp: Date;
  objectionName: string; // "Hearsay", "Leading", "Relevance", etc.
  grounds: string; // "FRE 802", "FRE 611(c)", etc.
  ruleText?: string;
  targetEntryId: string; // Which question/answer triggered this objection
}

export interface CounterArgument {
  id: string;
  timestamp: Date;
  content: string; // AI's counter-argument as examining counsel
  citeRules?: string[];
}

export interface Rebuttal {
  id: string;
  timestamp: Date;
  content: string; // User's rebuttal to counter-argument
}

export interface JudgeRuling {
  id: string;
  timestamp: Date;
  decision: 'SUSTAINED' | 'OVERRULED';
  justification: string;
  rulesApplied: string[];
}

export interface ObjectionBattle {
  objection: Objection;
  counterArgument: CounterArgument;
  rebuttal?: Rebuttal; // Optional user rebuttal
  ruling: JudgeRuling;
}

// Case and scenario data
export interface CaseData {
  id: string;
  caseType: CaseType;
  parties: {
    plaintiff?: string;
    defendant?: string;
    prosecution?: string;
  };
  claims: string;
  keyFacts: string;
  examinationType: ExaminationType;
  createdAt: Date;
  userId: string;
}

export interface WitnessData {
  name: string;
  role: string; // "Plaintiff", "Defendant", "Expert", "Eyewitness", etc.
  background: string;
}

export interface GeneratedScenario {
  id: string;
  caseData: CaseData;
  witness: WitnessData;
  scenarioSummary: string;
  createdAt: Date;
}

// Scripted examination
export interface ScriptedQA {
  id: string;
  question: string;
  answer: string;
  order: number;
}

// Battle session state
export interface BattleSession {
  id: string;
  userId: string;
  mode: ExaminationMode;
  ruleset: RulesetType;
  startTime: Date;
  endTime?: Date;

  // Mode-specific data
  caseData?: CaseData;
  scenario?: GeneratedScenario;
  script?: ScriptedQA[];

  // Session data
  transcript: TranscriptEntry[];
  objectionBattles: ObjectionBattle[];
  currentState: ObjectionState;

  // Metadata
  isActive: boolean;
  completionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

// User stats and performance
export interface UserStats {
  userId: string;
  totalBattles: number;
  totalObjections: number;
  sustainedObjections: number;
  overruledObjections: number;
  rulesCited: Record<string, number>; // rule number -> count
  averageArgumentQuality?: number;
  lastActive: Date;
}

// Subscription and payment types
export type SubscriptionTier = 'FREE' | 'PRO' | 'PREMIUM';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INACTIVE';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // in cents
  interval: 'month' | 'year';
  features: string[];
  battlesPerMonth: number | null; // null = unlimited
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  battlesUsedThisMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription: UserSubscription;
  stats: UserStats;
  createdAt: Date;
  lastLoginAt: Date;
}

// Configuration for different modes
export interface ScriptedModeConfig {
  script: string; // Raw pasted script
}

export interface CaseBasedModeConfig {
  caseType: CaseType;
  parties: {
    plaintiff?: string;
    defendant?: string;
    prosecution?: string;
  };
  claims: string;
  keyFacts: string;
  examinationType: ExaminationType;
}

export interface AIGeneratedModeConfig {
  // No config needed - AI generates everything
  preferredScenarioType?: 'CIVIL' | 'CRIMINAL' | 'RANDOM';
}
