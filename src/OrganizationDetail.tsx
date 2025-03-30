import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
// @ts-expect-error
import compass_logo from './assets/compass_logo.png';
import React from "react";

const OrganizationDetail = () => {
  const location = useLocation();
  const organizationDataLocation = location.state; 
  const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
  const [categoryData, __] = useState(localStorage.getItem("categoryData"));
  // @ts-expect-error
  const [isFinacialData, setIsFinacialData] = useState(false);
  const navigate = useNavigate();

  // Default data if none provided
  const defaultData = {
    timestamp: "2024-11-15T05:17:32.156000",
    citation: "none",
    context: "Organization context will be displayed here.",
    lean: "Neutral",
    rating: 0,
    topic: "Organization Name"
  };

  // Use provided data or fall back to default
  var {
    topic,
    lean,
    rating,
    context,
    citation
  } = organizationDataLocation || organizationDataLocalStorage || defaultData;

  // If financial contrubution. 
  // TODO: Actually learn react and figure out a better way to do this
  if (categoryData == 'Financial Contributions') {
    context = (organizationDataLocation && organizationDataLocation.fec_financial_contributions_summary_text)
    || (organizationDataLocalStorage && organizationDataLocalStorage.fec_financial_contributions_summary_text)
    // setIsFinacialData(true)
  }

  useEffect(() => {
    setIsFinacialData(categoryData == 'Financial Contributions')
  }, [categoryData]);

  const handleLogoClick = (event) => {
    console.log(event)
    navigate('/', {});
  };

  // function leanAndRatingContent(lean, rating) {
  //   if (!isFinacialData) {
  //     return (<div className="space-y-1">
  //               <div className="text-lg">
  //                   Lean: {lean ? lean.trim(): ''}
  //               </div>
  //               <div className="text-lg">
  //                   Rating {rating}
  //               </div>
  //            </div>);
  //   } else {
  //     return (<div/>);
  //   }
  // }

  return (
    <div className="px-0 py-1 flex justify-even">
        {/* Logo */}
        <div 
          className="absolute top-2 left-8 cursor-pointer "
          role="button"
          onClick={handleLogoClick}
          tabIndex={0}
        >
          <div className="flex items-center gap-2">
            <img src={compass_logo} className="hidden sm:block" width="65" height="65" alt="compass_logo" />
            <h1 className="text-4xl font-bold text-black">Compass AI</h1>
          </div>
          
        </div>
       

        {/* categoryData */}
        <Card className="w-screen mx-auto absolute top-20 px-4 py-5 bg-white">
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
                <div className="text-lg">
                DEI Friendliness Rating: {rating}
                </div>
              </div>
            )}
            {categoryData == 'Wokeness' && (
              <div className="space-y-1">
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

            {/* Financial Contributions */}
            {/*Temporarily remove this from all pages now that financial contributions is 
               its own category. Eventually this can be rolled into the responses to backup 
               and be used to generate the text in the other categories. */}
            {/* {categoryData !== 'Financial Contributions' && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Financial Contributions:</h3>
                <div className="text-base">
                  Information about financial contributions will be displayed here.
                </div>
              </div>
            )} */}

          </CardContent> 
        </Card> 
      </div>
  );
};


export default OrganizationDetail;
