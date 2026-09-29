// TODO: party breakdown chart temporarily turned off.
// import ContributionsByPartyChart from '../charts/ContributionsByPartyChart';
import TopContributionRecipientsChart from '../charts/TopContributionRecipientsChart';
// TODO: disabled until /getContributionsToCommitteeFromLeadershipOnly is recreated on the backend.
// import LeadershipContributionsChart from '../charts/LeadershipContributionsChart';

const ChartsSection = ({ 
  isFinancialData,
  categoryData,
  // TODO: party breakdown chart temporarily turned off.
  // contributionsData,
  // isLoading,
  // error,
  recipientData,
  isLoadingRecipients,
  recipientError,
  topic,
  committee_id,
  committee_name,
  // TODO: disabled until /getContributionsToCommitteeFromLeadershipOnly is recreated on the backend.
  // leadershipData,
  // isLoadingLeadership,
  // leadershipError,
  // displayedLeadershipCount
}) => {
  if (!isFinancialData && categoryData !== 'Financial Contributions') {
    return null;
  }

  return (
    <>
      {/* TODO: party breakdown chart temporarily turned off.
      <hr className="border-gray-200" />

      <ContributionsByPartyChart
        contributionsData={contributionsData}
        isLoading={isLoading}
        error={error}
      />
      */}

      <hr className="border-gray-200" />

      <TopContributionRecipientsChart 
        recipientData={recipientData}
        isLoadingRecipients={isLoadingRecipients}
        recipientError={recipientError}
        topic={topic}
        committee_id={committee_id}
        committee_name={committee_name}
      />

      {/* TODO: disabled until /getContributionsToCommitteeFromLeadershipOnly is recreated on the backend.
      <hr className="border-gray-200" />

      <LeadershipContributionsChart
        leadershipData={leadershipData}
        isLoadingLeadership={isLoadingLeadership}
        leadershipError={leadershipError}
        topic={topic}
        committee_id={committee_id}
        displayedLeadershipCount={displayedLeadershipCount}
      />
      */}
    </>
  );
};

export default ChartsSection;