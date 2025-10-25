import { Rule, Ruleset, RulesetType } from '../types';

// Federal Rules of Evidence
const freRules: Rule[] = [
  {
    number: '401',
    title: 'Test for Relevant Evidence',
    text: 'Evidence is relevant if: (a) it has any tendency to make a fact more or less probable than it would be without the evidence; and (b) the fact is of consequence in determining the action.',
    commonObjections: ['Irrelevant', 'Not Relevant', 'Lacks Relevance']
  },
  {
    number: '402',
    title: 'General Admissibility of Relevant Evidence',
    text: 'Relevant evidence is admissible unless any of the following provides otherwise: the United States Constitution; a federal statute; these rules; or other rules prescribed by the Supreme Court. Irrelevant evidence is not admissible.',
    commonObjections: ['Irrelevant', 'Inadmissible']
  },
  {
    number: '403',
    title: 'Excluding Relevant Evidence for Prejudice, Confusion, or Other Reasons',
    text: 'The court may exclude relevant evidence if its probative value is substantially outweighed by a danger of one or more of the following: unfair prejudice, confusing the issues, misleading the jury, undue delay, wasting time, or needlessly presenting cumulative evidence.',
    commonObjections: ['Unfairly Prejudicial', 'More Prejudicial than Probative', 'Waste of Time']
  },
  {
    number: '602',
    title: 'Need for Personal Knowledge',
    text: 'A witness may testify to a matter only if evidence is introduced sufficient to support a finding that the witness has personal knowledge of the matter. Evidence to prove personal knowledge may consist of the witness\'s own testimony. This rule does not apply to a witness\'s expert testimony under Rule 703.',
    commonObjections: ['Lacks Personal Knowledge', 'No Foundation', 'Speculation']
  },
  {
    number: '611(c)',
    title: 'Leading Questions',
    text: 'Leading questions should not be used on direct examination except as necessary to develop the witness\'s testimony. Ordinarily, the court should allow leading questions: (1) on cross-examination; and (2) when a party calls a hostile witness, an adverse party, or a witness identified with an adverse party.',
    commonObjections: ['Leading', 'Leading Question on Direct']
  },
  {
    number: '701',
    title: 'Opinion Testimony by Lay Witnesses',
    text: 'If a witness is not testifying as an expert, testimony in the form of an opinion is limited to one that is: (a) rationally based on the witness\'s perception; (b) helpful to clearly understanding the witness\'s testimony or to determining a fact in issue; and (c) not based on scientific, technical, or other specialized knowledge within the scope of Rule 702.',
    commonObjections: ['Improper Lay Opinion', 'Calls for Speculation', 'Opinion Not Rationally Based']
  },
  {
    number: '802',
    title: 'The Rule Against Hearsay',
    text: 'Hearsay is not admissible unless any of the following provides otherwise: a federal statute; these rules; or other rules prescribed by the Supreme Court. Hearsay is a statement that: (1) the declarant does not make while testifying at the current trial or hearing; and (2) a party offers in evidence to prove the truth of the matter asserted in the statement.',
    commonObjections: ['Hearsay', 'Inadmissible Hearsay']
  },
  {
    number: '803',
    title: 'Exceptions to the Rule Against Hearsay',
    text: 'The following are not excluded by the rule against hearsay, regardless of whether the declarant is available as a witness: present sense impression, excited utterance, then-existing mental/emotional/physical condition, statement made for medical diagnosis or treatment, recorded recollection, records of regularly conducted activity (business records), public records, and others.',
    commonObjections: ['Hearsay (no exception applies)', 'Does Not Qualify for Exception']
  },
  {
    number: '901',
    title: 'Authenticating or Identifying Evidence',
    text: 'To satisfy the requirement of authenticating or identifying an item of evidence, the proponent must produce evidence sufficient to support a finding that the item is what the proponent claims it is.',
    commonObjections: ['Lack of Authentication', 'Not Authenticated', 'Lack of Foundation']
  },
  {
    number: '1002',
    title: 'Requirement of the Original (Best Evidence Rule)',
    text: 'An original writing, recording, or photograph is required in order to prove its content unless these rules or a federal statute provides otherwise.',
    commonObjections: ['Best Evidence Rule', 'Original Required', 'Not the Best Evidence']
  }
];

// Simplified Mock Trial Ruleset
const mockTrialRules: Rule[] = [
  {
    number: '1',
    title: 'Relevance',
    text: 'Evidence must relate to the case and help prove or disprove an important fact.',
    commonObjections: ['Irrelevant', 'Not Relevant']
  },
  {
    number: '2',
    title: 'Leading Questions',
    text: 'Questions that suggest the answer are not allowed on direct examination, but are allowed on cross-examination.',
    commonObjections: ['Leading', 'Leading on Direct']
  },
  {
    number: '3',
    title: 'Hearsay',
    text: 'A witness cannot testify about what someone else said outside of court if offered to prove the truth of what was said.',
    commonObjections: ['Hearsay']
  },
  {
    number: '4',
    title: 'Personal Knowledge',
    text: 'A witness must have personally seen, heard, or experienced what they are testifying about.',
    commonObjections: ['Lacks Personal Knowledge', 'Speculation']
  },
  {
    number: '5',
    title: 'Opinion Testimony',
    text: 'Witnesses can only give opinions if they are helpful and based on what the witness personally observed.',
    commonObjections: ['Improper Opinion', 'Calls for Speculation']
  },
  {
    number: '6',
    title: 'Authentication',
    text: 'Documents and physical evidence must be shown to be genuine before being admitted.',
    commonObjections: ['Not Authenticated', 'Lack of Foundation']
  },
  {
    number: '7',
    title: 'Unfair Prejudice',
    text: 'Evidence can be excluded if it would be unfairly harmful or misleading.',
    commonObjections: ['Unfairly Prejudicial', 'More Prejudicial than Probative']
  }
];

// Create rulesets
const FRE_RULESET: Ruleset = {
  type: 'FRE',
  name: 'Federal Rules of Evidence',
  description: 'Full Federal Rules of Evidence with comprehensive coverage of evidentiary rules used in federal courts.',
  rules: freRules
};

const MOCK_TRIAL_RULESET: Ruleset = {
  type: 'MOCK_TRIAL',
  name: 'Simplified Mock Trial Rules',
  description: 'Simplified evidence rules designed for mock trial competitions and educational purposes.',
  rules: mockTrialRules
};

// Export function to get ruleset by type
export function getRuleset(type: RulesetType): Ruleset {
  return type === 'FRE' ? FRE_RULESET : MOCK_TRIAL_RULESET;
}

// Get all available rulesets
export function getAllRulesets(): Ruleset[] {
  return [FRE_RULESET, MOCK_TRIAL_RULESET];
}

// Find a rule by number
export function findRule(ruleNumber: string, rulesetType: RulesetType): Rule | undefined {
  const ruleset = getRuleset(rulesetType);
  return ruleset.rules.find(rule => rule.number === ruleNumber);
}

// Get all common objections for a ruleset
export function getAllObjections(rulesetType: RulesetType): string[] {
  const ruleset = getRuleset(rulesetType);
  const objections = new Set<string>();

  ruleset.rules.forEach(rule => {
    rule.commonObjections.forEach(obj => objections.add(obj));
  });

  return Array.from(objections).sort();
}

// Search for rules by objection name
export function findRulesByObjection(objectionName: string, rulesetType: RulesetType): Rule[] {
  const ruleset = getRuleset(rulesetType);
  return ruleset.rules.filter(rule =>
    rule.commonObjections.some(obj =>
      obj.toLowerCase().includes(objectionName.toLowerCase())
    )
  );
}

// Export the rulesets
export { FRE_RULESET, MOCK_TRIAL_RULESET };
