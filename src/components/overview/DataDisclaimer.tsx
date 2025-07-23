const DataDisclaimer = ({ categoryData }) => {
  // Only show disclaimer for Financial Contributions
  if (categoryData !== 'Financial Contributions') {
    return null;
  }

  return (
    <div className="text-sm text-gray-600 italic leading-relaxed">
      {/* <br /> */}
      This financial information is based on Federal Election Commission filings from the 2024 election cycle.
      <br />
      <br />
    </div>
  );
};

export default DataDisclaimer;