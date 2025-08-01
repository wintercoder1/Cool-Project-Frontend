
export default function LeadershipContributionsChart({ 
  leadershipData, 
  isLoadingLeadership, 
  leadershipError,
  topic,
  committee_id,
  displayedLeadershipCount = 10
}) {
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
    .sort((a, b) => b.total_amount - a.total_amount);
  
  // Take the number of leadership contributors to display
  const displayedLeadership = sortedLeadership.slice(0, displayedLeadershipCount);
  
  const handleViewAllLeadershipInNewTab = () => {
    localStorage.setItem('leadershipContributionsData', JSON.stringify({
      leadership: sortedLeadership,
      organizationName: topic,
      committeeId: committee_id
    }));

    // window.open('#/organizationRecipientsTotals', "_blank", "noreferrer");
    window.open('#/organizationLeadershipContributionTotals', "_blank", "noreferrer");
  };
  
  // Calculate total amount for summary
  const totalLeadershipAmount = sortedLeadership.reduce((sum, contributor) => sum + contributor.total_amount, 0);
  
  // This was a weird bug idk.
  const smaller = displayedLeadershipCount <= sortedLeadership.length ?  displayedLeadershipCount  : sortedLeadership.length;
  const larger = displayedLeadershipCount <= sortedLeadership.length ?  sortedLeadership.length : displayedLeadershipCount;

  return (
    <div className="space-y-4 py-5 mt-8">
      <h3 className="text-xl font-semibold">Contributions from Company Leadership</h3>
      
      <div className="text-base mb-4">
        <div>Total from Leadership: ${totalLeadershipAmount.toLocaleString()}</div>
        <div className="text-sm text-gray-600">
          {sortedLeadership.length} leadership contributor{sortedLeadership.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-3">
        {displayedLeadership.map((contributor, index) => {
          return (
            <div key={`${contributor.name}-${contributor.employer}-${index}`} className="p-0 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {contributor.name}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {contributor.occupation}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {contributor.employer}
                  </div>
                </div>
                <div className="ml-4 text-right flex-shrink-0">
                  <div className="font-semibold text-gray-900">
                    ${contributor.total_amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
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
          Showing {smaller} of {larger} total leadership contributors
        </div>
        
        {/* <div className="flex justify-center gap-3">
          <button
            onClick={handleViewAllLeadershipInNewTab}
            className="px-4 py-2 bg-gray-100 text-gray rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            View All Leadership Contributors
          </button>
        </div> */}

      </div>

    </div>
  );
};
