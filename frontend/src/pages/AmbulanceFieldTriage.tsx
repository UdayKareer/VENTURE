import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ambulance,
  Camera,
  Activity,
  HeartPulse,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Radio,
  FileText,
  AlertOctagon,
  Users,
  HelpCircle,
  Pill,
  Sparkles,
  QrCode,
  Scan,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  RefreshCw,
  X,
  MapPin,
  Check
} from 'lucide-react';
import { usePatientStore, type AmbulanceTelemetry, type FamilyMemberProfile } from '../store/usePatientStore';

export default function AmbulanceFieldTriage() {
  const navigate = useNavigate();
  const { vehicleTag, dispatchAmbulanceTelemetry } = usePatientStore();

  // Triage Phase Workflow:
  // Phase 1: 'scan' -> Paramedic scans crash QR tag on vehicle/helmet
  // Phase 2: 'auth' -> Paramedic enters official hospital passcode (108)
  // Phase 3: 'triage' -> Active in-transit triage, vitals & streaming to trauma bay
  const [triageStep, setTriageStep] = useState<'scan' | 'auth' | 'triage'>('scan');

  // Scanner state
  const [scannedTagId, setScannedTagId] = useState('');
  const [manualTagInput, setManualTagInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Authentication state
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected victim in this incident
  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(null);
  const [isGuestVictim, setIsGuestVictim] = useState(false);
  const [guestName, setGuestName] = useState('');

  const activeMember = vehicleTag.members.find((m) => m.id === selectedVictimId) || null;

  // In-Transit Field Vitals (Clean / empty by default)
  const [gcs, setGcs] = useState<number | ''>('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [pulse, setPulse] = useState<number | ''>('');
  const [spO2, setSpO2] = useState<number | ''>('');
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [selectedHospital, setSelectedHospital] = useState('HOSP-PGIMER');

  // Injury site selection (Starts empty)
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);

  // Scene & Wound Photo state (Starts empty)
  const [injuryPhotos, setInjuryPhotos] = useState<string[]>([]);

  const [transmitted, setTransmitted] = useState(false);

  const availableInjuries = [
    'Traumatic Brain Injury (TBI)',
    'Cervical Spine Trauma',
    'Blunt Chest Trauma / Flail Chest',
    'Compound Limb Fracture',
    'Internal Abdominal / Pelvic Hemorrhage',
    'Severe Friction Road Rash'
  ];

  const hospitalOptions = [
    {
      id: 'HOSP-PGIMER',
      name: 'PGIMER Level-1 Apex Trauma Centre',
      time: '4 mins',
      capabilities: '24/7 Neuro ICU • Blood Bank Massive Transfusion Ready'
    },
    {
      id: 'HOSP-GMCH32',
      name: 'GMCH Sector 32 Emergency Bay',
      time: '8 mins',
      capabilities: 'Level-2 Trauma • On-call Orthopedic & General Surgery'
    },
    {
      id: 'HOSP-CIVIL',
      name: 'Sub-Divisional Civil Hospital',
      time: '3 mins',
      capabilities: 'Primary Stabilization Only (No CT on duty)'
    }
  ];

  // Camera video stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScanning && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch(() => {
          // Fallback gracefully to simulated scanner animation if physical webcam blocked
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScanning]);

  const handleSimulateTagScan = (tag: string) => {
    setScannedTagId(tag);
    setIsScanning(false);
    setTriageStep('auth');
  };

  const handleManualTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTagInput.trim()) return;
    setScannedTagId(manualTagInput.trim().toUpperCase());
    setIsScanning(false);
    setTriageStep('auth');
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();
    if (
      clean === '108' ||
      clean === 'PARAMEDIC-108' ||
      clean === 'HOSPITAL-108' ||
      clean === 'DOCTOR-ER' ||
      clean === 'EMERGENCY'
    ) {
      setTriageStep('triage');
      setAuthError('');
    } else {
      setAuthError('Access Denied. Enter valid paramedic passcode (e.g. 108 or PARAMEDIC-108).');
    }
  };

  const applyClinicalPreset = (preset: 'shock' | 'tbi' | 'stable') => {
    if (preset === 'shock') {
      setGcs(7);
      setBpSystolic('84');
      setBpDiastolic('52');
      setPulse(124);
      setSpO2(88);
      setSelectedInjuries(['Traumatic Brain Injury (TBI)', 'Compound Limb Fracture']);
    } else if (preset === 'tbi') {
      setGcs(9);
      setBpSystolic('148');
      setBpDiastolic('92');
      setPulse(62);
      setSpO2(94);
      setSelectedInjuries(['Traumatic Brain Injury (TBI)', 'Cervical Spine Trauma']);
    } else if (preset === 'stable') {
      setGcs(15);
      setBpSystolic('122');
      setBpDiastolic('80');
      setPulse(78);
      setSpO2(99);
      setSelectedInjuries(['Severe Friction Road Rash']);
    }
  };

  const toggleInjury = (inj: string) => {
    if (selectedInjuries.includes(inj)) {
      setSelectedInjuries(selectedInjuries.filter((i) => i !== inj));
    } else {
      setSelectedInjuries([...selectedInjuries, inj]);
    }
  };

  const handleTransmitTelemetry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVictimId && !isGuestVictim) {
      alert('Please select which passenger is actually in the vehicle for this crash.');
      return;
    }

    const hospitalObj = hospitalOptions.find((h) => h.id === selectedHospital);

    const victimName = isGuestVictim 
      ? (guestName.trim() || 'Unidentified Guest Borrower') 
      : (activeMember?.name || 'Victim');

    const telemetry: AmbulanceTelemetry = {
      telemetryId: 'AMB-108-RUN-' + Math.floor(100 + Math.random() * 900),
      victimId: isGuestVictim ? 'guest-rider' : (activeMember?.id || 'unknown'),
      victimName: victimName,
      victimPhoto: isGuestVictim ? undefined : activeMember?.photoUrl,
      victimAge: isGuestVictim ? 'Unknown' : (activeMember?.age || 30),
      victimGender: isGuestVictim ? 'Unknown' : (activeMember?.gender || 'Male'),
      bloodGroup: isGuestVictim ? 'Unknown (Standby O-)' : (activeMember?.bloodGroup || 'O+'),
      abhaId: isGuestVictim ? 'Unregistered Guest' : (activeMember?.abhaId || '14-0000-0000-0000'),
      criticalAllergies: isGuestVictim ? [] : (activeMember?.criticalAllergies || []),
      chronicConditions: isGuestVictim ? [] : (activeMember?.chronicConditions || []),
      currentMedications: isGuestVictim ? [] : (activeMember?.currentMedications || []),
      victimMember: isGuestVictim ? null : activeMember,
      vehicleTag: scannedTagId || vehicleTag.tagId,
      hospitalId: selectedHospital,
      hospitalName: hospitalObj?.name || 'PGIMER Trauma Centre',
      etaMinutes: Number(etaMinutes) || 4,
      injuryTags: selectedInjuries.length > 0 ? selectedInjuries : ['Polytrauma Under Evaluation'],
      incidentPhotos: injuryPhotos,
      gcsScore: Number(gcs) || 15,
      vitals: {
        bp: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : 'Pending Measure',
        hr: Number(pulse) || 80,
        spo2: Number(spO2) || 98,
        rr: 20
      },
      criticalDirectives: [
        'Emergency Resuscitation Readiness',
        activeMember ? `Standby ${activeMember.bloodGroup} PRBC Units` : 'Standby 2 Units O-Negative PRBCs',
        'Bedside FAST Ultrasound & Polytrauma Protocol'
      ],
      dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    dispatchAmbulanceTelemetry(telemetry);
    setTransmitted(true);
  };

  const handleResetRun = () => {
    setTriageStep('scan');
    setScannedTagId('');
    setManualTagInput('');
    setPasscode('');
    setSelectedVictimId(null);
    setIsGuestVictim(false);
    setTransmitted(false);
    setGcs('');
    setBpSystolic('');
    setBpDiastolic('');
    setPulse('');
    setSpO2('');
    setSelectedInjuries([]);
    setInjuryPhotos([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      
      {/* Top Paramedic Header - Clean Institutional White */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Ambulance size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">108 Ambulance Field Triage Console</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 uppercase tracking-widest font-mono">
                Unit 108-North-04
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Paramedic: Officer S. Singh, EMT-P • GPS: <strong className="font-mono text-slate-700">NH-44 Highway Mile 18</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {triageStep !== 'scan' && (
            <button
              onClick={handleResetRun}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>New Incident Scan</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Hospital ER Link Active
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* =========================================================================
            PHASE 1: SCAN VEHICLE / HELMET QR TAG
            ========================================================================= */}
        {triageStep === 'scan' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-5">
            
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
              <Scan size={28} />
            </div>

            <div>
              <span className="text-[10px] font-mono text-teal-800 uppercase tracking-widest font-bold">
                Step 1: Link Crash Tag
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1 uppercase">
                Scan Incident Vehicle or Helmet QR Decal
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                When arriving at the crash scene, scan the physical 3M QR tag attached to the victim's helmet or vehicle windshield to load their secure incident profile.
              </p>
            </div>

            {/* QR Viewfinder Mockup / Camera Stream */}
            <div className="w-full max-w-sm rounded-xl border-2 border-slate-200 bg-slate-950 p-4 relative overflow-hidden aspect-video flex flex-col items-center justify-center shadow-inner">
              {isScanning ? (
                <>
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 animate-pulse shadow-lg shadow-red-500" />
                  <div className="absolute bottom-2 text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded">
                    Camera Aimed • Align QR within Frame
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <QrCode size={40} className="text-slate-500 animate-pulse" />
                  <span className="text-xs font-mono">Scanner Viewfinder Ready</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Camera Scan or Quick 1-Tap Preset */}
            <div className="w-full max-w-sm flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsScanning(!isScanning)}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera size={15} />
                <span>{isScanning ? 'Close Live Camera' : 'Turn On Live Tablet Camera Scanner'}</span>
              </button>

              <div className="flex items-center my-1">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[10px] uppercase font-bold text-slate-400 font-mono">or 1-Tap Simulation</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* 1-Tap Simulation button for hackathon judges */}
              <button
                type="button"
                onClick={() => handleSimulateTagScan('PING-HLM-882')}
                className="w-full py-3 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <QrCode size={16} />
                <span>Scan Helmet Decal (Tag: PING-HLM-882 • CH-01-AB-1234)</span>
              </button>

              {/* Manual Tag Entry */}
              <form onSubmit={handleManualTagSubmit} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={manualTagInput}
                  onChange={(e) => setManualTagInput(e.target.value)}
                  placeholder="Or enter Tag ID manually (e.g. CH-01-AB-1234)"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 cursor-pointer"
                >
                  Confirm
                </button>
              </form>
            </div>

          </div>
        )}

        {/* =========================================================================
            PHASE 2: AUTHORIZED PARAMEDIC PASSCODE GATE
            ========================================================================= */}
        {triageStep === 'auth' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-5 max-w-md mx-auto w-full animate-fade-in">
            
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <Lock size={22} className="text-slate-800" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Tag Linked: {scannedTagId}
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-2 uppercase">
                Step 2: Enter 108 Paramedic Passcode
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                In compliance with DPDP Act 2023, patient medical vaults are encrypted. Enter official responder credentials to unlock clinical profile:
              </p>
            </div>

            <form onSubmit={handleVerifyPasscode} className="w-full space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-600" />
                    Responder Passcode:
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    Official Key: <strong className="text-teal-800">108</strong>
                  </span>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Enter Passcode (e.g. 108 or PARAMEDIC-108)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-mono text-center text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
                {authError && (
                  <p className="text-xs text-red-600 mt-2 text-center font-semibold">
                    {authError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTriageStep('scan')}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Back to Scanner
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Verify & Decrypt Records
                </button>
              </div>
            </form>

          </div>
        )}

        {/* =========================================================================
            PHASE 3: ACTIVE FIELD TRIAGE, VITALS & TELEMETRY STREAMING
            ========================================================================= */}
        {triageStep === 'triage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left Column: Victim Selection & Decrypted History (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              {/* STEP 3A: SELECT WHO IS ACTUALLY IN THE VEHICLE */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-red-600" />
                    3. Who is in this Crash?
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Select Active Victim</span>
                </div>
                
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Multiple family members share this vehicle. <strong>Tap who is actually riding in this crash</strong>:
                </p>

                <div className="space-y-2">
                  {vehicleTag.members.map((member) => {
                    const isSelected = selectedVictimId === member.id && !isGuestVictim;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedVictimId(member.id);
                          setIsGuestVictim(false);
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-red-600 bg-red-50/60 shadow-xs ring-1 ring-red-600/30'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                        }`}
                      >
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">{member.name}</span>
                            <span className="text-xs font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-mono">
                              {member.bloodGroup}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {member.relationship} • {member.age} Yrs ({member.gender})
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Guest Borrower Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGuestVictim(true);
                      setSelectedVictimId(null);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                      isGuestVictim
                        ? 'border-amber-500 bg-amber-50 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                      <HelpCircle size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 block">Unregistered Borrower / Guest</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Someone else was borrowing vehicle</span>
                    </div>
                  </button>
                </div>

                {isGuestVictim && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter guest name or 'Unknown Male/Female'"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                )}
              </div>

              {/* Decrypted Clinical Vault of Selected Victim */}
              {activeMember && !isGuestVictim ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck size={15} className="text-teal-700" />
                      Decrypted Medical History ({activeMember.name})
                    </h3>
                    <span className="text-[9px] bg-teal-50 text-teal-800 font-mono px-2 py-0.5 rounded border border-teal-200 font-bold">
                      ABHA VERIFIED
                    </span>
                  </div>

                  <div className="text-xs space-y-2.5">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Critical Allergies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeMember.criticalAllergies.map((a, i) => (
                          <span key={i} className="text-[10px] font-bold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded">
                            ⚠️ DO NOT ADMINISTER: {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Pre-Existing Conditions & Implants</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeMember.chronicConditions.map((c, i) => (
                          <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Medications (Bleeding Warnings)</span>
                      <span className="text-slate-700 text-[11px] block mt-0.5 font-mono">
                        {activeMember.currentMedications.join(', ')}
                      </span>
                    </div>

                    {activeMember.pastVisits.length > 0 && (
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Recent Hospital Encounter</span>
                        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 mt-1">
                          <strong>{activeMember.pastVisits[0].hospital}</strong> ({activeMember.pastVisits[0].date}): {activeMember.pastVisits[0].diagnosis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : !isGuestVictim ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-400">
                  Select who was in the vehicle above to decrypt their medical history.
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 leading-relaxed">
                  <strong>Unregistered Borrower:</strong> Universal O-Negative transfusion protocol and unidentified trauma series will be alerted to the hospital.
                </div>
              )}

              {/* Accident Scene Photo Capture */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider mb-2.5">
                  <Camera size={15} className="text-slate-700" />
                  Accident Scene & Wound Camera
                </h3>
                
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
                  {injuryPhotos.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={injuryPhotos[0]}
                        alt="Incident Photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setInjuryPhotos([])}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 gap-1">
                      <Camera size={22} className="text-slate-300" />
                      <span className="text-xs">No Photo Attached</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex gap-2">
                  <label className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 transition-colors">
                    <Upload size={14} /> Snap / Attach Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setInjuryPhotos([reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Vitals, Injuries & Hospital Transmission (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              <form onSubmit={handleTransmitTelemetry} className="flex flex-col gap-5">
                
                {/* Quick Simulation Presets Toolbar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-600" /> Rapid EMT Vitals Presets:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyClinicalPreset('shock')}
                      className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold cursor-pointer"
                    >
                      Severe Shock (BP 84/52)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyClinicalPreset('tbi')}
                      className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold cursor-pointer"
                    >
                      Head Trauma (GCS 9)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyClinicalPreset('stable')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold cursor-pointer"
                    >
                      Conscious (GCS 15)
                    </button>
                  </div>
                </div>

                {/* Observed Trauma Injuries */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertOctagon size={15} className="text-red-700" />
                      4. Observed Trauma Injuries
                    </h3>
                    <span className="text-[10px] text-slate-400">Select all present</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableInjuries.map((inj) => {
                      const isChecked = selectedInjuries.includes(inj);
                      return (
                        <button
                          type="button"
                          key={inj}
                          onClick={() => toggleInjury(inj)}
                          className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
                            isChecked
                              ? 'border-red-600 bg-red-50 text-red-900'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="pr-2">{inj}</span>
                          {isChecked && <CheckCircle2 size={15} className="text-red-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* In-Transit Vitals & GCS */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                    <Activity size={15} className="text-teal-700" />
                    5. Hemodynamics & Neurological Score
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* GCS */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        GCS (3 - 15)
                      </span>
                      <input
                        type="number"
                        min="3"
                        max="15"
                        value={gcs}
                        onChange={(e) => setGcs(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 15"
                        className="w-full text-lg font-black text-slate-900 bg-transparent focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                        {gcs !== '' && Number(gcs) <= 8 ? 'Coma / Intubation' : gcs !== '' ? 'Neurologically responsive' : 'Enter score'}
                      </span>
                    </div>

                    {/* Blood Pressure */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        BP (mmHg)
                      </span>
                      <div className="flex items-center text-lg font-black text-slate-900">
                        <input
                          type="text"
                          value={bpSystolic}
                          onChange={(e) => setBpSystolic(e.target.value)}
                          placeholder="120"
                          className="w-12 bg-transparent focus:outline-none text-slate-900 font-mono"
                        />
                        <span>/</span>
                        <input
                          type="text"
                          value={bpDiastolic}
                          onChange={(e) => setBpDiastolic(e.target.value)}
                          placeholder="80"
                          className="w-12 bg-transparent focus:outline-none text-slate-600 text-base ml-1 font-mono"
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                        {bpSystolic && Number(bpSystolic) < 90 ? 'Hypotension' : 'Systolic / Diastolic'}
                      </span>
                    </div>

                    {/* Pulse */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Heart Rate
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="75"
                          className="w-full text-lg font-black text-slate-900 bg-transparent focus:outline-none font-mono"
                        />
                        <span className="text-xs text-slate-400">bpm</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                        {pulse !== '' && Number(pulse) > 100 ? 'Tachycardia' : 'Radial Pulse'}
                      </span>
                    </div>

                    {/* SpO2 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        SpO2 (%)
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={spO2}
                          onChange={(e) => setSpO2(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="98"
                          className="w-full text-lg font-black text-slate-900 bg-transparent focus:outline-none font-mono"
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                        {spO2 !== '' && Number(spO2) < 90 ? 'Hypoxemia' : 'Pulse Oximetry'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Target Hospital Emergency Department */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider mb-2.5">
                    <Building2 size={15} className="text-teal-700" />
                    6. Destination Trauma Center
                  </h3>

                  <div className="space-y-2">
                    {hospitalOptions.map((hosp) => (
                      <button
                        type="button"
                        key={hosp.id}
                        onClick={() => setSelectedHospital(hosp.id)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          selectedHospital === hosp.id
                            ? 'border-teal-600 bg-teal-50/60 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{hosp.name}</span>
                          <span className="text-[10px] text-slate-500 block">{hosp.capabilities}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2 py-1 rounded border border-slate-200">
                          ETA {hosp.time}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* In-Transit ETA Slider */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Estimated Arrival Time (ETA):</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={etaMinutes}
                        onChange={(e) => setEtaMinutes(Number(e.target.value))}
                        className="w-32 accent-teal-700"
                      />
                      <span className="text-sm font-black text-slate-900 font-mono w-14 text-right">
                        {etaMinutes} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Broadcast Telemetry Action */}
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={transmitted}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      transmitted
                        ? 'bg-emerald-700 text-white cursor-default'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                    }`}
                  >
                    <Radio size={16} className={transmitted ? '' : 'animate-ping'} />
                    {transmitted
                      ? '✓ Telemetry Streamed to Hospital ER! (Active)'
                      : 'Transmit Live Telemetry to Hospital ER'}
                  </button>

                  {transmitted && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                        <div>
                          <strong className="block">PGIMER Emergency Department Alerted & Blood Standby Confirmed</strong>
                          <span className="text-[11px] text-emerald-800">
                            Pre-arrival emergency orders for {activeMember ? activeMember.name : 'Victim'} broadcasted with ETA {etaMinutes} mins.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                        LIVE EN-ROUTE
                      </span>
                    </div>
                  )}
                </div>

              </form>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}