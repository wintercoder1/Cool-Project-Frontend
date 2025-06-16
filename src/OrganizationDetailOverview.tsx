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
  const { organizationData, categoryData, location } = useOrganizationData();

  const {
    isFinancialData,
    committee_id,
    committee_name,
    context,
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
  // const handleFinancialContributionClickNewTab = () => {
    const updatedOrganizationData = { ...organizationData };
    
    localStorage.setItem("categoryData", "Financial Contributions");
    localStorage.setItem("shouldFetchFinancialOverview", "true");
    localStorage.setItem("organizationData", JSON.stringify(updatedOrganizationData));
    
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
    <div className="min-h-screen">
      <PageHeader onLogoClick={handleLogoClick} />

      {/* <div className="bg-gray-100 min-h-screen"> */}
      <div className="bg-white min-h-screen">
        <div className="flex justify-center pt-6 px-4 lg:px-20">
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
    </div>
  );
};

export default OrganizationDetailOverview;

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useLocation } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { useNavigate} from 'react-router-dom';
// import networkManager from './network/NetworkManager';
// import React from "react";

// // Import components
// import ContributionsByPartyChart from './components/charts/ContributionsByPartyChart';
// import TopContributionRecipientsChart from './components/charts/TopContributionRecipientsChart';
// import LeadershipContributionsChart from './components/charts/LeadershipContributionsChart';
// import PoliticalLeaningQuickLook  from './components/overview/PoliticalLeaningQuickLook';
// import OtherQueryCategoryRatingQuickLook from './components/overview/OtherQueryCategoryRatingQuickLook';
// import LogoHeader from './components/LogoHeader';

// const OrganizationDetailOverview = () => {
//   const location = useLocation();
//   const organizationDataLocation = location.state; 
//   const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
//   const [categoryData, __] = useState(localStorage.getItem("categoryData"));
//   const [isFinancialData, setIsFinancialData] = useState(false);
//   const [contributionsData, setContributionsData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [recipientData, setRecipientData] = useState(null);
//   const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
//   const [recipientError, setRecipientError] = useState(null);
//   const [leadershipData, setLeadershipData] = useState(null);
//   const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);
//   const [leadershipError, setLeadershipError] = useState(null);
//   const [displayedLeadershipCount, ___] = useState(10);
//   const [financialOverviewData, setFinancialOverviewData] = useState(null);
//   const [isLoadingFinancialOverview, setIsLoadingFinancialOverview] = useState(false);
//   const [financialOverviewError, setFinancialOverviewError] = useState(null);
//   const [shouldFetchFinancialOverview, setShouldFetchFinancialOverview] = useState(false);
//   const navigate = useNavigate();

//   // Default data if none provided.
//   const defaultData = {
//     timestamp: "2024-11-15T05:17:32.156000",
//     citation: "none",
//     context: "Organization context will be displayed here.",
//     lean: "Neutral",
//     rating: 0,
//     topic: "Organization Name"
//   };

//   // Use provided data or fall back to default.
//   var {
//     topic,
//     lean,
//     rating,
//     context,
//     // @ts-expect-error
//     citation,
//     committee_id,
//     committee_name,
//     created_with_financial_contributions_info,
//   } = organizationDataLocation || organizationDataLocalStorage || defaultData;

//   // If financial contribution. 
//   // TODO: Actually learn react and figure out a better way to do this.
//   if (categoryData == 'Financial Contributions') {
//     // Use financial overview data if available, otherwise fall back to existing data
//     if (financialOverviewData) {
//       context = financialOverviewData.fec_financial_contributions_summary_text || financialOverviewData.context;
//       committee_id = financialOverviewData.committee_id || committee_id;
//       committee_name = financialOverviewData.committee_name || committee_name;
//     } else {
//       context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
//       || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)
//     }

//     // Some committee IDs were wrongly stored as integers with leading zeros removed.
//     // We will fix that here.
//     if (committee_id && committee_id.length <= 9) {    
//       let prepend_C = ''
//       if (!isNaN(committee_id) && committee_id[0] != 'C') {
//         prepend_C = 'C'
//       }
//       // If leading zeros need to be added.
//       let zeros = ''
//       if (!isNaN(committee_id) && committee_id.length < 8) {
//         const num_zeros_to_add = 8 - committee_id.length
//         let i = 0
//         while (i < num_zeros_to_add) {
//           zeros += '0'
//           i += 1
//         }
//       }
//       // Update committee id based on what we calculated above.
//       const updated_committe_id = prepend_C + zeros + committee_id
//       committee_id = updated_committe_id
//     }
//     console.log('\nCommittee ID:')
//     console.log(committee_id)
//   }

//   useEffect(() => {
//     setIsFinancialData(categoryData == 'Financial Contributions')
    
//     // Check if we should fetch financial overview data (coming from the link click)
//     const shouldFetch = localStorage.getItem("shouldFetchFinancialOverview");
//     if (shouldFetch === "true") {
//       setShouldFetchFinancialOverview(true);
//       localStorage.removeItem("shouldFetchFinancialOverview"); // Clean up the flag
//     }
//   }, [categoryData]);

//   // Fetch financial overview data only when triggered by the link click
//   useEffect(() => {
//     const fetchFinancialOverviewData = async () => {
//       if (!shouldFetchFinancialOverview || categoryData !== 'Financial Contributions' || !topic) return;
      
//       setIsLoadingFinancialOverview(true);
//       setFinancialOverviewError(null);
      
//       try {
//         const data = await networkManager.getFinancialContributionsOverview(topic);
//         setFinancialOverviewData(data);
        
//         // Update the organization data with the financial overview data
//         if (data) {
//           const updatedData = {
//             ...(organizationDataLocation || organizationDataLocalStorage || defaultData),
//             ...data
//           };
//           localStorage.setItem("organizationData", JSON.stringify(updatedData));
//         }
//       } catch (err) {
//         console.error('Error fetching financial overview data:', err);
//         setFinancialOverviewError('Failed to load financial contributions overview data');
//       } finally {
//         setIsLoadingFinancialOverview(false);
//         setShouldFetchFinancialOverview(false); // Reset the flag
//       }
//     };

//     fetchFinancialOverviewData();
//   }, [shouldFetchFinancialOverview, categoryData, topic]);

//   // Fetch contribution data when component mounts or committee_id changes
//   useEffect(() => {
//     const fetchContributionsData = async () => {
//       if (!committee_id) return;
      
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const data = await networkManager.getContributionPercentages(committee_id);
//         setContributionsData(data);
//       } catch (err) {
//         console.error('Error fetching contributions data:', err);
//         setError('Failed to load contributions percentages breakdown data');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchContributionsData();
//   }, [committee_id]);

//   // Fetch recipient data when component mounts or committee_id changes
//   useEffect(() => {
//     const fetchRecipientData = async () => {
//       if (!committee_id) return;
      
//       setIsLoadingRecipients(true);
//       setRecipientError(null);
      
//       try {
//         const data = await networkManager.getContributionRecipients(committee_id);
//         setRecipientData(data);
//       } catch (err) {
//         console.error('Error fetching recipient data:', err);
//         setRecipientError('Failed to load contribution recipients data');
//       } finally {
//         setIsLoadingRecipients(false);
//       }
//     };

//     fetchRecipientData();
//   }, [committee_id]);

//   // Fetch leadership contributions data when component mounts or committee_id changes
//   useEffect(() => {
//     const fetchLeadershipData = async () => {
//       if (!committee_id) return;
      
//       setIsLoadingLeadership(true);
//       setLeadershipError(null);
      
//       try {
//         const data = await networkManager.getLeadershipContributions(committee_id);
//         setLeadershipData(data);
//       } catch (err) {
//         console.error('Error fetching leadership data:', err);
//         setLeadershipError('Failed to load leadership contributions data');
//       } finally {
//         setIsLoadingLeadership(false);
//       }
//     };

//     fetchLeadershipData();
//   }, [committee_id]);

//   const handleLogoClick = (event) => {
//     console.log(event)
//     navigate('/', {});
//   };

//   const handleFinancialContributionClick = () => {
//     // Navigate to the same page but with Financial Contributions category
//     const updatedOrganizationData = {
//       ...(organizationDataLocation || organizationDataLocalStorage || defaultData),
//       // Include any additional data needed for financial contributions view
//     };
    
//     // Set flags to indicate we should fetch financial overview data
//     localStorage.setItem("categoryData", "Financial Contributions");
//     localStorage.setItem("shouldFetchFinancialOverview", "true");
//     localStorage.setItem("organizationData", JSON.stringify(updatedOrganizationData));
    
//     // Navigate to the same route with updated state
//     navigate(location.pathname, { 
//       state: updatedOrganizationData,
//       replace: true 
//     });
    
//     // Force a page refresh to ensure the component re-renders with new category
//     window.location.reload();
//   };

//   return (
//     // <div className="min-h-screen bg-gray-100">
//     <div className="min-h-screen ">
//         {/* Logo */}
//         <div className="flex justify-centertop-0   w-full">
//           <div className="absolute top-4 left-8 cursor-pointer bg-white ">
//             <LogoHeader onClick={handleLogoClick} />
//           </div>
//         </div>

//         {/* Main Content Card - Centered */}
//         <div className="flex justify-center pt-28 px-4 lg:px-20">
//           <Card className="w-full max-w-3xl bg-white shadow-lg">

//             <CardHeader className="pb-2">
//               {categoryData !== 'Financial Contributions' && (
//                 <CardTitle className="text-2xl font-bold">
//                     Overview for {topic}
//                 </CardTitle>
//               )}
//               {categoryData === 'Financial Contributions' && (
//                 <CardTitle className="text-2xl font-bold">
//                     Financial Contributions Overview for {topic}
//                 </CardTitle>
//               )}
//             </CardHeader>
          
//             <CardContent className="space-y-6">
//               {/* Show loading state for Financial Contributions only when fetching overview */}
//               {categoryData === 'Financial Contributions' && shouldFetchFinancialOverview && isLoadingFinancialOverview && (
//                 <div className="text-center py-8">
//                   <div className="text-lg">Loading financial contributions overview...</div>
//                 </div>
//               )}

//               {/* Show error state for Financial Contributions only when there was a fetch error */}
//               {categoryData === 'Financial Contributions' && financialOverviewError && (
//                 <div className="text-center py-8">
//                   <div className="text-lg text-red-600">{financialOverviewError}</div>
//                 </div>
//               )}

//               {/* Only hide content when actively loading financial overview data from link click */}
//               {!(categoryData === 'Financial Contributions' && shouldFetchFinancialOverview && (isLoadingFinancialOverview || financialOverviewError)) && (
//                 <>
//                   {/* Category-specific ratings */}

//                   {/* Political Leaning Category */}
//                   {categoryData === 'Political Leaning' && (
//                     <PoliticalLeaningQuickLook 
//                       lean={lean}
//                       rating={rating}
//                     />
//                   )}      

//                   {/* Other Rating-only Categories */}
//                   {/* This includes:

//                       DEI Friendliness
//                       Wokeness
//                       Environmental Impact
//                       Immigration Support
//                       Techonology Innovation
//                       .. plus more to come likely

//                       Does NOT include Political Leaning or financial contributions.
//                   */}
//                   {categoryData !== 'Political Leaning' && categoryData !== 'Financial Contributions' &&(
//                     <OtherQueryCategoryRatingQuickLook
//                       text={`${categoryData} Rating:`}
//                       rating={rating}
//                     />
//                   )}             

//                   {/* Context */}
//                   <div className="text-base space-y-20 ">
//                     {context && context.split('\n').map((line, i) => (
//                       <React.Fragment key={i}>
//                         {line.trim()}
//                         {i < context.split('\n').length - 1 && <br />}
//                       </React.Fragment>
//                     ))}
//                   </div>
                
//                   {/* Financial Contributions Link - only show for Political Leaning when financial data exists */}
//                   {categoryData === 'Political Leaning' && created_with_financial_contributions_info === true && (
//                     <div className="space-y-2">
//                       {/* <h3 className="text-lg font-semibold">For a more in depth look</h3> */}
//                       <br></br>
//                       <h3 className="text-lg font-semibold">Citations:</h3>
//                       <div className="text-base">
//                         <button 
//                           onClick={handleFinancialContributionClick}
//                           className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
//                         >
//                           {/* Check out the financial contributions overview for a deeper dive into the financial contributions information. */}
//                           Financial Contributions Overview for {topic} 
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Citations */ }
//                   {/* This could eventualy include web crawed information and links to articles or Twitter/X posts. */}
//                   {/* {categoryData !== 'Financial Contributions' && (
//                     <div className="space-y-2">
//                       <h3 className="text-lg font-semibold">Citations:</h3>
//                       <div className="text-base">
//                         {(citation == null || citation !== "none") ? citation : "No citations available"}
//                       </div>
//                     </div>
//                   )} */}

//                   {/* Chart Components - only show for Financial Contributions */}
//                   {(isFinancialData || categoryData === 'Financial Contributions') && (
//                     <>
//                       <ContributionsByPartyChart 
//                         contributionsData={contributionsData}
//                         isLoading={isLoading}
//                         error={error}
//                       />
                      
//                       <TopContributionRecipientsChart 
//                         recipientData={recipientData}
//                         isLoadingRecipients={isLoadingRecipients}
//                         recipientError={recipientError}
//                         topic={topic}
//                         committee_id={committee_id}
//                         committee_name={committee_name}
//                       />
                    
//                       <LeadershipContributionsChart 
//                         leadershipData={leadershipData}
//                         isLoadingLeadership={isLoadingLeadership}
//                         leadershipError={leadershipError}
//                         topic={topic}
//                         committee_id={committee_id}
//                         displayedLeadershipCount={displayedLeadershipCount}
//                       />
//                     </>
//                   )}
//                 </>
//               )}

//             </CardContent> 
//           </Card>

//         </div>
//       </div>
//   );
// };

// export default OrganizationDetailOverview;


// // // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // // import { useLocation } from 'react-router-dom';
// // // // import { useState, useEffect } from 'react';
// // // // import { useNavigate} from 'react-router-dom';
// // // // import networkManager from './network/NetworkManager';
// // // // import React from "react";

// // // // // Import components
// // // // import ContributionsByPartyChart from './components/charts/ContributionsByPartyChart';
// // // // import TopContributionRecipientsChart from './components/charts/TopContributionRecipientsChart';
// // // // import LeadershipContributionsChart from './components/charts/LeadershipContributionsChart';
// // // // import PoliticalLeaningQuickLook  from './components/overview/PoliticalLeaningQuickLook';
// // // // import OtherQueryCategoryRatingQuickLook from './components/overview/OtherQueryCategoryRatingQuickLook';
// // // // import LogoHeader from './components/LogoHeader';

// // // // const OrganizationDetailOverview = () => {
// // // //   const location = useLocation();
// // // //   const organizationDataLocation = location.state; 
// // // //   const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
// // // //   const [categoryData, __] = useState(localStorage.getItem("categoryData"));
// // // //   const [isFinancialData, setIsFinancialData] = useState(false);
// // // //   const [contributionsData, setContributionsData] = useState(null);
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [error, setError] = useState(null);
// // // //   const [recipientData, setRecipientData] = useState(null);
// // // //   const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
// // // //   const [recipientError, setRecipientError] = useState(null);
// // // //   const [leadershipData, setLeadershipData] = useState(null);
// // // //   const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);
// // // //   const [leadershipError, setLeadershipError] = useState(null);
// // // //   const [displayedLeadershipCount, ___] = useState(10);
// // // //   const [financialOverviewData, setFinancialOverviewData] = useState(null);
// // // //   const [isLoadingFinancialOverview, setIsLoadingFinancialOverview] = useState(false);
// // // //   const [financialOverviewError, setFinancialOverviewError] = useState(null);
// // // //   const [shouldFetchFinancialOverview, setShouldFetchFinancialOverview] = useState(false);
// // // //   const navigate = useNavigate();

// // // //   // Default data if none provided.
// // // //   const defaultData = {
// // // //     timestamp: "2024-11-15T05:17:32.156000",
// // // //     citation: "none",
// // // //     context: "Organization context will be displayed here.",
// // // //     lean: "Neutral",
// // // //     rating: 0,
// // // //     topic: "Organization Name"
// // // //   };

// // // //   // Use provided data or fall back to default.
// // // //   var {
// // // //     topic,
// // // //     lean,
// // // //     rating,
// // // //     context,
// // // //     // @ts-expect-error
// // // //     citation,
// // // //     committee_id,
// // // //     committee_name,
// // // //     created_with_financial_contributions_info,
// // // //   } = organizationDataLocation || organizationDataLocalStorage || defaultData;

// // // //   // If financial contribution. 
// // // //   // TODO: Actually learn react and figure out a better way to do this.
// // // //   if (categoryData == 'Financial Contributions') {
// // // //     // Use financial overview data if available, otherwise fall back to existing data
// // // //     if (financialOverviewData) {
// // // //       context = financialOverviewData.fec_financial_contributions_summary_text || financialOverviewData.context;
// // // //       committee_id = financialOverviewData.committee_id || committee_id;
// // // //       committee_name = financialOverviewData.committee_name || committee_name;
// // // //     } else {
// // // //       context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
// // // //       || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)
// // // //     }

// // // //     // Some committee IDs were wrongly stored as integers with leading zeros removed.
// // // //     // We will fix that here.
// // // //     if (committee_id && committee_id.length <= 9) {    
// // // //       let prepend_C = ''
// // // //       if (!isNaN(committee_id) && committee_id[0] != 'C') {
// // // //         prepend_C = 'C'
// // // //       }
// // // //       // If leading zeros need to be added.
// // // //       let zeros = ''
// // // //       if (!isNaN(committee_id) && committee_id.length < 8) {
// // // //         const num_zeros_to_add = 8 - committee_id.length
// // // //         let i = 0
// // // //         while (i < num_zeros_to_add) {
// // // //           zeros += '0'
// // // //           i += 1
// // // //         }
// // // //       }
// // // //       // Update committee id based on what we calculated above.
// // // //       const updated_committe_id = prepend_C + zeros + committee_id
// // // //       committee_id = updated_committe_id
// // // //     }
// // // //     console.log('\nCommittee ID:')
// // // //     console.log(committee_id)
// // // //   }

// // // //   useEffect(() => {
// // // //     setIsFinancialData(categoryData == 'Financial Contributions')
    
// // // //     // Check if we should fetch financial overview data (coming from the link click)
// // // //     const shouldFetch = localStorage.getItem("shouldFetchFinancialOverview");
// // // //     if (shouldFetch === "true") {
// // // //       setShouldFetchFinancialOverview(true);
// // // //       localStorage.removeItem("shouldFetchFinancialOverview"); // Clean up the flag
// // // //     }
// // // //   }, [categoryData]);

// // // //   // Fetch financial overview data only when triggered by the link click
// // // //   useEffect(() => {
// // // //     const fetchFinancialOverviewData = async () => {
// // // //       if (!shouldFetchFinancialOverview || categoryData !== 'Financial Contributions' || !topic) return;
      
// // // //       setIsLoadingFinancialOverview(true);
// // // //       setFinancialOverviewError(null);
      
// // // //       try {
// // // //         const data = await networkManager.getFinancialContributionsOverview(topic);
// // // //         setFinancialOverviewData(data);
        
// // // //         // Update the organization data with the financial overview data
// // // //         if (data) {
// // // //           const updatedData = {
// // // //             ...(organizationDataLocation || organizationDataLocalStorage || defaultData),
// // // //             ...data
// // // //           };
// // // //           localStorage.setItem("organizationData", JSON.stringify(updatedData));
// // // //         }
// // // //       } catch (err) {
// // // //         console.error('Error fetching financial overview data:', err);
// // // //         setFinancialOverviewError('Failed to load financial contributions overview data');
// // // //       } finally {
// // // //         setIsLoadingFinancialOverview(false);
// // // //         setShouldFetchFinancialOverview(false); // Reset the flag
// // // //       }
// // // //     };

// // // //     fetchFinancialOverviewData();
// // // //   }, [shouldFetchFinancialOverview, categoryData, topic]);

// // // //   // Fetch contribution data when component mounts or committee_id changes
// // // //   useEffect(() => {
// // // //     const fetchContributionsData = async () => {
// // // //       if (!committee_id) return;
      
// // // //       setIsLoading(true);
// // // //       setError(null);
      
// // // //       try {
// // // //         const data = await networkManager.getContributionPercentages(committee_id);
// // // //         setContributionsData(data);
// // // //       } catch (err) {
// // // //         console.error('Error fetching contributions data:', err);
// // // //         setError('Failed to load contributions percentages breakdown data');
// // // //       } finally {
// // // //         setIsLoading(false);
// // // //       }
// // // //     };

// // // //     fetchContributionsData();
// // // //   }, [committee_id]);

// // // //   // Fetch recipient data when component mounts or committee_id changes
// // // //   useEffect(() => {
// // // //     const fetchRecipientData = async () => {
// // // //       if (!committee_id) return;
      
// // // //       setIsLoadingRecipients(true);
// // // //       setRecipientError(null);
      
// // // //       try {
// // // //         const data = await networkManager.getContributionRecipients(committee_id);
// // // //         setRecipientData(data);
// // // //       } catch (err) {
// // // //         console.error('Error fetching recipient data:', err);
// // // //         setRecipientError('Failed to load contribution recipients data');
// // // //       } finally {
// // // //         setIsLoadingRecipients(false);
// // // //       }
// // // //     };

// // // //     fetchRecipientData();
// // // //   }, [committee_id]);

// // // //   // Fetch leadership contributions data when component mounts or committee_id changes
// // // //   useEffect(() => {
// // // //     const fetchLeadershipData = async () => {
// // // //       if (!committee_id) return;
      
// // // //       setIsLoadingLeadership(true);
// // // //       setLeadershipError(null);
      
// // // //       try {
// // // //         const data = await networkManager.getLeadershipContributions(committee_id);
// // // //         setLeadershipData(data);
// // // //       } catch (err) {
// // // //         console.error('Error fetching leadership data:', err);
// // // //         setLeadershipError('Failed to load leadership contributions data');
// // // //       } finally {
// // // //         setIsLoadingLeadership(false);
// // // //       }
// // // //     };

// // // //     fetchLeadershipData();
// // // //   }, [committee_id]);

// // // //   const handleLogoClick = (event) => {
// // // //     console.log(event)
// // // //     navigate('/', {});
// // // //   };

// // // //   const handleFinancialContributionClick = () => {
// // // //     // Navigate to the same page but with Financial Contributions category
// // // //     const updatedOrganizationData = {
// // // //       ...(organizationDataLocation || organizationDataLocalStorage || defaultData),
// // // //       // Include any additional data needed for financial contributions view
// // // //     };
    
// // // //     // Set flags to indicate we should fetch financial overview data
// // // //     localStorage.setItem("categoryData", "Financial Contributions");
// // // //     localStorage.setItem("shouldFetchFinancialOverview", "true");
// // // //     localStorage.setItem("organizationData", JSON.stringify(updatedOrganizationData));
    
// // // //     // Navigate to the same route with updated state
// // // //     navigate(location.pathname, { 
// // // //       state: updatedOrganizationData,
// // // //       replace: true 
// // // //     });
    
// // // //     // Force a page refresh to ensure the component re-renders with new category
// // // //     window.location.reload();
// // // //   };


// // // //   return (
// // // //     <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
// // // //         {/* Logo */}
// // // //         <div className="absolute top-4 left-8 cursor-pointer">
// // // //           <LogoHeader onClick={handleLogoClick} />
// // // //         </div>

// // // //         {/* categoryData */}
// // // //         <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
// // // //           <CardHeader className="pb-2">
// // // //             {categoryData !== 'Financial Contributions' && (
// // // //               <CardTitle className="text-2xl font-bold">
// // // //                   Overview for {topic}
// // // //               </CardTitle>
// // // //             )}
// // // //             {categoryData === 'Financial Contributions' && (
// // // //               <CardTitle className="text-2xl font-bold">
// // // //                   Financial Contributions Overview for {topic}
// // // //               </CardTitle>
// // // //             )}
// // // //           </CardHeader>
          
// // // //           <CardContent className="space-y-6">
// // // //             {/* Show loading state for Financial Contributions only when fetching overview */}
// // // //             {categoryData === 'Financial Contributions' && shouldFetchFinancialOverview && isLoadingFinancialOverview && (
// // // //               <div className="text-center py-8">
// // // //                 <div className="text-lg">Loading financial contributions overview...</div>
// // // //               </div>
// // // //             )}

// // // //             {/* Show error state for Financial Contributions only when there was a fetch error */}
// // // //             {categoryData === 'Financial Contributions' && financialOverviewError && (
// // // //               <div className="text-center py-8">
// // // //                 <div className="text-lg text-red-600">{financialOverviewError}</div>
// // // //               </div>
// // // //             )}

// // // //             {/* Only hide content when actively loading financial overview data from link click */}
// // // //             {!(categoryData === 'Financial Contributions' && shouldFetchFinancialOverview && (isLoadingFinancialOverview || financialOverviewError)) && (
// // // //               <>
// // // //                 {/* Category-specific ratings */}

// // // //                 {/* Political Leaning Category */}
// // // //                 {categoryData === 'Political Leaning' && (
// // // //                   <PoliticalLeaningQuickLook 
// // // //                     lean={lean}
// // // //                     rating={rating}
// // // //                   />
// // // //                 )}      

// // // //                 {/* Other Rating-only Categories */}
// // // //                 {/* This includes:

// // // //                     DEI Friendliness
// // // //                     Wokeness
// // // //                     Environmental Impact
// // // //                     Immigration Support
// // // //                     Techonology Innovation
// // // //                     .. plus more to come likely

// // // //                     Does NOT include Political Leaning or financial contributions.
// // // //                 */}
// // // //                 {categoryData !== 'Political Leaning' && categoryData !== 'Financial Contributions' &&(
// // // //                   <OtherQueryCategoryRatingQuickLook
// // // //                     text={`${categoryData} Rating:`}
// // // //                     rating={rating}
// // // //                   />
// // // //                 )}             

// // // //                 {/* Context */}
// // // //                 <div className="text-base space-y-20 ">
// // // //                   {context && context.split('\n').map((line, i) => (
// // // //                     <React.Fragment key={i}>
// // // //                       {line.trim()}
// // // //                       {i < context.split('\n').length - 1 && <br />}
// // // //                     </React.Fragment>
// // // //                   ))}
// // // //                 </div>
                
// // // //                 {/* Financial Contributions Link - only show for Political Leaning when financial data exists */}
// // // //                 {categoryData === 'Political Leaning' && created_with_financial_contributions_info === true && (
// // // //                   <div className="space-y-2">
// // // //                     {/* <h3 className="text-lg font-semibold">For a more in depth look</h3> */}
// // // //                     <br></br>
// // // //                     <h3 className="text-lg font-semibold">Citations:</h3>
// // // //                     <div className="text-base">
// // // //                       <button 
// // // //                         onClick={handleFinancialContributionClick}
// // // //                         className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
// // // //                       >
// // // //                         {/* Check out the financial contributions overview for a deeper dive into the financial contributions information. */}
// // // //                         Financial Contributions Overview for {topic} 
// // // //                       </button>
// // // //                     </div>
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Citations */ }
// // // //                 {/* This could eventualy include web crawed information and links to articles or Twitter/X posts. */}
// // // //                 {/* {categoryData !== 'Financial Contributions' && (
// // // //                   <div className="space-y-2">
// // // //                     <h3 className="text-lg font-semibold">Citations:</h3>
// // // //                     <div className="text-base">
// // // //                       {(citation == null || citation !== "none") ? citation : "No citations available"}
// // // //                     </div>
// // // //                   </div>
// // // //                 )} */}

// // // //                 {/* Chart Components - only show for Financial Contributions */}
// // // //                 {(isFinancialData || categoryData === 'Financial Contributions') && (
// // // //                   <>
// // // //                     <ContributionsByPartyChart 
// // // //                       contributionsData={contributionsData}
// // // //                       isLoading={isLoading}
// // // //                       error={error}
// // // //                     />
                    
// // // //                     <TopContributionRecipientsChart 
// // // //                       recipientData={recipientData}
// // // //                       isLoadingRecipients={isLoadingRecipients}
// // // //                       recipientError={recipientError}
// // // //                       topic={topic}
// // // //                       committee_id={committee_id}
// // // //                       committee_name={committee_name}
// // // //                     />
                    
// // // //                     <LeadershipContributionsChart 
// // // //                       leadershipData={leadershipData}
// // // //                       isLoadingLeadership={isLoadingLeadership}
// // // //                       leadershipError={leadershipError}
// // // //                       topic={topic}
// // // //                       committee_id={committee_id}
// // // //                       displayedLeadershipCount={displayedLeadershipCount}
// // // //                     />
// // // //                   </>
// // // //                 )}
// // // //               </>
// // // //             )}

// // // //           </CardContent> 
// // // //         </Card> 
// // // //       </div>
// // // //   );
// // // // };

// // // // export default OrganizationDetailOverview;