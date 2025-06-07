import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import networkManager from './network/NetworkManager'; 
// @ts-expect-error
import checkmark_logo from './assets/blue_checkmark_logo.png';
import React from "react";

// Import components
import ContributionsByPartyChart from './components/charts/ContributionsByPartyChart';
import TopContributionRecipientsChart from './components/charts/TopContributionRecipientsChart';
import LeadershipContributionsChart from './components/charts/LeadershipContributionsChart';
import LogoHeader from './components/LogoHeader';

const OrganizationDetailOverview = () => {
  const location = useLocation();
  const organizationDataLocation = location.state; 
  const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
  const [categoryData, __] = useState(localStorage.getItem("categoryData"));
  const [isFinancialData, setIsFinancialData] = useState(false);
  const [contributionsData, setContributionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);
  const [leadershipError, setLeadershipError] = useState(null);
  const [displayedLeadershipCount, ___] = useState(10);
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
    committee_id,
    committee_name
  } = organizationDataLocation || organizationDataLocalStorage || defaultData;

  // If financial contribution. 
  // TODO: Actually learn react and figure out a better way to do this.
  if (categoryData == 'Financial Contributions') {
    context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
    || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)

    // Some committee IDs were wrongly stored as integers with leading zeros removed.
    // We will fix that here.
    if (committee_id && committee_id.length <= 9) {    
      let prepend_C = ''
      if (!isNaN(committee_id) && committee_id[0] != 'C') {
        prepend_C = 'C'
      }
      // If leading zeros need to be added.
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
    setIsFinancialData(categoryData == 'Financial Contributions')
  }, [categoryData]);

  // Fetch contribution data when component mounts or committee_id changes
  useEffect(() => {
    const fetchContributionsData = async () => {
      if (!committee_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await networkManager.getContributionPercentages(committee_id);
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
        const data = await networkManager.getContributionRecipients(committee_id);
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
        const data = await networkManager.getLeadershipContributions(committee_id);
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

  return (
    <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
        {/* Logo */}
        <div className="absolute top-4 left-8 cursor-pointer">
          <LogoHeader onClick={handleLogoClick} />
        </div>

        {/* categoryData */}
        <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              Overview for {topic}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Category-specific ratings */}
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

            {/* Chart Components - only show for Financial Contributions */}
            {(isFinancialData || categoryData === 'Financial Contributions') && (
              <>
                <ContributionsByPartyChart 
                  contributionsData={contributionsData}
                  isLoading={isLoading}
                  error={error}
                />
                
                <TopContributionRecipientsChart 
                  recipientData={recipientData}
                  isLoadingRecipients={isLoadingRecipients}
                  recipientError={recipientError}
                  topic={topic}
                  committee_id={committee_id}
                  committee_name={committee_name}
                />
                
                <LeadershipContributionsChart 
                  leadershipData={leadershipData}
                  isLoadingLeadership={isLoadingLeadership}
                  leadershipError={leadershipError}
                  topic={topic}
                  committee_id={committee_id}
                  displayedLeadershipCount={displayedLeadershipCount}
                />
              </>
            )}

          </CardContent> 
        </Card> 
      </div>
  );
};

export default OrganizationDetailOverview;