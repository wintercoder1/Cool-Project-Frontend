import { useState } from 'react';

export default function TopContributionRecipientsChart({ 
  recipientData, 
  isLoadingRecipients, 
  recipientError,
  topic,
  committee_id,
  committee_name
}) {
  const [displayedRecipientsCount, setDisplayedRecipientsCount] = useState(10);

  if (isLoadingRecipients) return <div className="text-center py-4">Loading recipients data...</div>;
  if (recipientError) return <div className="text-center py-4 text-gray-500">{recipientError}</div>;
  if (!recipientData || !recipientData.contribution_totals) return null;

  const recipients = recipientData.contribution_totals;
  
  // Sort recipients by total contribution amount (descending)
  const sortedRecipients = [...recipients].sort((a, b) => b.total_contribution_amount - a.total_contribution_amount);
  
  // Take the number of recipients to display based on current count
  const displayedRecipients = sortedRecipients.slice(0, displayedRecipientsCount);
  
  const handleLoadMore = () => {
    setDisplayedRecipientsCount(prev => Math.min(prev + 10, recipients.length));
  };
  
  const handleViewAllInNewTab = () => {
    // Create a new window/tab with the recipients data
    localStorage.setItem('recipientsTotalsData', JSON.stringify({
      recipients: sortedRecipients,
      organizationName: topic,
      committeeID: committee_id,
      committeeName: committee_name
    }));

    window.open('#/organizationRecipientsTotals', "_blank", "noreferrer");
  };
  
  const hasMoreRecipients = displayedRecipientsCount < recipients.length;
  
  // This was a weird bug idk.
  const smaller = displayedRecipientsCount <= sortedRecipients.length ?  displayedRecipientsCount  : sortedRecipients.length;
  const larger = displayedRecipientsCount <= sortedRecipients.length ?  sortedRecipients.length : displayedRecipientsCount;

  return (
    <div className="space-y-4 py-5 mt-8">
      <h3 className="text-xl font-semibold">Top Contribution Recipients</h3>
      
      <div className="space-y-3">
        {displayedRecipients.map((recipient) => {
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
          Showing {smaller} of {larger} total recipients
        </div> 
        
        <div className="flex justify-center gap-3">
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

// export default TopContributionRecipientsChart;