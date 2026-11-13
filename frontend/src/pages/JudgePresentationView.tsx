import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  Ambulance,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Wifi,
  Laptop,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Users,
  Stethoscope,
  HeartPulse,
  Radio,
  Clock
} from 'lucide-react';

export default function JudgePresentationView() {
  const navigate = useNavigate();

  // Host configuration presets
  const [selectedHostPreset, setSelectedHostPreset] = useState<'production' | 'lan' | 'local' | 'custom'>('production');
  const [customHost, setCustomHost] = useState('https://venture.brijbhushan.cv');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active base domain computation
  const getActiveBaseUrl = () => {
    if (selectedHostPreset === 'production') return 'https://venture.brijbhushan.cv';
    if (selectedHostPreset === 'lan') return 'http://10.56.196.30:5173';
    if (selectedHostPreset === 'local') return 'http://localhost:5173';
    return customHost.trim().replace(/\/+$/, '');
  };

  const baseUrl = getActiveBaseUrl();

  // 3 Primary Presentation QR Configurations
  const qrCards = [
    {
      id: 'qr-crash-tag',
      number: '1',
      badge: 'ROADSIDE CRASH TAG',
      title: 'Helmet & Motorbike Crash Tag',
      subtitle: 'Zero-Knowledge Bystander Scan & Paramedic Portal',
      targetPath: '/emergency/PING-HLM-882',
      tagId: 'PING-HLM-882',
      scenario: 'Crash on National Highway 21 (Rohan Verma - HR-26-DK-9021)',
      accentColor: 'red',
      icon: Ambulance,
      whatJudgesSee: [
        'Sec. 134A Good Samaritan Legal Protection shield',
        'Multi-Passenger selector (Owner, Spouse, Child, Guest rider)',
        'One-touch GPS emergency beacon broadcast to 108 Emergency Hub',
        'Paramedic Ingress gate (Passcode: 108) to unlock vitals & stream wound photos'
      ],
      pitchTip: 'Ask the judge to scan this, tap "Paramedic Access", enter passcode 108, and transmit live vitals to the doctor!'
    },
    {
      id: 'qr-hospital-checkin',
      number: '2',
      badge: 'HOSPITAL ENTRANCE KIOSK',
      title: 'Fast-Track OPD Gateway Entry',
      subtitle: 'ABHA 10-Second Digital Token & Triage Dispatch',
      targetPath: '/hospital/checkin',
      tagId: 'HOSP-GATEWAY-OPD',
      scenario: 'PGIMER Apex Trauma & Outpatient Center Gate 1',
      accentColor: 'teal',
      icon: Building2,
      whatJudgesSee: [
        'Selects registered patient/family member in 1 tap',
        'Chooses department: General Medicine, Cardiology, Orthopedics',
        'Generates verified digital token (OPD-105) instantly',
        'Triggers LIVE WebSocket push directly to Doctor OPD Queue in real-time!'
      ],
      pitchTip: 'Have the judge check in on their phone while watching the Doctor Dashboard on your laptop screen — it updates in real time without refreshing!'
    },
    {
      id: 'qr-fleet-decal',
      number: '3',
      badge: 'FLEET & CAR WINDSHIELD',
      title: 'Vehicle Fleet Windshield Decal',
      subtitle: 'Multi-Passenger Identity & Commercial Transport',
      targetPath: '/emergency/PING-WND-404',
      tagId: 'PING-WND-404',
      scenario: 'Commercial Cab / Family Car (DL-01-AB-1234)',
      accentColor: 'blue',
      icon: Users,
      whatJudgesSee: [
        'Renders registered frequent co-passengers registry',
        'Bystander selects exactly which person is injured inside the vehicle',
        'Eliminates phantom calls by notifying only the victim\'s specific next-of-kin',
        'Links directly into 108 triage workflow with pre-authenticated clinical records'
      ],
      pitchTip: 'Highlights our anti-prank and co-passenger architecture: solving the critical flaw of traditional medical tags.'
    }
  ];

  const handleCopy = (fullUrl: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(fullUrl);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 print:bg-white print:p-0">
      
      {/* Top Presentation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <QrCode size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">PingME LifeMesh</h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
                  Judge Presentation Hub
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live interactive scannable QR tags for hackathon judging & real mobile device testing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <button
              onClick={() => navigate('/doctor')}
              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Stethoscope size={14} /> Open Doctor Dashboard
            </button>
            <button
              onClick={() => navigate('/studio')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <QrCode size={14} /> Tag Studio
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Print Presentation Cards"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Toggle Fullscreen Projector Mode"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* Presentation Host Selector Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={13} className="text-teal-600" /> Broadcast Target URL Switcher
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Switch where the judge's phone camera will open when scanning the QR codes.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Host: <span className="underline">{baseUrl}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => setSelectedHostPreset('production')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedHostPreset === 'production'
                  ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Globe size={13} className="text-teal-600" /> Production Domain
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Default
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                https://venture.brijbhushan.cv
              </div>
            </button>

            <button
              onClick={() => setSelectedHostPreset('lan')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedHostPreset === 'lan'
                  ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Wifi size={13} className="text-blue-600" /> Wi-Fi LAN IP
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Hotspot
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                http://10.56.196.30:5173
              </div>
            </button>

            <button
              onClick={() => setSelectedHostPreset('local')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedHostPreset === 'local'
                  ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Laptop size={13} className="text-slate-600" /> Localhost
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  Local Dev
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                http://localhost:5173
              </div>
            </button>

            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-center ${
                selectedHostPreset === 'custom'
                  ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Custom IP / Tunnel</span>
                <input
                  type="radio"
                  name="host"
                  checked={selectedHostPreset === 'custom'}
                  onChange={() => setSelectedHostPreset('custom')}
                  className="cursor-pointer"
                />
              </label>
              <input
                type="text"
                value={customHost}
                onFocus={() => setSelectedHostPreset('custom')}
                onChange={(e) => setCustomHost(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner for Presentation */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:bg-white print:text-slate-900 print:border print:border-slate-300 print:p-4">
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black tracking-wider uppercase">
              <Sparkles size={13} /> Live Interactive Judge Screening Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-slate-900">
              3 Scannable QR Tags for Live Judge Evaluation
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed print:text-slate-600">
              Point any mobile phone camera at the QR codes below to experience the real-time zero-knowledge emergency triage, bystander Good Samaritan HUD, and outpatient fast-track system.
            </p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
            <QrCode size={220} />
          </div>
        </div>

        {/* 3 Main Scannable QR Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qrCards.map((card) => {
            const Icon = card.icon;
            const fullUrl = `${baseUrl}${card.targetPath}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(fullUrl)}&color=0F172A&bgcolor=FFFFFF`;

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                      QR CODE {card.number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      card.accentColor === 'red'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : card.accentColor === 'teal'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Icon size={18} className={
                      card.accentColor === 'red' ? 'text-red-600' : card.accentColor === 'teal' ? 'text-teal-600' : 'text-blue-600'
                    } />
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {card.subtitle}
                  </p>
                </div>

                {/* Scannable High-Contrast QR Code */}
                <div className="p-6 flex flex-col items-center justify-center bg-white">
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md relative group/qr">
                    <img
                      src={qrImageUrl}
                      alt={card.title}
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover/qr:bg-slate-950/5 transition-colors rounded-xl pointer-events-none" />
                  </div>
                  
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      <QrCode size={12} className="text-slate-500" /> Scan with mobile phone camera
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-xs">
                      Tag ID: {card.tagId}
                    </div>
                  </div>
                </div>

                {/* Features & What Judge Will Experience */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Live Verification Flow:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {card.whatJudgesSee.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                    <span className="font-extrabold uppercase block text-[10px] text-amber-800 tracking-wider">
                      💡 Presenter Tip:
                    </span>
                    {card.pitchTip}
                  </div>

                  {/* Actions: Open in Tab & Copy Link */}
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs text-center"
                    >
                      <span>Open Link</span> <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleCopy(fullUrl)}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      title="Copy URL"
                    >
                      {copiedUrl === fullUrl ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* 4-Step Interactive Pitch Walkthrough for Presenter */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-teal-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              3-Minute Live Hackathon Pitch Script (Step-by-Step)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                STAGE 1
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">Open Doctor Screen</h4>
              <p className="text-slate-600 leading-relaxed">
                Keep the Doctor Command Center (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/doctor</code>) visible on your laptop screen. Point out that the queue is predominantly calm, routine OPD patients (green badges).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                STAGE 2
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">Judge Scans Hospital Entry</h4>
              <p className="text-slate-600 leading-relaxed">
                Hand QR 2 to the judge. Have them check in as "Kavita Verma" for General Medicine. In less than 500ms, watch a new patient token appear live on your doctor screen via WebSocket!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800">
                STAGE 3
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">Judge Scans Crash Tag</h4>
              <p className="text-slate-600 leading-relaxed">
                Have another judge scan QR 1. Show the Good Samaritan legal protection, co-passenger selection, and Paramedic Ingress (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">passcode: 108</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                STAGE 4
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">Live Resuscitation Alert</h4>
              <p className="text-slate-600 leading-relaxed">
                As the paramedic submits trauma vitals and wound photo, the doctor dashboard automatically sounds a high-acuity casualty alert and pre-primes the resuscitation bay before the ambulance arrives.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
