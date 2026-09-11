import type { ContributionsAbsence } from '../../lib/financialContributions';

interface ContributionsUnavailableProps {
  absence: ContributionsAbsence;
}

/**
 * Shown where the contributions write-up would be, when there isn't one.
 *
 * Deliberately not styled as an error: per the API, "the absence *is* the
 * answer". A company with no corporate PAC is a finding, not a failure.
 */
export default function ContributionsUnavailable({
  absence,
}: ContributionsUnavailableProps) {
  const { kind, message, scopeNote, sourceUrl, searchedAs } = absence;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
      <p className="text-gray-800">{message}</p>

      {/* Not boilerplate: a corporate PAC is a narrow instrument, and without
          this "no PAC" reads as "no political spending", which is false. */}
      {scopeNote && (
        <p className="text-sm text-gray-500 mt-2">{scopeNote}</p>
      )}

      {/* Names tried, so "not found" is legible as a limit of the search rather
          than a claim about the company. */}
      {kind === 'no_committee_found' && searchedAs && searchedAs.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Searched for: {searchedAs.join(', ')}.
        </p>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-blue-600 underline hover:text-blue-800 mt-3"
        >
          Source
        </a>
      )}
    </div>
  );
}
