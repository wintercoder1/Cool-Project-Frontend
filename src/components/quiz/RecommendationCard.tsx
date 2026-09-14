import { useState } from 'react';
import { Link } from 'react-router-dom';
import IssueRowsTable from './IssueRowsTable';
import { answerDetailPath } from '@/lib/queryTypes';
import {
  bandClasses,
  bandLabel,
  coveragePercent,
  readGapLabel,
  type QuizRecommendation,
} from '@/lib/quiz';

interface RecommendationCardProps {
  recommendation: QuizRecommendation;
  rank: number;
  /** Category-level: nothing shown has a rating on anything they weighted. */
  nothingRated: boolean;
}

/**
 * One recommendation, with its explanation folded away underneath.
 *
 * What leads the card is deliberate. `band_text` is the headline figure and the
 * raw `match` number is kept inside the detail view, because the gap between
 * 87.3 and 84.1 sits well inside the error of a five-point judgement and
 * printing it invents precision the rating does not have.
 *
 * Coverage sits beside the band, never folded into it. The two answer different
 * questions — how well this fits, and how much of what you asked about we
 * actually know — and any single blended number quietly ranks the companies we
 * researched least at the top.
 */
export default function RecommendationCard({
  recommendation,
  rank,
  nothingRated,
}: RecommendationCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const issueRows = recommendation.issue_rows ?? [];
  const evidence = recommendation.evidence ?? [];
  const gaps = recommendation.not_known ?? [];

  // `best_available` marks the top result. It takes over the badge only when
  // the band itself would undersell a list that genuinely has nothing better in
  // it — leading with "Poor match" on the best thing on the shelf reads as a
  // verdict on the company rather than on our data.
  const leadWithBestAvailable =
    recommendation.best_available &&
    (recommendation.band === 'mixed' ||
      recommendation.band === 'poor' ||
      recommendation.band == null);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-400 font-medium">{rank}</span>
            <h3 className="font-bold text-gray-900 truncate">
              {recommendation.topic}
            </h3>
          </div>

          {!nothingRated && (
            <p className="text-xs text-gray-500 mt-1">
              Based on {coveragePercent(recommendation.coverage)}% of what you
              said mattered
            </p>
          )}
        </div>

        {nothingRated ? (
          <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
            Not rated yet
          </span>
        ) : (
          <span
            className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md ${
              leadWithBestAvailable
                ? 'bg-gray-900 text-white'
                : bandClasses(recommendation.band)
            }`}
          >
            {leadWithBestAvailable
              ? 'Best here'
              : bandLabel(recommendation.band, recommendation.band_text)}
          </span>
        )}
      </div>

      {!nothingRated && recommendation.headline && (
        <p className="text-sm text-gray-700 mt-3">{recommendation.headline}</p>
      )}

      {/* Thin coverage is hedged in place rather than hidden. The note is
          written to be shown verbatim.

          Informational blue, not warning amber. This says we hold less than
          half of what the reader asked about — a gap in our data, not a
          finding about the company — and a warning colour would attach the
          doubt to the company instead of to us. The tint is far enough from
          the solid `brand` selection state to never read as one. */}
      {recommendation.low_confidence && recommendation.confidence_note && (
        <p className="text-xs text-brand-deep bg-brand-tint rounded-md px-3 py-2 mt-3">
          {recommendation.confidence_note}
        </p>
      )}

      {(issueRows.length > 0 || evidence.length > 0 || gaps.length > 0) && (
        <button
          type="button"
          onClick={() => setShowDetail((open) => !open)}
          className="text-xs font-medium text-gray-700 hover:text-black underline underline-offset-2 mt-3"
        >
          {showDetail ? 'Hide the working' : 'Show the working'}
        </button>
      )}

      {showDetail && (
        <div className="mt-4 space-y-5">
          {recommendation.match != null && (
            <p
              className={`text-xs ${
                recommendation.low_confidence ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Match {Math.round(recommendation.match)} out of 100, across{' '}
              {coveragePercent(recommendation.coverage)}% coverage. Treat the
              band above as the real answer; this number is finer than the
              ratings behind it.
            </p>
          )}

          {issueRows.length > 0 && <IssueRowsTable rows={issueRows} />}

          {/* Gaps get their own block rather than grey six-point type at the
              bottom. What we did not check is part of the answer. */}
          {gaps.length > 0 && (
            <div className="bg-gray-50 rounded-md p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                What we could not check
              </h4>
              <ul className="mt-2 space-y-1">
                {gaps.map((gap, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {readGapLabel(gap)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                The ratings behind this
              </h4>
              <div className="mt-2 space-y-3">
                {evidence.map((item, index) => {
                  const body = item.summary ?? item.context;

                  return (
                    <div
                      key={`${item.axis}-${index}`}
                      className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {item.axis_label}
                      </div>
                      {item.source_note && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.source_note}
                        </p>
                      )}
                      {body && (
                        <p className="text-sm text-gray-700 mt-1">{body}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {/* answerDetailPath appends ?id=, so this opens the
                            exact answer row the rating came from rather than
                            whatever the topic-matching fallback finds.

                            New tab, matching how the rest of the app opens a
                            detail page (MainPage, RecommendationsSection). It
                            also protects the results: the run lives in React
                            state and cannot be rebuilt from the URL, because
                            the answers are deliberately kept out of history —
                            so navigating away in this tab loses the ranking,
                            and the browser's Back button cannot bring it
                            back. */}
                        {item.answer_id != null && item.query_type && (
                          <Link
                            to={answerDetailPath(
                              item.query_type,
                              recommendation.topic,
                              item.answer_id
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-700 hover:text-black underline underline-offset-2"
                          >
                            Read the full answer
                          </Link>
                        )}
                        {item.citation && (
                          <a
                            href={item.citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-700 hover:text-black underline underline-offset-2"
                          >
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
