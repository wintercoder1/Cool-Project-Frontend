interface GroupRow {
  group: string;
  /** Current API. Sums to ~100 but not exactly (Apple: 99.8). */
  percent?: number;
  /** Both shapes carry this; the only value the older shape has. */
  expected?: number;
}

interface Demographics {
  /** Current shape: percentages live here. */
  estimated_ethnicity?: {
    groups?: GroupRow[];
    caveat?: string;
    source_url?: string;
    basis?: string;
    is_estimate?: boolean;
  } | null;
  /** Older shape, still served by the un-redeployed production API. */
  expected_counts?: GroupRow[];
  people_total?: number;
  team_size?: number;
}

interface LeadershipDemographicsChartProps {
  demographics?: Demographics | null;
  className?: string;
}

/**
 * Reads either payload shape. The API moved percentages under
 * `estimated_ethnicity.groups`; production still serves the older flat
 * `expected_counts`, so both are accepted rather than assuming a version.
 */
export function extractGroups(demographics?: Demographics | null): GroupRow[] {
  const current = demographics?.estimated_ethnicity?.groups;
  if (Array.isArray(current) && current.length > 0) return current;
  const legacy = demographics?.expected_counts;
  return Array.isArray(legacy) ? legacy : [];
}

/**
 * Share of leadership by estimated ethnicity.
 *
 * COLOR/ORDER, and why it is the way it is — the palette was run through the
 * dataviz validator rather than eyeballed:
 *
 *  - Slices are drawn in a FIXED canonical group order, never sorted by size.
 *    That keeps a group's colour identical across every company (colour follows
 *    the entity, not its rank) and makes slice adjacency deterministic, so the
 *    validated adjacent-pair separation actually holds. Sorting by value would
 *    let any two colours end up touching.
 *  - The six hues are slots 1-6 of the validated categorical palette. Every
 *    adjacent pair passes CVD separation (worst ΔE 9.1 protan), as does the
 *    wrap pair where the last slice meets the first (ΔE 26.5).
 *  - Three of the six hues fall under 3:1 contrast against a white surface, so
 *    the validator requires relief: identity is ALSO carried by the legend and
 *    the table below, never by colour alone.
 *
 * Percentages are normalised over the sum of the expected counts, so they total
 * 100% — the raw counts are fractional estimates and sum to slightly under the
 * headcount (Apple: 9.98 across 10 people).
 */

// Canonical order — do not reorder, and do not sort by value. See above.
const GROUP_ORDER = [
  'White',
  // The API split its Asian bucket: older cached rows carry the single
  // 'Asian or Pacific Islander', newer ones carry the two below instead. They
  // never appear in the same row, so the legacy label shares East Asian's hue.
  'Asian or Pacific Islander',
  'East Asian or Pacific Islander',
  'South Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Two or more races',
  'American Indian or Alaska Native',
];

export const OTHER_LABEL = 'Other';

// Validated as a set with OTHER_COLOR under --pairs all, not just adjacent
// pairs: after collapsing, which groups survive varies by company, so any two
// can end up touching. Normal-vision floor passes (worst ΔE 15.3). The CVD
// warning sits in the 6-8 band, which is permitted only alongside secondary
// encoding — hence the 2px gaps, the on-arc labels and the legend.
//
// The palette's orange slot is deliberately absent: it is what made every
// six-colour set fail (orange↔green ΔE 3.2 for protan viewers).
//
// CAVEAT, since the API grew an eighth group: seven named colours cannot all be
// mutually distinguishable in this palette. Every 7-subset of the 8 slots must
// include orange or magenta, and both produce a hard failure — the best
// available (this set) still has South Asian↔Hispanic at ΔE 13.2 for normal
// vision, under the floor of 15. Identity therefore rests on the legend and the
// on-arc labels, not on colour. Collapsing sub-3% groups into Other usually
// keeps four or five slices on screen, well inside what the palette supports,
// but a company with seven groups all above 3% would hit the limit.
const GROUP_COLORS: Record<string, string> = {
  'White': '#2a78d6',
  'Asian or Pacific Islander': '#1baf7a',
  // Same hue as the legacy label it replaces — the two never co-occur.
  'East Asian or Pacific Islander': '#1baf7a',
  'South Asian': '#e34948',
  'Black or African American': '#eda100',
  'Hispanic or Latino': '#e87ba4',
  'Two or more races': '#008300',
  'American Indian or Alaska Native': '#4a3aa7',
};

// Neutral on purpose: "Other" is a bucket, not a peer of the named groups. It
// fails the chroma floor by design; what matters is that it separates from all
// six, which it does.
const OTHER_COLOR = '#52525b';

// Groups below this share fold into Other. Three sub-3% slices are unreadable
// as arcs and were the reason a pie struggled with this data at all.
const COLLAPSE_BELOW_PCT = 3;

const FALLBACK_COLOR = '#6b7280';

const R = 90;
const CX = 100;
const CY = 100;
// Only slices with room get a number on the arc; everything else is read off
// the legend. A number on every slice collides at these sizes.
const ARC_LABEL_MIN_PCT = 7;

const polar = (angleDeg: number, radius: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
};

export default function LeadershipDemographicsChart({
  demographics,
  className = '',
}: LeadershipDemographicsChartProps) {
  const counts = extractGroups(demographics);
  if (counts.length === 0) return null;

  // Prefer the API's own percent; fall back to the expected count, which the
  // older shape is limited to. Either way the value is only a weight here —
  // arc geometry re-normalises below so the slices close the circle.
  const byGroup = new Map<string, number>();
  for (const row of counts) {
    const value = Number(row?.percent ?? row?.expected);
    if (row?.group && Number.isFinite(value) && value > 0) {
      byGroup.set(row.group, (byGroup.get(row.group) ?? 0) + value);
    }
  }

  // Canonical groups first in fixed order, then anything the API adds later so
  // a new census group still renders rather than silently vanishing.
  const ordered = [
    ...GROUP_ORDER.filter((g) => byGroup.has(g)),
    ...Array.from(byGroup.keys()).filter((g) => !GROUP_ORDER.includes(g)),
  ];

  const total = ordered.reduce((sum, g) => sum + (byGroup.get(g) ?? 0), 0);
  if (total <= 0) return null;

  // Collapse the slivers into Other, keeping canonical order and appending
  // Other last so it reads as the remainder rather than a peer group.
  const named = ordered.filter((g) => ((byGroup.get(g) ?? 0) / total) * 100 >= COLLAPSE_BELOW_PCT);
  const collapsed = ordered.filter((g) => !named.includes(g));
  const collapsedWeight = collapsed.reduce((sum, g) => sum + (byGroup.get(g) ?? 0), 0);

  const rows = [
    ...named.map((group) => ({ group, weight: byGroup.get(group) ?? 0, color: GROUP_COLORS[group] ?? FALLBACK_COLOR })),
    ...(collapsedWeight > 0
      ? [{ group: OTHER_LABEL, weight: collapsedWeight, color: OTHER_COLOR }]
      : []),
  ];

  // Exact percentages, by construction. Shares are re-normalised over the sum
  // (the source percentages total 99.8, not 100), then rounded by largest
  // remainder so the displayed whole numbers add to exactly 100 — naive
  // rounding of each slice independently would show 99 or 101.
  const shares = rows.map((r) => (r.weight / total) * 100);
  const floors = shares.map((v) => Math.floor(v));
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const byFraction = shares
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const display = [...floors];
  for (const { i } of byFraction) {
    if (left <= 0) break;
    display[i] += 1;
    left -= 1;
  }

  const slices = rows.map((row, i) => ({
    group: row.group,
    color: row.color,
    pct: shares[i],      // arc geometry — closes the circle
    shown: display[i],   // label — the set sums to exactly 100
  }));

  // One group at 100% has no arc to draw — a full circle is a degenerate path.
  const single = slices.length === 1;

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const start = cursor;
    const sweep = (slice.pct / 100) * 360;
    cursor += sweep;
    const end = cursor;
    const p1 = polar(start, R);
    const p2 = polar(end, R);
    const largeArc = sweep > 180 ? 1 : 0;
    const mid = polar(start + sweep / 2, R * 0.62);
    return {
      ...slice,
      d: `M ${CX} ${CY} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`,
      labelX: mid.x,
      labelY: mid.y,
    };
  });

  const fmt = (pct: number) => String(pct);

  const collapsedNames = collapsed;

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 flex-shrink-0 mx-auto sm:mx-0"
          role="img"
          aria-label="Share of leadership by estimated ethnicity"
        >
          {single ? (
            <circle cx={CX} cy={CY} r={R} fill={arcs[0].color} />
          ) : (
            arcs.map((arc) => (
              <path
                key={arc.group}
                d={arc.d}
                fill={arc.color}
                /* 2px surface-coloured gap between neighbouring fills */
                stroke="#ffffff"
                strokeWidth={2}
              >
                <title>{`${arc.group}: ${fmt(arc.shown)}%`}</title>
              </path>
            ))
          )}
          {arcs
            .filter((arc) => arc.pct >= ARC_LABEL_MIN_PCT)
            .map((arc) => (
              <text
                key={`label-${arc.group}`}
                x={arc.labelX}
                y={arc.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[13px] font-semibold"
                fill="#ffffff"
              >
                {fmt(arc.shown)}%
              </text>
            ))}
        </svg>

        {/* Legend carries every value, including the slivers too small to label
            on the arc, and is what makes the low-contrast hues legible. */}
        <ul className="flex-1 space-y-1.5 min-w-0">
          {slices.map((slice) => (
            <li key={slice.group} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-700 truncate">{slice.group}</span>
              <span className="ml-auto font-medium text-gray-900 tabular-nums flex-shrink-0">
                {fmt(slice.shown)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Name what went into Other. Collapsing unreadable slivers is a display
          decision; quietly dropping which ethnic groups they were would not be. */}
      {collapsedNames.length > 0 && (
        <p className="text-xs text-gray-500 mt-4">
          Other combines {collapsedNames.join(', ')}.
        </p>
      )}
    </div>
  );
}
