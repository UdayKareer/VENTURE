import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  AlertTriangle,
  Ambulance,
  Lock,
  Unlock,
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
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Pill,
  Hospital
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile } from '../store/usePatientStore';

export default function BystanderEmergencyHUD() {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { vehicleTag, triggerEmergencySos } = usePatientStore();

  const [selectedMember, setSelectedMember] = useState<FamilyMemberProfile>(
    vehicleTag.members[0] || null
  );
  const [isGuestRider, setIsGuestRider] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  // Real Hospital & Paramedic Authentication State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

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

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();
    if (
      clean === '108' ||
      clean === 'PARAMEDIC-108' ||
      clean === 'HOSPITAL-108' ||
      clean === 'DOCTOR-ER' ||
      clean === 'EMERGENCY'
    ) {
      setIsVaultUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Access Denied. Enter valid hospital passcode (e.g. 108 or PARAMEDIC-108).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-16 selection:bg-rose-500/30">
      
      {/* Top Clinical Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold shadow-xs">
              <AlertOctagon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight uppercase">PingME Care Emergency HUD</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> Live Crash Telemetry
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Tag ID: {tagId || vehicleTag.tagId}</p>
            </div>
          </div>

          {isVaultUnlocked ? (
            <button
              onClick={() => setIsVaultUnlocked(false)}
              className="text-[10px] font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock size={12} />
              <span>Relock Profile</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md flex items-center gap-1">
              <Lock size={11} /> EHR Locked
            </span>
          )}
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">

        {/* Crash Incident & Vehicle Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Incident Vehicle</span>
            <span className="font-bold text-white text-sm font-mono">{vehicleTag.regNumber}</span>
            <span className="text-slate-400 block text-[11px]">{vehicleTag.vehicleModel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Crash Site GPS</span>
            <span className="text-rose-400 font-semibold flex items-center gap-1 justify-end text-[11px] font-mono">
              <MapPin size={12} /> NH-44 Highway Mile 18
            </span>
            <span className="text-[10px] text-slate-500">Chandigarh-Ambala Highway</span>
          </div>
        </div>

        {/* Section 1: Who was in this Vehicle? (Registered Profiles) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-teal-400" />
                Registered Passengers on this Tag
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Match victim by face to initiate emergency dispatch:
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
                      ? 'border-teal-500 bg-teal-500/15 shadow-sm ring-1 ring-teal-500/40'
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
                      <span className="text-xs font-bold text-white truncate block">{member.name}</span>
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

          {/* Guest Borrower Toggle */}
          <button
            onClick={() => {
              setIsGuestRider(!isGuestRider);
            }}
            className={`w-full mt-3 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGuestRider
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={14} className={isGuestRider ? 'text-amber-400' : 'text-slate-500'} />
            <span>Victim is an Unregistered Guest / Borrower (Lent Vehicle)</span>
          </button>
        </div>

        {/* Section 2: Public Bystander Emergency Actions (Always Visible) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance size={15} className="text-rose-400" />
                Immediate Roadside Actions
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Public actions available to any bystander or passerby:
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Public Mode
            </span>
          </div>

          {/* 108 Emergency Ambulance SOS Beacon */}
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
                ? '✓ 108 Dispatched! PGIMER Trauma Bay Alerted'
                : '🚨 Trigger 108 Ambulance SOS Beacon'}
            </span>
          </button>

          {/* 1-Tap Masked Call to Family */}
          {selectedMember && !isGuestRider && (
            <button
              onClick={handleCallEmergencyContact}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PhoneCall size={15} className="text-emerald-400" />
              <span>
                {callInitiated
                  ? 'Connecting Proxy Telecom Bridge...'
                  : `1-Tap Masked Call Family: ${selectedMember.emergencyContact.name} (${selectedMember.emergencyContact.relation})`}
              </span>
            </button>
          )}

          {sosSent && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="leading-tight">
                Live crash coordinates transmitted to 108 State Dispatch and Level-1 Trauma Bay. Standby units alerted.
              </span>
            </div>
          )}
        </div>

        {/* Section 3: THE MEDICAL PROFILE VAULT (Protected / Locked vs Unlocked) */}
        {!isVaultUnlocked ? (
          /* STATE A: LOCKED VAULT (Hospital Passcode Gate) */
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Full Medical Profile & Records Locked
                  </h3>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    DPDP Act Protected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  In compliance with privacy laws, intimate clinical records (ABHA ID, drug allergies, past surgeries, chronic illnesses, and prescriptions) are encrypted. 
                  Only authorized paramedics and hospital trauma doctors can decrypt this profile.
                </p>
              </div>
            </div>

            {/* Emergency Passcode Unlock Box */}
            <form onSubmit={handleUnlockVault} className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-400" />
                  Authorized Hospital / Paramedic Passcode:
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Demo Key: <strong className="text-slate-300">108</strong>
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Enter Passcode (e.g. 108 or PARAMEDIC-108)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Unlock size={14} />
                  <span>Decrypt Vault</span>
                </button>
              </div>

              {authError && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {authError}
                </p>
              )}
            </form>

          </div>
        ) : (
          /* STATE B: UNLOCKED CLINICAL VAULT (Full Medical Data Revealed to Hospital/Paramedic) */
          <div className="bg-slate-900 border border-teal-500/40 rounded-xl p-5 shadow-2xl flex flex-col gap-4 animate-fade-in">
            
            {/* Decryption Success Banner */}
            <div className="p-3 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-between text-xs text-teal-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                <span className="font-semibold">
                  Decrypted: Authorized 108 Paramedic / Trauma Surgeon Session Active
                </span>
              </div>
              <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-500/20 px-2 py-0.5 rounded">
                Section 7(f) Override
              </span>
            </div>

            {/* Patient Header & Blood Group */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-xs"
                />
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                    ABHA Digital Health Record
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedMember.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Age: {selectedMember.age} ({selectedMember.gender})</span>
                    <span>•</span>
                    <span className="font-mono text-teal-300 font-semibold">{selectedMember.abhaId}</span>
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

            {/* Critical Lethal Allergies Alert */}
            {selectedMember.criticalAllergies.length > 0 && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide block">
                    Severe Lethal Drug Allergies (Anaphylaxis Risk):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedMember.criticalAllergies.map((allergy, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold text-rose-200 bg-rose-900/60 border border-rose-500/40 px-2.5 py-0.5 rounded">
                        DO NOT ADMINISTER: {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chronic Medical Conditions & Surgical Implants */}
            {selectedMember.chronicConditions.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <HeartPulse size={13} className="text-teal-400" />
                  Pre-Existing Chronic Conditions & Surgical Implants:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.chronicConditions.map((cond, i) => (
                    <span key={i} className="text-[11px] font-semibold text-slate-200 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Daily Prescriptions */}
            {selectedMember.currentMedications.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Pill size={13} className="text-amber-400" />
                  Active Chronic Medications (Bleeding / Drug Interaction Warnings):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.currentMedications.map((med, i) => (
                    <span key={i} className="text-[11px] font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Past Hospital Visits & Prescriptions History */}
            {selectedMember.pastVisits && selectedMember.pastVisits.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <Hospital size={13} className="text-blue-400" />
                  Verified Past Hospital Records on File ({selectedMember.pastVisits.length} Encounters):
                </span>
                <div className="space-y-2">
                  {selectedMember.pastVisits.map((visit, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{visit.hospital}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{visit.date}</span>
                      </div>
                      <div className="text-teal-300 text-[11px]">
                        {visit.department} • <strong className="text-slate-200">{visit.diagnosis}</strong>
                      </div>
                      {visit.prescriptions && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Rx: {visit.prescriptions.join(' | ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paramedic / Doctor Ingress Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/paramedic/triage')}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <Activity size={15} />
                <span>Open 108 Paramedic Triage &rarr;</span>
              </button>
              <button
                onClick={() => navigate('/doctor')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Stethoscope size={15} className="text-teal-400" />
                <span>Open Doctor Emergency Bay &rarr;</span>
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}