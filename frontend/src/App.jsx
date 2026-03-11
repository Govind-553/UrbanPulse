import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenReportPage from './pages/CitizenReportPage';
import RiskMapPage from './pages/RiskMapPage';
import DashboardPage from './pages/DashboardPage';
import WardManagementPage from './pages/WardManagementPage';
import IssueDetailsPage from './pages/IssueDetailsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<CitizenReportPage />} />
          <Route path="/map" element={<RiskMapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ward-management" element={<WardManagementPage />} />
          <Route path="/issue/:id" element={<IssueDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
