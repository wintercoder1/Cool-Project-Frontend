import './index.css'
import ReactDOM from "react-dom/client";
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage.tsx'
import OrganizationDetail from '@/OrganizationDetail.tsx'

const test_org_detail = {"timestamp": "2024-11-15T02:19:13.500000",
  "citation": "\nSource 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative like Coors Light or Miller Light involves minimal sacrifice in terms of taste preference.\n\nObservability of consumption.\n",
  "context": " Molson is a Canadian beer company, and based on the political leanings of other Canadian companies, such as Labatt (3 Liberal), it is likely that Molson has a similar political leaning [1]. However, it's worth noting that Molson's parent company, Molson Coors Brewing Company, has a more conservative leaning due to its ownership of Coors, a well-known conservative brand [2]. Therefore, Molson's political leaning is likely to be slightly more liberal than its parent company. Reference: [1] Labatt: 3 Liberal [2] Coors: 4 Conservative.  Source 1: Labatt: 3 Liberal Source 2: Coors: 4 Conservative.  Source 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative\n",
  "lean": " Liberal",
  "rating": 3,
  "topic": "molson"};

export default function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
          {/* <Route index element={<MainPage />} /> */}
          {/* <Route path="organization" 
                 element={<OrganizationDetail data={test_org_detail}/>} /> */}
          {/* <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NoPage />} /> */}
        {/* </Route> */}
        <Route path="organization" 
                 element={<OrganizationDetail data={test_org_detail}/>} />
      </Routes>
    </BrowserRouter>
  );
}


const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode)
root.render(
  <StrictMode>
    {/* <MainPage /> */}
    <Main />
  </StrictMode>
);

// ReactDOM.createRoot(domNode).render(
//   <StrictMode>
//     <Main />
//   </StrictMode>
// );


// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// // import App from './App.tsx'
// import MainPage from './MainPage.tsx'
// import OrganizationDetail from '@/OrganizationDetail.tsx'

// const test_org_detail = {"timestamp": "2024-11-15T02:19:13.500000",
//   "citation": "\nSource 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative like Coors Light or Miller Light involves minimal sacrifice in terms of taste preference.\n\nObservability of consumption.\n",
//   "context": " Molson is a Canadian beer company, and based on the political leanings of other Canadian companies, such as Labatt (3 Liberal), it is likely that Molson has a similar political leaning [1]. However, it's worth noting that Molson's parent company, Molson Coors Brewing Company, has a more conservative leaning due to its ownership of Coors, a well-known conservative brand [2]. Therefore, Molson's political leaning is likely to be slightly more liberal than its parent company. Reference: [1] Labatt: 3 Liberal [2] Coors: 4 Conservative.  Source 1: Labatt: 3 Liberal Source 2: Coors: 4 Conservative.  Source 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative\n",
//   "lean": " Liberal",
//   "rating": 3,
//   "topic": "molson"};

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     {/* <App /> */}
//     <MainPage />
//     {/* <OrganizationDetail data={test_org_detail}/> */}
//   </StrictMode>,
// )
