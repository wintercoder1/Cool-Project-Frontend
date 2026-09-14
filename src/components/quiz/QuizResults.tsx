import { Link } from 'react-router-dom';
import RecommendationCard from './RecommendationCard';
import ShareControl from './ShareControl';
import {
  bandLabel,
  coveragePercent,
  type QuizCategoryResult,
  type QuizResultResponse,
} from '@/lib/quiz';

interface QuizResultsProps {
  result: QuizResultResponse;
  /**
   * Back into the quiz with the existing answers intact, landing on the screen
   * that holds the rules. Kept separate from onRestart because the two are
   * different promises: "Change an answer" says the answers still exist.
   */
  onEditAnswers: () => void;
  editLabel?: string;
  /** Clear everything and begin again from the first screen. */
  onRestart: () => void;
  restartLabel?: string;
}

/**
 * A company's own page, for an alternative we hold no explanation for.
 *
 * political_leaning on purpose: the pool query reads entity_type off the
 * political_leaning table, so every company that can appear in a result is
 * guaranteed to have a row there. Any other axis might 404 for a company whose
 * ranking came from a different one.
 */
const companyPagePath = (topic: string): string =>
  `/organization/political_leaning/${encodeURIComponent(topic)}`;

function CategoryBlock({
  categoryResult,
  onEditAnswers,
  editLabel,
}: {
  categoryResult: QuizCategoryResult;
  onEditAnswers: () => void;
  editLabel: string;
}) {
  const { recommendations, alternatives, excluded } = categoryResult;
  const nothingRated = Boolean(categoryResult.nothing_rated);

  // A pool with anything in it never comes back empty, so an empty list is not
  // "no good options" — it means every company failed one of the user's own
  // dealbreakers. That is the single genuinely empty case, and the only one
  // worth offering to relax a rule for.
  const everythingExcluded =
    recommendations.length === 0 && excluded.did_not_match > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">
          {categoryResult.label}
        </h2>
        <span className="text-xs text-gray-500">
          {categoryResult.considered}{' '}
          {categoryResult.considered === 1 ? 'company' : 'companies'} scored
        </span>
      </div>

      {/* Both exclusion counts, separately and always. "Didn't match your
          priorities" and "we couldn't verify" are different facts — the first
          is about the companies, the second is about our data — and merging
          them hides a coverage gap behind what looks like decisive filtering. */}
      {(excluded.did_not_match > 0 || excluded.could_not_verify > 0) && (
        <p className="text-xs text-gray-500 mt-1">
          {excluded.did_not_match > 0 && (
            <span>{excluded.did_not_match} did not match your rules</span>
          )}
          {excluded.did_not_match > 0 && excluded.could_not_verify > 0 && ' · '}
          {excluded.could_not_verify > 0 && (
            <span>
              {excluded.could_not_verify} we could not verify either way
            </span>
          )}
        </p>
      )}

      {nothingRated && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2 mt-4">
          We hold no ratings on the issues you weighted for anything on this
          shelf. These are the companies we know are here — not matches.
        </p>
      )}

      {!nothingRated && categoryResult.all_low_confidence && (
        <p className="text-sm text-brand-deep bg-brand-tint rounded-md px-3 py-2 mt-4">
          Everything below is provisional: we hold only part of what you asked
          about for each of these.
        </p>
      )}

      {everythingExcluded ? (
        <div className="mt-4 text-center py-6">
          <p className="text-gray-700">Nothing here cleared your rules.</p>
          <p className="text-sm text-gray-500 mt-1">
            Dealbreakers remove a company outright. Dropping one would widen
            this list.
          </p>
          <button
            type="button"
            onClick={onEditAnswers}
            className="mt-4 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors"
          >
            {editLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.normalized_topic_name}
              recommendation={recommendation}
              rank={index + 1}
              nothingRated={nothingRated}
            />
          ))}
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Also in this category
          </h3>
          <div className="mt-2 divide-y divide-gray-200">
            {alternatives.map((alternative) => (
              // New tab, for the same reason as the evidence links: the
              // ranking only exists in this tab's React state.
              <Link
                key={alternative.normalized_topic_name}
                to={companyPagePath(alternative.topic)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-2 hover:bg-gray-50 transition-colors px-1 -mx-1 rounded"
              >
                <span className="text-sm text-gray-900 truncate">
                  {alternative.topic}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {alternative.match == null
                    ? 'Not rated'
                    : `${bandLabel(alternative.band, alternative.band_text)} · ${coveragePercent(
                        alternative.coverage
                      )}% known`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The results screen, shared by a fresh run and an opened share link — the two
 * are scored through the identical path, so they render identically too.
 */
export default function QuizResults({
  result,
  onEditAnswers,
  editLabel = 'Change an answer',
  onRestart,
  restartLabel = 'Start over',
}: QuizResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Your matches</h1>
        <span className="text-xs text-gray-500">
          Rated as of {new Date(result.as_of).toLocaleDateString()}
        </span>
      </div>

      {result.results.map((categoryResult) => (
        <CategoryBlock
          key={categoryResult.category}
          categoryResult={categoryResult}
          onEditAnswers={onEditAnswers}
          editLabel={editLabel}
        />
      ))}

      <ShareControl
        shareToken={result.share_token}
        shareWarning={result.share_warning}
      />

      {/* Both required on every screen that renders a result. The methodology
          note is the part that does real work — it discloses what the ratings
          are and where they come from. */}
      <div className="text-xs text-gray-500 space-y-2 px-1">
        <p>{result.methodology_note}</p>
        {result.disclaimer && <p>{result.disclaimer}</p>}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm font-medium text-gray-700 hover:text-black underline underline-offset-2"
        >
          {restartLabel}
        </button>
      </div>
    </div>
  );
}
