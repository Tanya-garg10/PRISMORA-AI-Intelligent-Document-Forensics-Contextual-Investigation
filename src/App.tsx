import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800 font-sans selection:bg-violet-200 selection:text-violet-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/investigations/new" element={<NewInvestigationPage />} />
              <Route path="/investigations/:id" element={<WorkspacePage />} />
              <Route path="/investigations/:id/evidence" element={<EvidenceExplorerPage />} />
              <Route path="/investigations/:id/graph" element={<RelationshipGraphPage />} />
              <Route path="/graph" element={<RelationshipGraphPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
