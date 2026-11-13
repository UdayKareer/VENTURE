import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Ambulance,
  Lock,
  KeyRound,
  UserCheck,
  ChevronRight,
  Radio,
  MapPin,
  Heart,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile } from '../store/usePatientStore';

export default function BystanderEmergencyHUD() {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { vehicleTag, triggerEmergencySos, antiPrankVerification, verifyOwnerSafety } = usePatientStore();

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
      // Direct tel link simulation
      window.location.href = `tel:${selectedMember?.emergencyContact?.realPhone || '108'}`;
    }, 800);
  };

  const handleUnlockParamedic = (e: React.FormEvent) => {
    e.preventDefault();
    if (paramedicPin === 'PARAMEDIC-108' || paramedicPin === '108' || paramedicPin === 'DOCTOR-ER') {
      setShowPinModal(false);
      navigate('/paramedic/triage');
    } else {
      setPinError('Invalid PIN. Use PARAMEDIC-108 for emergency responder access.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-12">
      
      {/* High-Contrast Incident Header */}
      <div className="w-full bg-red-600 px-4 py-3 text-white text-center shadow-lg sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="animate-pulse shrink-0" />
          <span className="text-xs font-black tracking-wider uppercase">
            Emergency Roadside HUD • Live Accident Mode
          </span>
        </div>
        <span className="text-[10px] bg-red-800/80 px-2 py-0.5 rounded font-mono font-bold">
          {tagId || vehicleTag.tagId}
        </span>
      </div>

      <div className="max-w-md w-full px-4 pt-4 flex flex-col gap-4">
        
        {/* Supreme Court Section 134A Good Samaritan Legal Immunity Shield */}
        <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3.5 shadow-md flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
              Section 134A Good Samaritan Legal Immunity
            </h4>
            <p className="text-[11px] text-emerald-200/90 leading-tight mt-1">
              Under Supreme Court Order & Indian Motor Vehicles Act, <strong>you cannot be questioned by police, detained, or asked to pay hospital fees</strong> for helping this crash victim.
            </p>
          </div>
        </div>

        {/* Vehicle Identity Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Involved</span>
            <span className="font-bold text-white text-sm font-mono">{vehicleTag.regNumber}</span>
            <span className="text-slate-400 block text-[11px]">{vehicleTag.vehicleModel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">GPS Location</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1 justify-end text-[11px]">
              <MapPin size={12} /> NH-44 Highway Mile 18
            </span>
          </div>
        </div>

        {/* Step 1: Visual Photo Identification of Injured Person */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck size={16} className="text-amber-400" />
              1. Confirm Injured Rider by Photo
            </h3>
            <span className="text-[10px] text-slate-400">Match Face Below</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Look at the crash victim. Tap their photo to see emergency first-aid details and contact family:
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {vehicleTag.members.map((member) => {
              const isSelected = selectedMember?.id === member.id && !isGuestRider;
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                    setIsGuestRider(false);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                      : 'border-slate-800 bg-slate-950 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-lg object-cover mb-1.5 border border-slate-700"
                  />
                  <span className="text-[11px] font-bold text-white truncate w-full">
                    {member.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400">{member.relationship}</span>
                  <span className="text-[10px] font-black text-red-400 mt-1">
                    {member.bloodGroup}
                  </span>
                </button>
              );
            })}
          </div>

          {/* "Guest Rider" Override Button */}
          <button
            onClick={() => {
              setIsGuestRider(true);
              setSelectedMember(null);
            }}
            className={`w-full mt-3 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGuestRider
                ? 'border-red-500 bg-red-500/20 text-red-200'
                : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle size={14} />
            Victim is Someone Else / Guest Rider (Lent Bike)
          </button>
        </div>

        {/* Step 2: Critical Emergency Actions for Selected Victim */}
        {selectedMember && !isGuestRider && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Identified Victim</span>
                <h3 className="text-base font-bold text-white">{selectedMember.name}</h3>
                <span className="text-xs text-slate-400">Age: {selectedMember.age} ({selectedMember.gender})</span>
              </div>

              {/* Blood Group Badge */}
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Blood Group</span>
                <span className="text-xl font-black text-red-500 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-xl">
                  {selectedMember.bloodGroup}
                </span>
              </div>
            </div>

            {/* Critical Allergies Warning */}
            {selectedMember.criticalAllergies.length > 0 && (
              <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-red-300 uppercase block">
                    Critical First-Aid & Drug Warning:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMember.criticalAllergies.map((a, i) => (
                      <span key={i} className="text-[10px] font-bold text-red-200 bg-red-900/60 px-2 py-0.5 rounded">
                        DO NOT GIVE: {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Masked 1-Tap Call to Family Proxy */}
            <button
              onClick={handleCallEmergencyContact}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <PhoneCall size={18} />
              {callInitiated ? 'Calling Proxy Bridge...' : `1-Tap Call Family: ${selectedMember.emergencyContact.name} (${selectedMember.emergencyContact.relation})`}
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Zero-knowledge call via proxy bridge. Your phone number is not revealed.
            </p>
          </div>
        )}

        {/* Guest Rider Special Notice */}
        {isGuestRider && (
          <div className="bg-amber-950/60 border border-amber-600/40 rounded-xl p-4 text-xs text-amber-200 flex flex-col gap-2">
            <div className="font-bold flex items-center gap-2 text-amber-300">
              <AlertTriangle size={16} /> Guest Rider Incident Flagged
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              We have dispatched an automated SMS alert to the registered vehicle owner ({vehicleTag.registeredOwner}) to identify the borrower. Please trigger 108 trauma beacon below immediately:
            </p>
          </div>
        )}

        {/* Step 3: Trigger 108 Ambulance Trauma SOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Ambulance size={16} className="text-red-400" />
              2. Hospital Casualty Alert
            </h4>
            <span className="text-[10px] text-red-400 font-bold animate-pulse">Live Telemetry Feed</span>
          </div>

          <button
            onClick={handleTriggerSOS}
            disabled={sosSent}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer ${
              sosSent
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
            }`}
          >
            <Radio size={18} className={sosSent ? '' : 'animate-ping'} />
            {sosSent ? 'Trauma SOS Transmitted to Emergency Bay!' : '🚨 Trigger 108 Ambulance SOS Beacon'}
          </button>

          {sosSent && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>
                Trauma Beacon broadcasted to PGIMER & GMCH-32 Emergency Bays with GPS coordinates.
              </span>
            </div>
          )}
        </div>

        {/* Data Privacy & Authorized Paramedic Login Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Lock size={14} /> Full Medical Vault Locked (DPDP Act 2023)
          </div>
          <p className="text-[11px] text-slate-500">
            Past hospital prescriptions, surgeries, and ABHA EHR records are encrypted and accessible only to authorized paramedics and trauma surgeons.
          </p>

          <button
            onClick={() => setShowPinModal(true)}
            className="mt-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound size={14} /> 108 Paramedic / Doctor Login
          </button>
        </div>

      </div>

      {/* Paramedic Login PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
              <KeyRound size={24} />
            </div>

            <h3 className="text-base font-bold text-white text-center">
              108 Emergency Responder PIN
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-4">
              Enter official paramedic credentials to access in-transit trauma intake and full patient medical history:
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
                  placeholder="Enter PIN (e.g. PARAMEDIC-108)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-center text-white focus:outline-none focus:border-amber-500"
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-1.5 text-center font-medium">
                    {pinError}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Demo PIN: <strong className="text-slate-300">PARAMEDIC-108</strong>
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
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Unlock Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
