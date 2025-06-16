import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import networkManager from '../network/NetworkManager';

export const useOrganizationData = () => {
  const location = useLocation();
  const organizationDataLocation = location.state;
  const [organizationDataLocalStorage] = useState(JSON.parse(localStorage.getItem("organizationData")));
  const [categoryData] = useState(localStorage.getItem("categoryData"));

  // Default data if none provided
  const defaultData = {
    timestamp: "2024-11-15T05:17:32.156000",
    citation: "none",
    context: "Organization context will be displayed here.",
    lean: "Neutral",
    rating: 0,
    topic: "Organization Name"
  };

  const organizationData = organizationDataLocation || organizationDataLocalStorage || defaultData;

  return {
    organizationData,
    categoryData,
    location
  };
};