// components/overview/OrganizationCard.jsx
import { Card, CardContent } from "@/components/ui/card";

// Component imports
import OverviewHeader from './OverviewHeader';
// @ts-expect-error
import LoadingStates from './LoadingStates';
import RatingSection from './RatingSection';
import ContextSection from './ContextSection';
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

                        <ContextSection context={context} />
                        
                        
                        
                        {/* <LoadingStates 
                            categoryData={categoryData}
                            shouldFetchFinancialOverview={shouldFetchFinancialOverview}
                            isLoadingFinancialOverview={isLoadingFinancialOverview}
                            financialOverviewError={financialOverviewError}
                        />  */}

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
