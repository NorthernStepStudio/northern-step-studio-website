import { DecisionPathCode, UserProfile } from './types';

type RuleField =
  | 'creditStage'
  | 'openAccounts'
  | 'recentLatePayments'
  | 'deniedRecently'
  | 'revolvingUtilizationPct';
type RuleOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
type RuleValue = string | number | boolean;

interface DecisionCondition {
  field: RuleField;
  operator: RuleOperator;
  value: RuleValue;
}

interface DecisionNode {
  id: string;
  pathCode: DecisionPathCode;
  priority: number;
  all: DecisionCondition[];
}

// JSON-style deterministic decision tree for onboarding and roadmap routing.
export const DECISION_TREE: DecisionNode[] = [
  {
    id: 'path_d_secured_stage',
    pathCode: 'D',
    priority: 100,
    all: [{ field: 'creditStage', operator: 'eq', value: 'secured_card_stage' }]
  },
  {
    id: 'path_c_missed_payments',
    pathCode: 'C',
    priority: 90,
    all: [{ field: 'creditStage', operator: 'eq', value: 'missed_payments' }]
  },
  {
    id: 'path_b_thin_file',
    pathCode: 'B',
    priority: 80,
    all: [{ field: 'creditStage', operator: 'eq', value: 'thin_file' }]
  },
  {
    id: 'path_a_no_credit',
    pathCode: 'A',
    priority: 70,
    all: [{ field: 'creditStage', operator: 'eq', value: 'no_credit' }]
  },
  {
    id: 'fallback',
    pathCode: 'A',
    priority: 0,
    all: []
  }
];

const compareCondition = (actual: unknown, operator: RuleOperator, expected: RuleValue): boolean => {
  if (operator === 'eq') {
    return actual === expected;
  }

  if (typeof actual !== 'number' || typeof expected !== 'number') {
    return false;
  }

  if (operator === 'gt') {
    return actual > expected;
  }

  if (operator === 'gte') {
    return actual >= expected;
  }

  if (operator === 'lt') {
    return actual < expected;
  }

  return actual <= expected;
};

const matchesNode = (profile: UserProfile, node: DecisionNode): boolean => {
  return node.all.every((condition) => {
    const actual = profile[condition.field];
    return compareCondition(actual, condition.operator, condition.value);
  });
};

export const resolvePathCodeFromDecisionTree = (profile: UserProfile): DecisionPathCode => {
  const ordered = [...DECISION_TREE].sort((a, b) => b.priority - a.priority);
  const matched = ordered.find((node) => matchesNode(profile, node));
  return matched?.pathCode ?? 'A';
};
