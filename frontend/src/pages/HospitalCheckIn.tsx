import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  QrCode,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile, type PatientData } from '../store/usePatientStore';

export default function HospitalCheckIn() {
  const navigate = useNavigate();
  const { vehicleTag, checkInFamilyMemberAsOPD } = usePatientStore();

  const [selectedMember, setSelectedMember] = useState<FamilyMemberProfile>(vehicleTag.members[0]);
  const [complaint, setComplaint] = useState('High fever with chills and productive cough for 3 days');
  const [severity, setSeverity] = useState(6);
  const [generatedPatient, setGeneratedPatient] = useState<PatientData | null>(null);

  const presetComplaints = [
    'High fever with chills and productive cough for 3 days',
    'Severe acute retrosternal chest pain with left arm radiation',
    'Right knee severe swelling and joint stiffness after walking',
    'Acute dyspepsia, burning epigastric pain and nausea after meals',
    'Shortness of breath, acute wheezing and tightness in chest'
  ];

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const p = checkInFamilyMemberAsOPD(selectedMember, complaint, severity);
    setGeneratedPatient(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-16">
      
      {/* Hospital Gateway Banner */}
      <div className="w-full bg-teal-600 px-4 py-3 text-white text-center shadow-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={18} />
          <span className="text-xs font-black tracking-wider uppercase">
            Hospital Entrance QR Check-In • Fast-Track OPD
          </span>
        </div>
        <span className="text-[10px] bg-teal-800/80 px-2 py-0.5 rounded font-bold">
          Central Hospital Portal
        </span>
      </div>

      <div className="max-w-md w-full px-4 pt-4 flex flex-col gap-4">
        
        {/* Welcome & Time-Saving Value Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-teal-400" />
            1-Tap OPD Check-In with PingME
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Skip the 45-minute manual registration line. Your ABHA ID, past hospital prescriptions, and clinical history are linked automatically.
          </p>
        </div>

        {!generatedPatient ? (
          <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
            
            {/* Step 1: Select Who is Consulting Today */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Users size={15} className="text-teal-400" />
                  1. Select Consulting Patient
                </span>
                <span className="text-[10px] text-teal-400 font-semibold">Saved Family Profiles</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {vehicleTag.members.map((member) => {
                  const isSelected = selectedMember.id === member.id;
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/15 shadow-md shadow-teal-500/20'
                          : 'border-slate-800 bg-slate-950 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-lg object-cover mb-1 border border-slate-700"
                      />
                      <span className="text-xs font-bold text-white truncate w-full">
                        {member.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400">{member.relationship}</span>
                      <span className="text-[10px] font-mono text-teal-300 mt-0.5">
                        {member.bloodGroup}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-white font-semibold mb-1">
                  <span>Selected: {selectedMember.name} (Age {selectedMember.age})</span>
                  <span className="text-teal-400 font-mono text-[10px]">ABHA: {selectedMember.abhaId}</span>
                </div>
                <div>Known Allergies: <strong className="text-red-400">{selectedMember.criticalAllergies.join(', ') || 'None'}</strong></div>
                <div>Past Hospital Visits: <strong className="text-slate-300">{selectedMember.pastVisits.length} Records on File</strong></div>
              </div>
            </div>

            {/* Step 2: What is the Complaint Today? */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider mb-2 block">
                <Stethoscope size={15} className="text-teal-400" />
                2. Reason for Today's Visit
              </span>

              <textarea
                rows={3}
                required
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe symptoms, duration and location..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
              />

              <div className="mt-2 flex flex-wrap gap-1.5">
                {presetComplaints.map((preset, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setComplaint(preset)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-colors text-left"
                  >
                    + {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Severity Slider */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">Symptom Discomfort / Pain Level:</span>
                  <span className="font-bold text-teal-400 font-mono text-sm">{severity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <QrCode size={18} />
              Generate Token & Enter Live Doctor Queue
            </button>

          </form>
        ) : (
          /* Live Issued Token Display Card */
          <div className="bg-slate-900 border border-teal-500/60 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-teal-400 tracking-widest">
                Check-In Complete • Live Queue Token
              </span>
              <div className="text-4xl font-black text-white font-mono mt-1 tracking-tight">
                {generatedPatient.token}
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                Patient: <strong className="text-slate-200">{generatedPatient.name}</strong>
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Department</span>
                <span className="font-bold text-slate-200">Internal Medicine (Cabin 4)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Wait</span>
                <span className="font-bold text-teal-400 flex items-center gap-1 font-mono">
                  <Clock size={12} /> ~12 Minutes
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your medical history and previous records have been pushed to Dr. R. Verma's consultation screen in real time via Socket.io.
            </p>

            <button
              onClick={() => navigate('/doctor')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              Open Doctor Dashboard (See Live Queue) <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
