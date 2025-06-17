import { useState, useEffect } from 'react';
import networkManager from '../network/NetworkManager';

export const useFinancialData = (categoryData, topic, organizationData, defaultData) => {
  const [isFinancialData, setIsFinancialData] = useState(false);
  const [financialOverviewData, setFinancialOverviewData] = useState(null);
  const [isLoadingFinancialOverview, setIsLoadingFinancialOverview] = useState(false);
  const [financialOverviewError, setFinancialOverviewError] = useState(null);
  const [shouldFetchFinancialOverview, setShouldFetchFinancialOverview] = useState(false);

  // Process committee ID for financial contributions
  let committee_id = organizationData.committee_id;
  let committee_name = organizationData.committee_name;
  let context = organizationData.context;

  if (categoryData === 'Financial Contributions') {
    if (financialOverviewData) {
      context = financialOverviewData.fec_financial_contributions_summary_text || financialOverviewData.context;
      committee_id = financialOverviewData.committee_id || committee_id;
      committee_name = financialOverviewData.committee_name || committee_name;
    } else {
      context = organizationData.fec_financial_contributions_summary_text || context;
    }

    // Fix committee ID format
    if (committee_id && committee_id.length <= 9) {
      let prepend_C = '';
      if (!isNaN(committee_id) && committee_id[0] !== 'C') {
        prepend_C = 'C';
      }

      let zeros = '';
      if (!isNaN(committee_id) && committee_id.length < 8) {
        const num_zeros_to_add = 8 - committee_id.length;
        zeros = '0'.repeat(num_zeros_to_add);
      }

      committee_id = prepend_C + zeros + committee_id;
    }
  }

  useEffect(() => {
    setIsFinancialData(categoryData === 'Financial Contributions');
    
    const shouldFetch = localStorage.getItem("shouldFetchFinancialOverview");
    if (shouldFetch === "true") {
      setShouldFetchFinancialOverview(true);
      localStorage.removeItem("shouldFetchFinancialOverview");
    }
  }, [categoryData]);

  useEffect(() => {
    const fetchFinancialOverviewData = async () => {
      if (!shouldFetchFinancialOverview || categoryData !== 'Financial Contributions' || !topic) return;
      
      setIsLoadingFinancialOverview(true);
      setFinancialOverviewError(null);
      
      try {
        console.log('Fetching financial overview data for:', topic);
        const data = await networkManager.getFinancialContributionsOverviewTextOnly(topic);
        console.log('Financial overview data:', data);
        setFinancialOverviewData(data);
        
        if (data) {
          const updatedData = { ...organizationData, ...data };
          localStorage.setItem("organizationData", JSON.stringify(updatedData));
        }
      } catch (err) {
        console.error('Error fetching financial overview data:', err);
        setFinancialOverviewError('Failed to load financial contributions overview data');
      } finally {
        setIsLoadingFinancialOverview(false);
        setShouldFetchFinancialOverview(false);
      }
    };

    fetchFinancialOverviewData();
  }, [shouldFetchFinancialOverview, categoryData, topic, organizationData]);

  return {
    isFinancialData,
    committee_id,
    committee_name,
    context,
    financialOverviewData,
    isLoadingFinancialOverview,
    financialOverviewError,
    shouldFetchFinancialOverview
  };
};