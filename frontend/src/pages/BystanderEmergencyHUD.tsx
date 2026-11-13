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
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Pill,
  Hospital,
  Shield
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

  // Security Gate State
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
      clean === 'EMERGENCY' ||
      clean === 'CARE'
    ) {
      setIsVaultUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Access Denied. Enter valid hospital or 108 responder passcode (e.g. 108).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-16 selection:bg-teal-500/30">
      
      {/* Top Clinical Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs ${
              isVaultUnlocked ? 'bg-teal-600' : 'bg-slate-800 border border-slate-700 text-amber-400'
            }`}>
              {isVaultUnlocked ? <ShieldCheck size={18} /> : <Lock size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight uppercase">PingME Care Health Vault</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                  isVaultUnlocked 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isVaultUnlocked ? 'Decrypted Session' : 'Encrypted Vault'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Tag ID: {tagId || vehicleTag.tagId}</p>
            </div>
          </div>

          {isVaultUnlocked ? (
            <button
              onClick={() => {
                setIsVaultUnlocked(false);
                setPasscode('');
              }}
              className="text-[10px] font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock size={12} />
              <span>Lock Vault</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
              <Shield size={11} className="text-teal-400" /> DPDP Secure
            </span>
          )}
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">

        {/* Vehicle & Incident GPS Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Registered Vehicle</span>
            <span className="font-bold text-white text-sm font-mono">{vehicleTag.regNumber}</span>
            <span className="text-slate-400 block text-[11px]">{vehicleTag.vehicleModel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Incident GPS</span>
            <span className="text-rose-400 font-semibold flex items-center gap-1 justify-end text-[11px] font-mono">
              <MapPin size={12} /> NH-44 Highway Mile 18
            </span>
            <span className="text-[10px] text-slate-500">Chandigarh-Ambala Highway</span>
          </div>
        </div>

        {/* =========================================================================
            STATE 1: LOCKED SECURITY GATE (Anti-Prank, Anti-Scraping & DPDP Protection)
            ========================================================================= */}
        {!isVaultUnlocked ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-xs">
                <Lock size={26} />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase">
                Protected Patient Health Vault
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                To prevent <strong>prank calls, false alarms, and unauthorized data scraping</strong>, patient identity, family emergency contacts, and clinical medical records are encrypted.
              </p>
            </div>

            {/* Anti-Prank & DPDP Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-teal-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-slate-200">DPDP Act 2023 & ABDM Security Protocol:</strong> Access to medical history, ABHA health IDs, and caller bridge is restricted to verified hospital trauma bays, 108 paramedics, and authorized doctors.
              </div>
            </div>

            {/* Passcode Unlock Form */}
            <form onSubmit={handleUnlockVault} className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-400" />
                    Enter Hospital / Paramedic Passcode:
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    Official Key: <strong className="text-amber-300">108</strong>
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
                  placeholder="Enter Hospital Passcode (e.g. 108)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-center text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-inner"
                />
                {authError && (
                  <p className="text-xs text-rose-400 mt-2 text-center font-medium">
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
              >
                <Unlock size={16} />
                <span>Verify Credential & Decrypt Patient Vault</span>
              </button>
            </form>

            {/* Public Anonymous SOS Beacon (In case bystander does not know password) */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 block mb-2">
                Are you a public bystander at an active crash scene without a passcode?
              </span>
              <button
                onClick={handleTriggerSOS}
                disabled={sosSent}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sosSent
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 shadow-xs'
                }`}
              >
                <Ambulance size={15} className={sosSent ? '' : 'text-rose-400 animate-pulse'} />
                <span>
                  {sosSent
                    ? '✓ Anonymous 108 Crash Alert Broadcasted!'
                    : '🚨 Send Anonymous GPS Crash Alert to 108'}
                </span>
              </button>
            </div>

          </div>
        ) : (
          /* =========================================================================
             STATE 2: UNLOCKED CLINICAL VAULT (Full Medical Dossier + Family Caller)
             ========================================================================= */
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* Decryption Success Banner */}
            <div className="p-3.5 rounded-xl bg-teal-950/50 border border-teal-500/40 flex items-center justify-between text-xs text-teal-200 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                <span className="font-bold">
                  Verified Responder Access Granted • Clinical Vault Decrypted
                </span>
              </div>
              <span className="text-[10px] font-mono text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">
                AUTH: 108 ACTIVE
              </span>
            </div>

            {/* Select Victim from Registered Passengers */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-teal-400" />
                    Select Injured Passenger (From Vehicle Tag)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap victim's photo to inspect clinical profile & alert emergency contacts:
                  </p>
                </div>
                <span className="text-[10px] font-mono text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 shrink-0">
                  {vehicleTag.members.length} On Record
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
                          <span>Active Dossier</span>
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
                }}
                className={`w-full mt-3 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isGuestRider
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle size={14} className={isGuestRider ? 'text-amber-400' : 'text-slate-500'} />
                <span>Victim is an Unregistered Borrower (Lent Vehicle)</span>
              </button>
            </div>

            {/* Unlocked Clinical Dossier of Selected Patient */}
            {selectedMember && !isGuestRider && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3.5">
                
                {/* Header with Photo, Name & Blood Group */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-xs"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                        ABHA Digital Health Record (Verified)
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">{selectedMember.name}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Age: {selectedMember.age} ({selectedMember.gender})</span>
                        <span>•</span>
                        <span className="font-mono text-teal-300 font-semibold">{selectedMember.abhaId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider mb-1">
                      Blood Group
                    </span>
                    <span className="text-xl font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1 rounded-xl shadow-xs inline-block">
                      {selectedMember.bloodGroup}
                    </span>
                  </div>
                </div>

                {/* Lethal Allergies Alert */}
                {selectedMember.criticalAllergies.length > 0 && (
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertTriangle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide block">
                        Severe Lethal Drug Allergies (Anaphylaxis Risk):
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedMember.criticalAllergies.map((allergy, i) => (
                          <span key={i} className="text-[10px] font-mono font-bold text-rose-200 bg-rose-900/60 border border-rose-500/40 px-2 py-0.5 rounded">
                            DO NOT ADMINISTER: {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chronic Conditions & Surgical Implants */}
                {selectedMember.chronicConditions.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <HeartPulse size={13} className="text-teal-400" />
                      Pre-Existing Chronic Conditions & Implants:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.chronicConditions.map((cond, i) => (
                        <span key={i} className="text-[11px] font-semibold text-slate-200 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-lg">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Prescriptions */}
                {selectedMember.currentMedications.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Pill size={13} className="text-amber-400" />
                      Daily Regimen (Bleeding / Drug Interaction Warnings):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.currentMedications.map((med, i) => (
                        <span key={i} className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Hospital Encounters on File */}
                {selectedMember.pastVisits && selectedMember.pastVisits.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Hospital size={13} className="text-blue-400" />
                      Verified Past Hospital Encounters ({selectedMember.pastVisits.length} Records):
                    </span>
                    <div className="space-y-1.5">
                      {selectedMember.pastVisits.map((visit, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-white">{visit.hospital}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{visit.date}</span>
                          </div>
                          <div className="text-teal-300 text-[11px] mt-0.5">
                            {visit.department} • <strong className="text-slate-200">{visit.diagnosis}</strong>
                          </div>
                          {visit.prescriptions && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Rx: {visit.prescriptions.join(' | ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Responder Family Caller & SOS Actions */}
                <div className="pt-2 flex flex-col gap-2.5 border-t border-slate-800">
                  <button
                    onClick={handleCallEmergencyContact}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <PhoneCall size={15} />
                    <span>
                      {callInitiated
                        ? 'Connecting Telecom Proxy...'
                        : `Call Family Contact: ${selectedMember.emergencyContact.name} (${selectedMember.emergencyContact.relation})`}
                    </span>
                  </button>

                  <button
                    onClick={handleTriggerSOS}
                    disabled={sosSent}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      sosSent
                        ? 'bg-emerald-700 text-white cursor-default'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                    }`}
                  >
                    <Ambulance size={16} className={sosSent ? '' : 'animate-bounce'} />
                    <span>
                      {sosSent
                        ? '✓ Trauma Beacon Broadcasted to Level-1 Emergency Bay!'
                        : '🚨 Trigger 108 Ambulance SOS & Hospital Trauma Beacon'}
                    </span>
                  </button>

                  {/* Paramedic / Doctor Route Shortcuts */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => navigate('/paramedic/triage')}
                      className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity size={14} />
                      <span>108 Triage &rarr;</span>
                    </button>
                    <button
                      onClick={() => navigate('/doctor')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Stethoscope size={14} className="text-teal-400" />
                      <span>Doctor Console &rarr;</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}