import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LogoHeader from './components/LogoHeader';
import AuthNavBar from './components/AuthNavBar';
import Footer from './components/Footer';
import networkManager from './network/NetworkManager';
import LeadershipDemographicsChart, { extractGroups } from './components/charts/LeadershipDemographicsChart';
import VoteSection from './components/overview/VoteSection';
import FeedbackSection from './components/overview/FeedbackSection';

// The UI label; VoteSection/FeedbackSection map it to the LEADERSHIP query type.
const LEADERSHIP_CATEGORY = 'Leadership Demographics';

/**
 * Leadership Demographics for one company.
 *
 * A separate page rather than a branch inside OrganizationDetailOverview: that
 * component is built around a lean/rating/context answer and threads a dozen
 * props through OrganizationCard, none of which this shape has. index.tsx
 * routes here when the category slug is leadership_demographics.
 *
 * The estimates are surname-derived. The API says so in its own caveat fields
 * and those are rendered, not summarised away — a population-level guess about
 * a named individual is exactly the sort of thing that should stay labelled.
 */
export default function LeadershipDetail() {
  const navigate = useNavigate();
  const { topic } = useParams();
  const decodedTopic = topic ? decodeURIComponent(topic) : '';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!decodedTopic) return;
    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const result = await networkManager.getLeadership(decodedTopic);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('Leadership fetch failed:', err);
        if (!cancelled) {
          setError(
            (err as { status?: number })?.status === 404
              ? 'No leadership data is available for this organization yet.'
              : 'Could not load leadership data.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [decodedTopic]);

  const demographics = data?.demographics;
  const officers = Array.isArray(data?.officers) ? data.officers : [];
  const companyName = data?.resolved_company || data?.topic || decodedTopic;

  // The API moved these under estimated_ethnicity; production still serves the
  // older flat shape, so read both rather than assuming a version.
  const estimated = demographics?.estimated_ethnicity;
  const groups = extractGroups(demographics);
  const basis =
    estimated?.basis ??
    (typeof demographics?.people_total === 'number'
      ? `${demographics.people_total} officers`
      : null);
  const coverage = demographics?.coverage;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader onClick={() => navigate('/')} />
      </div>
      <AuthNavBar className="mt-2" />

      <div className="flex-1 bg-gray-100 pt-8 pb-16 px-4">
        <div className="w-full max-w-3xl mx-auto space-y-6">

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Leadership demographics
            </h1>
            <p className="text-gray-500 mt-1">
              {companyName}
              {data?.ticker ? ` · ${data.ticker}` : ''}
            </p>

            {loading ? (
              <p className="text-gray-500 mt-6">Loading…</p>
            ) : error ? (
              <p className="text-gray-700 mt-6">{error}</p>
            ) : groups.length === 0 ? (
              <p className="text-gray-700 mt-6">
                No demographic estimate is available for this organization.
              </p>
            ) : (
              <>
                <LeadershipDemographicsChart
                  demographics={demographics}
                  className="mt-6"
                />

                <p className="text-sm text-gray-500 mt-6">
                  {basis && <>Based on {basis}</>}
                  {typeof coverage?.no_data === 'number' && coverage.no_data > 0 && (
                    <> · {coverage.no_data} without a surname match</>
                  )}
                </p>
              </>
            )}

            {/* Same row the other categories get, from the same components:
                thumbs, Save (favorite) and copy-link, then Leave feedback.
                VoteSection resolves LEADERSHIP and the answer id off the data
                it is handed, so nothing extra is threaded in. */}
            {!loading && !error && data?.id != null && (
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <VoteSection
                  organizationData={data}
                  categoryData={LEADERSHIP_CATEGORY}
                />
                <FeedbackSection
                  organizationData={data}
                  categoryData={LEADERSHIP_CATEGORY}
                />
              </div>
            )}
          </div>

          {officers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Officers
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Per-person estimates are guesses from the surname alone and are
                far less reliable than the aggregate above.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Title</th>
                      <th className="py-2 font-medium">Estimated group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer: any, index: number) => {
                      const est = officer?.estimated_ethnicity;
                      const pct =
                        typeof est?.probability === 'number'
                          ? ` (${Math.round(est.probability * 100)}%)`
                          : '';
                      return (
                        <tr
                          key={`${officer?.name ?? 'officer'}-${index}`}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-2 pr-4 text-gray-900">
                            {officer?.display_name || officer?.name || '—'}
                          </td>
                          <td className="py-2 pr-4 text-gray-600">
                            {officer?.title || '—'}
                          </td>
                          <td className="py-2 text-gray-600">
                            {est?.most_likely ? `${est.most_likely}${pct}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(data?.source_url || data?.company_page_url) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Sources</h2>
              <ul className="text-sm space-y-1">
                {data?.source_url && (
                  <li>
                    <a href={data.source_url} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">
                      {data.source_detail || 'SEC EDGAR filings'}
                    </a>
                  </li>
                )}
                {data?.company_page_url && (
                  <li>
                    <a href={data.company_page_url} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">
                      Company leadership page
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
