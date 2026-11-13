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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start font-sans pb-16">
      
      {/* Hospital Gateway Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">Hospital Fast-Track Entry</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  QR Token Desk
                </span>
              </div>
              <p className="text-[10px] text-slate-500">PGIMER Apex OPD Facility • Chandigarh</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
            Average Wait: 12m
          </span>
        </div>
      </header>

      <main className="max-w-xl w-full px-4 pt-4 flex flex-col gap-4">
        
        {/* Value Prop Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0 mt-0.5 border border-teal-100">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1-Tap OPD Fast-Track Check-In
            </h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Skip the manual registration counter. Your ABHA ID, past hospital prescriptions, and doctor records link instantly to the consulting physician.
            </p>
          </div>
        </div>

        {!generatedPatient ? (
          <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
            
            {/* Step 1: Select Consulting Patient */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users size={14} className="text-teal-700" />
                    1. Select Consulting Patient
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Choose from your registered family profiles:
                  </p>
                </div>
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
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
                          ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600/30'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 truncate block">{member.name}</span>
                          <span className="text-[10px] text-slate-500 block">{member.relationship} • {member.age}y</span>
                          <span className="text-[10px] font-mono text-teal-700 font-bold block mt-0.5">
                            {member.bloodGroup}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-teal-200 flex items-center justify-between text-[10px] text-teal-800 font-bold">
                          <span>Selected</span>
                          <CheckCircle2 size={12} className="text-teal-700" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Patient Health Summary Card */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-slate-900 font-bold">
                  <span>{selectedMember.name} • {selectedMember.gender}, {selectedMember.age}y</span>
                  <span className="text-teal-800 font-mono text-[10px]">ABHA: {selectedMember.abhaId}</span>
                </div>
                <div className="text-[10px]">
                  Allergies: <span className="text-red-700 font-semibold">{selectedMember.criticalAllergies.join(', ') || 'No known allergies'}</span>
                </div>
                <div className="text-[10px]">
                  Chronic History: <span className="text-slate-800">{selectedMember.chronicConditions.join(', ') || 'None recorded'}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Select Specialty & Purpose */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3.5">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Stethoscope size={14} className="text-teal-700" />
                  2. Select Department & Specialty
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
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
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
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
                            ? 'border-teal-500 bg-teal-50/60 text-teal-950 font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{reason}</span>
                        {isSelected && <CheckCircle2 size={13} className="text-teal-700 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <QrCode size={16} />
              <span>Generate Fast-Track OPD Token Now</span>
            </button>

          </form>
        ) : (
          /* Step 3: Issued OPD Token Card */
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
            
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 size={30} />
            </div>

            <div>
              <span className="text-[10px] font-mono text-teal-800 uppercase tracking-widest font-bold">
                OPD Token Issued & Queued
              </span>
              <h2 className="text-3xl font-mono font-black text-slate-900 mt-1">
                {generatedPatient.token}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Patient: <strong className="text-slate-900">{generatedPatient.name}</strong> • {department}
              </p>
            </div>

            {/* Estimated Wait Box */}
            <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-left">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Wait</span>
                <span className="text-base font-bold text-emerald-700 font-mono">10 - 15 Mins</span>
                <span className="text-[10px] text-slate-500 block">3 Patients Ahead</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Room</span>
                <span className="text-base font-bold text-slate-900 font-mono">Room 104</span>
                <span className="text-[10px] text-slate-500 block">Dr. Arvind Sharma</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-700 shrink-0" />
                <span>ABHA Records Synced to Doctor Cockpit</span>
              </div>
              <span className="font-mono text-emerald-800 text-[11px] font-bold">Live Synced</span>
            </div>

            <div className="w-full flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGeneratedPatient(null)}
                className="flex-1 py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Check In Another Member
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctor')}
                className="flex-1 py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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