import { useState, useEffect } from 'react';
import networkManager from '../network/NetworkManager';

export const useChartData = (committee_id) => {
  const [contributionsData, setContributionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);
  const [leadershipError, setLeadershipError] = useState(null);
  const [displayedLeadershipCount] = useState(10);

  // Fetch contribution data
  useEffect(() => {
    const fetchContributionsData = async () => {
      if (!committee_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await networkManager.getContributionPercentages(committee_id);
        setContributionsData(data);
      } catch (err) {
        console.error('Error fetching contributions data:', err);
        setError('Failed to load contributions percentages breakdown data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionsData();
  }, [committee_id]);

  // Fetch recipient data
  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!committee_id) return;
      
      setIsLoadingRecipients(true);
      setRecipientError(null);
      
      try {
        const data = await networkManager.getContributionRecipients(committee_id);
        setRecipientData(data);
      } catch (err) {
        console.error('Error fetching recipient data:', err);
        setRecipientError('Failed to load contribution recipients data');
      } finally {
        setIsLoadingRecipients(false);
      }
    };

    fetchRecipientData();
  }, [committee_id]);

  // Fetch leadership data
  useEffect(() => {
    const fetchLeadershipData = async () => {
      if (!committee_id) return;
      
      setIsLoadingLeadership(true);
      setLeadershipError(null);
      
      try {
        const data = await networkManager.getLeadershipContributions(committee_id);
        setLeadershipData(data);
      } catch (err) {
        console.error('Error fetching leadership data:', err);
        setLeadershipError('Failed to load leadership contributions data');
      } finally {
        setIsLoadingLeadership(false);
      }
    };

    fetchLeadershipData();
  }, [committee_id]);

  return {
    contributionsData,
    isLoading,
    error,
    recipientData,
    isLoadingRecipients,
    recipientError,
    leadershipData,
    isLoadingLeadership,
    leadershipError,
    displayedLeadershipCount
  };
};