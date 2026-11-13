import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Ambulance,
  Building2,
  QrCode,
  RotateCcw,
  Radio,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Smartphone,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { usePatientStore } from '../store/usePatientStore';

export default function DemoControlBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const {
    vehicleTag,
    dispatchAmbulanceTelemetry,
    checkInFamilyMemberAsOPD,
    populateDemoPatients,
    setIncomingAmbulance
  } = usePatientStore();

  const handleSimulateCrash = () => {
    const telemetry = {
      telemetryId: 'AMB-108-LIVE-RUN',
      victimId: 'fam-ramesh',
      victimName: 'Ramesh Verma',
      victimPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      vehicleTag: 'TAG-CH01AB1234',
      hospitalId: 'HOSP-PGIMER',
      hospitalName: 'PGIMER Level-1 Apex Trauma Centre',
      etaMinutes: 4,
      liveEtaSeconds: 240,
      injuryTags: ['Severe Traumatic Brain Injury (TBI)', 'Left Femur Compound Fracture'],
      incidentPhotos: ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'],
      gcsScore: 7,
      vitals: {
        bp: '84/52',
        hr: 122,
        spo2: 88,
        rr: 24
      },
      criticalDirectives: [
        'Immediate Red Trauma Bay 1 Reservation',
        'Stat 2 Units O-Negative Uncrossmatched PRBCs',
        'Rapid Sequence Intubation (RSI) Tray Bedside',
        'Stat Non-Contrast Head CT Protocol Booked'
      ],
      dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    dispatchAmbulanceTelemetry(telemetry);
    setLastAction('🚨 Highway Crash SOS Dispatched! Doctor Dashboard alerted.');
    setTimeout(() => setLastAction(null), 4000);
    navigate('/doctor');
  };

  const handleSimulateOPD = () => {
    const member = vehicleTag.members[1] || vehicleTag.members[0]; // Sunita Verma
    checkInFamilyMemberAsOPD(
      member,
      'Acute high fever with chills and productive cough for 3 days',
      6
    );
    setLastAction(`🏥 OPD Token generated for ${member.name}! In Doctor Queue.`);
    setTimeout(() => setLastAction(null), 4000);
    navigate('/doctor');
  };

  const handleResetDemo = () => {
    populateDemoPatients();
    setIncomingAmbulance(null);
    setLastAction('🔄 Demo State Reset to Pristine Baseline.');
    setTimeout(() => setLastAction(null), 3000);
  };

  if (collapsed) {
    return (
      <div className="fixed bottom-3 right-4 z-50">
        <button
          onClick={() => setCollapsed(false)}
          className="py-1.5 px-3 rounded-full bg-slate-900/90 text-amber-400 border border-slate-700 hover:border-amber-500 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          <Radio size={12} className="animate-pulse text-amber-400" />
          <span>PingME Demo Toolbar</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Demo Presentation Bar" className="fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      
      {/* Left: Branding & Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-white uppercase tracking-wider text-[11px]">
            PingME LifeMesh
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
            PRESENTER HUD
          </span>
        </div>

        {lastAction && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 animate-fade-in">
            {lastAction}
          </span>
        )}
      </div>

      {/* Middle: 1-Click Simulation Triggers */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleSimulateCrash}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[11px] flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
        >
          <Ambulance size={14} />
          <span>🚨 Simulate Highway Crash</span>
        </button>

        <button
          onClick={handleSimulateOPD}
          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition-transform active:scale-95 cursor-pointer"
        >
          <Building2 size={14} />
          <span>🏥 Simulate Hospital OPD Scan</span>
        </button>

        <button
          onClick={handleResetDemo}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset queue and telemetry to clean demo state"
        >
          <RotateCcw size={13} />
          <span>Reset State</span>
        </button>
      </div>

      {/* Right: Quick Portal Navigation Chips */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => navigate('/studio')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
            location.pathname === '/studio'
              ? 'bg-amber-500 text-slate-950 border-amber-500'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Tag Studio
        </button>

        <button
          onClick={() => navigate(`/emergency/${vehicleTag.tagId}`)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
            location.pathname.startsWith('/emergency')
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Bystander HUD
        </button>

        <button
          onClick={() => navigate('/paramedic/triage')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
            location.pathname === '/paramedic/triage'
              ? 'bg-red-700 text-white border-red-700'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Paramedic
        </button>

        <button
          onClick={() => navigate('/hospital/checkin')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
            location.pathname === '/hospital/checkin'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Hospital QR
        </button>

        <button
          onClick={() => navigate('/doctor')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
            location.pathname === '/doctor'
              ? 'bg-teal-500 text-slate-950 border-teal-500'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Doctor Dashboard
        </button>

        {/* Minimize Button */}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors ml-1"
          title="Minimize Presenter Bar"
        >
          <ChevronDown size={14} />
        </button>
      </div>

    </aside>
  );
}
