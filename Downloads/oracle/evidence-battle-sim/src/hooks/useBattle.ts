import { useState, useCallback } from 'react';
import {
  BattleSession,
  ExaminationMode,
  RulesetType,
  ObjectionState,
  TranscriptEntry,
  ObjectionBattle,
  ScriptedQA,
  CaseData,
  GeneratedScenario,
  Objection,
  CounterArgument,
  JudgeRuling,
  CourtRole
} from '../types';
import {
  generateExaminingCounselQuestion,
  generateWitnessResponse,
  generateCounterArgument,
  generateJudgeRuling
} from '../services/ai';

export function useBattle() {
  const [session, setSession] = useState<BattleSession | null>(null);
  const [currentObjection, setCurrentObjection] = useState<Objection | null>(null);
  const [currentCounter, setCurrentCounter] = useState<CounterArgument | null>(null);
  const [currentRuling, setCurrentRuling] = useState<JudgeRuling | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);

  const startBattle = useCallback((
    mode: ExaminationMode,
    ruleset: RulesetType,
    config: {
      script?: ScriptedQA[];
      caseData?: CaseData;
      scenario?: GeneratedScenario;
    }
  ) => {
    const newSession: BattleSession = {
      id: crypto.randomUUID(),
      userId: 'anonymous', // Will be updated with actual user ID
      mode,
      ruleset,
      startTime: new Date(),
      transcript: [],
      objectionBattles: [],
      currentState: 'NONE',
      isActive: true,
      completionStatus: 'IN_PROGRESS',
      ...config
    };

    setSession(newSession);
    setScriptIndex(0);
    setCurrentObjection(null);
    setCurrentCounter(null);
    setCurrentRuling(null);
  }, []);

  const addTranscriptEntry = useCallback((
    role: CourtRole,
    speaker: string,
    content: string,
    type: TranscriptEntry['type']
  ) => {
    if (!session) return;

    const entry: TranscriptEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      role,
      speaker,
      content,
      type
    };

    setSession(prev => prev ? {
      ...prev,
      transcript: [...prev.transcript, entry]
    } : null);

    return entry;
  }, [session]);

  const continueExamination = useCallback(async () => {
    if (!session || isProcessing) return;

    setIsProcessing(true);

    try {
      if (session.mode === 'SCRIPTED' && session.script) {
        // Scripted mode: execute next Q&A from script
        if (scriptIndex < session.script.length) {
          const qa = session.script[scriptIndex];

          // Add question
          addTranscriptEntry(
            'EXAMINING_COUNSEL',
            'Examining Counsel',
            qa.question,
            'QUESTION'
          );

          // Wait a bit for realism
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Add answer
          addTranscriptEntry(
            'WITNESS',
            'Witness',
            qa.answer,
            'ANSWER'
          );

          setScriptIndex(prev => prev + 1);
        }
      } else {
        // Dynamic modes: AI generates Q&A
        const caseContext = session.scenario?.scenarioSummary ||
          `${session.caseData?.caseType} case: ${session.caseData?.claims}. Facts: ${session.caseData?.keyFacts}`;

        const witnessContext = session.scenario?.witness
          ? `${session.scenario.witness.name}, ${session.scenario.witness.role}. ${session.scenario.witness.background}`
          : 'Witness';

        // Generate question
        const question = await generateExaminingCounselQuestion(
          caseContext,
          witnessContext,
          session.caseData?.examinationType || 'DIRECT',
          session.ruleset,
          session.transcript
        );

        addTranscriptEntry(
          'EXAMINING_COUNSEL',
          'Examining Counsel',
          question,
          'QUESTION'
        );

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate answer
        const answer = await generateWitnessResponse(
          question,
          caseContext,
          witnessContext,
          session.ruleset,
          session.transcript
        );

        addTranscriptEntry(
          'WITNESS',
          'Witness',
          answer,
          'ANSWER'
        );
      }

      // Update state to allow objection
      setSession(prev => prev ? { ...prev, currentState: 'NONE' } : null);
    } catch (error) {
      console.error('Error continuing examination:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [session, isProcessing, scriptIndex, addTranscriptEntry]);

  const makeObjection = useCallback((objectionName: string, grounds: string) => {
    if (!session || session.transcript.length === 0) return;

    // Find the last question or answer to object to
    const targetEntry = [...session.transcript]
      .reverse()
      .find(e => e.type === 'QUESTION' || e.type === 'ANSWER');

    if (!targetEntry) return;

    const objection: Objection = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      objectionName,
      grounds,
      targetEntryId: targetEntry.id
    };

    setCurrentObjection(objection);

    addTranscriptEntry(
      'OPPOSING_COUNSEL',
      'You (Opposing Counsel)',
      `Objection! ${objectionName}. ${grounds}`,
      'OBJECTION'
    );

    setSession(prev => prev ? { ...prev, currentState: 'OBJECTION_MADE' } : null);
  }, [session, addTranscriptEntry]);

  const processObjection = useCallback(async () => {
    if (!session || !currentObjection || isProcessing) return;

    setIsProcessing(true);
    setSession(prev => prev ? { ...prev, currentState: 'ARGUING' } : null);

    try {
      // Find the target entry
      const targetEntry = session.transcript.find(e => e.id === currentObjection.targetEntryId);
      if (!targetEntry) return;

      const caseContext = session.scenario?.scenarioSummary ||
        `${session.caseData?.caseType} case: ${session.caseData?.claims}. Facts: ${session.caseData?.keyFacts}`;

      // Generate counter-argument
      const counter = await generateCounterArgument(
        currentObjection,
        targetEntry,
        caseContext,
        session.ruleset,
        session.transcript
      );

      setCurrentCounter(counter);

      addTranscriptEntry(
        'EXAMINING_COUNSEL',
        'Examining Counsel',
        counter.content,
        'ARGUMENT'
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate judge ruling
      const ruling = await generateJudgeRuling(
        currentObjection,
        counter,
        targetEntry,
        caseContext,
        session.ruleset
      );

      setCurrentRuling(ruling);

      addTranscriptEntry(
        'JUDGE',
        'The Court',
        `${ruling.decision}. ${ruling.justification}`,
        'RULING'
      );

      // Add to objection battles
      const battle: ObjectionBattle = {
        objection: currentObjection,
        counterArgument: counter,
        ruling
      };

      setSession(prev => prev ? {
        ...prev,
        objectionBattles: [...prev.objectionBattles, battle],
        currentState: 'RULED'
      } : null);
    } catch (error) {
      console.error('Error processing objection:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [session, currentObjection, isProcessing, addTranscriptEntry]);

  const continueAfterRuling = useCallback(() => {
    setCurrentObjection(null);
    setCurrentCounter(null);
    setCurrentRuling(null);
    setSession(prev => prev ? { ...prev, currentState: 'NONE' } : null);
  }, []);

  const endBattle = useCallback(() => {
    setSession(prev => prev ? {
      ...prev,
      endTime: new Date(),
      isActive: false,
      completionStatus: 'COMPLETED'
    } : null);
  }, []);

  return {
    session,
    currentObjection,
    currentCounter,
    currentRuling,
    isProcessing,
    startBattle,
    continueExamination,
    makeObjection,
    processObjection,
    continueAfterRuling,
    endBattle
  };
}
