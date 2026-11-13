import React, { useState } from 'react';
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
  Send,
  User,
  Radio,
  FileText,
  AlertOctagon
} from 'lucide-react';
import { usePatientStore, type AmbulanceTelemetry } from '../store/usePatientStore';

export default function AmbulanceFieldTriage() {
  const navigate = useNavigate();
  const { vehicleTag, dispatchAmbulanceTelemetry } = usePatientStore();

  const [selectedMemberId, setSelectedMemberId] = useState(vehicleTag.members[0]?.id || 'fam-ramesh');
  const activeMember = vehicleTag.members.find((m) => m.id === selectedMemberId) || vehicleTag.members[0];

  // In-Transit Field Vitals
  const [gcs, setGcs] = useState(7);
  const [bpSystolic, setBpSystolic] = useState('84');
  const [bpDiastolic, setBpDiastolic] = useState('52');
  const [pulse, setPulse] = useState(122);
  const [spO2, setSpO2] = useState(88);
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [selectedHospital, setSelectedHospital] = useState('HOSP-PGIMER');

  // Injury site selection
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([
    'Severe Traumatic Brain Injury (TBI)',
    'Left Femur Compound Fracture'
  ]);

  // Uploaded photo state
  const [injuryPhotos, setInjuryPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
  ]);

  const [transmitted, setTransmitted] = useState(false);

  const availableInjuries = [
    'Severe Traumatic Brain Injury (TBI)',
    'Cervical Spine Trauma',
    'Blunt Chest Trauma / Flail Chest',
    'Left Femur Compound Fracture',
    'Abdominal Bleed / Pelvic Ring Fracture',
    'Extensive Road Rash & Friction Burns'
  ];

  const hospitalOptions = [
    {
      id: 'HOSP-PGIMER',
      name: 'PGIMER Level-1 Apex Trauma Centre',
      time: '4 mins',
      capabilities: '24/7 Neuro ICU • Massive Transfusion Protocol Ready'
    },
    {
      id: 'HOSP-GMCH32',
      name: 'GMCH Sector 32 Emergency Bay',
      time: '8 mins',
      capabilities: 'Level-2 Trauma • General Surgery On-Call'
    },
    {
      id: 'HOSP-CIVIL',
      name: 'Sub-Divisional Civil Hospital',
      time: '3 mins',
      capabilities: 'Basic Stabilization Only (No CT on duty)'
    }
  ];

  const toggleInjury = (inj: string) => {
    if (selectedInjuries.includes(inj)) {
      setSelectedInjuries(selectedInjuries.filter((i) => i !== inj));
    } else {
      setSelectedInjuries([...selectedInjuries, inj]);
    }
  };

  const handleTransmitTelemetry = (e: React.FormEvent) => {
    e.preventDefault();

    const hospitalObj = hospitalOptions.find((h) => h.id === selectedHospital);

    const telemetry: AmbulanceTelemetry = {
      telemetryId: 'AMB-108-RUN-' + Math.floor(100 + Math.random() * 900),
      victimId: activeMember.id,
      victimName: activeMember.name,
      victimPhoto: activeMember.photoUrl,
      vehicleTag: vehicleTag.tagId,
      hospitalId: selectedHospital,
      hospitalName: hospitalObj?.name || 'PGIMER Trauma Centre',
      etaMinutes: Number(etaMinutes),
      injuryTags: selectedInjuries,
      incidentPhotos: injuryPhotos,
      gcsScore: Number(gcs),
      vitals: {
        bp: `${bpSystolic}/${bpDiastolic}`,
        hr: Number(pulse),
        spo2: Number(spO2),
        rr: 24
      },
      criticalDirectives: [
        'Immediate Red Trauma Bay Reservation (Bay 1)',
        'Stat 2 Units O-Negative Uncrossmatched PRBCs',
        'Rapid Sequence Intubation (RSI) Tray Bedside',
        'Stat Polytrauma Non-Contrast Head CT Reserved'
      ],
      dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    dispatchAmbulanceTelemetry(telemetry);
    setTransmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Top Paramedic Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
            <Ambulance size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">108 Ambulance Field Triage</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-widest">
                Authorized Paramedic Ingress
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Unit: AMB-108-NORTH-04 • Crew: Officer S. Singh, EMT-P
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/doctor')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          View Hospital ER Monitor →
        </button>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Victim Selector & Unlocked Medical Vault (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Passenger Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-3">
              <User size={15} className="text-amber-400" />
              Select Injured Passenger (From Vehicle Tag)
            </h3>

            <div className="space-y-2">
              {vehicleTag.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                    selectedMemberId === member.id
                      ? 'border-red-500 bg-red-500/15 shadow-md'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{member.name}</span>
                      <span className="text-xs font-black text-red-400">{member.bloodGroup}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {member.relationship} • Age {member.age}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Unlocked Medical Vault (Decrypted under Section 7f DPDP Act) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck size={16} className="text-emerald-400" />
                Decrypted Medical History (ABHA)
              </h3>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                AUTH GRANTED
              </span>
            </div>

            <div className="text-xs space-y-2.5">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Critical Allergies</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMember.criticalAllergies.map((a, i) => (
                    <span key={i} className="text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-0.5 rounded">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Chronic Conditions & Implants</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMember.chronicConditions.map((c, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Medications</span>
                <span className="text-slate-300 text-[11px] block mt-0.5">
                  {activeMember.currentMedications.join(', ')}
                </span>
              </div>

              {activeMember.pastVisits.length > 0 && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Recent Hospital Encounter</span>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 mt-1">
                    <strong>{activeMember.pastVisits[0].hospital}</strong> ({activeMember.pastVisits[0].date}): {activeMember.pastVisits[0].diagnosis}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Crash Scene & Wound Photo Capture */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-2.5">
              <Camera size={15} className="text-amber-400" />
              Accident Scene & Wound Camera
            </h3>
            
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
              {injuryPhotos.length > 0 ? (
                <img
                  src={injuryPhotos[0]}
                  alt="Incident Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Camera size={16} /> No Photo Attached
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <label className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700">
                <Upload size={14} /> Snap / Upload Wound Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setInjuryPhotos([reader.result as string, ...injuryPhotos]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Triage Matrix, Vitals & Live Hospital Dispatch (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <form onSubmit={handleTransmitTelemetry} className="flex flex-col gap-6">
            
            {/* Injury Tagging Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-3">
                <AlertOctagon size={16} className="text-red-400" />
                Tag Specific Trauma Injuries
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableInjuries.map((inj) => {
                  const isChecked = selectedInjuries.includes(inj);
                  return (
                    <button
                      type="button"
                      key={inj}
                      onClick={() => toggleInjury(inj)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-red-500 bg-red-500/20 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="pr-2">{inj}</span>
                      {isChecked && <CheckCircle2 size={16} className="text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-Transit Vitals & GCS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-4">
                <Activity size={16} className="text-amber-400" />
                In-Transit Hemodynamics & Neurological Score
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* GCS */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    GCS (3-15)
                  </span>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={gcs}
                    onChange={(e) => setGcs(Number(e.target.value))}
                    className="w-full text-xl font-black text-amber-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] text-red-400 font-semibold block mt-0.5">
                    {gcs <= 8 ? 'Severe Coma (RSI)' : 'Moderate TBI'}
                  </span>
                </div>

                {/* Blood Pressure */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    BP (mmHg)
                  </span>
                  <div className="flex items-center text-xl font-black text-white">
                    <input
                      type="text"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="w-10 bg-transparent focus:outline-none text-red-400"
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="w-10 bg-transparent focus:outline-none text-slate-400 text-base ml-1"
                    />
                  </div>
                  <span className="text-[9px] text-red-400 font-semibold block mt-0.5">
                    Hypotensive Shock
                  </span>
                </div>

                {/* Pulse */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Heart Rate
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full text-xl font-black text-amber-400 bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-semibold block mt-0.5">
                    Tachycardia
                  </span>
                </div>

                {/* SpO2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    SpO2 (%)
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(Number(e.target.value))}
                      className="w-full text-xl font-black text-red-500 bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                  <span className="text-[9px] text-red-400 font-semibold block mt-0.5">
                    Acute Hypoxemia
                  </span>
                </div>

              </div>
            </div>

            {/* Acuity-Based Destination Hospital Matching */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-3">
                <Building2 size={16} className="text-amber-400" />
                Target Hospital Emergency Department
              </h3>

              <div className="space-y-2">
                {hospitalOptions.map((hosp) => (
                  <button
                    type="button"
                    key={hosp.id}
                    onClick={() => setSelectedHospital(hosp.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      selectedHospital === hosp.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{hosp.name}</span>
                      <span className="text-[10px] text-slate-400 block">{hosp.capabilities}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      ETA {hosp.time}
                    </span>
                  </button>
                ))}
              </div>

              {/* Live ETA Slider */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Live In-Transit ETA to Bay:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(Number(e.target.value))}
                    className="w-32 accent-amber-500"
                  />
                  <span className="text-base font-black text-amber-400 font-mono w-14 text-right">
                    {etaMinutes} min
                  </span>
                </div>
              </div>
            </div>

            {/* Transmission Action */}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={transmitted}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
                  transmitted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                }`}
              >
                <Radio size={18} className={transmitted ? '' : 'animate-ping'} />
                {transmitted
                  ? 'Telemetry Streamed to Hospital Trauma Bay! (Active)'
                  : 'Transmit Live Telemetry & Prime Trauma Bay 1'}
              </button>

              {transmitted && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>PGIMER Trauma Resuscitation Bay 1 primed. Pre-arrival blood bank orders sent.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/doctor')}
                    className="font-bold underline text-amber-400 ml-2"
                  >
                    Open Doctor View →
                  </button>
                </div>
              )}
            </div>

          </form>

        </div>

      </main>

    </div>
  );
}
