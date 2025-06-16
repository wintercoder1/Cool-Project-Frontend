const CitationsSection = ({ 
    categoryData, 
    created_with_financial_contributions_info, 
    topic,
    onFinancialContributionClick 
  }) => {
    if (categoryData !== 'Political Leaning' || !created_with_financial_contributions_info) {
      return null;
    }
  
    return (
      <div className="space-y-2">
        <br />
        <h3 className="text-lg font-semibold">Citations:</h3>
        <div className="text-base">
          <button 
            onClick={onFinancialContributionClick}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
          >
            Financial Contributions Overview for {topic} 
          </button>
        </div>
      </div>
    );
  };

  export default CitationsSection;