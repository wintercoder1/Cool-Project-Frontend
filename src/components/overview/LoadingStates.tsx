const LoadingStates = ({ 
    categoryData, 
    shouldFetchFinancialOverview, 
    isLoadingFinancialOverview, 
    financialOverviewError 
  }) => {
    if (categoryData === 'Financial Contributions' && shouldFetchFinancialOverview && isLoadingFinancialOverview) {
      return (
        <div className="text-center py-8">
          <div className="text-lg">Loading financial contributions overview...</div>
        </div>
      );
    }
  
    if (categoryData === 'Financial Contributions' && financialOverviewError) {
      return (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">{financialOverviewError}</div>
        </div>
      );
    }
  
    return null;
  };

  export default LoadingStates;