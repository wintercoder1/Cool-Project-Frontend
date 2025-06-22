import ContributionsByPartyChart from '../charts/ContributionsByPartyChart';
import TopContributionRecipientsChart from '../charts/TopContributionRecipientsChart';
import LeadershipContributionsChart from '../charts/LeadershipContributionsChart';

const ChartsSection = ({ 
  isFinancialData,
  categoryData,
  contributionsData,
  isLoading,
  error,
  recipientData,
  isLoadingRecipients,
  recipientError,
  topic,
  committee_id,
  committee_name,
  leadershipData,
  isLoadingLeadership,
  leadershipError,
  displayedLeadershipCount
}) => {
  if (!isFinancialData && categoryData !== 'Financial Contributions') {
    return null;
  }

  return (
    <>
      <hr className="border-gray-200" />

      <ContributionsByPartyChart 
        contributionsData={contributionsData}
        isLoading={isLoading}
        error={error}
      />
      
      <hr className="border-gray-200" />

      <TopContributionRecipientsChart 
        recipientData={recipientData}
        isLoadingRecipients={isLoadingRecipients}
        recipientError={recipientError}
        topic={topic}
        committee_id={committee_id}
        committee_name={committee_name}
      />
    
      <hr className="border-gray-200" />
      
      <LeadershipContributionsChart 
        leadershipData={leadershipData}
        isLoadingLeadership={isLoadingLeadership}
        leadershipError={leadershipError}
        topic={topic}
        committee_id={committee_id}
        displayedLeadershipCount={displayedLeadershipCount}
      />
    </>
  );
};

export default ChartsSection;