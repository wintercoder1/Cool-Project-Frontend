// Main component: OrganizationDetailOverview.jsx
import { useNavigate } from 'react-router-dom';

// Component imports
import PageHeader from './components/overview/PageHeader';
import OrganizationCard from './components/overview/OrganizationCard';

// Hook imports
import { useOrganizationData } from './hooks/useOrganizationData';
import { useFinancialData } from './hooks/useFinancialData';
import { useChartData } from './hooks/useChartData';

const OrganizationDetailOverview = () => {
  const navigate = useNavigate();
  // @ts-expect-error
  const { organizationData, categoryData, location } = useOrganizationData();

  const {
    isFinancialData,
    committee_id,
    committee_name,
    context,
    // @ts-expect-error
    financialOverviewData,
    isLoadingFinancialOverview,
    financialOverviewError,
    shouldFetchFinancialOverview
  } = useFinancialData(categoryData, organizationData.topic, organizationData);

  const chartData = useChartData(committee_id);

  const handleLogoClick = (event) => {
    console.log(event);
    navigate('/', {});
  };

  const handleFinancialContributionClick = () => {
    localStorage.setItem("categoryData", "Financial Contributions");
    localStorage.setItem("shouldFetchFinancialOverview", "true");
    openFinancialContributionPageNewTab();
  };

  const openFinancialContributionPageNewTab = () => {
    window.open('#/organization', "_blank", "noreferrer");
  };

  // const openFinancialContributionPageSameTab = (updatedOrganizationData) => {
  //   navigate(location.pathname, { 
  //     state: updatedOrganizationData,
  //     replace: true 
  //   });
  //   window.location.reload();
  // };

  return (
    <div className="bg-white">
      <PageHeader onLogoClick={handleLogoClick} />
      
      {/* NUCLEAR APPROACH - Force everything to top */}
      <div 
        className="bg-white"
        style={{
          position: 'absolute',
          top: '85px', // Adjust to your header height
          left: '0',
          right: '0',
          zIndex: 1
        }}
      >
        <OrganizationCard
          organizationData={organizationData}
          categoryData={categoryData}
          context={context}
          isFinancialData={isFinancialData}
          committee_id={committee_id}
          committee_name={committee_name}
          shouldFetchFinancialOverview={shouldFetchFinancialOverview}
          isLoadingFinancialOverview={isLoadingFinancialOverview}
          financialOverviewError={financialOverviewError}
          onFinancialContributionClick={handleFinancialContributionClick}
          chartData={chartData}
        />
      </div>
    </div>
  );
};

export default OrganizationDetailOverview;