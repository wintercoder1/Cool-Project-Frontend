import './index.css'
import ReactDOM from "react-dom/client";
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from './MainPage.tsx'
import OrganizationDetail from '@/OrganizationDetail.tsx'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" 
               element={<MainPage />} />
        <Route path="organization" 
               element={<OrganizationDetail />} />
      </Routes>
    </BrowserRouter>
  );
}


const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode)
root.render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
