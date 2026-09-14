import type { QuizIssueRow } from '@/lib/quiz';

interface IssueRowsTableProps {
  rows: QuizIssueRow[];
}

const WEIGHT_LABELS: Record<number, string> = {
  1: 'A little',
  2: 'Quite a bit',
  4: 'Main thing',
};

const weightLabel = (weight: number): string =>
  WEIGHT_LABELS[weight] ?? `Weight ${weight}`;

const fitLabel = (row: QuizIssueRow): string =>
  row.alignment == null ? '—' : `${Math.round(row.alignment * 100)}%`;

const MISSING_FALLBACK = 'We have not researched this one.';

const ROW_LABEL =
  'text-left font-normal text-gray-400 pr-3 pb-1 whitespace-nowrap align-top';

/**
 * The arithmetic, in full. This *is* the explanation — the headline above it is
 * a one-line summary of this table, not a substitute for it.
 *
 * A row with `known: false` carries `missing_note` and has value, alignment and
 * axis all null. It gets the note, never a zero: rendering 0 where we hold
 * nothing would read as "we checked and found nothing good", which is a
 * different and false claim.
 *
 * It stays a table at every width; what changes is how many table rows one
 * issue takes. Five columns do not fit a phone, and letting the table scroll
 * sideways hides the two that matter most — what we found, and how well it fits
 * — behind a gesture nobody performs. So below sm each issue spans four rows in
 * two columns instead, which keeps the labels aligned down the page and says
 * the same things in the same order.
 */
export default function IssueRowsTable({ rows }: IssueRowsTableProps) {
  if (rows.length === 0) return null;

  return (
    <div>
      {/* Phone: one tbody per issue, four rows each. Multiple tbody elements in
          one table are valid, and they give each issue a grouping element to
          hang its key and its separating rule on. */}
      <table className="sm:hidden w-full text-sm">
        {rows.map((row) => (
          <tbody key={row.issue} className="border-t border-gray-200">
            <tr>
              <th colSpan={2} className="text-left pt-3 pb-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-gray-900">{row.label}</span>
                  {row.known && (
                    <span className="font-normal text-gray-900">{fitLabel(row)}</span>
                  )}
                </span>
              </th>
            </tr>

            <tr>
              <th scope="row" className={ROW_LABEL}>
                You wanted
              </th>
              <td className="text-gray-600 pb-1 w-full">{row.stance_text ?? '—'}</td>
            </tr>

            {row.known ? (
              <tr>
                <th scope="row" className={ROW_LABEL}>
                  We found
                </th>
                <td className="text-gray-600 pb-1 w-full">{row.value_text ?? '—'}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={2} className="text-gray-500 italic pb-1">
                  {row.missing_note ?? MISSING_FALLBACK}
                </td>
              </tr>
            )}

            <tr>
              <th scope="row" className={ROW_LABEL}>
                Matters
              </th>
              <td className="text-gray-500 pb-3 w-full">{weightLabel(row.weight)}</td>
            </tr>
          </tbody>
        ))}
      </table>

      {/* Anything wider: one row per issue, five columns. */}
      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="font-medium py-2 pr-3">Issue</th>
            <th className="font-medium py-2 pr-3">Matters</th>
            <th className="font-medium py-2 pr-3">You wanted</th>
            <th className="font-medium py-2 pr-3">What we found</th>
            <th className="font-medium py-2 text-right">Fit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.issue} className="border-t border-gray-200 align-top">
              <td className="py-2 pr-3 font-medium text-gray-900">{row.label}</td>
              <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                {weightLabel(row.weight)}
              </td>
              <td className="py-2 pr-3 text-gray-600">{row.stance_text ?? '—'}</td>

              {row.known ? (
                <>
                  <td className="py-2 pr-3 text-gray-600">{row.value_text ?? '—'}</td>
                  <td className="py-2 text-right text-gray-900 whitespace-nowrap">
                    {fitLabel(row)}
                  </td>
                </>
              ) : (
                <td className="py-2 text-gray-500 italic" colSpan={2}>
                  {row.missing_note ?? MISSING_FALLBACK}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
