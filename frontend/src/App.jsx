import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenReportPage from './pages/CitizenReportPage';
import RiskMapPage from './pages/RiskMapPage';
import DashboardPage from './pages/DashboardPage';
import WardManagementPage from './pages/WardManagementPage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected for ANY logged in user */}
            <Route path="/report" element={
              <ProtectedRoute>
                <CitizenReportPage />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <RiskMapPage />
              </ProtectedRoute>
            } />
            
            {/* Protected for ONLY authorities */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['authority']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/ward-management" element={
              <ProtectedRoute allowedRoles={['authority']}>
                <WardManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/issue/:id" element={
              <ProtectedRoute allowedRoles={['authority']}>
                <IssueDetailsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
