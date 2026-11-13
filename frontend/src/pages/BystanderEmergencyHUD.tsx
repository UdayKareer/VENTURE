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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start font-sans pb-16">
      
      {/* Top Clinical Header - Normal White */}
      <header className="w-full bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs ${
              isVaultUnlocked ? 'bg-teal-700' : 'bg-slate-800 text-white'
            }`}>
              {isVaultUnlocked ? <ShieldCheck size={18} /> : <Lock size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">PingME Care Emergency Gateway</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                  isVaultUnlocked 
                    ? 'bg-teal-50 text-teal-800 border-teal-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isVaultUnlocked ? 'Decrypted Session' : 'Encrypted Vault'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Tag ID: {tagId || vehicleTag.tagId}</p>
            </div>
          </div>

          {isVaultUnlocked ? (
            <button
              onClick={() => {
                setIsVaultUnlocked(false);
                setPasscode('');
              }}
              className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock size={12} />
              <span>Lock Vault</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1">
              <Shield size={11} className="text-teal-700" /> DPDP Secure
            </span>
          )}
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">

        {/* Vehicle & Crash Location Context */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Registered Vehicle</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{vehicleTag.regNumber}</span>
            <span className="text-slate-600 block text-[11px] font-medium">{vehicleTag.vehicleModel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Crash Site Location</span>
            <span className="text-red-700 font-bold flex items-center gap-1 justify-end text-[11px] font-mono">
              <MapPin size={12} /> NH-44 Highway Mile 18
            </span>
            <span className="text-[10px] text-slate-500">Chandigarh-Ambala Highway</span>
          </div>
        </div>

        {/* =========================================================================
            STATE 1: LOCKED SECURITY GATE (Clean White Institutional Theme)
            ========================================================================= */}
        {!isVaultUnlocked ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-3 shadow-2xs">
                <Lock size={22} className="text-slate-700" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                Protected Patient Health Vault
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                To prevent <strong>prank calls, false alarms, and unauthorized data scraping</strong>, patient identity, family emergency contacts, and clinical medical records are encrypted.
              </p>
            </div>

            {/* Anti-Prank & Privacy Notice */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-teal-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-slate-900">DPDP Act 2023 & ABDM Protocol:</strong> Access to medical history, ABHA health IDs, and family caller bridge is restricted to verified hospital trauma bays, 108 paramedics, and attending physicians.
              </div>
            </div>

            {/* Passcode Unlock Form */}
            <form onSubmit={handleUnlockVault} className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-600" />
                    Enter Hospital / Paramedic Passcode:
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
                  placeholder="Enter Hospital Passcode (e.g. 108)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-mono text-center text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
                {authError && (
                  <p className="text-xs text-red-600 mt-2 text-center font-semibold">
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Unlock size={15} />
                <span>Verify Credential & Decrypt Patient Vault</span>
              </button>
            </form>

            {/* Public Anonymous SOS Beacon (In case bystander does not know password) */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 block mb-2">
                Are you a public bystander at an active crash scene without a passcode?
              </span>
              <button
                onClick={handleTriggerSOS}
                disabled={sosSent}
                className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sosSent
                    ? 'bg-emerald-700 text-white cursor-default'
                    : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                <Ambulance size={15} className={sosSent ? '' : 'text-red-600 animate-pulse'} />
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
             STATE 2: UNLOCKED CLINICAL VAULT (Clean White Institutional Theme)
             ========================================================================= */
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* Decryption Success Banner */}
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-900 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-700 shrink-0" />
                <span className="font-bold">
                  Verified Responder Access Granted • Clinical Vault Decrypted
                </span>
              </div>
              <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                AUTH: 108 ACTIVE
              </span>
            </div>

            {/* Select Victim from Registered Passengers */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-teal-700" />
                    Select Injured Passenger (From Vehicle Tag)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tap victim's photo to inspect clinical profile & alert emergency contacts:
                  </p>
                </div>
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
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
                          ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600/30'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 truncate block">{member.name}</span>
                          <span className="text-[10px] text-slate-500 block">{member.relationship} • {member.age}y</span>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              {member.bloodGroup}
                            </span>
                            <span className="text-[9px] text-slate-500 truncate">
                              {member.gender}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-teal-200 flex items-center justify-between text-[10px] text-teal-800 font-bold">
                          <span>Active Dossier</span>
                          <CheckCircle2 size={12} className="text-teal-700" />
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
                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle size={14} className={isGuestRider ? 'text-amber-700' : 'text-slate-400'} />
                <span>Victim is an Unregistered Borrower (Lent Vehicle)</span>
              </button>
            </div>

            {/* Unlocked Clinical Dossier of Selected Patient */}
            {selectedMember && !isGuestRider && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3.5">
                
                {/* Header with Photo, Name & Blood Group */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-teal-700 uppercase tracking-wider font-bold">
                        ABHA Digital Health Record (Verified)
                      </span>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{selectedMember.name}</h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Age: {selectedMember.age} ({selectedMember.gender})</span>
                        <span>•</span>
                        <span className="font-mono text-teal-800 font-semibold">{selectedMember.abhaId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider mb-1">
                      Blood Group
                    </span>
                    <span className="text-xl font-mono font-black text-red-700 bg-red-50 border border-red-200 px-3.5 py-1 rounded-lg shadow-2xs inline-block">
                      {selectedMember.bloodGroup}
                    </span>
                  </div>
                </div>

                {/* Lethal Allergies Alert */}
                {selectedMember.criticalAllergies.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2.5">
                    <AlertTriangle size={17} className="text-red-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-red-900 uppercase tracking-wide block">
                        Severe Lethal Drug Allergies (Anaphylaxis Risk):
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedMember.criticalAllergies.map((allergy, i) => (
                          <span key={i} className="text-[10px] font-mono font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                            DO NOT ADMINISTER: {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chronic Conditions & Surgical Implants */}
                {selectedMember.chronicConditions.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <HeartPulse size={13} className="text-teal-700" />
                      Pre-Existing Chronic Conditions & Implants:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.chronicConditions.map((cond, i) => (
                        <span key={i} className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Prescriptions */}
                {selectedMember.currentMedications.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Pill size={13} className="text-amber-700" />
                      Daily Regimen (Bleeding / Drug Interaction Warnings):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.currentMedications.map((med, i) => (
                        <span key={i} className="text-[11px] font-mono font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Hospital Encounters on File */}
                {selectedMember.pastVisits && selectedMember.pastVisits.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Hospital size={13} className="text-blue-700" />
                      Verified Past Hospital Encounters ({selectedMember.pastVisits.length} Records):
                    </span>
                    <div className="space-y-1.5">
                      {selectedMember.pastVisits.map((visit, i) => (
                        <div key={i} className="p-2 rounded bg-white border border-slate-200 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{visit.hospital}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{visit.date}</span>
                          </div>
                          <div className="text-teal-800 text-[11px] mt-0.5 font-medium">
                            {visit.department} • <strong className="text-slate-900">{visit.diagnosis}</strong>
                          </div>
                          {visit.prescriptions && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Rx: {visit.prescriptions.join(' | ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Responder Family Caller & SOS Actions */}
                <div className="pt-2 flex flex-col gap-2.5 border-t border-slate-100">
                  <button
                    onClick={handleCallEmergencyContact}
                    className="w-full py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
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
                    className={`w-full py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      sosSent
                        ? 'bg-emerald-800 text-white cursor-default'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
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
                      className="py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity size={14} />
                      <span>108 Triage &rarr;</span>
                    </button>
                    <button
                      onClick={() => navigate('/doctor')}
                      className="py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Stethoscope size={14} className="text-teal-700" />
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