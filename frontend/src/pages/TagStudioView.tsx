import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  Smartphone,
  Printer,
  Users,
  Plus,
  Heart,
  AlertTriangle,
  Radio,
  ExternalLink,
  Bike,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { usePatientStore, type FamilyMemberProfile } from '../store/usePatientStore';

export default function TagStudioView() {
  const navigate = useNavigate();
  const { vehicleTag, updateVehicleProfile } = usePatientStore();
  const [selectedTagType, setSelectedTagType] = useState<'helmet' | 'windshield'>('helmet');
  const [showAddMember, setShowAddMember] = useState(false);
  const [nfcSimulated, setNfcSimulated] = useState(false);

  // Form for new member
  const [newMember, setNewMember] = useState<Partial<FamilyMemberProfile>>({
    name: '',
    relationship: 'Child',
    age: 20,
    gender: 'Male',
    bloodGroup: 'O+',
    abhaId: '14-0000-0000-0000',
    criticalAllergies: [],
    chronicConditions: [],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  });

  const getEmergencyUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/emergency/${vehicleTag.tagId}`;
    }
    return `http://localhost:5173/emergency/${vehicleTag.tagId}`;
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getEmergencyUrl())}&color=0B0F17&bgcolor=FFFFFF`;

  const handleSimulateNfc = () => {
    setNfcSimulated(true);
    setTimeout(() => {
      setNfcSimulated(false);
      navigate(`/emergency/${vehicleTag.tagId}`);
    }, 1200);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name) return;

    const member: FamilyMemberProfile = {
      id: 'fam-' + Date.now(),
      name: newMember.name,
      relationship: newMember.relationship as any || 'Relative',
      age: Number(newMember.age) || 25,
      gender: newMember.gender as any || 'Male',
      photoUrl: newMember.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      bloodGroup: (newMember.bloodGroup as any) || 'O+',
      abhaId: newMember.abhaId || `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-0001`,
      criticalAllergies: newMember.criticalAllergies || ['None Reported'],
      chronicConditions: newMember.chronicConditions || ['None Reported'],
      currentMedications: ['None'],
      emergencyContact: {
        name: vehicleTag.registeredOwner,
        relation: 'Primary Contact',
        maskedPhone: '+91 ••••• ••442',
        realPhone: '+91 98112 24442'
      },
      pastVisits: []
    };

    updateVehicleProfile({
      members: [...vehicleTag.members, member]
    });

    setShowAddMember(false);
    setNewMember({
      name: '',
      relationship: 'Child',
      age: 20,
      gender: 'Male',
      bloodGroup: 'O+',
      abhaId: '',
      criticalAllergies: [],
      chronicConditions: []
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <QrCode size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">PingME Tag Studio</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                Phygital Vault
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vehicle & Helmet QR Decal Generator with ABHA Emergency Identity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            Doctor Dashboard <ChevronRight size={14} />
          </button>
          <button
            onClick={() => navigate('/hospital/checkin')}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            Hospital Entry QR <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Physical Sticker Preview & Live Scanners (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
            
            {/* Decal Type Switcher */}
            <div className="w-full flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
              <button
                onClick={() => setSelectedTagType('helmet')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedTagType === 'helmet'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Helmet Decal (50mm Round)
              </button>
              <button
                onClick={() => setSelectedTagType('windshield')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedTagType === 'windshield'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Windshield Tag (80x45mm)
              </button>
            </div>

            {/* Physical Sticker Visualization (High-density 3M Reflective styling) */}
            {selectedTagType === 'helmet' ? (
              <div className="relative w-64 h-64 rounded-full border-4 border-amber-500/80 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/10 group">
                <div className="absolute inset-1 rounded-full border border-dashed border-amber-400/40 pointer-events-none" />
                
                {/* PingME Brand Badge */}
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1">
                  <ShieldCheck size={12} /> PingME LifeMesh
                </div>

                {/* Scannable QR Code */}
                <div className="bg-white p-2 rounded-xl shadow-md border-2 border-slate-900">
                  <img
                    src={qrImageUrl}
                    alt="PingME QR"
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[11px] font-black tracking-wider text-white uppercase block">
                    {vehicleTag.helmetTagId}
                  </span>
                  <span className="text-[9px] text-amber-400/90 font-medium">
                    SCAN FOR EMERGENCY & FIRST AID
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-80 h-48 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 flex items-center justify-between shadow-2xl shadow-amber-500/10">
                <div className="flex-1 pr-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
                      <ShieldCheck size={14} /> PingME Care Tag
                    </div>
                    <div className="text-base font-black text-white mt-1">
                      {vehicleTag.regNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {vehicleTag.vehicleModel}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 leading-tight">
                    Sec. 134A Motor Vehicles Act Protected.<br />
                    Linked with Ayushman Bharat (ABHA).
                  </div>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-md border-2 border-slate-900 shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="PingME QR"
                    className="w-28 h-28 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Quick Testing Trigger Buttons */}
            <div className="w-full mt-6 space-y-2">
              <button
                onClick={() => navigate(`/emergency/${vehicleTag.tagId}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Eye size={15} /> Open Bystander Emergency HUD
              </button>

              <button
                onClick={handleSimulateNfc}
                disabled={nfcSimulated}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Radio size={14} className={nfcSimulated ? 'animate-ping text-amber-400' : 'text-slate-400'} />
                {nfcSimulated ? 'NFC Handshake Connected! Opening HUD...' : 'Simulate 1-Tap Smartphone NFC Tap'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              Judges can point any smartphone camera at this screen to open the live roadside Bystander HUD.
            </p>
          </div>
        </div>

        {/* Right Column: Family Travelers Management (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Vehicle Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Bike className="text-amber-400" size={20} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Registered Vehicle Profile
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 px-2.5 py-1 rounded-md border border-slate-700">
                {vehicleTag.tagId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Registration Number</span>
                <span className="font-bold text-white font-mono">{vehicleTag.regNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Vehicle Model</span>
                <span className="font-semibold text-slate-300">{vehicleTag.vehicleModel}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Primary Rider</span>
                <span className="font-semibold text-slate-300">{vehicleTag.registeredOwner}</span>
              </div>
            </div>
          </div>

          {/* Registered Co-Travelers List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={16} className="text-amber-400" />
                  Family Co-Travelers with Photographs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Photographs allow accident bystanders & first responders to visually confirm the injured rider.
                </p>
              </div>

              <button
                onClick={() => setShowAddMember(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Co-Traveler
              </button>
            </div>

            {/* Members Cards Grid */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {vehicleTag.members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-4"
                >
                  {/* Photo */}
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-800 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {member.relationship}
                        </span>
                      </div>
                      <span className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                        {member.bloodGroup}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Age: {member.age} ({member.gender})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">ABHA: {member.abhaId}</span>
                    </div>

                    {/* Medical Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {member.criticalAllergies.map((all, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-red-950/60 text-red-300 border border-red-800/50 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <AlertTriangle size={10} /> {all}
                        </span>
                      ))}

                      {member.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-4">
                    Register New Family Co-Traveler
                  </h3>

                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="e.g. Priya Verma"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Relationship
                        </label>
                        <select
                          value={newMember.relationship}
                          onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        >
                          <option value="Self">Self</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Relative">Relative</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Blood Group
                        </label>
                        <select
                          value={newMember.bloodGroup}
                          onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold text-red-400"
                        >
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Age</label>
                        <input
                          type="number"
                          value={newMember.age}
                          onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Gender</label>
                        <select
                          value={newMember.gender}
                          onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                      >
                        Save Co-Traveler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
