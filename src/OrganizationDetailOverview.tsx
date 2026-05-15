import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import networkManager from './network/NetworkManager';

// Component imports
import PageHeader from './components/overview/PageHeader';
import OrganizationCard from './components/overview/OrganizationCard';
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

const OrganizationDetailOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, topic } = useParams();
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

  // True when the URL points to a different topic than what's in localStorage
  const topicIsMismatch = !!topic && normalize(originalOrgTopic) !== normalize(effectiveTopic);
  const needsFetch = topicIsMismatch &&
    effectiveCategoryData !== 'Financial Contributions' &&
    !fetchedOrgData;

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

  // Fetch org data when navigating via a shared URL without matching localStorage data
  useEffect(() => {
    if (!needsFetch || !effectiveCategoryData || !effectiveTopic) return;
    let cancelled = false;
    const fetchOrgData = async () => {
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
    };
    fetchOrgData();
    return () => { cancelled = true; };
  }, [needsFetch, effectiveCategoryData, effectiveTopic]);

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
    window.open(`#/organization/financial_contributions/${encodedTopic}`, '_blank', 'noreferrer');
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
            isLoading={isFetchingOrgData}
            isEditing={isEditing}
            editedContext={editedContext}
            onEditedContextChange={setEditedContext}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            saveError={saveError}
          />
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
