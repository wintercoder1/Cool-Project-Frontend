// Updated routing file
// @ts-expect-error
import './index.css'
import ReactDOM from "react-dom/client";
import { StrictMode } from 'react'
import { HashRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage.tsx'
import OrganizationDetailOverview  from '@/OrganizationDetailOverview.tsx'
import OrganizationContributionTotals from '@/OrganizationContributionTotals.tsx'
import OrganizationQuery from '@/OrganizationQuery.tsx'
import OrganizationLeadershipContributionTotals from '@/OrganizationLeadershipContributionTotals.tsx'
import WaitingPage  from '@/WaitingPage.tsx'

export default function MainRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" 
               element={<MainPage />} />
        <Route path="/organization" 
               element={<OrganizationDetailOverview />} />
        <Route path="/organization/:category/:topic" 
               element={<OrganizationDetailOverview />} />
        <Route path="/organizationRecipientsTotals"
               element={<OrganizationContributionTotals/>} />
        <Route path="/organizationLeadershipContributionTotals"
               element={<OrganizationLeadershipContributionTotals/>} />
        <Route path="/query" 
               element={<OrganizationQuery />} />
        <Route path="/waiting" 
               element={<WaitingPage />} />
      </Routes>
    </HashRouter>
  );
}

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode)
root.render(
  <StrictMode>
    <MainRouter />
    {/* <WaitingPage /> */}
  </StrictMode>
);

// // Updated routing file
// // @ts-expect-error
// import './index.css'
// import ReactDOM from "react-dom/client";
// import { StrictMode } from 'react'
// import { HashRouter, Routes, Route } from "react-router-dom";
// import MainPage from './MainPage.tsx'
// import OrganizationDetailOverview  from '@/OrganizationDetailOverview.tsx'
// import OrganizationContributionTotals from '@/OrganizationContributionTotals.tsx'
// import OrganizationQuery from '@/OrganizationQuery.tsx'
// import WaitingPage  from '@/WaitingPage.tsx'

// export default function MainRouter() {
//   return (
//     <HashRouter>
//       <Routes>
//         <Route path="/" 
//                element={<MainPage />} />
//         <Route path="/organization" 
//                element={<OrganizationDetailOverview />} />
//         <Route path="/organization/:category/:topic" 
//                element={<OrganizationDetailOverview />} />
//         <Route path="/organizationRecipientsTotals"
//                element={<OrganizationContributionTotals/>} />
//         <Route path="/query" 
//                element={<OrganizationQuery />} />
//         <Route path="/waiting" 
//                element={<WaitingPage />} />
//       </Routes>
//     </HashRouter>
//   );
// }

// const domNode = document.getElementById('root');
// const root = ReactDOM.createRoot(domNode)
// root.render(
//   <StrictMode>
//     <MainRouter />
//     {/* <WaitingPage /> */}
//   </StrictMode>
// );

// // Updated routing file
// // @ts-expect-error
// import './index.css'
// import ReactDOM from "react-dom/client";
// import { StrictMode } from 'react'
// import { HashRouter, Routes, Route } from "react-router-dom";
// import MainPage from './MainPage.tsx'
// import OrganizationDetailOverview  from '@/OrganizationDetailOverview.tsx'
// import OrganizationContributionTotals from '@/OrganizationContributionTotals.tsx'
// import OrganizationQuery from '@/OrganizationQuery.tsx'
// import WaitingPage  from '@/WaitingPage.tsx'

// export default function MainRouter() {
//   return (
//     <HashRouter>
//       <Routes>
//         <Route path="/" 
//                element={<MainPage />} />
//         <Route path="/organization" 
//                element={<OrganizationDetailOverview />} />
//         <Route path="/organization/:category" 
//                element={<OrganizationDetailOverview />} />
//         <Route path="/organizationRecipientsTotals"
//                element={<OrganizationContributionTotals/>} />
//         <Route path="/query" 
//                element={<OrganizationQuery />} />
//         <Route path="/waiting" 
//                element={<WaitingPage />} />
//       </Routes>
//     </HashRouter>
//   );
// }

// const domNode = document.getElementById('root');
// const root = ReactDOM.createRoot(domNode)
// root.render(
//   <StrictMode>
//     <MainRouter />
//     {/* <WaitingPage /> */}
//   </StrictMode>
// );

// // @ts-expect-error
// import './index.css'
// import ReactDOM from "react-dom/client";
// import { StrictMode } from 'react'
// import { HashRouter, Routes, Route } from "react-router-dom";
// import MainPage from './MainPage.tsx'
// import OrganizationDetailOverview  from '@/OrganizationDetailOverview.tsx'
// import OrganizationContributionTotals from '@/OrganizationContributionTotals.tsx'
// import OrganizationQuery from '@/OrganizationQuery.tsx'
// import WaitingPage  from '@/WaitingPage.tsx'

// export default function MainRouter() {
//   return (
//     <HashRouter>
//       <Routes>
//         <Route path="/" 
//                element={<MainPage />} />
//         <Route path="organization" 
//                element={<OrganizationDetailOverview />} />
//         <Route path="organizationRecipientsTotals"
//                element={<OrganizationContributionTotals/>} />
//         <Route path="query" 
//                element={<OrganizationQuery />} />
//         <Route path="waiting" 
//                element={<WaitingPage />} />
//       </Routes>
//     </HashRouter>
//   );
// }


// const domNode = document.getElementById('root');
// const root = ReactDOM.createRoot(domNode)
// root.render(
//   <StrictMode>
//     <MainRouter />
//     {/* <WaitingPage /> */}
//   </StrictMode>
// );
