/**
 * Mapping between the backend's canonical query types (POLITICAL_LEANING),
 * the URL slugs used by the detail routes (political_leaning), and the labels
 * shown to people (Political Leaning).
 *
 * NOTE: OrganizationDetailOverview.tsx carries its own CATEGORY_SLUG_MAP that
 * predates this and also handles a legacy 'financial-contributions' spelling.
 * It was left alone rather than refactored as part of the favorites work; this
 * module is what new code should use, and the two are worth merging later.
 */

export const QUERY_TYPE_LABELS: Record<string, string> = {
  POLITICAL_LEANING: 'Political Leaning',
  DEI_FRIENDLINESS: 'DEI Friendliness',
  WOKENESS: 'Wokeness',
  ENVIRONMENTAL_IMPACT: 'Environmental Impact',
  IMMIGRATION_SUPPORT: 'Immigration Support',
  TECHNOLOGY_INNOVATION: 'Technology Innovation',
  FINANCIAL_CONTRIBUTIONS: 'Financial Contributions',
};

/** 'political_leaning' -> 'POLITICAL_LEANING'. Also tolerates hyphens. */
export const slugToQueryType = (slug?: string | null): string | null =>
  slug ? slug.replace(/-/g, '_').toUpperCase() : null;

/** 'POLITICAL_LEANING' -> 'political_leaning', the detail route's slug. */
export const queryTypeToSlug = (queryType: string): string =>
  queryType.toLowerCase();

/** 'POLITICAL_LEANING' -> 'Political Leaning'; falls back to a readable form. */
export const queryTypeToLabel = (queryType: string): string =>
  QUERY_TYPE_LABELS[queryType] ??
  queryType
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * The detail-page URL for a favorited answer.
 *
 * Carries ?id= so the detail page's authoritative id lookup is used rather than
 * its topic-matching fallback — the favorite points at one specific answer row,
 * and a topic can have several.
 */
export const answerDetailPath = (
  queryType: string,
  topic: string,
  answerId: number | string
): string =>
  `/organization/${queryTypeToSlug(queryType)}/${encodeURIComponent(
    topic
  )}?id=${encodeURIComponent(String(answerId))}`;
