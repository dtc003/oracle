import Anthropic from '@anthropic-ai/sdk';
import {
  RulesetType,
  ExaminationType,
  CaseData,
  WitnessData,
  GeneratedScenario,
  ScriptedQA,
  Objection,
  CounterArgument,
  JudgeRuling,
  TranscriptEntry
} from '../types';
import { getRuleset } from './rules';

// Initialize Anthropic client
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
console.log('Anthropic API Key loaded:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');
console.log('All env vars:', import.meta.env);

const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: For production, use a backend proxy
});

// System prompts for different rulesets
function getSystemPrompt(ruleset: RulesetType): string {
  const rulesetData = getRuleset(ruleset);

  if (ruleset === 'FRE') {
    return `You are a sophisticated AI legal assistant specializing in the Federal Rules of Evidence. You have deep expertise in:
- All Federal Rules of Evidence (FRE), particularly rules 401-403 (Relevance), 602 (Personal Knowledge), 611(c) (Leading Questions), 701 (Lay Opinion), 802-803 (Hearsay), 901 (Authentication), and 1002 (Best Evidence Rule)
- Courtroom procedure and evidentiary arguments
- Professional legal reasoning and argument construction

Available Rules:
${rulesetData.rules.map(r => `Rule ${r.number}: ${r.title}\n${r.text}`).join('\n\n')}

When acting as Examining Counsel, you strategically test the boundaries of evidence rules while maintaining professional conduct.

When acting as Opposing Counsel (counter-arguing), you provide sophisticated, case-specific arguments that:
- Cite specific rule numbers and language
- Address the factual context of the case
- Provide persuasive legal reasoning
- Use professional courtroom language
- Are situationally aware and contextually appropriate

When acting as the Judge, you:
- Weigh both arguments carefully
- Apply the rules correctly to the specific facts
- Provide clear educational justification
- Reference specific rule numbers
- Explain your reasoning in a way that helps users learn`;
  } else {
    return `You are an AI legal assistant specializing in simplified Mock Trial evidence rules. You have expertise in:
- Simplified evidence rules for educational and mock trial purposes
- Basic courtroom procedure
- Clear, accessible legal reasoning

Available Rules:
${rulesetData.rules.map(r => `Rule ${r.number}: ${r.title}\n${r.text}`).join('\n\n')}

When acting as Examining Counsel, you ask questions that test basic evidence rules while keeping complexity manageable.

When acting as Opposing Counsel (counter-arguing), you provide clear, straightforward arguments that:
- Reference the simplified rule numbers
- Explain why the evidence should be admitted
- Use accessible language
- Are appropriate for students and competitors

When acting as the Judge, you:
- Weigh both arguments
- Apply the simplified rules correctly
- Provide clear, educational explanations
- Help users understand the reasoning`;
  }
}

// Generate a dynamic examination question
export async function generateExaminingCounselQuestion(
  caseContext: string,
  witnessContext: string,
  examinationType: ExaminationType,
  ruleset: RulesetType,
  previousTranscript?: TranscriptEntry[]
): Promise<string> {
  const systemPrompt = getSystemPrompt(ruleset);
  const examinationTypeDesc = examinationType === 'DIRECT' ? 'direct examination' : 'cross-examination';

  const prompt = `You are acting as the Examining Counsel in a ${examinationTypeDesc}.

Case Context:
${caseContext}

Witness:
${witnessContext}

${previousTranscript && previousTranscript.length > 0 ? `
Previous Testimony:
${previousTranscript.slice(-5).map(t => `${t.speaker}: ${t.content}`).join('\n')}
` : ''}

Generate ONE ${examinationTypeDesc} question that:
${examinationType === 'DIRECT' ?
  '- Is non-leading (unless appropriate for hostile witness)\n- Elicits narrative testimony\n- May occasionally push boundaries (slightly leading, borderline improper)' :
  '- Is appropriately leading\n- Challenges the witness\n- Tests their testimony'
}
- Is strategic and tests evidence rules
- Fits naturally in the examination flow
- Could potentially trigger an objection

Return ONLY the question itself, nothing else. Do not include "Q:" or any prefix.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 200,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text.trim() : '';
}

// Generate witness response
export async function generateWitnessResponse(
  question: string,
  caseContext: string,
  witnessContext: string,
  ruleset: RulesetType,
  previousTranscript?: TranscriptEntry[]
): Promise<string> {
  const systemPrompt = getSystemPrompt(ruleset);

  const prompt = `You are acting as the Witness testifying in court.

Case Context:
${caseContext}

Your Background:
${witnessContext}

${previousTranscript && previousTranscript.length > 0 ? `
Previous Testimony:
${previousTranscript.slice(-5).map(t => `${t.speaker}: ${t.content}`).join('\n')}
` : ''}

Question asked: "${question}"

Provide a natural witness response that:
- Stays in character based on the witness background
- Answers the question (but not too perfectly)
- May occasionally include objectionable content (hearsay, speculation, lack of personal knowledge)
- Sounds like realistic courtroom testimony
- Is 1-3 sentences

Return ONLY the answer itself, nothing else. Do not include "A:" or any prefix.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text.trim() : '';
}

// Generate counter-argument (CRITICAL for 85% fidelity goal)
export async function generateCounterArgument(
  objection: Objection,
  targetEntry: TranscriptEntry,
  caseContext: string,
  ruleset: RulesetType,
  previousTranscript?: TranscriptEntry[]
): Promise<CounterArgument> {
  const systemPrompt = getSystemPrompt(ruleset);
  const rulesetData = getRuleset(ruleset);

  const prompt = `You are now acting as the Examining Counsel (Opposing Counsel to the objector) responding to an objection.

Case Context:
${caseContext}

${previousTranscript && previousTranscript.length > 0 ? `
Recent Testimony:
${previousTranscript.slice(-5).map(t => `${t.speaker}: ${t.content}`).join('\n')}
` : ''}

The ${targetEntry.type === 'QUESTION' ? 'Question' : 'Answer'} at issue:
"${targetEntry.content}"

Objection Made:
- Objection Name: ${objection.objectionName}
- Grounds: ${objection.grounds}
${objection.ruleText ? `- Rule Text: ${objection.ruleText}` : ''}

You must now argue AGAINST this objection and defend your ${targetEntry.type === 'QUESTION' ? 'question' : 'witness\'s answer'}.

Provide a sophisticated, professional counter-argument that:
1. Directly addresses the objection raised
2. Cites specific rule numbers and legal standards from the ${rulesetData.name}
3. Explains why the ${targetEntry.type === 'QUESTION' ? 'question' : 'answer'} IS admissible under the rules
4. Uses the specific factual context of this case
5. Is persuasive and situationally aware
6. Uses professional courtroom language ("Your Honor, ...")
7. Is 2-4 sentences

This is CRITICAL: Your argument must feel like it comes from a skilled trial attorney. Be specific, cite rules, and make a compelling case.

Return your counter-argument:`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  const argumentText = content.type === 'text' ? content.text.trim() : '';

  // Extract cited rules (simple pattern matching)
  const ruleCitations = argumentText.match(/(?:FRE |Rule |§)?(\d{3}(?:\([a-z]\))?)/gi) || [];

  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    content: argumentText,
    citeRules: ruleCitations
  };
}

// Generate judge ruling (CRITICAL for educational value)
export async function generateJudgeRuling(
  objection: Objection,
  counterArgument: CounterArgument,
  targetEntry: TranscriptEntry,
  caseContext: string,
  ruleset: RulesetType
): Promise<JudgeRuling> {
  const systemPrompt = getSystemPrompt(ruleset);
  const rulesetData = getRuleset(ruleset);

  const prompt = `You are now acting as the Judge presiding over this case.

Case Context:
${caseContext}

The ${targetEntry.type === 'QUESTION' ? 'Question' : 'Answer'} at issue:
"${targetEntry.content}"

Objection:
- ${objection.objectionName}
- Grounds: ${objection.grounds}

Opposing Counsel's Counter-Argument:
"${counterArgument.content}"

You must now rule on this objection.

Analyze both arguments and make a ruling (SUSTAINED or OVERRULED) based on:
1. The applicable rules from the ${rulesetData.name}
2. The specific facts of this case
3. The strength of both arguments
4. Proper application of evidentiary standards

Provide your ruling in this EXACT format:

DECISION: [SUSTAINED or OVERRULED]

JUSTIFICATION: [Your explanation]

Your justification should:
- Be 2-4 sentences
- Reference specific rule numbers
- Explain WHY you made this decision
- Be educational and help the user learn
- Address the key legal issue

This is a teaching moment - make your reasoning clear and instructive.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  const responseText = content.type === 'text' ? content.text.trim() : '';

  // Parse the response
  const decisionMatch = responseText.match(/DECISION:\s*(SUSTAINED|OVERRULED)/i);
  const justificationMatch = responseText.match(/JUSTIFICATION:\s*(.+?)$/is);

  const decision = decisionMatch ? decisionMatch[1].toUpperCase() as 'SUSTAINED' | 'OVERRULED' : 'OVERRULED';
  const justification = justificationMatch ? justificationMatch[1].trim() : responseText;

  // Extract rules applied
  const rulesApplied = justification.match(/(?:FRE |Rule |§)?(\d{3}(?:\([a-z]\))?)/gi) || [];

  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    decision,
    justification,
    rulesApplied
  };
}

// Generate full scenario (Mode C)
export async function generateFullScenario(
  ruleset: RulesetType,
  preferredType?: 'CIVIL' | 'CRIMINAL' | 'RANDOM'
): Promise<GeneratedScenario> {
  const systemPrompt = getSystemPrompt(ruleset);

  const caseTypeInstruction = preferredType === 'RANDOM' || !preferredType
    ? 'Randomly choose between a civil or criminal case.'
    : `Generate a ${preferredType} case.`;

  const prompt = `Generate a complete courtroom scenario for evidence objection practice.

${caseTypeInstruction}

Provide a realistic scenario with:
1. Case type (civil or criminal)
2. Parties involved
3. Claims/charges
4. Key facts (3-5 bullet points)
5. Witness name and role
6. Witness background (1-2 sentences)
7. Brief scenario summary

Return your response in this EXACT JSON format:
{
  "caseType": "CIVIL" or "CRIMINAL",
  "parties": {
    "plaintiff": "name" (if civil),
    "defendant": "name",
    "prosecution": "name" (if criminal)
  },
  "claims": "brief description of claims/charges",
  "keyFacts": "bullet point facts",
  "witness": {
    "name": "witness name",
    "role": "witness role",
    "background": "witness background"
  },
  "scenarioSummary": "1-2 sentence summary"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  const responseText = content.type === 'text' ? content.text.trim() : '{}';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const scenarioData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  const caseData: CaseData = {
    id: crypto.randomUUID(),
    caseType: scenarioData.caseType || 'CIVIL',
    parties: scenarioData.parties || {},
    claims: scenarioData.claims || '',
    keyFacts: scenarioData.keyFacts || '',
    examinationType: 'DIRECT', // Default to direct
    createdAt: new Date(),
    userId: '' // Will be set when saved
  };

  const witness: WitnessData = {
    name: scenarioData.witness?.name || 'Unknown Witness',
    role: scenarioData.witness?.role || 'Witness',
    background: scenarioData.witness?.background || ''
  };

  return {
    id: crypto.randomUUID(),
    caseData,
    witness,
    scenarioSummary: scenarioData.scenarioSummary || '',
    createdAt: new Date()
  };
}

// Parse scripted Q&A
export function parseScript(scriptText: string): ScriptedQA[] {
  const lines = scriptText.split('\n').filter(line => line.trim());
  const qaList: ScriptedQA[] = [];
  let currentQ = '';
  let order = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for Q: or Q. or Question:
    if (/^Q[:.]\s*/i.test(trimmed)) {
      currentQ = trimmed.replace(/^Q[:.]\s*/i, '').trim();
    }
    // Check for A: or A. or Answer:
    else if (/^A[:.]\s*/i.test(trimmed) && currentQ) {
      const answer = trimmed.replace(/^A[:.]\s*/i, '').trim();
      qaList.push({
        id: crypto.randomUUID(),
        question: currentQ,
        answer,
        order: order++
      });
      currentQ = '';
    }
  }

  return qaList;
}
