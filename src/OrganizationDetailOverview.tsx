// Updated OrganizationDetailOverview.jsx
// @ts-expect-error
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Component imports
import PageHeader from './components/overview/PageHeader';
import OrganizationCard from './components/overview/OrganizationCard';

// Hook imports
import { useOrganizationData } from './hooks/useOrganizationData';
import { useFinancialData } from './hooks/useFinancialData';
import { useChartData } from './hooks/useChartData';

const OrganizationDetailOverview = () => {
  const navigate = useNavigate();
  const { category, topic } = useParams();
  
  // Set localStorage and document title based on URL parameters
  useEffect(() => {
    if (category === 'financial-contributions') {
      localStorage.setItem("categoryData", "Financial Contributions");
      localStorage.setItem("shouldFetchFinancialOverview", "true");
    }
    if (topic) {
      // Decode the topic from URL (in case it has special characters)
      const decodedTopic = decodeURIComponent(topic);
      localStorage.setItem("organizationTopic", decodedTopic);
      
      // Update document title
      const categoryTitle = category === 'financial-contributions' ? 'Financial Contributions' : 'Overview';
      document.title = `${decodedTopic} - ${categoryTitle}`;
    }
  }, [category, topic]);

  // @ts-expect-error
  const { organizationData, categoryData, location: hookLocation } = useOrganizationData();

  // Override categoryData if coming from URL
  const effectiveCategoryData = category === 'financial-contributions' ? 'Financial Contributions' : categoryData;
  
  // Use topic from URL if available, otherwise fall back to organizationData.topic
  const effectiveTopic = topic ? decodeURIComponent(topic) : organizationData.topic;
  if (organizationData.topic !== effectiveTopic) {
    organizationData.topic = effectiveTopic;
  }

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
  } = useFinancialData(effectiveCategoryData, effectiveTopic, organizationData);

  // Override shouldFetchFinancialOverview if coming from URL
  const effectiveShouldFetchFinancialOverview = category === 'financial-contributions' ? true : shouldFetchFinancialOverview;

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
    const currentTopic = effectiveTopic || organizationData.topic;
    const encodedTopic = encodeURIComponent(currentTopic);
    window.open(`#/organization/financial-contributions/${encodedTopic}`, "_blank", "noreferrer");
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
          categoryData={effectiveCategoryData}
          context={context}
          isFinancialData={isFinancialData}
          committee_id={committee_id}
          committee_name={committee_name}
          shouldFetchFinancialOverview={effectiveShouldFetchFinancialOverview}
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

// // Updated OrganizationDetailOverview.jsx
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { useEffect } from 'react';

// // Component imports
// import PageHeader from './components/overview/PageHeader';
// import OrganizationCard from './components/overview/OrganizationCard';

// // Hook imports
// import { useOrganizationData } from './hooks/useOrganizationData';
// import { useFinancialData } from './hooks/useFinancialData';
// import { useChartData } from './hooks/useChartData';

// const OrganizationDetailOverview = () => {
//   const navigate = useNavigate();
//   const { category, topic } = useParams();
//   const location = useLocation();
  
//   // Set localStorage based on URL parameters
//   useEffect(() => {
//     if (category === 'financial-contributions') {
//       localStorage.setItem("categoryData", "Financial Contributions");
//       localStorage.setItem("shouldFetchFinancialOverview", "true");
//     }
//     if (topic) {
//       // Decode the topic from URL (in case it has special characters)
//       const decodedTopic = decodeURIComponent(topic);
//       localStorage.setItem("organizationTopic", decodedTopic);
//     }
//   }, [category, topic]);

//   // @ts-expect-error
//   const { organizationData, categoryData, location: hookLocation } = useOrganizationData();

//   // Override categoryData if coming from URL
//   const effectiveCategoryData = category === 'financial-contributions' ? 'Financial Contributions' : categoryData;
  
//   // Use topic from URL if available, otherwise fall back to organizationData.topic
//   const effectiveTopic = topic ? decodeURIComponent(topic) : organizationData.topic;

//   const {
//     isFinancialData,
//     committee_id,
//     committee_name,
//     context,
//     // @ts-expect-error
//     financialOverviewData,
//     isLoadingFinancialOverview,
//     financialOverviewError,
//     shouldFetchFinancialOverview
//   } = useFinancialData(effectiveCategoryData, effectiveTopic, organizationData);

//   // Override shouldFetchFinancialOverview if coming from URL
//   const effectiveShouldFetchFinancialOverview = category === 'financial-contributions' ? true : shouldFetchFinancialOverview;

//   const chartData = useChartData(committee_id);

//   const handleLogoClick = (event) => {
//     console.log(event);
//     navigate('/', {});
//   };

//   const handleFinancialContributionClick = () => {
//     localStorage.setItem("categoryData", "Financial Contributions");
//     localStorage.setItem("shouldFetchFinancialOverview", "true");
//     openFinancialContributionPageNewTab();
//   };

//   const openFinancialContributionPageNewTab = () => {
//     const currentTopic = effectiveTopic || organizationData.topic;
//     const encodedTopic = encodeURIComponent(currentTopic);
//     window.open(`#/organization/financial-contributions/${encodedTopic}`, "_blank", "noreferrer");
//   };

//   // const openFinancialContributionPageSameTab = (updatedOrganizationData) => {
//   //   navigate(location.pathname, { 
//   //     state: updatedOrganizationData,
//   //     replace: true 
//   //   });
//   //   window.location.reload();
//   // };

//   return (
//     <div className="bg-white">
//       <PageHeader onLogoClick={handleLogoClick} />
      
//       {/* NUCLEAR APPROACH - Force everything to top */}
//       <div 
//         className="bg-white"
//         style={{
//           position: 'absolute',
//           top: '85px', // Adjust to your header height
//           left: '0',
//           right: '0',
//           zIndex: 1
//         }}
//       >
//         <OrganizationCard
//           organizationData={organizationData}
//           categoryData={effectiveCategoryData}
//           context={context}
//           isFinancialData={isFinancialData}
//           committee_id={committee_id}
//           committee_name={committee_name}
//           shouldFetchFinancialOverview={effectiveShouldFetchFinancialOverview}
//           isLoadingFinancialOverview={isLoadingFinancialOverview}
//           financialOverviewError={financialOverviewError}
//           onFinancialContributionClick={handleFinancialContributionClick}
//           chartData={chartData}
//         />
//       </div>
//     </div>
//   );
// };

// export default OrganizationDetailOverview;

// // Updated OrganizationDetailOverview.jsx
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { useEffect } from 'react';

// // Component imports
// import PageHeader from './components/overview/PageHeader';
// import OrganizationCard from './components/overview/OrganizationCard';

// // Hook imports
// import { useOrganizationData } from './hooks/useOrganizationData';
// import { useFinancialData } from './hooks/useFinancialData';
// import { useChartData } from './hooks/useChartData';

// const OrganizationDetailOverview = () => {
//   const navigate = useNavigate();
//   const { category } = useParams();
//   const location = useLocation();
  
//   // Set localStorage based on URL parameters
//   useEffect(() => {
//     if (category === 'financial-contributions') {
//       localStorage.setItem("categoryData", "Financial Contributions");
//       localStorage.setItem("shouldFetchFinancialOverview", "true");
//     }
//   }, [category]);

//   // @ts-expect-error
//   const { organizationData, categoryData, location: hookLocation } = useOrganizationData();

//   // Override categoryData if coming from URL
//   const effectiveCategoryData = category === 'financial-contributions' ? 'Financial Contributions' : categoryData;

//   const {
//     isFinancialData,
//     committee_id,
//     committee_name,
//     context,
//     // @ts-expect-error
//     financialOverviewData,
//     isLoadingFinancialOverview,
//     financialOverviewError,
//     shouldFetchFinancialOverview
//   } = useFinancialData(effectiveCategoryData, organizationData.topic, organizationData);

//   // Override shouldFetchFinancialOverview if coming from URL
//   const effectiveShouldFetchFinancialOverview = category === 'financial-contributions' ? true : shouldFetchFinancialOverview;

//   const chartData = useChartData(committee_id);

//   const handleLogoClick = (event) => {
//     console.log(event);
//     navigate('/', {});
//   };

//   const handleFinancialContributionClick = () => {
//     localStorage.setItem("categoryData", "Financial Contributions");
//     localStorage.setItem("shouldFetchFinancialOverview", "true");
//     openFinancialContributionPageNewTab();
//   };

//   const openFinancialContributionPageNewTab = () => {
//     window.open('#/organization/financial-contributions', "_blank", "noreferrer");
//   };

//   // const openFinancialContributionPageSameTab = (updatedOrganizationData) => {
//   //   navigate(location.pathname, { 
//   //     state: updatedOrganizationData,
//   //     replace: true 
//   //   });
//   //   window.location.reload();
//   // };

//   return (
//     <div className="bg-white">
//       <PageHeader onLogoClick={handleLogoClick} />
      
//       {/* NUCLEAR APPROACH - Force everything to top */}
//       <div 
//         className="bg-white"
//         style={{
//           position: 'absolute',
//           top: '85px', // Adjust to your header height
//           left: '0',
//           right: '0',
//           zIndex: 1
//         }}
//       >
//         <OrganizationCard
//           organizationData={organizationData}
//           categoryData={effectiveCategoryData}
//           context={context}
//           isFinancialData={isFinancialData}
//           committee_id={committee_id}
//           committee_name={committee_name}
//           shouldFetchFinancialOverview={effectiveShouldFetchFinancialOverview}
//           isLoadingFinancialOverview={isLoadingFinancialOverview}
//           financialOverviewError={financialOverviewError}
//           onFinancialContributionClick={handleFinancialContributionClick}
//           chartData={chartData}
//         />
//       </div>
//     </div>
//   );
// };

// export default OrganizationDetailOverview;


// // Main component: OrganizationDetailOverview.jsx
// import { useNavigate } from 'react-router-dom';

// // Component imports
// import PageHeader from './components/overview/PageHeader';
// import OrganizationCard from './components/overview/OrganizationCard';

// // Hook imports
// import { useOrganizationData } from './hooks/useOrganizationData';
// import { useFinancialData } from './hooks/useFinancialData';
// import { useChartData } from './hooks/useChartData';

// const OrganizationDetailOverview = () => {
//   const navigate = useNavigate();
//   // @ts-expect-error
//   const { organizationData, categoryData, location } = useOrganizationData();

//   const {
//     isFinancialData,
//     committee_id,
//     committee_name,
//     context,
//     // @ts-expect-error
//     financialOverviewData,
//     isLoadingFinancialOverview,
//     financialOverviewError,
//     shouldFetchFinancialOverview
//   } = useFinancialData(categoryData, organizationData.topic, organizationData);

//   const chartData = useChartData(committee_id);

//   const handleLogoClick = (event) => {
//     console.log(event);
//     navigate('/', {});
//   };

//   const handleFinancialContributionClick = () => {
//     localStorage.setItem("categoryData", "Financial Contributions");
//     localStorage.setItem("shouldFetchFinancialOverview", "true");
//     openFinancialContributionPageNewTab();
//   };

//   const openFinancialContributionPageNewTab = () => {
//     window.open('#/organization', "_blank", "noreferrer");
//   };

//   // const openFinancialContributionPageSameTab = (updatedOrganizationData) => {
//   //   navigate(location.pathname, { 
//   //     state: updatedOrganizationData,
//   //     replace: true 
//   //   });
//   //   window.location.reload();
//   // };

//   return (
//     <div className="bg-white">
//       <PageHeader onLogoClick={handleLogoClick} />
      
//       {/* NUCLEAR APPROACH - Force everything to top */}
//       <div 
//         className="bg-white"
//         style={{
//           position: 'absolute',
//           top: '85px', // Adjust to your header height
//           left: '0',
//           right: '0',
//           zIndex: 1
//         }}
//       >
//         <OrganizationCard
//           organizationData={organizationData}
//           categoryData={categoryData}
//           context={context}
//           isFinancialData={isFinancialData}
//           committee_id={committee_id}
//           committee_name={committee_name}
//           shouldFetchFinancialOverview={shouldFetchFinancialOverview}
//           isLoadingFinancialOverview={isLoadingFinancialOverview}
//           financialOverviewError={financialOverviewError}
//           onFinancialContributionClick={handleFinancialContributionClick}
//           chartData={chartData}
//         />
//       </div>
//     </div>
//   );
// };

// export default OrganizationDetailOverview;