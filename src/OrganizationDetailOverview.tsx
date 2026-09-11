import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import networkManager from './network/NetworkManager';

// Component imports
import PageHeader, { PAGE_CONTENT_TOP } from './components/overview/PageHeader';
import OrganizationCard from './components/overview/OrganizationCard';
import RecommendationsSection from './components/overview/RecommendationsSection';
import Footer from './components/Footer';

// Hook imports
import { useOrganizationData } from './hooks/useOrganizationData';
import { useFinancialData } from './hooks/useFinancialData';
import { useChartData } from './hooks/useChartData';
import { readContributionsAbsence } from './lib/financialContributions';
import ContributionsUnavailable from './components/overview/ContributionsUnavailable';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'political_leaning': 'Political Leaning',
  'dei_friendliness': 'DEI Friendliness',
  'wokeness': 'Wokeness',
  'environmental_impact': 'Environmental Impact',
  'immigration_support': 'Immigration Support',
  'technology_innovation': 'Technology Innovation',
  'financial_contributions': 'Financial Contributions',
  'financial-contributions': 'Financial Contributions',
};

const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Turns the URL slug into the backend query-type token, e.g.
// 'financial_contributions' / 'financial-contributions' -> 'FINANCIAL_CONTRIBUTIONS'.
const slugToQueryType = (slug?: string | null): string | null =>
  slug ? slug.replace(/-/g, '_').toUpperCase() : null;

// Parses an id param into a non-negative integer, or null if absent/invalid.
const parseId = (raw: string | null): number | null => {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

// getPersistedAnswerById is occasionally flaky, so try it twice (one retry)
// with a short gap before giving up and letting the caller fall back to cache.
const ID_FETCH_ATTEMPTS = 2;
const ID_FETCH_RETRY_DELAY_MS = 400;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const fetchAnswerById = async (queryType: string, id: number) => {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= ID_FETCH_ATTEMPTS; attempt++) {
    try {
      const result = await networkManager.getPersistedAnswerById(queryType, id);
      const answer = result?.answer ?? result;
      if (answer) return answer;
      lastErr = new Error('Empty answer from getPersistedAnswerById');
    } catch (err) {
      lastErr = err;
    }
    if (attempt < ID_FETCH_ATTEMPTS) await sleep(ID_FETCH_RETRY_DELAY_MS);
  }
  throw lastErr;
};

const OrganizationDetailOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, topic } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = location.pathname.endsWith('/edit');

  const [fetchedOrgData, setFetchedOrgData] = useState(null);
  const [isFetchingOrgData, setIsFetchingOrgData] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState('');
  const [savedContext, setSavedContext] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // @ts-expect-error
  const { organizationData, categoryData, location: hookLocation } = useOrganizationData();

  // Capture topic before mutation to detect mismatches (URL topic vs localStorage topic)
  const originalOrgTopic = organizationData.topic;

  const effectiveCategoryData = category
    ? (CATEGORY_SLUG_MAP[category] || categoryData)
    : categoryData;

  const effectiveTopic = topic ? decodeURIComponent(topic) : organizationData.topic;
  if (organizationData.topic !== effectiveTopic) {
    organizationData.topic = effectiveTopic;
  }

  // ---- Parsed from the URL: query type (from the slug) and id (from ?id=) ----
  const queryType = slugToQueryType(category) ||
    (effectiveCategoryData ? slugToQueryType(String(effectiveCategoryData).replace(/\s+/g, '_')) : null);
  const urlId = parseId(searchParams.get('id'));

  // Stable key for an id-based lookup; null when there's no usable id/query type.
  const idFetchKey = urlId != null && queryType ? `${queryType}|${urlId}` : null;
  // Records the idFetchKey we've already resolved (succeeded OR exhausted retries),
  // so we attempt each id exactly one round (two tries) and then stop.
  const idFetchDoneRef = useRef<string | null>(null);

  // True when the URL points to a different topic than what's in localStorage
  const topicIsMismatch = !!topic && normalize(originalOrgTopic) !== normalize(effectiveTopic);

  // Tier 1: if the URL carries an id + query type, fetch by id BEFORE consulting
  // the cache — the id is authoritative. (Falls back to cache only after the
  // retried fetch fails; see the effect below.)
  const needsIdFetch =
    !fetchedOrgData && !!idFetchKey && idFetchDoneRef.current !== idFetchKey;

  // Tier 2: only when there is NO id, use the original topic-analysis path.
  const needsTopicFetch =
    !fetchedOrgData &&
    !idFetchKey &&
    topicIsMismatch &&
    effectiveCategoryData !== 'Financial Contributions';

  // Runs once per topic. Without the ref the generate branch could fire again
  // on any re-render before its result lands.
  const contributionsResolveDoneRef = useRef<string | null>(null);
  const needsContributionsResolve =
    !fetchedOrgData &&
    !idFetchKey &&
    effectiveCategoryData === 'Financial Contributions' &&
    contributionsResolveDoneRef.current !== effectiveTopic;

  const needsFetch = needsIdFetch || needsTopicFetch || needsContributionsResolve;

  // Set localStorage + document title from URL params
  useEffect(() => {
    if (category) {
      const displayCategory = CATEGORY_SLUG_MAP[category];
      if (displayCategory) {
        localStorage.setItem('categoryData', displayCategory);
      }
      if (displayCategory === 'Financial Contributions') {
        localStorage.setItem('shouldFetchFinancialOverview', 'true');
      }
    }
    if (topic) {
      const decodedTopic = decodeURIComponent(topic);
      localStorage.setItem('organizationTopic', decodedTopic);
      const displayCategory = category ? CATEGORY_SLUG_MAP[category] : categoryData;
      document.title = `${decodedTopic} - ${displayCategory || 'Overview'}`;
    }
  }, [category, topic]);

  // Hydrate the page. Tiered:
  //   1. id + query type present -> getPersistedAnswerById, tried twice. On
  //      success it hydrates the page (taking priority over the cache); if both
  //      attempts fail we leave fetchedOrgData null so effectiveOrgData below
  //      falls back to the cached organizationData.
  //   2. no id -> the legacy getTopicAnalysis path.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Tier 1: authoritative id lookup, before the cache.
      if (idFetchKey && idFetchDoneRef.current !== idFetchKey && !fetchedOrgData) {
        setIsFetchingOrgData(true);
        try {
          const answer = await fetchAnswerById(queryType as string, urlId as number);
          if (!cancelled && answer) {
            setFetchedOrgData(answer);
            localStorage.setItem('organizationData', JSON.stringify(answer));
          }
        } catch (err) {
          // Both attempts failed — fall back to the cached response by leaving
          // fetchedOrgData null (effectiveOrgData uses organizationData).
          console.error('getPersistedAnswerById failed after retry; falling back to cache:', err);
        } finally {
          if (!cancelled) {
            idFetchDoneRef.current = idFetchKey;
            setIsFetchingOrgData(false);
          }
        }
        return;
      }

      // Tier 1.5: a financial-contributions URL with no ?id=. This is how the
      // Chrome extension links in when it only had the cheap preview, and how
      // any hand-typed or shared URL arrives.
      //
      // Resolve it here rather than inferring intent from the missing id: one
      // ~0.15s call answers all three questions at once — is there a committee
      // at all, does a full answer exist, and what is its id. Trusting "no id
      // means generate" would let any visitor trigger a multi-second
      // generation, and would generate for companies that have no PAC to
      // analyse in the first place.
      if (needsContributionsResolve && effectiveTopic) {
        contributionsResolveDoneRef.current = effectiveTopic;
        setIsFetchingOrgData(true);
        try {
          const probe = await networkManager.getFinancialContributionsPercentContributionsOnly(
            effectiveTopic
          );

          // No committee: nothing to generate. Hand the payload straight to the
          // page so the absence notice renders with its message and citation.
          if (readContributionsAbsence(probe)) {
            if (!cancelled) setFetchedOrgData(probe);
            return;
          }

          const fullId = parseId(probe?.id != null ? String(probe.id) : null);
          if (probe?.full_answer_available && fullId != null) {
            // A full answer exists after all — same authoritative path as ?id=.
            const answer = await fetchAnswerById('FINANCIAL_CONTRIBUTIONS', fullId);
            if (!cancelled && answer) {
              setFetchedOrgData(answer);
              localStorage.setItem('organizationData', JSON.stringify(answer));
            }
            return;
          }

          // Nothing cached: generate it. This is the slow path (~3s plus the
          // model) and the only branch that should reach it.
          const generated = await networkManager.getOrCreateFinancialContributionsOverview(
            effectiveTopic
          );
          if (!cancelled && generated) {
            setFetchedOrgData(generated);
            localStorage.setItem('organizationData', JSON.stringify(generated));
          }
        } catch (err) {
          console.error('Failed to resolve financial contributions for URL:', err);
        } finally {
          if (!cancelled) setIsFetchingOrgData(false);
        }
        return;
      }

      // Tier 2: legacy topic-analysis fetch (no id in the URL).
      if (needsTopicFetch && effectiveCategoryData && effectiveTopic) {
        setIsFetchingOrgData(true);
        try {
          const data = await networkManager.getTopicAnalysis(effectiveCategoryData, effectiveTopic);
          if (!cancelled) {
            setFetchedOrgData(data);
            localStorage.setItem('organizationData', JSON.stringify(data));
          }
        } catch (err) {
          console.error('Failed to fetch organization data from URL:', err);
        } finally {
          if (!cancelled) setIsFetchingOrgData(false);
        }
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // needsContributionsResolve is deliberately NOT a dependency. It is a latch
    // derived from a ref that the effect sets before awaiting, so listing it
    // here made the effect re-run the moment it flipped false — cancelling its
    // own in-flight probe, so the result was discarded and the card rendered
    // empty. The real inputs are the topic, category and id below.
  }, [idFetchKey, needsTopicFetch, queryType, urlId, effectiveCategoryData, effectiveTopic]);

  const effectiveOrgData = fetchedOrgData || organizationData;

  const {
    isFinancialData,
    committee_id,
    committee_name,
    context: hookContext,
    // Now consumed (see contributionsAbsence below); it was previously unused,
    // which is what the @ts-expect-error here was suppressing.
    financialOverviewData,
    isLoadingFinancialOverview,
    financialOverviewError,
    shouldFetchFinancialOverview
  } = useFinancialData(effectiveCategoryData, effectiveTopic, effectiveOrgData);

  const displayContext = savedContext ?? hookContext;

  // The API now reports "no committee" as a normal answer (error: false plus a
  // committee_status), so nothing upstream treats it as a failure and the card
  // would otherwise render an empty write-up. Read whichever payload is live.
  // Check both payloads, rather than preferring one. The text-only endpoint
  // the hook calls carries no committee_status by design (it makes no graph
  // call), so `financialOverviewData ?? effectiveOrgData` let an absent payload
  // mask a real absence sitting on the row — the card then rendered empty,
  // with neither a write-up nor the notice explaining why there isn't one.
  const contributionsAbsence =
    effectiveCategoryData === 'Financial Contributions'
      ? readContributionsAbsence(financialOverviewData) ??
        readContributionsAbsence(effectiveOrgData)
      : null;

  const handleStartEdit = () => {
    setEditedContext(displayContext || '');
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!effectiveOrgData.id || !effectiveCategoryData) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await networkManager.manualEditPersistedAnswer(effectiveCategoryData, effectiveOrgData.id, editedContext);
      setSavedContext(editedContext);
      setIsEditing(false);
    } catch (err) {
      setSaveError('Failed to save. Please try again.');
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveShouldFetchFinancialOverview =
    category && CATEGORY_SLUG_MAP[category] === 'Financial Contributions'
      ? true
      : shouldFetchFinancialOverview;

  const chartData = useChartData(committee_id);

  const handleLogoClick = (event) => {
    console.log(event);
    navigate('/', {});
  };

  const handleFinancialContributionClick = () => {
    localStorage.setItem('categoryData', 'Financial Contributions');
    localStorage.setItem('shouldFetchFinancialOverview', 'true');
    openFinancialContributionPageNewTab();
  };

  const handleDelete = async () => {
    if (!effectiveOrgData.id || !effectiveCategoryData) return;
    if (!window.confirm(`Delete the answer for "${effectiveOrgData.topic}"? This cannot be undone.`)) return;
    try {
      await networkManager.deletePersistedAnswer(effectiveCategoryData, effectiveOrgData.id);
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const openFinancialContributionPageNewTab = () => {
    const currentTopic = effectiveTopic || effectiveOrgData.topic;
    const encodedTopic = encodeURIComponent(currentTopic);
    window.open(`/organization/financial_contributions/${encodedTopic}`, '_blank', 'noreferrer');
  };

  return (
    <div className="bg-white">
      <PageHeader onLogoClick={handleLogoClick} />

      {/* NUCLEAR APPROACH - Force everything to top with light gray background */}
      <div
        className=""
        style={{
          position: 'absolute',
          top: PAGE_CONTENT_TOP,
          left: '0',
          right: '0',
          zIndex: 1
        }}
      >
        <div className="bg-gray-100 mt-8 pt-10 pb-14">
          <OrganizationCard
            organizationData={effectiveOrgData}
            categoryData={effectiveCategoryData}
            context={displayContext}
            unavailableNotice={
              contributionsAbsence ? (
                <ContributionsUnavailable absence={contributionsAbsence} />
              ) : null
            }
            isFinancialData={isFinancialData}
            committee_id={committee_id}
            committee_name={committee_name}
            shouldFetchFinancialOverview={effectiveShouldFetchFinancialOverview}
            isLoadingFinancialOverview={isLoadingFinancialOverview}
            financialOverviewError={financialOverviewError}
            onFinancialContributionClick={handleFinancialContributionClick}
            chartData={chartData}
            isLoading={isFetchingOrgData || needsFetch}
            isEditing={isEditing}
            editedContext={editedContext}
            onEditedContextChange={setEditedContext}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            saveError={saveError}
          />
          <div className="px-4 lg:px-20 flex justify-center mt-6">
            <div className="w-full max-w-3xl">
              <RecommendationsSection organizationData={effectiveOrgData} categoryData={effectiveCategoryData} />
            </div>
          </div>

          {isEditMode && (
            <div className="px-4 lg:px-20 flex justify-center mt-6">
              <div className="w-full max-w-3xl space-y-3">
                <button
                  onClick={handleStartEdit}
                  disabled={isEditing}
                  className="w-full py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Edit Text
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Delete Answer
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default OrganizationDetailOverview;