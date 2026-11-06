import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewInvestigationPage from './pages/NewInvestigationPage';
import WorkspacePage from './pages/WorkspacePage';
import EvidenceExplorerPage from './pages/EvidenceExplorerPage';
import RelationshipGraphPage from './pages/RelationshipGraphPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import DocumentsPage from './pages/DocumentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function ApplicationRoutes() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#17182b] selection:bg-violet-200 selection:text-violet-900">
      <Navbar />
      <main className={`min-h-screen ${isLanding ? '' : 'app-main'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/investigations/new" element={<NewInvestigationPage />} />
          <Route path="/investigations/:id" element={<WorkspacePage />} />
          <Route path="/investigations/:id/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/investigations/:id/graph" element={<RelationshipGraphPage />} />
          <Route path="/graph" element={<RelationshipGraphPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isLanding && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter><ApplicationRoutes /></BrowserRouter>
    </QueryClientProvider>
  );
}
