import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import Consultation from './pages/Consultation';
import Summary from './pages/Summary';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import DoctorLayout from './components/DoctorLayout';
import DemoControlHub from './pages/DemoControlHub';

// PingME Care / LifeMesh Portals
import TagStudioView from './pages/TagStudioView';
import BystanderEmergencyHUD from './pages/BystanderEmergencyHUD';
import AmbulanceFieldTriage from './pages/AmbulanceFieldTriage';
import HospitalCheckIn from './pages/HospitalCheckIn';
import DemoControlBar from './components/DemoControlBar';

const ProtectedDoctorRoute = ({ children }: { children: React.ReactNode }) => {
  // Direct access enabled for seamless hackathon live demonstration
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        {/* Default Landing: Doctor Command Center */}
        <Route path="/" element={<Navigate to="/doctor" replace />} />

        {/* 1. PingME Tag Studio (Vehicle & Helmet QR Decal Generator) */}
        <Route path="/studio" element={<TagStudioView />} />

        {/* 2. Public Roadside Bystander Emergency HUD (Zero-Knowledge Scan) */}
        <Route path="/emergency/:tagId" element={<BystanderEmergencyHUD />} />
        <Route path="/emergency" element={<BystanderEmergencyHUD />} />

        {/* 3. Authorized 108 Paramedic / Ambulance In-Transit Field Triage */}
        <Route path="/paramedic/triage" element={<AmbulanceFieldTriage />} />
        <Route path="/paramedic" element={<AmbulanceFieldTriage />} />

        {/* 4. Hospital Entrance QR Outpatient Fast-Track Check-In */}
        <Route path="/hospital/checkin" element={<HospitalCheckIn />} />
        <Route path="/checkin" element={<HospitalCheckIn />} />

        {/* 5. Doctor Portal & Clinical Dashboard (UI Strictly Preserved) */}
        <Route path="/doctor/login" element={<Login />} />
        <Route 
          path="/doctor" 
          element={
            <ProtectedDoctorRoute>
              <DoctorLayout />
            </ProtectedDoctorRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
        </Route>

        {/* Legacy Patient Kiosk Routes */}
        <Route path="/patient" element={<Layout />}>
          <Route index element={<Navigate to="/patient/login" replace />} />
          <Route path="login" element={<PatientLogin />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="consultation" element={<Consultation />} />
          <Route path="summary" element={<Summary />} />
        </Route>

        {/* Demo Simulator Hub */}
        <Route path="/demo" element={<DemoControlHub />} />
        <Route path="/doctor/demo" element={<Navigate to="/demo" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>

      {/* Floating Demo Control Bar pinned across all pages */}
      <DemoControlBar />
    </BrowserRouter>
  );
}

export default App;
