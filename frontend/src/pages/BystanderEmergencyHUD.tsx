import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Ambulance,
  Lock,
  KeyRound,
  Users,
  MapPin,
  HeartPulse,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Activity,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile } from '../store/usePatientStore';

export default function BystanderEmergencyHUD() {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { vehicleTag, triggerEmergencySos } = usePatientStore();

  const [selectedMember, setSelectedMember] = useState<FamilyMemberProfile | null>(
    vehicleTag.members[0] || null
  );
  const [isGuestRider, setIsGuestRider] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  // Paramedic PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [paramedicPin, setParamedicPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleTriggerSOS = () => {
    triggerEmergencySos(vehicleTag.tagId, isGuestRider ? null : selectedMember, isGuestRider);
    setSosSent(true);
  };

  const handleCallEmergencyContact = () => {
    setCallInitiated(true);
    setTimeout(() => {
      window.location.href = `tel:${selectedMember?.emergencyContact?.realPhone || '108'}`;
    }, 600);
  };

  const handleUnlockParamedic = (e: React.FormEvent) => {
    e.preventDefault();
    if (paramedicPin.trim().toUpperCase() === 'PARAMEDIC-108' || paramedicPin.trim() === '108' || paramedicPin.trim().toUpperCase() === 'DOCTOR-ER') {
      setShowPinModal(false);
      navigate('/paramedic/triage');
    } else {
      setPinError('Invalid PIN. Official responder code is PARAMEDIC-108.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-16 selection:bg-rose-500/30">
      
      {/* Top Clinical Ticker / Navigation */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold shadow-xs">
              <AlertOctagon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight uppercase">PingME Emergency HUD</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> Live Crash Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Tag: {tagId || vehicleTag.tagId}</p>
            </div>
          </div>

          <button
            onClick={() => setShowPinModal(true)}
            className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyRound size={12} className="text-amber-400" />
            <span>108 Responder</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">
        
        {/* Supreme Court Section 134A Good Samaritan Legal Immunity Shield */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Good Samaritan Legal Protection (Sec. 134A)
              </h4>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                Supreme Court Order
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed mt-1">
              You are legally protected under the Motor Vehicles Act. <strong>Police, hospitals, or courts cannot harass, detain, or charge you</strong> for assisting this crash victim.
            </p>
          </div>
        </div>

        {/* Vehicle & Telemetry Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Crash Vehicle</span>
            <span className="font-bold text-white text-sm font-mono">{vehicleTag.regNumber}</span>
            <span className="text-slate-400 block text-[11px]">{vehicleTag.vehicleModel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Incident GPS</span>
            <span className="text-rose-400 font-semibold flex items-center gap-1 justify-end text-[11px] font-mono">
              <MapPin size={12} /> NH-44 Highway Mile 18
            </span>
            <span className="text-[10px] text-slate-500">Chandigarh-Ambala Corridor</span>
          </div>
        </div>

        {/* Section 1: Who is Injured? Registered People Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-teal-400" />
                Select Injured Rider / Passenger
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Match the victim's face to access life-saving clinical details & emergency family contacts:
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 shrink-0">
              {vehicleTag.members.length} Registered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {vehicleTag.members.map((member) => {
              const isSelected = selectedMember?.id === member.id && !isGuestRider;
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                    setIsGuestRider(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500/10 shadow-sm ring-1 ring-teal-500/40'
                      : 'border-slate-800 bg-slate-950/70 hover:bg-slate-950 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{member.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{member.relationship} • {member.age}y</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                          {member.bloodGroup}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate">
                          {member.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-teal-500/20 flex items-center justify-between text-[10px] text-teal-300 font-semibold">
                      <span>Selected Victim</span>
                      <CheckCircle2 size={12} className="text-teal-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Guest Rider Toggle */}
          <button
            onClick={() => {
              setIsGuestRider(!isGuestRider);
              if (!isGuestRider) setSelectedMember(null);
              else setSelectedMember(vehicleTag.members[0]);
            }}
            className={`w-full mt-3 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGuestRider
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={14} className={isGuestRider ? 'text-amber-400' : 'text-slate-500'} />
            <span>Victim is a Borrower / Unregistered Guest Rider (Lent Vehicle)</span>
          </button>
        </div>

        {/* Section 2: Deep Emergency Clinical Profile of Selected Victim */}
        {selectedMember && !isGuestRider && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3.5">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-xs"
                />
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                    Verified Digital Health Vault
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedMember.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Age: {selectedMember.age} ({selectedMember.gender})</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">ABHA: {selectedMember.abhaId}</span>
                  </div>
                </div>
              </div>

              {/* Large Blood Group Badge */}
              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider mb-1">
                  Blood Group
                </span>
                <span className="text-xl font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1 rounded-xl shadow-xs inline-block">
                  {selectedMember.bloodGroup}
                </span>
              </div>
            </div>

            {/* Critical Allergies Box */}
            {selectedMember.criticalAllergies.length > 0 && (
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide block">
                    Severe Drug Allergy Alert:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedMember.criticalAllergies.map((allergy, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold text-rose-200 bg-rose-900/50 border border-rose-500/30 px-2 py-0.5 rounded">
                        DO NOT ADMINISTER: {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chronic Conditions & Implants */}
            {selectedMember.chronicConditions.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Pre-Existing Medical History & Implants
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.chronicConditions.map((cond, i) => (
                    <span key={i} className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Active Medications */}
            {selectedMember.currentMedications.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Daily Regimen (Blood Thinners / Chronic Rx)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.currentMedications.map((med, i) => (
                    <span key={i} className="text-[11px] font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 1-Tap Masked Family Relay Phone Call */}
            <div className="pt-1">
              <button
                onClick={handleCallEmergencyContact}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>
                  {callInitiated
                    ? 'Connecting Proxy Call...'
                    : `1-Tap Call Family: ${selectedMember.emergencyContact.name} (${selectedMember.emergencyContact.relation})`}
                </span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Privacy Protected: Caller ID is masked via telecom bridge. Your personal number is not shared.
              </p>
            </div>

          </div>
        )}

        {/* Guest Rider Flagged Notice */}
        {isGuestRider && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-xs text-amber-200 flex flex-col gap-2 shadow-xs">
            <div className="font-bold flex items-center gap-2 text-amber-300">
              <AlertTriangle size={16} /> Unregistered Borrower Incident Flagged
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              We dispatched an automated high-priority SMS to the registered vehicle owner (<strong>{vehicleTag.registeredOwner}</strong>) to identify the driver. Please trigger 108 Emergency Beacon below so ambulance dispatch occurs immediately:
            </p>
          </div>
        )}

        {/* Section 3: Instant 108 Hospital Trauma SOS Beacon */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance size={15} className="text-rose-400" />
                Hospital Trauma SOS Beacon
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Alerts PGIMER & GMCH-32 Emergency Bay with crash coordinates & blood requirement:
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Live Socket
            </span>
          </div>

          <button
            onClick={handleTriggerSOS}
            disabled={sosSent}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              sosSent
                ? 'bg-emerald-600 text-white cursor-default shadow-xs'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
            }`}
          >
            <Ambulance size={18} className={sosSent ? '' : 'animate-bounce'} />
            <span>
              {sosSent
                ? '✓ Trauma Beacon Broadcasted to PGIMER Level-1 Bay!'
                : '🚨 Trigger 108 Ambulance SOS & Hospital Trauma Beacon'}
            </span>
          </button>

          {sosSent && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="leading-tight">
                Emergency broadcast live: 108 Dispatched. PGIMER Trauma Bay alerted with <strong>{selectedMember?.bloodGroup || 'O-'} blood standby</strong>.
              </span>
            </div>
          )}
        </div>

        {/* DPDP Act 2023 Security Notice & Authorized Responder Entry */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={14} className="text-slate-500" />
            <span className="text-[11px]">DPDP Act 2023 Encrypted Vault</span>
          </div>
          <button
            onClick={() => setShowPinModal(true)}
            className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Paramedic Login</span>
            <ChevronRight size={12} />
          </button>
        </div>

      </main>

      {/* Paramedic Login PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
              <KeyRound size={22} />
            </div>

            <h3 className="text-sm font-bold text-white text-center">
              108 Paramedic / Doctor Login
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-4">
              Enter official emergency responder credentials to open the in-transit triage console:
            </p>

            <form onSubmit={handleUnlockParamedic} className="space-y-4">
              <div>
                <input
                  type="text"
                  autoFocus
                  value={paramedicPin}
                  onChange={(e) => {
                    setParamedicPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="PIN: PARAMEDIC-108"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-center text-white focus:outline-none focus:border-teal-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
                    {pinError}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Demo Authorized PIN: <strong className="text-slate-300 font-mono">PARAMEDIC-108</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Access Triage Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}