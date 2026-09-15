/**
 * Compass Match — the values quiz.
 *
 * Types and pure helpers for the three quiz endpoints. The quiz runs entirely
 * on the client: the server ships no interface, serves the questions, and
 * scores the answers.
 *
 * Two rules from the API contract are load-bearing enough to restate here,
 * because breaking either silently produces a plausible-looking wrong answer:
 *
 *   1. Send answers, never a computed score. There is no endpoint that accepts
 *      a match value, and scoring lives server-side so it can be versioned.
 *   2. Never blend `match` and `coverage`. A company at 92 on 0.3 coverage is
 *      not a better recommendation than one at 78 on 1.0 — but every blended
 *      figure says it is, and hands the top of the list to whichever companies
 *      we researched least. Rank on match, tier on coverage, show both.
 */

/** Importance weight. 0/1/2/4 — the jump to 4 is a deliberate doubling. */
export type QuizWeight = 0 | 1 | 2 | 4;

/**
 * A stance answer. Usually a number in -1.0…1.0, but `political_giving` also
 * offers the string 'stay_out', which selects a different scoring rule
 * (rewarding a small skew either way) rather than naming a point on the axis.
 * Pass whatever the definition gave through unchanged — coercing it to a
 * number turns it into a midpoint, which is a different question.
 */
export type QuizStanceValue = number | 'stay_out';

export interface QuizOption<T> {
  value: T;
  label: string;
}

export interface QuizIssue {
  key: string;
  label: string;
  help?: string | null;
}

export interface QuizImportanceSection {
  prompt: string;
  options: QuizOption<number>[];
  issues: QuizIssue[];
}

export interface QuizStanceQuestion {
  key: string;
  prompt: string;
  help?: string | null;
  options: QuizOption<QuizStanceValue>[];
}

export interface QuizCategoryOption {
  value: string;
  label: string;
  company_count: number;
  available: boolean;
}

export interface QuizCategoriesSection {
  prompt: string;
  options: QuizCategoryOption[];
}

export interface QuizDealbreakersSection {
  prompt: string;
  help?: string | null;
  max: number;
  options: QuizOption<string>[];
}

export interface QuizVerificationSection {
  key: string;
  prompt: string;
  options: QuizOption<boolean>[];
}

export interface QuizDefinition {
  quiz_version: string;
  importance: QuizImportanceSection;
  stances: QuizStanceQuestion[];
  categories: QuizCategoriesSection;
  dealbreakers: QuizDealbreakersSection;
  verification: QuizVerificationSection;
  methodology_note: string;
  disclaimer?: string | null;
}

/** What the client holds while someone works through the screens. */
export interface QuizAnswers {
  weights: Record<string, number>;
  stances: Record<string, QuizStanceValue>;
  categories: string[];
  dealbreakers: string[];
  requireVerified: boolean;
}

export interface QuizSubmission {
  quiz_version: string;
  weights: Record<string, number>;
  stances: Record<string, QuizStanceValue>;
  categories: string[];
  dealbreakers: string[];
}

export interface QuizIssueRow {
  issue: string;
  label: string;
  weight: number;
  stance: QuizStanceValue | null;
  /** null when we hold nothing — never a middling stand-in. */
  value: number | null;
  alignment: number | null;
  contribution: number | null;
  known: boolean;
  axis: string | null;
  as_of?: string | null;
  stance_text?: string | null;
  value_text?: string | null;
  /** Present instead of value/alignment when `known` is false. */
  missing_note?: string | null;
}

export interface QuizEvidence {
  axis: string;
  axis_label: string;
  source_note?: string | null;
  summary?: string | null;
  context?: string | null;
  citation?: string | null;
  answer_id?: number | null;
  query_type?: string | null;
  as_of?: string | null;
}

export interface QuizRecommendation {
  normalized_topic_name: string;
  topic: string;
  /** null when we hold nothing on any weighted issue. Not a zero. */
  match: number | null;
  coverage: number;
  band: string | null;
  band_text?: string | null;
  status?: string;
  issue_rows?: QuizIssueRow[];
  missing_issues?: unknown[];
  headline?: string | null;
  evidence?: QuizEvidence[];
  /** Named gaps. Shape is loosely specified, so read it defensively. */
  not_known?: unknown[];
  low_confidence?: boolean;
  best_available?: boolean;
  confidence_note?: string | null;
}

/** Ranked, but summary fields only — no explanation travels with these. */
export interface QuizAlternative {
  normalized_topic_name: string;
  topic: string;
  match: number | null;
  coverage: number;
  band: string | null;
  band_text?: string | null;
}

export interface QuizCategoryResult {
  category: string;
  label: string;
  considered: number;
  excluded: {
    did_not_match: number;
    could_not_verify: number;
  };
  recommendations: QuizRecommendation[];
  alternatives: QuizAlternative[];
  /** Every result shown is thin. Say so once, at the top. */
  all_low_confidence?: boolean;
  /** Nothing shown has a score at all. Do not call these matches. */
  nothing_rated?: boolean;
}

export interface QuizResultResponse {
  success: boolean;
  quiz_version: string;
  as_of: string;
  methodology_note: string;
  disclaimer?: string | null;
  results: QuizCategoryResult[];
  share_token: string;
  share_warning: string;
}

/** A fresh, unanswered set. Every issue starts at 0 — nothing is pre-weighted. */
export const emptyAnswers = (): QuizAnswers => ({
  weights: {},
  stances: {},
  categories: [],
  dealbreakers: [],
  requireVerified: false,
});

/** The issues weighted above 0 — the only ones whose direction we ask about. */
export const weightedIssueKeys = (weights: Record<string, number>): string[] =>
  Object.keys(weights).filter((key) => (weights[key] || 0) > 0);

/**
 * The stance questions to show: one per issue the user actually weighted.
 *
 * Filtering here rather than at render time is the point — asking someone's
 * position on an issue they marked "Not at all" collects a political opinion
 * the result will never use.
 */
export const visibleStanceQuestions = (
  definition: QuizDefinition,
  weights: Record<string, number>
): QuizStanceQuestion[] =>
  definition.stances.filter((question) => (weights[question.key] || 0) > 0);

/**
 * Client-side validation, mirroring what the server enforces.
 *
 * A stance missing for a weighted issue is the one worth catching here: the
 * server does not error on it, it silently skips the issue — so the user would
 * get a ranking that quietly ignored something they said mattered.
 */
export const validateAnswers = (
  definition: QuizDefinition,
  answers: QuizAnswers
): string[] => {
  const problems: string[] = [];
  const weighted = weightedIssueKeys(answers.weights);

  if (weighted.length === 0) {
    problems.push('Give at least one issue some weight.');
  }

  for (const question of visibleStanceQuestions(definition, answers.weights)) {
    if (answers.stances[question.key] === undefined) {
      problems.push(`Answer the question about ${question.key.replace(/_/g, ' ')}.`);
    }
  }

  if (answers.categories.length === 0) {
    problems.push('Pick at least one place to shop.');
  }

  if (answers.dealbreakers.length > definition.dealbreakers.max) {
    problems.push(`Pick at most ${definition.dealbreakers.max} dealbreakers.`);
  }

  return problems;
};

/**
 * The POST body.
 *
 * `require_verified` rides in the dealbreakers array but is a strictness
 * setting rather than a claim about a company, so it does not count toward the
 * cap of two. `as_of` is never sent — the server pins it, which is what makes a
 * shared link reproduce the run that made it instead of drifting as ratings
 * land behind it.
 */
export const buildSubmission = (
  definition: QuizDefinition,
  answers: QuizAnswers
): QuizSubmission => {
  const stances: Record<string, QuizStanceValue> = {};
  for (const key of weightedIssueKeys(answers.weights)) {
    if (answers.stances[key] !== undefined) {
      stances[key] = answers.stances[key];
    }
  }

  return {
    quiz_version: definition.quiz_version,
    weights: answers.weights,
    stances,
    categories: answers.categories,
    dealbreakers: answers.requireVerified
      ? [...answers.dealbreakers, 'require_verified']
      : answers.dealbreakers,
  };
};

/**
 * The human-readable messages out of a failed request.
 *
 * Every quiz failure is a 400 carrying { detail: { errors: [...] } } whose
 * strings are written to be shown as-is. A 422 (schema, not scorer) and a 503
 * (database down) have other shapes and are handled separately — a 503 in
 * particular must never be rendered as "no matches", since it is not a
 * statement about any company.
 */
export const readQuizErrors = (error: unknown): string[] => {
  const status = (error as { status?: number })?.status;
  const body = (error as { body?: string })?.body;

  if (status === 503) {
    return ['Our data is briefly unavailable. This is not a result — please try again shortly.'];
  }

  if (body) {
    try {
      const parsed = JSON.parse(body);
      const detail = parsed?.detail;
      if (Array.isArray(detail?.errors)) {
        return detail.errors.map(String);
      }
      // 422: FastAPI's own validation shape, which is a bug on our side rather
      // than something the user can act on.
      if (Array.isArray(detail)) {
        return ['Something in that submission was malformed. Please retake the quiz.'];
      }
      if (typeof detail === 'string') return [detail];
    } catch {
      // Not JSON; fall through to the generic message.
    }
  }

  return ['Something went wrong scoring your answers. Please try again.'];
};

/**
 * True when the failure is a stale cached definition rather than bad input.
 * The only cure is re-fetching the definition and retaking — old answers are
 * deliberately not migrated, because a retuned scorer makes them incomparable.
 */
export const isVersionMismatch = (errors: string[]): boolean =>
  errors.some((message) => /quiz version/i.test(message));

/** Where a share token is read back. Answers live in the link, not on a server. */
export const shareUrlFor = (shareToken: string): string =>
  `${window.location.origin}/quiz/result?a=${encodeURIComponent(shareToken)}`;

const BAND_FALLBACK: Record<string, string> = {
  strong: 'Strong match',
  good: 'Good match',
  mixed: 'Mixed match',
  poor: 'Poor match',
};

/** `band_text` when the server sent one; a local rendering of `band` if not. */
export const bandLabel = (
  band: string | null | undefined,
  bandText?: string | null
): string => {
  if (bandText) return bandText;
  if (band && BAND_FALLBACK[band]) return BAND_FALLBACK[band];
  return 'Not scored';
};

/**
 * Tailwind classes per band. `null` (unscored) reads as neutral, not bad.
 *
 * Brand tints for the two bands that fit, grays for the two that do not — not
 * a green-to-amber ramp. Two reasons beyond the palette. A traffic-light scale
 * reads as a verdict on the company ("this one is bad"), when the band only
 * ever describes fit against the priorities this particular reader entered.
 * And colour is never the only channel here: the badge always carries its
 * `band_text`, so "Strong match" and "Poor match" are legible to someone who
 * cannot separate the hues at all.
 *
 * Weight descends within each hue (200 over 100, gray-200 over gray-100)
 * rather than across the whole ramp — gray-200 is fractionally heavier against
 * white than brand-100, so a single monotonic ramp is not available. Hue
 * carries the fits/does-not split, which is the distinction that matters.
 */
export const bandClasses = (band: string | null | undefined): string => {
  switch (band) {
    case 'strong':
      return 'bg-brand-200 text-brand-900';
    case 'good':
      return 'bg-brand-100 text-brand-900';
    case 'mixed':
      return 'bg-gray-200 text-gray-700';
    case 'poor':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/** Coverage as a percentage of the concern the user actually weighted. */
export const coveragePercent = (coverage: number): number =>
  Math.round((Number.isFinite(coverage) ? coverage : 0) * 100);

/**
 * `not_known` entries, flattened to strings.
 *
 * The contract describes these as "named gaps" without pinning the shape, and
 * they have to be given a real place in the layout rather than grey six-point
 * type — so read whichever field is there instead of assuming.
 */
export const readGapLabel = (gap: unknown): string => {
  if (typeof gap === 'string') return gap;
  const record = gap as Record<string, unknown> | null;
  const candidate =
    record?.label ?? record?.issue_label ?? record?.issue ?? record?.axis;
  return typeof candidate === 'string' ? candidate : 'Something we have not researched';
};
