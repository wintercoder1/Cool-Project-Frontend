import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
// @ts-expect-error
import checkmark_logo from './assets/blue_checkmark_logo.png';
import React from "react";

const OrganizationDetail = () => {
  const location = useLocation();
  const organizationDataLocation = location.state; 
  const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
  const [categoryData, __] = useState(localStorage.getItem("categoryData"));
  // @ts-expect-error
  const [isFinacialData, setIsFinacialData] = useState(false);
  const [contributionsData, setContributionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Default data if none provided.
  const defaultData = {
    timestamp: "2024-11-15T05:17:32.156000",
    citation: "none",
    context: "Organization context will be displayed here.",
    lean: "Neutral",
    rating: 0,
    topic: "Organization Name"
  };

  // Use provided data or fall back to default.
  var {
    topic,
    lean,
    rating,
    context,
    citation,
    committee_id
  } = organizationDataLocation || organizationDataLocalStorage || defaultData;

  // If financial contrubution. 
  // TODO: Actually learn react and figure out a better way to do this.
  if (categoryData == 'Financial Contributions') {
    context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
    || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)
    // setIsFinacialData(true)

    // Some comittee IDs were wrongly stored as integers with leading zeros removed.
    // We will fix that here.
    if (committee_id && committee_id.length <= 9) {    
      let prepend_C = ''
      if (!isNaN(committee_id) && committee_id[0] != 'C') {
        prepend_C = 'C'
      }
      // // If leading zeros need to be added.
      // // If committee ID is number format with missing zeroes.
      let zeros = ''
      if (!isNaN(committee_id) && committee_id.length < 8) {
        const num_zeros_to_add = 8 - committee_id.length
        let i = 0
        while (i < num_zeros_to_add) {
          zeros += '0'
          i += 1
        }
      }
      // Update committee id based on what we calculated above.
      const updated_committe_id = prepend_C + zeros + committee_id
      committee_id = updated_committe_id
    }
    console.log('\nCommittee ID:')
    console.log(committee_id)
  }

  useEffect(() => {
    setIsFinacialData(categoryData == 'Financial Contributions')
  }, [categoryData]);

  // Fetch contribution data when component mounts or committee_id changes
  useEffect(() => {
    const fetchContributionsData = async () => {
      if (!committee_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${committee_id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setContributionsData(data);
      } catch (err) {
        console.error('Error fetching contributions data:', err);
        setError('Failed to load contributions data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionsData();
  }, [committee_id]);

  const handleLogoClick = (event) => {
    console.log(event)
    navigate('/', {});
  };

  // Render the contributions chart
  const renderContributionsChart = () => {
    if (isLoading) return <div className="text-center py-4">Loading contributions data...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    if (!contributionsData) return null;

    const { percent_to_republicans, percent_to_democrats, total_to_republicans, total_to_democrats, total_contributions } = contributionsData;
    
    return (
      <div className="space-y-4 py-4 mt-6">
        <h3 className="text-xl font-semibold">Political Contributions Breakdown</h3>
        
        <div className="text-base space-y-2">
          <div>Total Contributions: ${total_contributions.toLocaleString()}</div>
          <div>To Republicans: ${total_to_republicans.toLocaleString()} ({percent_to_republicans}%)</div>
          <div>To Democrats: ${total_to_democrats.toLocaleString()} ({percent_to_democrats}%)</div>
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
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 mr-1 rounded-full"></div>
            <span>Republicans</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
        {/* Logo */}
        <div 
          className="absolute top-4 left-8 cursor-pointer "
          role="button"
          onClick={handleLogoClick}
          tabIndex={0}
        >

          <div className="flex items-center gap-2 justify-center sm:justify-start">
              <img src={checkmark_logo} className="block" width="55" height="55" alt="blue_check_logo" />
              <h1 className="text-4xl font-bold text-black">MoralCheck AI</h1>
          </div>
    
        </div>
       

        {/* categoryData */}
        <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              Overview for {topic}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Rest of your content remains the same */}
            {categoryData == 'Political Leaning' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                  Lean: {lean ? lean.trim(): ''}
                </div>
                <div className="text-lg">
                  Rating: {rating}
                </div>
              </div>
            )}
            {categoryData == 'DEI Friendliness' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                DEI Friendliness Rating: {rating}
                </div>
              </div>
            )}
            {categoryData == 'Wokeness' && (
              <div className="space-y-1">
                <br/>
                <div className="text-lg">
                  Wokeness Rating: {rating}
                </div>
              </div>
            )}

            {/* Context */}
            <div className="text-base">
              {context.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.trim()}
                  {i < context.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>

            {/* Citations */ }
            {categoryData !== 'Financial Contributions' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Citations:</h3>
                <div className="text-base">
                  {(citation == null || citation !== "none") ? citation : "No citations available"}
                </div>
              </div>
            )}

            {/* Political Contributions Chart */}
            {(isFinacialData || categoryData === 'Financial Contributions') && renderContributionsChart()}
          </CardContent> 
        </Card> 
      </div>
  );
};


export default OrganizationDetail;
 