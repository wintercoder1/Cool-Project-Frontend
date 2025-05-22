import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
// @ts-expect-error
import checkmark_logo from './assets/blue_checkmark_logo.png';
import React from "react";

const OrganizationDetailOverview = () => {
  const location = useLocation();
  const organizationDataLocation = location.state; 
  const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
  const [categoryData, __] = useState(localStorage.getItem("categoryData"));
  const [isFinancialData, setIsFinacialData] = useState(false);
  const [contributionsData, setContributionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState(null);
  const [displayedRecipientsCount, setDisplayedRecipientsCount] = useState(10);
  const [leadershipData, setLeadershipData] = useState(null);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);
  const [leadershipError, setLeadershipError] = useState(null);
  const [displayedLeadershipCount, setDisplayedLeadershipCount] = useState(10);
  const navigate = useNavigate();

  // Default data if none provided.
  const defaultData = {
    timestamp: "2024-11-15T05:17:32.156000",
    citation: "none",
    context: "Organization context will be displayed here.",
    lean: "Neutral",
    rating: 0,
    topic: "Organization Name"
  };

  // Use provided data or fall back to default.
  var {
    topic,
    lean,
    rating,
    context,
    citation,
    committee_id
  } = organizationDataLocation || organizationDataLocalStorage || defaultData;

  // If financial contrubution. 
  // TODO: Actually learn react and figure out a better way to do this.
  if (categoryData == 'Financial Contributions') {
    context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
    || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)
    // setIsFinacialData(true)

    // Some comittee IDs were wrongly stored as integers with leading zeros removed.
    // We will fix that here.
    if (committee_id && committee_id.length <= 9) {    
      let prepend_C = ''
      if (!isNaN(committee_id) && committee_id[0] != 'C') {
        prepend_C = 'C'
      }
      // // If leading zeros need to be added.
      // // If committee ID is number format with missing zeroes.
      let zeros = ''
      if (!isNaN(committee_id) && committee_id.length < 8) {
        const num_zeros_to_add = 8 - committee_id.length
        let i = 0
        while (i < num_zeros_to_add) {
          zeros += '0'
          i += 1
        }
      }
      // Update committee id based on what we calculated above.
      const updated_committe_id = prepend_C + zeros + committee_id
      committee_id = updated_committe_id
    }
    console.log('\nCommittee ID:')
    console.log(committee_id)
  }

  useEffect(() => {
    setIsFinacialData(categoryData == 'Financial Contributions')
  }, [categoryData]);

  // Fetch contribution data when component mounts or committee_id changes
  useEffect(() => {
    const fetchContributionsData = async () => {
      if (!committee_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${committee_id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setContributionsData(data);
      } catch (err) {
        console.error('Error fetching contributions data:', err);
        setError('Failed to load contributions percentages breakdown data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionsData();
  }, [committee_id]);

  // Fetch recipient data when component mounts or committee_id changes
  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!committee_id) return;
      
      setIsLoadingRecipients(true);
      setRecipientError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/getContributionRecipientTotalsList/${committee_id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setRecipientData(data);
      } catch (err) {
        console.error('Error fetching recipient data:', err);
        setRecipientError('Failed to load contribution recipients data');
      } finally {
        setIsLoadingRecipients(false);
      }
    };

    fetchRecipientData();
  }, [committee_id]);

  // Fetch leadership contributions data when component mounts or committee_id changes
  useEffect(() => {
    const fetchLeadershipData = async () => {
      if (!committee_id) return;
      
      setIsLoadingLeadership(true);
      setLeadershipError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/getContributionsToCommitteeFromLeadershipOnly/${committee_id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setLeadershipData(data);
      } catch (err) {
        console.error('Error fetching leadership data:', err);
        setLeadershipError('Failed to load leadership contributions data');
      } finally {
        setIsLoadingLeadership(false);
      }
    };

    fetchLeadershipData();
  }, [committee_id]);

  const handleLogoClick = (event) => {
    console.log(event)
    navigate('/', {});
  };

  // Render the contributions chart
  const renderContributionsChart = () => {
    if (isLoading) return <div className="text-center py-4">Loading contributions data...</div>;
    if (error) return <div className="text-center py-4 text-gray-500">{error}</div>;
    if (!contributionsData) return null;

    const { percent_to_republicans, percent_to_democrats, total_to_republicans, total_to_democrats, total_contributions } = contributionsData;
    
    // Calculate "Other" percentage if needed
    const totalPercent = percent_to_republicans + percent_to_democrats;
    const hasOther = Math.abs(totalPercent - 100) > 0.01; // Using small threshold for floating point comparison
    const percentOther = hasOther ? 100 - totalPercent : 0;
    const totalOther = hasOther ? total_contributions - total_to_republicans - total_to_democrats : 0;
    
    return (
      <div className="space-y-4 py-8 mt-6">
        <h3 className="text-xl font-semibold">Political Contributions Breakdown</h3>
        
        <div className="text-base space-y-2">
          <div>Total Contributions: ${total_contributions.toLocaleString()}</div>
          <div>To Republicans: ${total_to_republicans.toLocaleString()} ({percent_to_republicans}%)</div>
          <div>To Democrats: ${total_to_democrats.toLocaleString()} ({percent_to_democrats}%)</div>
          {hasOther && (
            <div>Other: ${totalOther.toLocaleString()} ({percentOther.toFixed(2)}%)</div>
          )}
        </div>
        
        <div className="relative h-8 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500" 
            style={{ width: `${percent_to_democrats}%` }}
          ></div>
          <div 
            className="absolute right-0 top-0 h-full bg-red-500" 
            style={{ width: `${percent_to_republicans}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 mr-1 rounded-full"></div>
            <span>Democrats</span>
          </div>
          {hasOther && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 mr-1 rounded-full"></div>
              <span>Other</span>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 mr-1 rounded-full"></div>
            <span>Republicans</span>
          </div>
        </div>
      </div>
    );
  };

  // Render the recipients chart
  const renderTopContributionRecipientsChart = () => {
    if (isLoadingRecipients) return <div className="text-center py-4">Loading recipients data...</div>;
    if (recipientError) return <div className="text-center py-4 text-gray-500">{recipientError}</div>;
    if (!recipientData || !recipientData.contribution_totals) return null;

    const recipients = recipientData.contribution_totals;
    
    // Sort recipients by total contribution amount (descending)
    const sortedRecipients = [...recipients].sort((a, b) => b.total_contribution_amount - a.total_contribution_amount);
    
    // Take the number of recipients to display based on current count
    const displayedRecipients = sortedRecipients.slice(0, displayedRecipientsCount);
    
    // @ts-expect-error
    const handleLoadMore = () => {
      setDisplayedRecipientsCount(prev => Math.min(prev + 10, recipients.length));
    };
    
    const handleViewAllInNewTab = () => {
      // Create a new window/tab with the recipients data
      // const newWindow = window.open('', '_blank');
      // if (newWindow) { 
        localStorage.setItem('recipientsTotalsData', JSON.stringify({
          recipients: sortedRecipients,
          organizationName: topic,
          committeeId: committee_id
        }));
 
        window.open('#/organizationRecipientsTotals', "_blank", "noreferrer");
      // }
    };
    
    // @ts-expect-error
    const hasMoreRecipients = displayedRecipientsCount < recipients.length;
    
    return (
      <div className="space-y-4 py-8 mt-8">
        <h3 className="text-xl font-semibold">Top Contribution Recipients</h3>
        
        <div className="space-y-3">
          {displayedRecipients.map((recipient, _) => { //(recipient, index)
            
            return (
              <div key={recipient.recipient_id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900 truncate max-w-xs">
                    {recipient.recipient_name}
                  </span>
                  <span className="text-gray-600 whitespace-nowrap ml-2">
                    ${recipient.total_contribution_amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {recipient.number_of_contributions} contribution{recipient.number_of_contributions !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            Showing {displayedRecipientsCount} of {recipients.length} total recipients
          </div>
          
          <div className="flex justify-center gap-3">
            {/* {hasMoreRecipients && (
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                Load More ({Math.min(10, recipients.length - displayedRecipientsCount)} more)
              </button>
            )} */}
            
            <button
              onClick={handleViewAllInNewTab}
              className="px-4 py-2 bg-gray-100 text-gray rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              View All Contribution Recipients
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the leadership contributions chart
  const renderLeadershipContributionsChart = () => {
    if (isLoadingLeadership) return <div className="text-center py-4">Loading leadership contributions data...</div>;
    if (leadershipError) return <div className="text-center py-4 text-gray-500">{leadershipError}</div>;
    if (!leadershipData || !leadershipData.leadership_contributors_to_committee) return null;

    const leadership = leadershipData.leadership_contributors_to_committee;
    
    // Aggregate contributions by person (name + employer combination)
    const aggregatedContributions = {};
    leadership.forEach(contributor => {
      const key = `${contributor.name}-${contributor.employer}`;
      if (!aggregatedContributions[key]) {
        aggregatedContributions[key] = {
          name: contributor.name,
          employer: contributor.employer,
          occupation: contributor.occupation,
          total_amount: 0,
          contribution_count: 0
        };
      }
      aggregatedContributions[key].total_amount += parseFloat(contributor.transaction_amount);
      aggregatedContributions[key].contribution_count += 1;
    });
    
    // Convert to array and sort by total contribution amount (descending)
    const sortedLeadership = Object.values(aggregatedContributions)
    // @ts-expect-error
      .sort((a, b) => b.total_amount - a.total_amount);
    
    // Take the number of leadership contributors to display
    const displayedLeadership = sortedLeadership.slice(0, displayedLeadershipCount);
    
    const handleViewAllLeadershipInNewTab = () => {
      localStorage.setItem('leadershipContributionsData', JSON.stringify({
        leadership: sortedLeadership,
        organizationName: topic,
        committeeId: committee_id
      }));
 
      window.open('#/organizationLeadershipContributions', "_blank", "noreferrer");
    };
    
    // Calculate total amount for summary
    // @ts-expect-error
    const totalLeadershipAmount = sortedLeadership.reduce((sum, contributor) => sum + contributor.total_amount, 0);
    
    return (
      <div className="space-y-4 py-8 mt-8">
        <h3 className="text-xl font-semibold">Leadership Contributions to Company Committee</h3>
        
        <div className="text-base mb-4">
          <div>Total from Leadership: ${totalLeadershipAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">
            {sortedLeadership.length} leadership contributor{sortedLeadership.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-3">
          {displayedLeadership.map((contributor, index) => {
            return (
              // @ts-expect-error
              <div key={`${contributor.name}-${contributor.employer}-${index}`} className="p-0 rounded-lg">
              {/* <div key={`${contributor.name}-${contributor.employer}-${index}`} className="bg-gray-50 p-3 rounded-lg"> */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {/* @ts-expect-error */}
                      {contributor.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {/* @ts-expect-error */}
                      {contributor.occupation}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {/* @ts-expect-error */}
                      {contributor.employer}
                    </div>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">
                    {/* <div className="font-semibold "> */}
                      {/* @ts-expect-error */}
                      ${contributor.total_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {/* @ts-expect-error */}
                      {contributor.contribution_count} contribution{contributor.contribution_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            {/* Showing {displayedLeadershipCount} of {sortedLeadership.length} total leadership contributors */}
            Showing {sortedLeadership.length} of {displayedLeadershipCount} total leadership contributors
          </div>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={handleViewAllLeadershipInNewTab}
              className="px-4 py-2 bg-gray-100 text-gray rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              View All Leadership Contributors
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
        {/* Logo */}
        <div 
          className="absolute top-4 left-8 cursor-pointer "
          role="button"
          onClick={handleLogoClick}
          tabIndex={0}
        >

          <div className="flex items-center gap-2 justify-center sm:justify-start">
              <img src={checkmark_logo} className="block" width="55" height="55" alt="blue_check_logo" />
              <h1 className="text-4xl font-bold text-black">MoralCheck AI</h1>
          </div>
    
        </div>
       

        {/* categoryData */}
        <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              Overview for {topic}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Rest of your content remains the same */}
            {categoryData == 'Political Leaning' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                  Lean: {lean ? lean.trim(): ''}
                </div>
                <div className="text-lg">
                  Rating: {rating}
                </div>
              </div>
            )}
            {categoryData == 'DEI Friendliness' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                DEI Friendliness Rating: {rating}
                </div>
              </div>
            )}
            {categoryData == 'Wokeness' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                  Wokeness Rating: {rating}
                </div>
              </div>
            )}

            {/* Context */}
            <div className="text-base">
              {context.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.trim()}
                  {i < context.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>

            {/* Citations */ }
            {categoryData !== 'Financial Contributions' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Citations:</h3>
                <div className="text-base">
                  {(citation == null || citation !== "none") ? citation : "No citations available"}
                </div>
              </div>
            )}

            {/* Political Contributions Chart */}
            {(isFinancialData || categoryData === 'Financial Contributions') && renderContributionsChart()}

            {/* Top Recipients Chart */}
            {(isFinancialData || categoryData === 'Financial Contributions') && renderTopContributionRecipientsChart()}
            
            {/* Leadership Contributions Chart */}
            {(isFinancialData || categoryData === 'Financial Contributions') && renderLeadershipContributionsChart()}

          </CardContent> 
        </Card> 
      </div>
  );
};


export default OrganizationDetailOverview;