import './index.css'
import ReactDOM from "react-dom/client";
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage.tsx'
import OrganizationDetail from '@/OrganizationDetail.tsx'
import OrganizationQuery from '@/OrganizationQuery.tsx'
import WaitingPage  from '@/WaitingPage.tsx'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" 
               element={<MainPage />} />
        <Route path="organization" 
               element={<OrganizationDetail />} />
        <Route path="query" 
               element={<OrganizationQuery />} />
        <Route path="waiting" 
               element={<WaitingPage />} />
      </Routes>
    </BrowserRouter>
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
