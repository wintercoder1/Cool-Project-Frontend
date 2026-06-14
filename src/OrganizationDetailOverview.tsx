import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import networkManager from './network/NetworkManager';

// Component imports
import PageHeader from './components/overview/PageHeader';
import OrganizationCard from './components/overview/OrganizationCard';
import RecommendationsSection from './components/overview/RecommendationsSection';
import Footer from './components/Footer';

// Hook imports
import { useOrganizationData } from './hooks/useOrganizationData';
import { useFinancialData } from './hooks/useFinancialData';
import { useChartData } from './hooks/useChartData';

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

// Builds a `?id=<id>` suffix when an id is present, otherwise an empty string
// so the URL is left unchanged. Handles numeric or string ids.
const buildIdQuery = (id: unknown): string =>
  id != null && id !== '' ? `?id=${encodeURIComponent(String(id))}` : '';

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

  const needsFetch = needsIdFetch || needsTopicFetch;

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
  }, [idFetchKey, needsTopicFetch, queryType, urlId, effectiveCategoryData, effectiveTopic]);

  const effectiveOrgData = fetchedOrgData || organizationData;

  const {
    isFinancialData,
    committee_id,
    committee_name,
    context: hookContext,
    // @ts-expect-error
    financialOverviewData,
    isLoadingFinancialOverview,
    financialOverviewError,
    shouldFetchFinancialOverview
  } = useFinancialData(effectiveCategoryData, effectiveTopic, effectiveOrgData);

  const displayContext = savedContext ?? hookContext;

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
    // Include ?id=<id> only when the org has an id; otherwise leave it off.
    // const idQuery = buildIdQuery(effectiveOrgData?.id);
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
          top: '48px',
          left: '0',
          right: '0',
          zIndex: 1
        }}
      >
        <div className="border-t border-gray-300 bg-gray-100 mt-8 pt-10 pb-14">
          <OrganizationCard
            organizationData={effectiveOrgData}
            categoryData={effectiveCategoryData}
            context={displayContext}
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

// ///////////////////////////////////////////////////////
// //
// // This below version is actually quite good TBH
// //
// ///////////////////////////////////////////////////////
// import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import networkManager from './network/NetworkManager';

// // Component imports
// import PageHeader from './components/overview/PageHeader';
// import OrganizationCard from './components/overview/OrganizationCard';
// import RecommendationsSection from './components/overview/RecommendationsSection';
// import Footer from './components/Footer';

// // Hook imports
// import { useOrganizationData } from './hooks/useOrganizationData';
// import { useFinancialData } from './hooks/useFinancialData';
// import { useChartData } from './hooks/useChartData';

// const CATEGORY_SLUG_MAP: Record<string, string> = {
//   'political_leaning': 'Political Leaning',
//   'dei_friendliness': 'DEI Friendliness',
//   'wokeness': 'Wokeness',
//   'environmental_impact': 'Environmental Impact',
//   'immigration_support': 'Immigration Support',
//   'technology_innovation': 'Technology Innovation',
//   'financial_contributions': 'Financial Contributions',
//   'financial-contributions': 'Financial Contributions',
// };

// const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// // Builds a `?id=<id>` suffix when an id is present, otherwise an empty string
// // so the URL is left unchanged. Handles numeric or string ids.
// const buildIdQuery = (id: unknown): string =>
//   id != null && id !== '' ? `?id=${encodeURIComponent(String(id))}` : '';

// // Turns the URL slug into the backend query-type token, e.g.
// // 'financial_contributions' / 'financial-contributions' -> 'FINANCIAL_CONTRIBUTIONS'.
// const slugToQueryType = (slug?: string | null): string | null =>
//   slug ? slug.replace(/-/g, '_').toUpperCase() : null;

// // Parses an id param into a positive integer, or null if absent/invalid.
// const parseId = (raw: string | null): number | null => {
//   if (raw == null || raw.trim() === '') return null;
//   const n = Number(raw);
//   return Number.isInteger(n) && n >= 0 ? n : null;
// };

// const OrganizationDetailOverview = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { category, topic } = useParams();
//   const [searchParams] = useSearchParams();
//   const isEditMode = location.pathname.endsWith('/edit');

//   const [fetchedOrgData, setFetchedOrgData] = useState(null);
//   const [isFetchingOrgData, setIsFetchingOrgData] = useState(false);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContext, setEditedContext] = useState('');
//   const [savedContext, setSavedContext] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveError, setSaveError] = useState<string | null>(null);

//   // @ts-expect-error
//   const { organizationData, categoryData, location: hookLocation } = useOrganizationData();

//   // Capture topic before mutation to detect mismatches (URL topic vs localStorage topic)
//   const originalOrgTopic = organizationData.topic;

//   const effectiveCategoryData = category
//     ? (CATEGORY_SLUG_MAP[category] || categoryData)
//     : categoryData;

//   const effectiveTopic = topic ? decodeURIComponent(topic) : organizationData.topic;
//   if (organizationData.topic !== effectiveTopic) {
//     organizationData.topic = effectiveTopic;
//   }

//   // ---- Parsed from the URL: query type (from the slug) and id (from ?id=) ----
//   const queryType = slugToQueryType(category) ||
//     (effectiveCategoryData ? slugToQueryType(String(effectiveCategoryData).replace(/\s+/g, '_')) : null);
//   const urlId = parseId(searchParams.get('id'));

//   // The cache already holds the requested record only if its id matches the URL id.
//   const cachedId = organizationData?.id;
//   const cacheMatchesId =
//     urlId != null && cachedId != null && Number(cachedId) === urlId;

//   // True when the URL points to a different topic than what's in localStorage
//   const topicIsMismatch = !!topic && normalize(originalOrgTopic) !== normalize(effectiveTopic);

//   // Tier 1 (preferred): when the URL carries an id + query type and the cache
//   // doesn't already hold that exact record, fetch it directly by id. This is
//   // what makes pages opened via a shared/`?id=` link (including Financial
//   // Contributions) hydrate from the backend instead of failing.
//   const needsIdFetch =
//     !fetchedOrgData && urlId != null && !!queryType && !cacheMatchesId;

//   // Tier 2 (fallback, no id): the original topic-analysis path.
//   const needsTopicFetch =
//     !fetchedOrgData &&
//     !needsIdFetch &&
//     topicIsMismatch &&
//     effectiveCategoryData !== 'Financial Contributions';

//   const needsFetch = needsIdFetch || needsTopicFetch;

//   // Set localStorage + document title from URL params
//   useEffect(() => {
//     if (category) {
//       const displayCategory = CATEGORY_SLUG_MAP[category];
//       if (displayCategory) {
//         localStorage.setItem('categoryData', displayCategory);
//       }
//       if (displayCategory === 'Financial Contributions') {
//         localStorage.setItem('shouldFetchFinancialOverview', 'true');
//       }
//     }
//     if (topic) {
//       const decodedTopic = decodeURIComponent(topic);
//       localStorage.setItem('organizationTopic', decodedTopic);
//       const displayCategory = category ? CATEGORY_SLUG_MAP[category] : categoryData;
//       document.title = `${decodedTopic} - ${displayCategory || 'Overview'}`;
//     }
//   }, [category, topic]);

//   // Fetch org data when it isn't available from the cache. Tiered:
//   //   1. id + query type present  -> getPersistedAnswerById (authoritative)
//   //   2. otherwise                -> getTopicAnalysis (legacy)
//   // The response's `answer` object hydrates the page.
//   useEffect(() => {
//     if (!needsIdFetch && !needsTopicFetch) return;
//     let cancelled = false;

//     const fetchById = async () => {
//       setIsFetchingOrgData(true);
//       try {
//         const result = await networkManager.getPersistedAnswerById(queryType, urlId);
//         const answer = result?.answer ?? result;
//         if (!cancelled && answer) {
//           setFetchedOrgData(answer);
//           localStorage.setItem('organizationData', JSON.stringify(answer));
//         }
//       } catch (err) {
//         console.error('Failed to fetch organization data by id:', err);
//       } finally {
//         if (!cancelled) setIsFetchingOrgData(false);
//       }
//     };

//     const fetchByTopic = async () => {
//       if (!effectiveCategoryData || !effectiveTopic) return;
//       setIsFetchingOrgData(true);
//       try {
//         const data = await networkManager.getTopicAnalysis(effectiveCategoryData, effectiveTopic);
//         if (!cancelled) {
//           setFetchedOrgData(data);
//           localStorage.setItem('organizationData', JSON.stringify(data));
//         }
//       } catch (err) {
//         console.error('Failed to fetch organization data from URL:', err);
//       } finally {
//         if (!cancelled) setIsFetchingOrgData(false);
//       }
//     };

//     if (needsIdFetch) {
//       fetchById();
//     } else {
//       fetchByTopic();
//     }

//     return () => { cancelled = true; };
//   }, [needsIdFetch, needsTopicFetch, queryType, urlId, effectiveCategoryData, effectiveTopic]);

//   const effectiveOrgData = fetchedOrgData || organizationData;

//   const {
//     isFinancialData,
//     committee_id,
//     committee_name,
//     context: hookContext,
//     // @ts-expect-error
//     financialOverviewData,
//     isLoadingFinancialOverview,
//     financialOverviewError,
//     shouldFetchFinancialOverview
//   } = useFinancialData(effectiveCategoryData, effectiveTopic, effectiveOrgData);

//   const displayContext = savedContext ?? hookContext;

//   const handleStartEdit = () => {
//     setEditedContext(displayContext || '');
//     setSaveError(null);
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setSaveError(null);
//   };

//   const handleSaveEdit = async () => {
//     if (!effectiveOrgData.id || !effectiveCategoryData) return;
//     setIsSaving(true);
//     setSaveError(null);
//     try {
//       await networkManager.manualEditPersistedAnswer(effectiveCategoryData, effectiveOrgData.id, editedContext);
//       setSavedContext(editedContext);
//       setIsEditing(false);
//     } catch (err) {
//       setSaveError('Failed to save. Please try again.');
//       console.error('Save failed:', err);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const effectiveShouldFetchFinancialOverview =
//     category && CATEGORY_SLUG_MAP[category] === 'Financial Contributions'
//       ? true
//       : shouldFetchFinancialOverview;

//   const chartData = useChartData(committee_id);

//   const handleLogoClick = (event) => {
//     console.log(event);
//     navigate('/', {});
//   };

//   const handleFinancialContributionClick = () => {
//     localStorage.setItem('categoryData', 'Financial Contributions');
//     localStorage.setItem('shouldFetchFinancialOverview', 'true');
//     openFinancialContributionPageNewTab();
//   };

//   const handleDelete = async () => {
//     if (!effectiveOrgData.id || !effectiveCategoryData) return;
//     if (!window.confirm(`Delete the answer for "${effectiveOrgData.topic}"? This cannot be undone.`)) return;
//     try {
//       await networkManager.deletePersistedAnswer(effectiveCategoryData, effectiveOrgData.id);
//       navigate('/');
//     } catch (err) {
//       console.error('Delete failed:', err);
//     }
//   };

//   const openFinancialContributionPageNewTab = () => {
//     const currentTopic = effectiveTopic || effectiveOrgData.topic;
//     const encodedTopic = encodeURIComponent(currentTopic);
//     // Include ?id=<id> only when the org has an id; otherwise leave it off.
//     const idQuery = buildIdQuery(effectiveOrgData?.id);
//     window.open(`/organization/financial_contributions/${encodedTopic}${idQuery}`, '_blank', 'noreferrer');
//   };

//   return (
//     <div className="bg-white">
//       <PageHeader onLogoClick={handleLogoClick} />

//       {/* NUCLEAR APPROACH - Force everything to top with light gray background */}
//       <div
//         className=""
//         style={{
//           position: 'absolute',
//           top: '48px',
//           left: '0',
//           right: '0',
//           zIndex: 1
//         }}
//       >
//         <div className="border-t border-gray-300 bg-gray-100 mt-8 pt-10 pb-14">
//           <OrganizationCard
//             organizationData={effectiveOrgData}
//             categoryData={effectiveCategoryData}
//             context={displayContext}
//             isFinancialData={isFinancialData}
//             committee_id={committee_id}
//             committee_name={committee_name}
//             shouldFetchFinancialOverview={effectiveShouldFetchFinancialOverview}
//             isLoadingFinancialOverview={isLoadingFinancialOverview}
//             financialOverviewError={financialOverviewError}
//             onFinancialContributionClick={handleFinancialContributionClick}
//             chartData={chartData}
//             isLoading={isFetchingOrgData || needsFetch}
//             isEditing={isEditing}
//             editedContext={editedContext}
//             onEditedContextChange={setEditedContext}
//             onSave={handleSaveEdit}
//             onCancel={handleCancelEdit}
//             isSaving={isSaving}
//             saveError={saveError}
//           />
//           <div className="px-4 lg:px-20 flex justify-center mt-6">
//             <div className="w-full max-w-3xl">
//               <RecommendationsSection organizationData={effectiveOrgData} categoryData={effectiveCategoryData} />
//             </div>
//           </div>

//           {isEditMode && (
//             <div className="px-4 lg:px-20 flex justify-center mt-6">
//               <div className="w-full max-w-3xl space-y-3">
//                 <button
//                   onClick={handleStartEdit}
//                   disabled={isEditing}
//                   className="w-full py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-lg font-semibold rounded-lg transition-colors"
//                 >
//                   Edit Text
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-lg transition-colors"
//                 >
//                   Delete Answer
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default OrganizationDetailOverview;