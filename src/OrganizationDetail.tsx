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

// return (
//   <div className="flex justify-even">
//     {/* Logo */}
//     <div 
//       // className="absolute top-3 left-8 w-screen mx-auto cursor-pointer py-2"
//       // className="flex  items-center pt-5 px-8"
//       role="button"
//       onClick={handleLogoClick}
//       tabIndex={0}
//     >

//       <h1 className="text-4xl font-bold text-black ">Compass AI</h1>
//     </div>
//     {/* categoryData */}
//     <Card className="w-screen mx-auto absolute top-20 px-10 py-10 bg-white">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-2xl font-bold">
//           Overview for {topic}
//         </CardTitle>
//       </CardHeader>
      
//       <CardContent className="space-y-6">
//         {/* Lean and Rating */}
        
//         {categoryData == 'Political Leaning' && (
//           <div className="space-y-1">
//             <br/>
//             <div className="text-lg">
//               Lean: {lean ? lean.trim(): ''}
//             </div>
//             <div className="text-lg">
//               Rating: {rating}
//             </div>
//           </div>
//         )}
//         {categoryData == 'DEI Friendliness' && (
//           <div className="space-y-1">
//             <div className="text-lg">
//             DEI Friendliness Rating: {rating}
//             </div>
//           </div>
//         )}
//         {categoryData == 'Wokeness' && (
//           <div className="space-y-1">
//             <div className="text-lg">
//               Wokeness Rating: {rating}
//             </div>
//           </div>
//         )}

//         {/* Context */}
//         <div className="text-base">
//           {context.split('\n').map((line, i) => (
//             <React.Fragment key={i}>
//               {line.trim()}
//               {i < context.split('\n').length - 1 && <br />}
//             </React.Fragment>
//           ))}
//         </div>

//         {/* Citations */ }
//         {categoryData !== 'Financial Contributions' && (
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">Citations:</h3>
//             <div className="text-base">
//               {(citation == null || citation !== "none") ? citation : "No citations available"}
//             </div>
//           </div>
//         )}

//         {/* Financial Contributions */}
//         {/*Temporarily remove this from all pages now that financial contributions is 
//            its own category. Eventually this can be rolled into the responses to backup 
//            and be used to generate the text in the other categories. */}
//         {/* {categoryData !== 'Financial Contributions' && (
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">Financial Contributions:</h3>
//             <div className="text-base">
//               Information about financial contributions will be displayed here.
//             </div>
//           </div>
//         )} */}

//       </CardContent> 
//     </Card> 
//   </div>
// );
// };

export default OrganizationDetail;

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useLocation } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { useNavigate} from 'react-router-dom';

// const OrganizationDetail = () => {
//   // Try both to see how the org info was passed in.
//   const location = useLocation();
//   const organizationDataLocation = location.state; 
//   const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));
//   const navigate = useNavigate();

//   // Default data if none provided
//   const defaultData = {
//     timestamp: "2024-11-15T05:17:32.156000",
//     citation: "none",
//     context: "Organization context will be displayed here.",
//     lean: "conservative",
//     rating: 4,
//     topic: "Organization Name"
//   };

//   // Use provided data or fall back to default
//   const {
//     topic,
//     lean,
//     rating,
//     context,
//     citation
//   } = organizationDataLocation || organizationDataLocalStorage || defaultData;

//   const handleLogoClick = (event) => {
//     console.log(event)
//     // openDetailPageCurrentTab(organization)
//     navigate('/', {});
//   };

//   return (
//     <div className="relative absolute top-8 ">
//       {/* Logo */}
//       <div className="absolute top-8 left-8 "
//            role="button"
          //  onClick={ (event) => handleLogoClick(event)}>
//         <h1 className="text-4xl font-bold text-black">CompassAI</h1>
//       </div>

//       <Card className="w-screen mx-auto absolute top-20 px-20 py-10 bg-white">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-2xl font-bold">
//             Overview for {topic}
//           </CardTitle>
//         </CardHeader>
        
//         <CardContent className="space-y-6">
//           {/* Lean and Rating */}
//           <div className="space-y-1">
//             <div className="text-lg">
//               Lean: {lean.trim()}
//             </div>
//             <div className="text-lg">
//               Rating {rating}
//             </div>
//           </div>

//           {/* Context */}
//           <div className="text-base">
//             {context}
//           </div>

//           {/* Citations */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">Citations:</h3>
//             <div className="text-base">
//               {citation !== "none" ? citation : "No citations available"}
//             </div>
//           </div>

//           {/* Financial Contributions */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold">Financial Contributions:</h3>
//             <div className="text-base">
//               Information about financial contributions will be displayed here.
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default OrganizationDetail;


// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useLocation } from 'react-router-dom';
// import { useState, useEffect } from 'react';

// const OrganizationDetail = () => {

//   // Try both to see how the org info was passed in.
//   const location = useLocation();
//   const organizationDataLocation = location.state; 

//   const [organizationDataLocalStorage, _] = useState(JSON.parse(localStorage.getItem("organizationData")));


//   // Default data if none provided
//   const defaultData = {
//     timestamp: "2024-11-15T05:17:32.156000",
//     citation: "none",
//     context: "Organization context will be displayed here.",
//     lean: "conservative",
//     rating: 4,
//     topic: "Organization Name"
//   };

//   // Use provided data or fall back to default
//   const {
//     topic,
//     lean,
//     rating,
//     context,
//     citation
//   } = organizationDataLocation || organizationDataLocalStorage || defaultData;

//   return (
//     <Card className="w-screen  mx-auto absolute top-20 px-20 py-10 bg-white">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-2xl font-bold">
//           Overview for {topic}
//         </CardTitle>
//       </CardHeader>
      
//       <CardContent className="space-y-6">
//         {/* Lean and Rating */}
//         <div className="space-y-1">
//           <div className="text-lg">
//             Lean: {lean.trim()}
//           </div>
//           <div className="text-lg">
//             Rating {rating}
//           </div>
//         </div>

//         {/* Context */}
//         <div className="text-base">
//           {context}
//         </div>

//         {/* Citations */}
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Citations:</h3>
//           {/* <div className="text-blue-600 underline">  */} {/* Add link highlights once citatations get implemented */}
//           <div className="text-base">
//             {citation !== "none" ? citation : "No citations available"}
//           </div>
//         </div>

//         {/* Financial Contributions */}
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Financial Contributions:</h3>
//           <div className="text-base">
//             Information about financial contributions will be displayed here.
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default OrganizationDetail;


// {/* <OrganizationDetail data={organizationData} /> */}