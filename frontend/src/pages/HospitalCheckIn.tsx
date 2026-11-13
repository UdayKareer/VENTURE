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
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile, type PatientData } from '../store/usePatientStore';

export default function HospitalCheckIn() {
  const navigate = useNavigate();
  const { vehicleTag, checkInFamilyMemberAsOPD } = usePatientStore();

  const [selectedMember, setSelectedMember] = useState<FamilyMemberProfile>(vehicleTag.members[0]);
  const [department, setDepartment] = useState('General Medicine');
  const [visitReason, setVisitReason] = useState('Follow-up Consultation & Routine Prescription Review');
  const [generatedPatient, setGeneratedPatient] = useState<PatientData | null>(null);

  const departments = [
    'General Medicine',
    'Cardiology OPD',
    'Orthopedics & Joint Care',
    'Pulmonology & Chest',
    'Pediatrics OPD',
    'General Surgery OPD',
    'Dermatology'
  ];

  const quickReasons = [
    'Follow-up Consultation & Routine Prescription Review',
    'Acute High Fever, Chills & Persistent Cough',
    'Hypertension & Glycemic Control Checkup',
    'Diagnostic Lab / ECG Report Consultation',
    'Joint Pain, Stiffness & Mobility Review'
  ];

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const complaintText = `[${department}] ${visitReason}`;
    const p = checkInFamilyMemberAsOPD(selectedMember, complaintText, 3);
    setGeneratedPatient(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start font-sans pb-16 selection:bg-teal-500/30">
      
      {/* Hospital Gateway Top Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight uppercase">Hospital Fast-Track Entry</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  QR Token Desk
                </span>
              </div>
              <p className="text-[10px] text-slate-400">PGIMER Apex OPD Facility • Chandigarh</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Average Wait: 12m
          </span>
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">
        
        {/* Value Prop Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400 shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              1-Tap OPD Fast-Track Check-In
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Skip the manual registration counter. Your ABHA ID, past hospital prescriptions, and doctor records link instantly to the consulting physician.
            </p>
          </div>
        </div>

        {!generatedPatient ? (
          <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
            
            {/* Step 1: Select Consulting Patient */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Users size={14} className="text-teal-400" />
                    1. Select Consulting Patient
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Choose from your registered family profiles:
                  </p>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  {vehicleTag.members.length} Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {vehicleTag.members.map((member) => {
                  const isSelected = selectedMember.id === member.id;
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 shadow-sm ring-1 ring-teal-500/40'
                          : 'border-slate-800 bg-slate-950/70 hover:bg-slate-950 hover:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate block">{member.name}</span>
                          <span className="text-[10px] text-slate-400 block">{member.relationship} • {member.age}y</span>
                          <span className="text-[10px] font-mono text-teal-400 font-semibold block mt-0.5">
                            {member.bloodGroup}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-teal-500/20 flex items-center justify-between text-[10px] text-teal-300 font-semibold">
                          <span>Selected</span>
                          <CheckCircle2 size={12} className="text-teal-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Patient Health Summary Card */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>{selectedMember.name} • {selectedMember.gender}, {selectedMember.age}y</span>
                  <span className="text-teal-400 font-mono text-[10px]">ABHA: {selectedMember.abhaId}</span>
                </div>
                <div className="text-[10px]">
                  Allergies: <span className="text-rose-400 font-semibold">{selectedMember.criticalAllergies.join(', ') || 'No known allergies'}</span>
                </div>
                <div className="text-[10px]">
                  Chronic History: <span className="text-slate-300">{selectedMember.chronicConditions.join(', ') || 'None recorded'}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Select Specialty & Purpose */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3.5">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Stethoscope size={14} className="text-teal-400" />
                  2. Select Department & Specialty
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose the clinic department you are visiting today:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {departments.map((dept) => {
                  const isSelected = department === dept;
                  return (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => setDepartment(dept)}
                      className={`py-2 px-2.5 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/15 text-teal-300 shadow-xs'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Visit Purpose (Quick Select):
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickReasons.map((reason, i) => {
                    const isSelected = visitReason === reason;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setVisitReason(reason)}
                        className={`py-2 px-3 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-teal-500/50 bg-teal-500/10 text-white font-medium'
                            : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{reason}</span>
                        {isSelected && <CheckCircle2 size={13} className="text-teal-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <QrCode size={16} />
              <span>Generate Fast-Track OPD Token Now</span>
            </button>

          </form>
        ) : (
          /* Step 3: Issued OPD Token Card */
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col items-center text-center gap-4">
            
            <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 size={30} />
            </div>

            <div>
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">
                OPD Token Issued & Queued
              </span>
              <h2 className="text-3xl font-mono font-black text-white mt-1">
                {generatedPatient.token}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Patient: <strong className="text-white">{generatedPatient.name}</strong> • {department}
              </p>
            </div>

            {/* Estimated Wait Box */}
            <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-left">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Wait</span>
                <span className="text-base font-bold text-emerald-400 font-mono">10 - 15 Mins</span>
                <span className="text-[10px] text-slate-500 block">3 Patients Ahead</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consultation Room</span>
                <span className="text-base font-bold text-white font-mono">Room 104</span>
                <span className="text-[10px] text-slate-500 block">Dr. Arvind Sharma</span>
              </div>
            </div>

            <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-400 shrink-0" />
                <span>ABHA Records Synced to Doctor Cockpit</span>
              </div>
              <span className="font-mono text-emerald-400 text-[11px] font-bold">Live Synced</span>
            </div>

            <div className="w-full flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGeneratedPatient(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Check In Another Member
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctor')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Doctor Live Queue</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}