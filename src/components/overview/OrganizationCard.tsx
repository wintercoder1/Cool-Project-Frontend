// components/overview/OrganizationCard.jsx
import { Card, CardContent } from "@/components/ui/card";

// Component imports
import OverviewHeader from './OverviewHeader';
// @ts-expect-error
import LoadingStates from './LoadingStates';
import RatingSection from './RatingSection';
import ContextSection from './ContextSection';
import VoteSection from './VoteSection';
import FeedbackSection from './FeedbackSection';
import CitationsSection from './CitationsSection';
import ChartsSection from './ChartsSection';
import DataDisclaimer from "./DataDisclaimer";

const OrganizationCard = ({
  organizationData,
  categoryData,
  context,
  isFinancialData,
  committee_id,
  committee_name,
  shouldFetchFinancialOverview,
  isLoadingFinancialOverview,
  financialOverviewError,
  onFinancialContributionClick,
  chartData,
  isLoading = false,
  isEditing = false,
  editedContext = '',
  onEditedContextChange = (_: string) => {},
  onSave = () => {},
  onCancel = () => {},
  isSaving = false,
  saveError = null as string | null,
}) => {
  const shouldHideContent = isLoading || (
    categoryData === 'Financial Contributions' &&
    shouldFetchFinancialOverview &&
    (isLoadingFinancialOverview || financialOverviewError)
  );

  return (
    <div className="px-4 lg:px-20 flex justify-center">
        <div className="w-full max-w-3xl">

            <Card className="w-full max-w-3xl bg-white ">
                <OverviewHeader categoryData={categoryData} topic={organizationData.topic} />

                <CardContent className="space-y-6">

                    {!shouldHideContent && (
                    <>
                        <RatingSection
                            categoryData={categoryData}
                            lean={organizationData.lean}
                            rating={organizationData.rating}
                        />

                        <hr className="border-gray-200" />

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-base text-gray-800 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-gray-400"
                              value={editedContext}
                              onChange={(e) => onEditedContextChange(e.target.value)}
                              disabled={isSaving}
                            />
                            {saveError && (
                              <p className="text-sm text-red-600">{saveError}</p>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                              >
                                {isSaving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={onCancel}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <ContextSection context={context} />
                        )}

                        <DataDisclaimer categoryData={categoryData} />

                        <VoteSection organizationData={organizationData} categoryData={categoryData} />

                        <FeedbackSection organizationData={organizationData} categoryData={categoryData} />

                        <CitationsSection
                            categoryData={categoryData}
                            created_with_financial_contributions_info={organizationData.created_with_financial_contributions_info}
                            topic={organizationData.topic}
                            onFinancialContributionClick={onFinancialContributionClick}
                        />


                        <ChartsSection
                            isFinancialData={isFinancialData}
                            categoryData={categoryData}
                            topic={organizationData.topic}
                            committee_id={committee_id}
                            committee_name={committee_name}
                            {...chartData}
                        />
                    </>
                    )}
                </CardContent>

            </Card>
        </div>
    </div>

  );
};

export default OrganizationCard;
