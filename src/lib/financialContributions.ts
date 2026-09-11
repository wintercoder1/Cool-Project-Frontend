/**
 * Reading the financial-contributions absence contract.
 *
 * The API used to signal "no committee" with `{ error: true, message: ... }`.
 * It now returns `error: false` and a `committee_status`, because an absence is
 * an answer rather than a failure — and because it distinguishes two absences
 * that used to look identical:
 *
 *   no_pac_on_record   has_pac false  A cited source says there is no corporate
 *                                     PAC. Carries scope_note and source_url.
 *   no_committee_found has_pac null   Nothing was found, and nothing is claimed.
 *                                     Carries searched_as: the names tried.
 *
 * The distinction matters in the UI: the first is a fact about the company, the
 * second is a limit of our search. Rendering both as "no data" would overstate
 * the second and understate the first.
 *
 * The legacy `error: true` shape is still recognised so an older or
 * un-redeployed backend keeps working.
 */

export type ContributionsAbsenceKind =
  | 'no_pac_on_record'
  | 'no_committee_found'
  | 'legacy_error';

export interface ContributionsAbsence {
  kind: ContributionsAbsenceKind;
  message: string;
  /** Only on no_pac_on_record: what a corporate PAC does and doesn't cover. */
  scopeNote?: string;
  /** Only on no_pac_on_record: the citation backing the claim. */
  sourceUrl?: string;
  /** Only on no_committee_found: the names that were searched. */
  searchedAs?: string[];
}

const FALLBACK_MESSAGE =
  'No political committee matching this company was found.';

/**
 * Returns a descriptor when the payload reports no usable contributions data,
 * or null when the answer is fine. Tolerates a null/undefined payload.
 */
export function readContributionsAbsence(
  data: Record<string, unknown> | null | undefined
): ContributionsAbsence | null {
  if (!data || typeof data !== 'object') return null;

  const status = data.committee_status;
  const message = typeof data.message === 'string' ? data.message : '';

  if (status === 'no_pac_on_record') {
    return {
      kind: 'no_pac_on_record',
      message: message || FALLBACK_MESSAGE,
      scopeNote: typeof data.scope_note === 'string' ? data.scope_note : undefined,
      sourceUrl: typeof data.source_url === 'string' ? data.source_url : undefined,
    };
  }

  if (status === 'no_committee_found') {
    return {
      kind: 'no_committee_found',
      message: message || FALLBACK_MESSAGE,
      searchedAs: Array.isArray(data.searched_as)
        ? (data.searched_as as unknown[]).filter((s): s is string => typeof s === 'string')
        : undefined,
    };
  }

  // Pre-committee_status backend. Only `error === true` counts — the new shapes
  // carry `error: false` alongside their status and must not land here.
  if (data.error === true) {
    return { kind: 'legacy_error', message: message || FALLBACK_MESSAGE };
  }

  return null;
}
