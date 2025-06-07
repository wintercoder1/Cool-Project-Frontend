export default function ContributionsByPartyChart({ 
  contributionsData, 
  isLoading, 
  error 
}) {
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
      <h3 className="text-xl font-semibold">Contributions to Each Political Party</h3>
      
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

// export default ContributionsByPartyChart;