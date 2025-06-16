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
  );
};

export default ChartsSection;