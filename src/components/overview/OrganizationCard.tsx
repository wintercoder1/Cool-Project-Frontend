// components/overview/OrganizationCard.jsx
import { Card, CardContent } from "@/components/ui/card";

// Component imports
import OverviewHeader from './OverviewHeader';
// @ts-expect-error
import LoadingStates from './LoadingStates';
// @ts-expect-error
import RatingSection from './RatingSection';
// @ts-expect-error
import ContextSection from './ContextSection';
// @ts-expect-error
import CitationsSection from './CitationsSection';
import ChartsSection from './ChartsSection';

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
  chartData
}) => {
  const shouldHideContent = categoryData === 'Financial Contributions' && 
    shouldFetchFinancialOverview && 
    (isLoadingFinancialOverview || financialOverviewError);

  return (
    <div className="flex justify-center pt-20 px-4 lg:px-20 ">
        <Card className="w-full max-w-3xl bg-white shadow-lg">
            <OverviewHeader categoryData={categoryData} topic={organizationData.topic} />
            
            <CardContent className="space-y-6">
                

                {!shouldHideContent && (
                <>
                    <RatingSection 
                      categoryData={categoryData}
                      lean={organizationData.lean}
                      rating={organizationData.rating}
                    />

                    <ContextSection context={context} />
                    
                    <CitationsSection 
                      categoryData={categoryData}
                      created_with_financial_contributions_info={organizationData.created_with_financial_contributions_info}
                      topic={organizationData.topic}
                      onFinancialContributionClick={onFinancialContributionClick}
                    />

                    <LoadingStates 
                      categoryData={categoryData}
                      shouldFetchFinancialOverview={shouldFetchFinancialOverview}
                      isLoadingFinancialOverview={isLoadingFinancialOverview}
                      financialOverviewError={financialOverviewError}
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
  );
};

export default OrganizationCard;