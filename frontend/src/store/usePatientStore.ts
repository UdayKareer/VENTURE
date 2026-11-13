import { create } from 'zustand';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { type EsiTriageResult } from '../services/clinicalAiService';
import { type DashavidhaData, type AshtaSthanaData } from '../data/clinicalProtocols';
import { offlineSyncService } from '../services/offlineSyncService';
import { type SupportedLanguage } from '../data/regionalTranslations';
import { 
  DEMO_PRESET_PATIENTS, 
  getFourActiveDemoPatients,
  PINGME_DEFAULT_VEHICLE,
  type VehicleTagProfile,
  type FamilyMemberProfile,
  type AmbulanceTelemetry
} from '../data/demoPresets';

export type { SupportedLanguage, VehicleTagProfile, FamilyMemberProfile, AmbulanceTelemetry };

// Dynamic socket URL detection for local dev & Wi-Fi LAN access on phone
const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export const socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  timeout: 5000
});

export interface PatientProfile {
  abhaId: string;
  abhaVerified?: boolean;
  name: string;
  age: string;
  gender: string;
  phone: string;
  height: string;
  weight: string;
  chronicConditions: ChronicConditionItem[];
  allergies: AllergyItem[];
  uploadedDocuments: UploadedDocument[];
  pastVisits: {
    date: string;
    hospital: string;
    department: string;
    reason: string; // What the patient mentioned
    diagnosis?: string; // What happened / Doctor's diagnosis
    prescriptions?: string[]; // Prescribed medications
    patientVisibleNotes?: string; // Instructions for patient
    doctorNotesHidden: string;
  }[];
}

export interface DocumentLabResult {
  test: string;
  value: string;
  unit: string;
  range: string;
  isOutOfRange: boolean;
}

export interface DocumentMedication {
  name: string;
  dose: string;
  frequency: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'ECG / Radiology' | 'Bedside Scan';
  date: string;
  timestamp?: number;
  uploadedBy?: 'doctor' | 'patient' | 'system';
  extractedDiagnoses: string[];
  extractedMeds: DocumentMedication[];
  extractedLabs: DocumentLabResult[];
  fileUrl?: string;
  isHandwritten?: boolean;
  ocrStatus?: 'complete' | 'bypassed_to_doctor' | 'partial';
  notes?: string;
}

export interface ChronicConditionItem {
  condition: string;
  duration: string;
  medication: string;
  status: string;
  isDoctorVerified?: boolean;
}

export interface AllergyItem {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  isDoctorVerified?: boolean;
}

export interface StructuredSummary {
  chiefComplaintSummary: string;
  hpi: string;
  pastHistory: string;
  medicationsSummary: string;
  allergiesSummary: string;
  rosSummary: string;
  ayushSummary?: string;
  redFlagsSummary: string[];
  documentHighlights: string[];
  suggestedWorkup: string[];
}

export interface PatientData {
  patientId: string;
  token: string;
  abhaId: string;
  abhaVerified: boolean;
  name: string;
  age: string;
  gender: string;
  phone: string;
  height: string;
  weight: string;
  language: SupportedLanguage;
  mode: 'modern' | 'ayush';
  
  // Step 1: Chief Complaint & Symptom Exploration (SOCRATES)
  chiefComplaint: string;
  chiefComplaintHi: string;
  symptomDuration: string;
  symptomSite: string;
  symptomCharacter: string;
  symptomRadiation: string;
  symptomTiming: string; // SOCRATES 'T' - Time course / diurnal timing pattern
  symptomSeverity: number; // 1-10
  aggravatingFactors: string;
  relievingFactors: string;
  associatedSymptoms: string[];

  // AYUSH & Integrative Medicine Frameworks (Dashavidha 10-Fold & Ashta Sthana 8-Point)
  prakriti: string;
  agni: string; // Digestive Fire
  koshtha: string; // Bowel Nature
  aharaVihara: string; // Diet & Lifestyle
  nidra: string; // Sleep quality
  ayushResponses?: { qId: string; answer: string; dosha: string }[];
  dashavidha?: Partial<DashavidhaData>;
  ashtaSthana?: Partial<AshtaSthanaData>;

  // Chronic & Allergies
  chronicConditions: ChronicConditionItem[];
  allergies: AllergyItem[];
  reviewOfSystems: string[];

  // Triage & Safety
  triageLevel: 'normal' | 'priority' | 'emergency';
  redFlags: string[];
  esiTriage?: EsiTriageResult;
  adaptiveAnswers?: Record<string, string>;

  // Scanned Documents & OCR
  uploadedDocuments: UploadedDocument[];

  // Doctor & Consent
  consentHistory: boolean;
  consentDocuments: boolean;
  consentAyush: boolean;
  enableIntegrativeExam?: boolean;
  structuredSummary: StructuredSummary;
  doctorNotes: string;
  prescriptions?: any[];
  primaryDiagnosis?: string;
  namasteCode?: string;
  status: 'waiting' | 'in_consultation' | 'accepted' | 'amended' | 'rejected' | 'admitted';
  createdAt: string;
  createdTimestamp?: number;

  // In-Patient Department (IPD) / Admission Tracking
  admittedWard?: string;
  bedNumber?: string;
  admissionDate?: string;
  ipdStage?: 'Observation' | 'Acute Care' | 'Stabilizing' | 'Ready for Discharge';
  ipdProgressNotes?: IpdProgressNote[];
  ipdMedications?: IpdMedication[];
  ipdVitals?: {
    spO2?: string;
    pulse?: string;
    bp?: string;
    temp?: string;
    respiratoryRate?: string;
  };

  // Hospital & Doctor Check-in Details
  hospitalCode?: string;
  hospitalName?: string;
  doctorNumber?: string;
  assignedDept?: string;
  assignedRoom?: string;
  queuePosition?: number;
}

export interface IpdProgressNote {
  id: string;
  timestamp: string;
  doctorName: string;
  note: string;
  vitalsSummary?: string;
}

export interface IpdMedication {
  id: string;
  name: string;
  dose: string;
  route: 'IV' | 'Oral' | 'SubQ' | 'Nebulization';
  schedule: string;
  lastGiven?: string;
  status: 'Active' | 'Held' | 'Completed';
}

interface PatientStore {
  currentPatient: PatientData;
  currentProfile: PatientProfile | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  updatePatient: (data: Partial<PatientData>) => void;
  updateProfile: (data: Partial<PatientProfile>) => void;
  checkProfileExists: (id: string) => boolean;
  loginProfile: (id: string, regData?: { name: string; age: string; gender: string }) => void;
  logoutProfile: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setMode: (mode: 'modern' | 'ayush') => void;
  addDocument: (doc: UploadedDocument) => void;
  addDocumentToPatient: (patientToken: string, doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  generatePatientToken: () => string;
  evaluateTriageAndSummary: () => void;
  saveToDatabase: () => void;
  resetPatient: () => void;
  resetDemoSession: () => void;
  loadPatient: (token: string) => PatientData | null;
  queueTrigger: number;
  triggerQueueUpdate: () => void;
  clearQueue: () => Promise<void>;
  initSocket: () => void;
  updatePatientIntegrativeExam: (patientToken: string, dashavidha: Partial<DashavidhaData>, ashtaSthana: Partial<AshtaSthanaData>) => void;
  populateDemoPatients: () => void;
  clearActiveQueueToRelieved: () => void;
  injectCustomPatient: (patient: PatientData) => void;

  // PingME Care / LifeMesh additions
  vehicleTag: VehicleTagProfile;
  updateVehicleProfile: (data: Partial<VehicleTagProfile>) => void;
  incomingAmbulance: AmbulanceTelemetry | null;
  setIncomingAmbulance: (telemetry: AmbulanceTelemetry | null) => void;
  antiPrankVerification: { tagId: string; status: 'idle' | 'verifying' | 'safe' | 'confirmed'; timestamp?: number };
  triggerEmergencySos: (tagId: string, selectedVictim?: FamilyMemberProfile | null, isGuestRider?: boolean) => void;
  dispatchAmbulanceTelemetry: (telemetry: AmbulanceTelemetry) => void;
  verifyOwnerSafety: (tagId: string, isSafe: boolean) => void;
  checkInFamilyMemberAsOPD: (member: FamilyMemberProfile, complaint: string, severity: number) => PatientData;
}

const createInitialPatient = (): PatientData => ({
  patientId: '',
  token: '',
  abhaId: '',
  abhaVerified: false,
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  height: '',
  weight: '',
  language: 'en',
  mode: 'modern',

  chiefComplaint: '',
  chiefComplaintHi: '',
  symptomDuration: '',
  symptomSite: '',
  symptomCharacter: '',
  symptomRadiation: '',
  symptomTiming: '',
  symptomSeverity: 5,
  aggravatingFactors: '',
  relievingFactors: '',
  associatedSymptoms: [],

  prakriti: '',
  agni: '',
  koshtha: '',
  aharaVihara: '',
  nidra: '',
  ayushResponses: [],
  dashavidha: {
    prakriti: '',
    vikriti: '',
    sara: '',
    samhanana: '',
    pramana: '',
    satmya: '',
    sattva: '',
    aharaShakti: '',
    vyayamaShakti: '',
    vaya: ''
  },
  ashtaSthana: {
    nadi: '',
    mutra: '',
    mala: '',
    jihwa: '',
    shabda: '',
    sparsha: '',
    druk: '',
    akruti: ''
  },

  chronicConditions: [],
  allergies: [],
  reviewOfSystems: [],

  triageLevel: 'normal',
  redFlags: [],
  adaptiveAnswers: {},

  uploadedDocuments: [],

  consentHistory: true,
  consentDocuments: true,
  consentAyush: false,

  structuredSummary: {
    chiefComplaintSummary: '',
    hpi: '',
    pastHistory: '',
    medicationsSummary: '',
    allergiesSummary: '',
    rosSummary: '',
    redFlagsSummary: [],
    documentHighlights: [],
    suggestedWorkup: [],
  },

  doctorNotes: '',
  primaryDiagnosis: '',
  namasteCode: '',
  status: 'waiting',
  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  hospitalCode: '',
  hospitalName: '',
  doctorNumber: '',
  assignedDept: '',
  assignedRoom: '',
  queuePosition: 0,
});

// Seed Initial Mock Database with Realistic Clinical Distribution (Routine OPD, Priority, Emergency)
export const mockDatabase: Record<string, PatientData> = {
  'OPD-101': {
    patientId: 'OPD-101',
    token: 'OPD-101',
    abhaId: '14-8821-3094-1102',
    abhaVerified: true,
    name: 'Priya Sen',
    age: '42',
    gender: 'Female',
    phone: '9876543210',
    height: '162',
    weight: '64',
    language: 'en',
    mode: 'modern',
    chiefComplaint: 'Routine 3-Month Follow-Up for Type 2 Diabetes & Routine Lab Review',
    chiefComplaintHi: 'मधुमेह की नियमित 3 महीने की जांच और दवा पर्ची नवीनीकरण',
    symptomDuration: 'Asymptomatic (Routine 3-month cycle)',
    symptomSite: 'Systemic metabolic follow-up',
    symptomCharacter: 'Stable, asymptomatic, good glycemic control',
    symptomRadiation: 'None',
    symptomTiming: 'Routine quarterly review',
    symptomSeverity: 2,
    aggravatingFactors: 'None reported',
    relievingFactors: 'Consistent dietary adherence and morning walking',
    associatedSymptoms: ['Mild occasional fatigue after long office hours'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: 'Balanced home-cooked diet, low glycemic index meals, 45 min daily walk',
    nidra: 'Sound sleep 7 hours nightly',
    dashavidha: {
      prakriti: 'Normal Balanced Stature',
      vikriti: 'None evident (Euglycemic)',
      sara: 'Good physical reserve',
      samhanana: 'Normal compact frame',
      pramana: 'BMI: 24.2 (Normal)',
      satmya: 'Good adaptation to balanced diet',
      sattva: 'High resilience',
      aharaShakti: 'Normal digestion (Samagni)',
      vyayamaShakti: 'Good exercise tolerance',
      vaya: 'Adult phase (42 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Regular (72 bpm, normotensive wave)',
      mutra: 'Normal clear, no polyuria',
      mala: 'Regular bowel habits',
      jihwa: 'Clean, no furring',
      shabda: 'Clear and fluent',
      sparsha: 'Warm and normal',
      druk: 'Clear, fundoscopy normal last year',
      akruti: 'Healthy, composed facies'
    },
    chronicConditions: [
      { condition: 'Type 2 Diabetes Mellitus', duration: '4 years', medication: 'Tab Metformin 500mg BD', status: 'Well-controlled (HbA1c 6.8%)', isDoctorVerified: true }
    ],
    allergies: [],
    reviewOfSystems: ['No polyuria or polydipsia', 'No paresthesias or foot numbness', 'No chest discomfort or exertional dyspnea'],
    triageLevel: 'normal',
    redFlags: [],
    adaptiveAnswers: {},
    esiTriage: {
      level: 5,
      category: 'Non-Urgent',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-500/30',
      rationale: 'Asymptomatic quarterly follow-up with stable glycemic control and normal home monitoring. Zero emergency indicators.',
      immediateActions: [
        'Routine physician physical examination',
        'Review recent fasting blood glucose (112 mg/dL)',
        'Renew 90-day maintenance prescription for Metformin 500mg'
      ],
      predictedResources: ['Physician Consultation', 'Prescription Renewal'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [
      {
        id: 'doc-sen-1',
        name: 'Metropolis_FastingGlucose_HbA1c.pdf',
        type: 'Lab Report',
        date: '10 Nov 2026',
        timestamp: Date.now() - 86400000 * 3,
        uploadedBy: 'patient',
        isHandwritten: false,
        ocrStatus: 'complete',
        extractedDiagnoses: ['Well-controlled Glycemia'],
        extractedMeds: [],
        extractedLabs: [
          { test: 'Fasting Blood Glucose', value: '112', unit: 'mg/dL', range: '70 - 100', isOutOfRange: true },
          { test: 'HbA1c', value: '6.8', unit: '%', range: '4.0 - 5.6', isOutOfRange: true },
          { test: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6 - 1.1', isOutOfRange: false }
        ],
        notes: 'Printed automated biochemical report from Metropolis Healthcare.'
      }
    ],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '42-year-old female with well-controlled Type 2 Diabetes presenting for routine 3-month outpatient review and prescription refill.',
      hpi: 'Patient reports feeling well with zero episodes of hypoglycemia, nocturia, or polyuria. Regular morning walks and home glucose logs average 110-125 mg/dL.',
      pastHistory: 'Type 2 Diabetes diagnosed 4 years ago. No diabetic retinopathy or microalbuminuria.',
      medicationsSummary: 'Metformin 500mg BD post meals.',
      allergiesSummary: 'No known drug or environmental allergies.',
      rosSummary: 'Zero cardiovascular, neurological, or renal complaints.',
      redFlagsSummary: [],
      documentHighlights: ['Recent HbA1c 6.8% (Target < 7.0% achieved)', 'Serum creatinine normal at 0.9 mg/dL'],
      suggestedWorkup: ['Annual lipid panel in 6 months', 'Continue current oral antidiabetic regimen']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:00 AM'
  },
  'OPD-102': {
    patientId: 'OPD-102',
    token: 'OPD-102',
    abhaId: '32-1094-5582-9901',
    abhaVerified: true,
    name: 'Rohan Gupta',
    age: '28',
    gender: 'Male',
    phone: '9812345678',
    height: '178',
    weight: '72',
    language: 'en',
    mode: 'modern',
    chiefComplaint: 'Mild Seasonal Throat Irritation and Dry Cough for 2 Days',
    chiefComplaintHi: '2 दिनों से गले में हल्की खराश और सूखी खांसी',
    symptomDuration: '2 days',
    symptomSite: 'Pharynx and upper trachea',
    symptomCharacter: 'Scratchy throat irritation, non-productive cough',
    symptomRadiation: 'None',
    symptomTiming: 'Worse early morning and with cold beverages',
    symptomSeverity: 3,
    aggravatingFactors: 'Cold liquids, air conditioning',
    relievingFactors: 'Warm tea, warm water sips',
    associatedSymptoms: ['Mild nasal congestion', 'No fever', 'No shortness of breath'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: 'Routine office routine, adequate fluid intake',
    nidra: 'Normal 7 hours',
    dashavidha: {
      prakriti: 'Normal Healthy Young Adult',
      vikriti: 'Mild upper airway irritation',
      sara: 'Excellent reserve',
      samhanana: 'Athletic lean build',
      pramana: 'Normal BMI (22.7)',
      satmya: 'Good adaptation',
      sattva: 'High resilience',
      aharaShakti: 'Normal digestion',
      vyayamaShakti: 'Regular gym workouts',
      vaya: 'Young adult (28 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Regular (74 bpm, regular rhythm)',
      mutra: 'Normal hydration',
      mala: 'Regular',
      jihwa: 'Clean, mild posterior pharyngeal erythema',
      shabda: 'Normal phonation, no hoarseness',
      sparsha: 'Afebrile (98.4°F)',
      druk: 'Clear sclera',
      akruti: 'Comfortable, non-toxic'
    },
    chronicConditions: [],
    allergies: [],
    reviewOfSystems: ['Afebrile, Temp 98.4°F', 'SpO2 99% on ambient room air', 'No stridor or wheeze on auscultation'],
    triageLevel: 'normal',
    redFlags: [],
    adaptiveAnswers: {},
    esiTriage: {
      level: 5,
      category: 'Non-Urgent',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-500/30',
      rationale: 'Mild upper respiratory mucosal irritation without fever, stridor, or respiratory distress. Hemodynamically stable.',
      immediateActions: [
        'Oropharyngeal inspection (mild erythema, no tonsillar exudates)',
        'Advise warm saline gargles & adequate oral hydration',
        'Prescribe symptomatic antitussive / lozenges if cough disrupts work'
      ],
      predictedResources: ['Outpatient Examination', 'Symptomatic Relief'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '28-year-old male presenting with 2 days of mild pharyngeal scratchiness and dry cough following AC exposure.',
      hpi: 'Patient developed mild throat irritation 48 hours ago. No fever, chills, hemoptysis, or dyspnea. Vital signs completely normal.',
      pastHistory: 'No prior medical or surgical history.',
      medicationsSummary: 'None.',
      allergiesSummary: 'No known drug allergies.',
      rosSummary: 'Vital signs stable: BP 118/76, HR 74, SpO2 99%.',
      redFlagsSummary: [],
      documentHighlights: [],
      suggestedWorkup: ['Conservative symptomatic management', 'Warm saline gargles']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:15 AM'
  },
  'OPD-103': {
    patientId: 'OPD-103',
    token: 'OPD-103',
    abhaId: '55-4920-1123-4488',
    abhaVerified: true,
    name: 'Meenakshi Sundaram',
    age: '61',
    gender: 'Female',
    phone: '9744221100',
    height: '155',
    weight: '68',
    language: 'en',
    mode: 'modern',
    chiefComplaint: 'Bilateral Knee Joint Stiffness after Prolonged Sitting & Exercise Guidance',
    chiefComplaintHi: 'बैठने के बाद दोनों घुटनों में अकड़न और दर्द, व्यायाम सलाह',
    symptomDuration: '6 months gradual onset',
    symptomSite: 'Bilateral knee joints (medial compartment)',
    symptomCharacter: 'Dull ache and stiffness lasting 10-15 minutes after rising',
    symptomRadiation: 'None',
    symptomTiming: 'Worst on waking and after prolonged chair sitting',
    symptomSeverity: 3,
    aggravatingFactors: 'Stairs climbing, squatting',
    relievingFactors: 'Gentle walking, warm compression',
    associatedSymptoms: ['Mild joint crepitus', 'No joint effusion', 'No redness or warmth'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: 'Vegetarian diet, sedentary lifestyle, limited walking',
    nidra: '6 hours nightly',
    dashavidha: {
      prakriti: 'Mature Adult Stature',
      vikriti: 'Mild degenerative osteoarticular change',
      sara: 'Moderate reserve',
      samhanana: 'Moderate bone frame',
      pramana: 'BMI: 28.3 (Overweight)',
      satmya: 'Moderate',
      sattva: 'Cooperative',
      aharaShakti: 'Normal digestion',
      vyayamaShakti: 'Reduced due to knee stiffness',
      vaya: 'Elder adult (61 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Regular (70 bpm, calm)',
      mutra: 'Normal',
      mala: 'Normal',
      jihwa: 'Clean',
      shabda: 'Clear',
      sparsha: 'Knees cool, no joint effusion',
      druk: 'Normal',
      akruti: 'Ambulant without cane'
    },
    chronicConditions: [
      { condition: 'Primary Bilateral Knee Osteoarthritis (Grade 1-2)', duration: '1 year', medication: 'Calcium 500mg + Vitamin D3 OD', status: 'Stable', isDoctorVerified: true }
    ],
    allergies: [],
    reviewOfSystems: ['No hot swollen joints', 'Morning stiffness < 20 mins (non-inflammatory)', 'Normal gait on flat floor'],
    triageLevel: 'normal',
    redFlags: [],
    adaptiveAnswers: {},
    esiTriage: {
      level: 4,
      category: 'Non-Urgent',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-500/30',
      rationale: 'Mild degenerative osteoarthritis symptoms with normal joint alignment and preserved mobility. No hot swelling or effusion.',
      immediateActions: [
        'Range of motion examination of bilateral knee joints',
        'Demonstrate quadriceps isometric strengthening exercises',
        'Prescribe topical NSAID gel for flare-ups'
      ],
      predictedResources: ['Orthopedic Exam', 'Physiotherapy Referral'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '61-year-old female presenting with 6 months of intermittent bilateral knee stiffness post-rest.',
      hpi: 'Patient reports stiffness lasting 10-15 minutes after getting up from couch. No locking, giving way, or nighttime pain.',
      pastHistory: 'Early osteoarthritis diagnosed 1 year ago. Vitals stable: BP 130/82, HR 70.',
      medicationsSummary: 'Calcium carbonate 500mg + Vit D3 daily.',
      allergiesSummary: 'None known.',
      rosSummary: 'Zero red-flag inflammatory signs.',
      redFlagsSummary: [],
      documentHighlights: [],
      suggestedWorkup: ['Low-impact quadriceps physiotherapy', 'Weight management counseling']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:30 AM'
  },
  'OPD-104': {
    patientId: 'OPD-104',
    token: 'OPD-104',
    abhaId: '78-3312-9904-2231',
    abhaVerified: true,
    name: 'Gurpreet Singh',
    age: '54',
    gender: 'Male',
    phone: '9988776655',
    height: '172',
    weight: '78',
    language: 'en',
    mode: 'modern',
    chiefComplaint: 'Essential Hypertension Monthly Blood Pressure Check & Drug Refill',
    chiefComplaintHi: 'हाई ब्लड प्रेशर की मासिक जांच और दवा पर्ची नवीनीकरण',
    symptomDuration: 'Asymptomatic routine check',
    symptomSite: 'Systemic cardiovascular follow-up',
    symptomCharacter: 'Asymptomatic, compliant with daily Amlodipine',
    symptomRadiation: 'None',
    symptomTiming: 'Monthly refill cycle',
    symptomSeverity: 1,
    aggravatingFactors: 'High dietary salt',
    relievingFactors: 'Regular medication adherence',
    associatedSymptoms: ['No headache', 'No dizziness', 'No visual disturbances'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: 'Reduced sodium diet, home-cooked meals',
    nidra: 'Good 7.5 hours',
    dashavidha: {
      prakriti: 'Balanced Middle-Aged Adult',
      vikriti: 'None evident (Controlled HTN)',
      sara: 'Normal reserve',
      samhanana: 'Broad chest frame',
      pramana: 'BMI: 26.3',
      satmya: 'Good adaptation',
      sattva: 'Calm',
      aharaShakti: 'Normal digestion',
      vyayamaShakti: 'Brisk evening walk 30 mins',
      vaya: 'Mature adult (54 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Regular (72 bpm, regular rate and volume)',
      mutra: 'Normal',
      mala: 'Normal',
      jihwa: 'Clean',
      shabda: 'Normal',
      sparsha: 'Normal warmth',
      druk: 'Fundus examination normal last visit',
      akruti: 'Composed, non-distressed'
    },
    chronicConditions: [
      { condition: 'Primary Essential Hypertension', duration: '3 years', medication: 'Tab Amlodipine 5mg OD (Morning)', status: 'Well-controlled (Clinic BP 126/82)', isDoctorVerified: true }
    ],
    allergies: [],
    reviewOfSystems: ['Clinic BP: 126/82 mmHg', 'Heart Rate: 72 bpm regular', 'Zero end-organ or neurological complaints'],
    triageLevel: 'normal',
    redFlags: [],
    adaptiveAnswers: {},
    esiTriage: {
      level: 5,
      category: 'Non-Urgent',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-500/30',
      rationale: 'Asymptomatic hypertensive review. Clinic BP 126/82 mmHg, HR 72 bpm regular. Zero end-organ symptoms.',
      immediateActions: [
        'Record clinic sitting blood pressure (126/82 mmHg)',
        'Check adherence to low-sodium dietary advice',
        'Renew 30-day supply of Tab Amlodipine 5mg OD'
      ],
      predictedResources: ['Blood Pressure Reading', 'Maintenance Refill'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '54-year-old male with controlled Essential Hypertension presenting for monthly checkup and medication refill.',
      hpi: 'Patient reports 100% adherence to Tab Amlodipine 5mg every morning. Home BP logs average 122/80 to 128/84. Zero headaches or palpitations.',
      pastHistory: 'Essential HTN since 2023. ECG normal.',
      medicationsSummary: 'Amlodipine 5mg OD.',
      allergiesSummary: 'None known.',
      rosSummary: 'Vital signs optimal: BP 126/82, HR 72, SpO2 99%.',
      redFlagsSummary: [],
      documentHighlights: [],
      suggestedWorkup: ['Continue current dosing', 'Annual renal function test due next quarter']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:45 AM'
  },
  'GEN-108': {
    patientId: 'GEN-108',
    token: 'GEN-108',
    abhaId: '22-8190-4491-1002',
    abhaVerified: true,
    name: 'Aarav Patel',
    age: '29',
    gender: 'Male',
    phone: '9765432100',
    height: '175',
    weight: '70',
    language: 'en',
    mode: 'modern',
    chiefComplaint: 'Productive cough, low-grade evening fever and wheezing for 5 days',
    chiefComplaintHi: '5 दिनों से खांसी, हल्का बुखार और सांस में घरघराहट',
    symptomDuration: '5 days',
    symptomSite: 'Chest / Upper respiratory tract',
    symptomCharacter: 'Productive cough with yellowish phlegm, chest tightness',
    symptomRadiation: 'None',
    symptomTiming: 'Cough worse at night and early morning; daytime episodes triggered by cold air',
    symptomSeverity: 5,
    aggravatingFactors: 'Cold air exposure, night time, dust',
    relievingFactors: 'Steam inhalation, warm fluids',
    associatedSymptoms: ['Wheezing on exhalation', 'Nasal congestion', 'Mild fatigue'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: '',
    nidra: '',
    dashavidha: {
      prakriti: 'Asthmatic Phenotype',
      vikriti: 'Bronchial spasm and mild infection',
      sara: 'Normal',
      samhanana: 'Average',
      pramana: 'Normal',
      satmya: 'Atopic to dust/pollen',
      sattva: 'Cooperative',
      aharaShakti: 'Normal',
      vyayamaShakti: 'Diminished during flare',
      vaya: 'Young adult (29 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Slightly rapid (86 bpm)',
      mutra: 'Normal',
      mala: 'Normal',
      jihwa: 'Mild coating',
      shabda: 'Expiratory wheeze audible',
      sparsha: 'Temp 99.2°F',
      druk: 'Clear',
      akruti: 'Mild respiratory effort'
    },
    chronicConditions: [
      { condition: 'Bronchial Asthma (Childhood onset)', duration: 'Since age 12', medication: 'Inhaler Budecort 200mcg SOS', status: 'Intermittent' }
    ],
    allergies: [
      { allergen: 'Dust Mites & Pollen', reaction: 'Allergic rhinitis & bronchospasm', severity: 'moderate' }
    ],
    reviewOfSystems: ['No hemoptysis', 'No weight loss', 'No pleuritic pain'],
    triageLevel: 'priority',
    redFlags: [
      'Wheezing exacerbation in known asthmatic patient'
    ],
    adaptiveAnswers: {},
    esiTriage: {
      level: 3,
      category: 'Urgent',
      color: '#eab308',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-500/30',
      rationale: 'Productive cough, low-grade fever, and wheeze in a known asthmatic. Hemodynamically stable but requires diagnostic workup (CBC, PEFR, Chest X-Ray).',
      immediateActions: [
        'Complete Blood Count (CBC) with differential',
        'Peak Expiratory Flow Rate (PEFR)',
        'Symptomatic bronchodilator therapy'
      ],
      predictedResources: ['Complete Blood Count', 'Peak Flow Meter', 'Inhaler Prescription'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '29-year-old male asthmatic presenting with 5-day acute lower respiratory infection and wheeze.',
      hpi: 'Patient developed productive cough with yellowish sputum, low-grade fevers, and nocturnal wheezing. Relies on SOS Budesonide inhaler.',
      pastHistory: 'Childhood bronchial asthma with atopic history.',
      medicationsSummary: 'Budecort 200mcg PRN.',
      allergiesSummary: 'Environmental dust/pollen atopy.',
      rosSummary: 'SpO2 96% on room air, RR 20/min.',
      redFlagsSummary: ['Expiratory wheeze requiring PEFR evaluation'],
      documentHighlights: [],
      suggestedWorkup: ['PEFR pre- and post-bronchodilator', 'CBC for eosinophilia']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:40 AM'
  },
  'EMG-911': {
    patientId: 'EMG-911',
    token: 'EMG-911',
    abhaId: '88-3921-9941-0021',
    abhaVerified: true,
    name: 'Ramesh Kumar Sharma',
    age: '58',
    gender: 'Male',
    phone: '9811223344',
    height: '168',
    weight: '76',
    language: 'hi',
    mode: 'modern',
    chiefComplaint: 'Acute retrosternal chest pain with diaphoresis and breathlessness',
    chiefComplaintHi: 'सीने में तेज दबाव, पसीना और सांस लेने में कठिनाई',
    symptomDuration: 'Started 45 minutes ago',
    symptomSite: 'Center of chest radiating to left arm and jaw',
    symptomCharacter: 'Crushing elephant-on-chest pressure',
    symptomRadiation: 'Left shoulder, inner arm, lower jaw',
    symptomTiming: 'Constant unremitting crushing pressure since 45 minutes',
    symptomSeverity: 9,
    aggravatingFactors: 'Any slight movement or exertion',
    relievingFactors: 'None, persisting at complete rest',
    associatedSymptoms: ['Profuse cold sweating', 'Shortness of breath', 'Nausea / Lightheadedness'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: '',
    nidra: '',
    dashavidha: {
      prakriti: 'Emergency Cardiac Case',
      vikriti: 'Acute coronary syndrome',
      sara: 'Compromised',
      samhanana: 'Average',
      pramana: 'Overweight',
      satmya: 'Compromised',
      sattva: 'High anxiety',
      aharaShakti: 'Suppressed',
      vyayamaShakti: 'Severely impaired',
      vaya: 'Late adult (58 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Tachycardia (104 bpm, weak pulse)',
      mutra: 'Not assessed',
      mala: 'Not assessed',
      jihwa: 'Dry',
      shabda: 'Short gasping sentences',
      sparsha: 'Cold clammy diaphoretic skin',
      druk: 'Anxious pale facies',
      akruti: 'Levine sign positive (clenched fist over sternum)'
    },
    chronicConditions: [
      { condition: 'Type 2 Diabetes Mellitus', duration: '8 years', medication: 'Tab Metformin 1000mg BD', status: 'Sub-optimally controlled' },
      { condition: 'Essential Hypertension', duration: '5 years', medication: 'Tab Telmisartan 40mg OD', status: 'Poor compliance' }
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'Anaphylaxis / Urticaria', severity: 'severe' }
    ],
    reviewOfSystems: ['Dyspnea on mild exertion', 'Occasional orthopnea', 'Bilateral pedal edema'],
    triageLevel: 'emergency',
    redFlags: [
      'CRITICAL: Acute crushing retrosternal chest pain radiating to left arm',
      'CRITICAL: Associated diaphoresis (cold sweats) and acute dyspnea',
      'HIGH RISK: Diaphoretic presentation with known DM-2 and HTN background'
    ],
    adaptiveAnswers: {},
    esiTriage: {
      level: 1,
      category: 'Resuscitation',
      color: '#ef4444',
      badgeBg: 'bg-red-500/10',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-500/30',
      rationale: 'Acute crushing chest pain, cold diaphoresis, dyspnea in a 58yo diabetic male. High probability of STEMI / Acute Coronary Syndrome.',
      immediateActions: [
        'Immediate 12-lead ECG within 10 minutes',
        'Establish dual large-bore IV access and continuous cardiac telemetry',
        'Load Aspirin 325mg chewable + Clopidogrel 300mg immediately',
        'Alert on-call interventional cardiology cath lab team'
      ],
      predictedResources: ['12-Lead ECG', 'High-Sensitivity Troponin I', 'Dual Antiplatelet Loading', 'Urgent Coronary Angiography'],
      algorithmSource: 'clinical-rule-engine'
    },
    uploadedDocuments: [
      {
        id: 'doc-1',
        name: 'MaxLab_Lipid_HbA1c_July2024.pdf',
        type: 'Lab Report',
        date: '14 Jul 2024',
        timestamp: Date.now() - 86400000 * 120,
        uploadedBy: 'patient',
        isHandwritten: false,
        ocrStatus: 'complete',
        extractedDiagnoses: ['Hyperlipidemia', 'Poorly controlled Glycemia'],
        extractedMeds: [],
        extractedLabs: [
          { test: 'HbA1c', value: '9.4', unit: '%', range: '4.0 - 5.6', isOutOfRange: true },
          { test: 'Total Cholesterol', value: '248', unit: 'mg/dL', range: '< 200', isOutOfRange: true },
          { test: 'Serum Creatinine', value: '1.4', unit: 'mg/dL', range: '0.7 - 1.2', isOutOfRange: true }
        ],
        notes: 'Digitally printed diagnostic panel from MaxLab Diagnostics.'
      }
    ],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '58-year-old male with acute crushing chest pain, profuse sweating, and dyspnea since 45 minutes.',
      hpi: 'Started at rest with sudden intense substernal pressure radiating down left arm and jaw. Accompanied by severe diaphoresis and nausea. Known poorly controlled DM-2 and HTN.',
      pastHistory: '8-year history of Type 2 DM (HbA1c 9.4%), 5-year history of Essential Hypertension.',
      medicationsSummary: 'Metformin 1000mg BD, Telmisartan 40mg OD (erratic compliance).',
      allergiesSummary: 'Penicillin (causes severe anaphylaxis).',
      rosSummary: 'Cold clammy diaphoretic skin, tachypneic (RR 24), tachycardic (HR 104), BP 154/98.',
      redFlagsSummary: [
        'Acute crushing substernal chest pain radiating to left arm',
        'Associated diaphoresis and dyspnea',
        'High cardiovascular risk profile'
      ],
      documentHighlights: ['Prior HbA1c 9.4%', 'Total Cholesterol 248 mg/dL', 'Creatinine 1.4 mg/dL'],
      suggestedWorkup: ['Stat 12-lead ECG', 'Troponin I / CK-MB', 'Chest X-Ray portable', 'Stat Cardiology Consult']
    },
    doctorNotes: '',
    status: 'waiting',
    createdAt: '09:15 AM'
  },
  'IPD-304': {
    patientId: 'IPD-304',
    token: 'IPD-304',
    abhaId: '45-2019-3382-7711',
    abhaVerified: true,
    name: 'Sunita Devi Verma',
    age: '44',
    gender: 'Female',
    phone: '9844332211',
    height: '158',
    weight: '62',
    language: 'hi',
    mode: 'modern',
    chiefComplaint: 'Post-acute Bronchial Exacerbation & Pneumonia - Step-down IV Care',
    chiefComplaintHi: 'दमा और फेफड़ों के संक्रमण के बाद भर्ती वार्ड देखभाल',
    symptomDuration: 'Day 3 In-patient',
    symptomSite: 'Chest / Lungs',
    symptomCharacter: 'Resolving cough with thinning sputum, improving dyspnea',
    symptomRadiation: 'None',
    symptomTiming: 'Improving',
    symptomSeverity: 3,
    aggravatingFactors: 'Exertion',
    relievingFactors: 'Supplemental O2, IV antibiotics',
    associatedSymptoms: ['Mild productive cough'],
    prakriti: '',
    agni: '',
    koshtha: '',
    aharaVihara: 'Hospital soft diet',
    nidra: 'Adequate',
    dashavidha: {
      prakriti: 'Inpatient Ward Patient',
      vikriti: 'Resolving lower respiratory infection',
      sara: 'Improving',
      samhanana: 'Average',
      pramana: 'Normal',
      satmya: 'Moderate',
      sattva: 'Good',
      aharaShakti: 'Normal',
      vyayamaShakti: 'Bedside ambulation only',
      vaya: 'Adult (44 Yrs)'
    },
    ashtaSthana: {
      nadi: 'Regular (82 bpm)',
      mutra: 'Normal',
      mala: 'Normal',
      jihwa: 'Clean',
      shabda: 'Clear voice',
      sparsha: 'Afebrile (98.6°F)',
      druk: 'Normal',
      akruti: 'Resting comfortably'
    },
    chronicConditions: [
      { condition: 'Bronchial Asthma', duration: '5 years', medication: 'Inhaler Formoterol + Budesonide', status: 'Under treatment' }
    ],
    allergies: [
      { allergen: 'Sulfa Drugs', reaction: 'Skin rashes', severity: 'moderate' }
    ],
    reviewOfSystems: ['Afebrile for 24h', 'SpO2 96% on ambient air', 'Lungs: Minimal bilateral rhonchi'],
    triageLevel: 'normal',
    redFlags: [],
    adaptiveAnswers: {},
    uploadedDocuments: [],
    consentHistory: true,
    consentDocuments: true,
    consentAyush: false,
    structuredSummary: {
      chiefComplaintSummary: '44yo female admitted for acute asthma exacerbation, now on Day 3 post-stabilization.',
      hpi: 'Admitted from casualty 3 days ago with wheezing and hypoxemia. Significantly improved with IV antibiotics and bronchodilators.',
      pastHistory: 'Known asthmatic.',
      medicationsSummary: 'IV Ceftriaxone, IV Hydrocortisone, Duolin nebulization.',
      allergiesSummary: 'Sulfa antibiotics.',
      rosSummary: 'SpO2 96% room air, vitals stable.',
      redFlagsSummary: [],
      documentHighlights: [],
      suggestedWorkup: ['Step down to oral Prednisolone', 'Discharge planning for Day 4']
    },
    doctorNotes: '',
    status: 'admitted',
    admittedWard: 'Female Medical Ward 3',
    bedNumber: 'Bed 204-B',
    admissionDate: '11 Nov 2026',
    ipdStage: 'Stabilizing',
    createdAt: '08:00 AM',
    ipdVitals: {
      bp: '126/80 mmHg',
      pulse: '82 bpm',
      spO2: '96%',
      temp: '98.6°F',
      respiratoryRate: '18/min'
    },
    ipdMedications: [
      { id: 'm1', name: 'IV Ceftriaxone', dose: '1g in 100ml NS', route: 'IV', schedule: 'BID (08:00 AM / 08:00 PM)', lastGiven: 'Today 08:00 AM (Nurse Sunita)', status: 'Active' },
      { id: 'm2', name: 'IV Hydrocortisone', dose: '100mg Bolus', route: 'IV', schedule: 'TID (06:00 / 14:00 / 22:00)', lastGiven: 'Today 02:00 PM', status: 'Active' },
      { id: 'm3', name: 'Nebulization Duolin', dose: '2.5ml Respule', route: 'Nebulization', schedule: 'Q6H (Every 6 hrs)', lastGiven: 'Today 12:00 PM', status: 'Active' },
      { id: 'm4', name: 'IV Pantoprazole', dose: '40mg', route: 'IV', schedule: 'OD (Morning before food)', lastGiven: 'Today 07:00 AM', status: 'Active' },
      { id: 'm5', name: 'Tab Paracetamol', dose: '650mg Oral', route: 'Oral', schedule: 'SOS (If Temp > 100°F)', lastGiven: 'Yesterday 09:00 PM', status: 'Active' }
    ],
    ipdProgressNotes: [
      { id: 'n1', timestamp: '11 Nov, 05:00 PM (Admission)', doctorName: 'Dr. R. Verma, MD', note: 'Admitted from Casualty with acute exacerbation of severe asthma. Started on supplemental O2, IV steroids, and scheduled nebulizations.', vitalsSummary: 'SpO2: 89% | BP: 142/90 | HR: 104' },
      { id: 'n2', timestamp: '12 Nov, 09:30 AM (Day 2 Rounds)', doctorName: 'Dr. R. Verma, MD', note: 'Dyspnea significantly improved. Wheezing diminished, SpO2 94% on 2L O2. Continued current IV regimen.', vitalsSummary: 'SpO2: 94% | BP: 132/84 | HR: 90' },
      { id: 'n3', timestamp: '13 Nov, 08:45 AM (Day 3 Today)', doctorName: 'Dr. R. Verma, MD', note: 'Patient afebrile for past 24 hours. Cough productive with thinning sputum. SpO2 96% maintaining well on room air. Step down IV Hydrocortisone to oral Prednisolone 30mg tomorrow. Discharge planned if stable.', vitalsSummary: 'SpO2: 96% | BP: 126/80 | HR: 82' }
    ]
  }
};

export const getFreshDemoProfile = (): PatientProfile => ({
  abhaId: '88-3921-9941-0021',
  name: 'Ramesh Kumar Sharma',
  age: '58',
  gender: 'Male',
  phone: '9811223344',
  height: '168',
  weight: '76',
  chronicConditions: [
    { condition: 'Type 2 Diabetes Mellitus', duration: '8 years', medication: 'Tab Metformin 1000mg BD', status: 'Sub-optimally controlled', isDoctorVerified: true },
    { condition: 'Essential Hypertension', duration: '5 years', medication: 'Tab Telmisartan 40mg OD', status: 'Poor compliance', isDoctorVerified: true },
    { condition: 'Mild Joint Pain', duration: '6 months', medication: 'Paracetamol PRN', status: 'Self-reported', isDoctorVerified: false }
  ],
  allergies: [
    { allergen: 'Penicillin', reaction: 'Anaphylaxis / Urticaria', severity: 'severe', isDoctorVerified: true },
    { allergen: 'Sulfa Drugs', reaction: 'Mild skin rash', severity: 'moderate', isDoctorVerified: false }
  ],
  uploadedDocuments: [
    {
      id: 'doc-1',
      name: 'MaxLab_Lipid_HbA1c_July2024.pdf',
      type: 'Lab Report',
      date: '14 Jul 2024',
      timestamp: new Date('2024-07-14T09:30:00').getTime(),
      uploadedBy: 'patient',
      isHandwritten: false,
      ocrStatus: 'complete',
      extractedDiagnoses: ['Hyperlipidemia', 'Poorly controlled Glycemia'],
      extractedMeds: [],
      extractedLabs: [
        { test: 'HbA1c', value: '9.4', unit: '%', range: '4.0 - 5.6', isOutOfRange: true },
        { test: 'Total Cholesterol', value: '248', unit: 'mg/dL', range: '< 200', isOutOfRange: true },
        { test: 'Serum Creatinine', value: '1.4', unit: 'mg/dL', range: '0.7 - 1.2', isOutOfRange: true }
      ],
      notes: 'Digitally printed diagnostic panel from MaxLab Diagnostics.'
    }
  ],
  pastVisits: [
    {
      date: '28 Aug 2024',
      hospital: 'AIIMS New Delhi (Apex)',
      department: 'Cardiology OPD (Room 12)',
      reason: 'Severe exertional breathlessness and recurrent chest tightness.',
      diagnosis: 'Hypertensive crisis secondary to non-compliance',
      prescriptions: ['Tab Telmisartan 40mg OD', 'Tab Amlodipine 5mg OD'],
      patientVisibleNotes: 'Please take your BP medicines regularly. Cut down salt intake to less than 1 tsp per day. Follow up in 1 month with lipid profile.',
      doctorNotesHidden: 'Patient non-compliant with Telmisartan. Re-emphasized diet control. Warned about cardiovascular risks.'
    },
    {
      date: '15 Mar 2024',
      hospital: 'AIIMS New Delhi (Apex)',
      department: 'Endocrinology & Metabolism (Room 14)',
      reason: 'High blood sugar readings at home.',
      diagnosis: 'Uncontrolled Type 2 Diabetes',
      prescriptions: ['Tab Metformin 1000mg BD', 'Tab Glimepiride 1mg OD'],
      patientVisibleNotes: 'Continue strict diabetic diet. Avoid sweets and simple carbs. Start daily 30-minute brisk walk.',
      doctorNotesHidden: 'HbA1c at 9.4%. Added sulfonylurea. Monitor for hypoglycemia.'
    }
  ]
});

export const mockProfiles: Record<string, PatientProfile> = {
  '9876543210': {
    abhaId: '14-8821-3094-1102',
    name: 'Priya Sen',
    age: '42',
    gender: 'Female',
    phone: '9876543210',
    height: '162',
    weight: '64',
    chronicConditions: [
      { condition: 'Type 2 Diabetes Mellitus', duration: '4 years', medication: 'Tab Metformin 500mg BD', status: 'Well-controlled (HbA1c 6.8%)', isDoctorVerified: true }
    ],
    allergies: [],
    uploadedDocuments: [
      {
        id: 'doc-sen-1',
        name: 'Metropolis_FastingGlucose_HbA1c.pdf',
        type: 'Lab Report',
        date: '10 Nov 2026',
        timestamp: Date.now() - 86400000 * 3,
        uploadedBy: 'patient',
        isHandwritten: false,
        ocrStatus: 'complete',
        extractedDiagnoses: ['Well-controlled Glycemia'],
        extractedMeds: [],
        extractedLabs: [
          { test: 'Fasting Blood Glucose', value: '112', unit: 'mg/dL', range: '70 - 100', isOutOfRange: true },
          { test: 'HbA1c', value: '6.8', unit: '%', range: '4.0 - 5.6', isOutOfRange: true },
          { test: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6 - 1.1', isOutOfRange: false }
        ],
        notes: 'Printed automated biochemical report from Metropolis Healthcare.'
      }
    ],
    pastVisits: [
      {
        date: '12 Aug 2026',
        hospital: 'Fortis Hospital Mohali',
        department: 'Endocrinology OPD',
        reason: 'Routine quarterly diabetes review.',
        diagnosis: 'Type 2 Diabetes Mellitus - Good Control',
        prescriptions: ['Tab Metformin 500mg BD'],
        patientVisibleNotes: 'Continue 45-minute daily brisk walk and low glycemic index meals. Repeat HbA1c in 3 months.',
        doctorNotesHidden: 'HbA1c stable at 6.9%. No microvascular signs. Continue current regimen.'
      }
    ]
  },
  '9812345678': {
    abhaId: '32-1094-5582-9901',
    name: 'Rohan Gupta',
    age: '28',
    gender: 'Male',
    phone: '9812345678',
    height: '178',
    weight: '72',
    chronicConditions: [],
    allergies: [],
    uploadedDocuments: [],
    pastVisits: []
  },
  '9744221100': {
    abhaId: '55-4920-1123-4488',
    name: 'Meenakshi Sundaram',
    age: '61',
    gender: 'Female',
    phone: '9744221100',
    height: '155',
    weight: '68',
    chronicConditions: [
      { condition: 'Primary Bilateral Knee Osteoarthritis (Grade 1-2)', duration: '1 year', medication: 'Calcium 500mg + Vitamin D3 OD', status: 'Stable', isDoctorVerified: true }
    ],
    allergies: [],
    uploadedDocuments: [],
    pastVisits: []
  },
  '9988776655': {
    abhaId: '78-3312-9904-2231',
    name: 'Gurpreet Singh',
    age: '54',
    gender: 'Male',
    phone: '9988776655',
    height: '172',
    weight: '78',
    chronicConditions: [
      { condition: 'Primary Essential Hypertension', duration: '3 years', medication: 'Tab Amlodipine 5mg OD (Morning)', status: 'Well-controlled (Clinic BP 126/82)', isDoctorVerified: true }
    ],
    allergies: [],
    uploadedDocuments: [],
    pastVisits: []
  },
  '9811223344': getFreshDemoProfile(),
  ...DEMO_PRESET_PATIENTS.reduce((acc, item) => {
    if (item.personaProfile) {
      acc[item.personaProfile.phone] = item.personaProfile;
    }
    return acc;
  }, {} as Record<string, PatientProfile>)
};

function broadcastSync(event: { type: string; [key: string]: any }) {
  if (typeof window !== 'undefined') {
    try {
      const channel = new BroadcastChannel('medikiosk_channel');
      channel.postMessage(event);
      channel.close();
    } catch (e) {}
  }
}

let isSocketInitialized = false;

export const usePatientStore = create<PatientStore>((set, get) => ({
  currentPatient: createInitialPatient(),
  currentProfile: null,
  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  updatePatient: (data) =>
    set((state) => ({
      currentPatient: { ...state.currentPatient, ...data },
    })),

  updateProfile: (data) =>
    set((state) => ({
      currentProfile: state.currentProfile ? { ...state.currentProfile, ...data } : null,
    })),

  checkProfileExists: (id) => {
    return Object.values(mockProfiles).some(p => p.phone === id || p.abhaId === id);
  },

  loginProfile: (id, regData) => {
    // If demo account, always restore pristine profile
    if (id === '9811223344' || id === '88-3921-9941-0021') {
      mockProfiles['9811223344'] = getFreshDemoProfile();
    }

    // Mock login by matching phone or abhaId
    const profile = Object.values(mockProfiles).find(p => p.phone === id || p.abhaId === id);
    if (profile) {
      set({ currentProfile: profile });
      // Pre-fill fresh patient intake session - never inherit stale consultation data from past runs
      const freshIntake = createInitialPatient();
      set({
        currentPatient: {
          ...freshIntake,
          name: profile.name,
          phone: profile.phone,
          age: profile.age,
          gender: profile.gender,
          abhaId: profile.abhaId,
          chronicConditions: [...profile.chronicConditions],
          allergies: [...profile.allergies],
          uploadedDocuments: [...profile.uploadedDocuments],
        }
      });
    } else {
      // Create new profile with regData
      const newProfile: PatientProfile = {
        abhaId: id.includes('-') ? id : 'Pending',
        name: regData?.name || 'New Patient',
        age: regData?.age || '30',
        gender: regData?.gender || 'Male',
        phone: id.includes('-') ? 'Pending' : id,
        height: '',
        weight: '',
        chronicConditions: [],
        allergies: [],
        uploadedDocuments: [],
        pastVisits: []
      };
      
      // Save to mockProfiles so they can login again
      mockProfiles[id] = newProfile;
      
      set({ currentProfile: newProfile });
      const freshIntake = createInitialPatient();
      set({
        currentPatient: {
          ...freshIntake,
          name: newProfile.name,
          phone: newProfile.phone,
          age: newProfile.age,
          gender: newProfile.gender,
          abhaId: newProfile.abhaId,
        }
      });
    }
  },

  resetDemoSession: () => {
    // Completely restore demo profile to pristine state and wipe active intake
    mockProfiles['9811223344'] = getFreshDemoProfile();
    set({
      currentProfile: null,
      currentPatient: createInitialPatient(),
      queueTrigger: get().queueTrigger + 1
    });
  },

  logoutProfile: () => {
    // Reset session and restore baseline demo state for next demonstration
    mockProfiles['9811223344'] = getFreshDemoProfile();
    set({
      currentProfile: null,
      currentPatient: createInitialPatient(),
      queueTrigger: get().queueTrigger + 1
    });
  },

  setLanguage: (lang) =>
    set((state) => ({
      currentPatient: { ...state.currentPatient, language: lang },
    })),

  setMode: (mode) =>
    set((state) => ({
      currentPatient: { ...state.currentPatient, mode: mode },
    })),

  addDocument: (doc) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        uploadedDocuments: [...state.currentPatient.uploadedDocuments, doc],
      },
    })),

  addDocumentToPatient: (patientToken: string, doc: UploadedDocument) => {
    // 1. Update in mockDatabase
    let targetPatient = mockDatabase[patientToken];
    if (!targetPatient) {
      targetPatient = Object.values(mockDatabase).find(p => p.token === patientToken || p.patientId === patientToken) as PatientData;
    }

    if (targetPatient) {
      targetPatient.uploadedDocuments = [doc, ...(targetPatient.uploadedDocuments || [])];
      
      // 2. Link to corresponding mockProfiles if available
      const profileKey = Object.keys(mockProfiles).find(
        k => mockProfiles[k].name === targetPatient.name || (targetPatient.abhaId && mockProfiles[k].abhaId === targetPatient.abhaId)
      );
      if (profileKey) {
        mockProfiles[profileKey].uploadedDocuments = [doc, ...(mockProfiles[profileKey].uploadedDocuments || [])];
      }

      // 3. Persist to Supabase
      syncPatientToSupabase(targetPatient);

      // 4. Cross-tab & local storage persistence
      broadcastSync({ type: 'DOC_ADDED', patientToken, doc });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('medikiosk_p_' + targetPatient.token, JSON.stringify(targetPatient));
          localStorage.setItem('medikiosk_latest_patient', JSON.stringify(targetPatient));
        } catch (e) {}
      }
    }

    // 5. Update Zustand state & trigger real-time reactive rerenders
    set((state) => {
      const isCurrent = state.currentPatient.token === patientToken || state.currentPatient.patientId === patientToken;
      return {
        currentPatient: isCurrent
          ? { ...state.currentPatient, uploadedDocuments: [doc, ...state.currentPatient.uploadedDocuments] }
          : state.currentPatient,
        currentProfile: state.currentProfile && targetPatient && (state.currentProfile.name === targetPatient.name || state.currentProfile.abhaId === targetPatient.abhaId)
          ? { ...state.currentProfile, uploadedDocuments: [doc, ...state.currentProfile.uploadedDocuments] }
          : state.currentProfile,
        queueTrigger: state.queueTrigger + 1
      };
    });
  },

  updatePatientIntegrativeExam: (patientToken: string, dashavidha: Partial<DashavidhaData>, ashtaSthana: Partial<AshtaSthanaData>) => {
    let targetPatient = mockDatabase[patientToken];
    if (!targetPatient) {
      targetPatient = Object.values(mockDatabase).find(p => p.token === patientToken || p.patientId === patientToken) as PatientData;
    }
    if (targetPatient) {
      targetPatient.dashavidha = { ...(targetPatient.dashavidha || {}), ...dashavidha };
      targetPatient.ashtaSthana = { ...(targetPatient.ashtaSthana || {}), ...ashtaSthana };
      if (dashavidha.prakriti) targetPatient.prakriti = dashavidha.prakriti;
      if (dashavidha.aharaShakti) targetPatient.agni = dashavidha.aharaShakti;
      if (ashtaSthana.mala) targetPatient.koshtha = ashtaSthana.mala;
      syncPatientToSupabase(targetPatient);

      // Cross-tab & local storage persistence
      broadcastSync({ type: 'EXAM_UPDATED', patientToken, dashavidha, ashtaSthana });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('medikiosk_p_' + targetPatient.token, JSON.stringify(targetPatient));
          localStorage.setItem('medikiosk_latest_patient', JSON.stringify(targetPatient));
        } catch (e) {}
      }
    }
    set((state) => {
      const isCurrent = state.currentPatient.token === patientToken || state.currentPatient.patientId === patientToken;
      return {
        currentPatient: isCurrent
          ? {
              ...state.currentPatient,
              dashavidha: { ...(state.currentPatient.dashavidha || {}), ...dashavidha },
              ashtaSthana: { ...(state.currentPatient.ashtaSthana || {}), ...ashtaSthana },
              prakriti: dashavidha.prakriti || state.currentPatient.prakriti,
              agni: dashavidha.aharaShakti || state.currentPatient.agni,
              koshtha: ashtaSthana.mala || state.currentPatient.koshtha
            }
          : state.currentPatient,
        queueTrigger: state.queueTrigger + 1
      };
    });
  },

  removeDocument: (id) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        uploadedDocuments: state.currentPatient.uploadedDocuments.filter((d) => d.id !== id),
      },
    })),

  generatePatientToken: () => {
    const existing = get().currentPatient.token;
    if (existing) return existing;
    const prefix = get().currentPatient.mode === 'ayush' ? 'AYU' : 'MED';
    const rand = Math.floor(100 + Math.random() * 900);
    const newToken = `${prefix}-${rand}`;
    set((state) => ({
      currentPatient: { ...state.currentPatient, token: newToken, patientId: newToken },
    }));
    return newToken;
  },

  evaluateTriageAndSummary: () => {
    const p = get().currentPatient;
    const redFlags: string[] = [];
    let triage: 'normal' | 'priority' | 'emergency' = 'normal';

    const textToScan = `${p.chiefComplaint} ${p.chiefComplaintHi} ${p.symptomCharacter} ${p.symptomRadiation} ${p.associatedSymptoms.join(' ')}`.toLowerCase();

    // Red flag clinical rules
    if (
      (textToScan.includes('chest') || textToScan.includes('सीने') || textToScan.includes('pressure') || textToScan.includes('दबाव')) &&
      (textToScan.includes('sweat') || textToScan.includes('पसीना') || textToScan.includes('arm') || textToScan.includes('breath') || textToScan.includes('सांस'))
    ) {
      triage = 'emergency';
      redFlags.push('RED FLAG: Suspected Acute Coronary Syndrome (Chest discomfort with radiation/diaphoresis)');
    } else if (textToScan.includes('stroke') || textToScan.includes('weakness') || textToScan.includes('slur') || textToScan.includes('लकवा')) {
      triage = 'emergency';
      redFlags.push('RED FLAG: Acute Neurological Deficit / Possible CVA stroke signs');
    } else if (textToScan.includes('blood') || textToScan.includes('खून') || textToScan.includes('hemoptysis') || textToScan.includes('vomiting blood')) {
      triage = 'emergency';
      redFlags.push('RED FLAG: Significant active hemorrhage / hemoptysis');
    } else if (p.symptomSeverity >= 8) {
      triage = 'priority';
      redFlags.push('High pain score (≥ 8/10)');
    }

    // Document highlights
    const docHighlights: string[] = [];
    p.uploadedDocuments.forEach((doc) => {
      doc.extractedLabs.forEach((lab) => {
        if (lab.isOutOfRange) {
          docHighlights.push(`Out of range: ${lab.test} is ${lab.value} ${lab.unit} (Ref: ${lab.range})`);
        }
      });
      if (doc.extractedDiagnoses.length) {
        docHighlights.push(`Prior diagnosed: ${doc.extractedDiagnoses.join(', ')}`);
      }
    });

    // Suggested workup
    const suggested: string[] = [];
    if (triage === 'emergency') {
      suggested.push('Stat 12-Lead ECG & continuous telemetry');
      suggested.push('Serum Troponin I / T');
      suggested.push('Immediate Triage Nurse bedside review');
    } else if (textToScan.includes('fever') || textToScan.includes('cough')) {
      suggested.push('Complete Blood Count (CBC) with ESR');
      suggested.push('Chest X-Ray PA View');
    } else if (textToScan.includes('abdominal') || textToScan.includes('stomach') || textToScan.includes('acidity')) {
      suggested.push('Ultrasound Whole Abdomen (USG)');
      suggested.push('Liver Function Test (LFT) & Serum Amylase/Lipase if acute');
    } else {
      suggested.push('Baseline Complete Hemogram');
      suggested.push('Vitals re-check: BP, Pulse, SpO2');
    }

    // Synthesis of HPI
    const hpiText = `${p.age || 'Patient'} ${p.gender} presenting with chief complaint of ${p.chiefComplaint || 'unspecified complaints'}. Symptom onset was ${p.symptomDuration || 'recent'}, characterized as ${p.symptomCharacter || 'discomfort'}, localized to ${p.symptomSite || 'affected region'}, severity rated ${p.symptomSeverity}/10. Aggravated by: ${p.aggravatingFactors || 'N/A'}; relieved by: ${p.relievingFactors || 'N/A'}. Associated symptoms: ${p.associatedSymptoms.length ? p.associatedSymptoms.join(', ') : 'None denied'}.`;

    const pastText = p.chronicConditions.length
      ? p.chronicConditions.map((c) => `${c.condition} (${c.duration}) - on ${c.medication || 'No meds'} [${c.status || 'Active'}]`).join('; ')
      : 'No significant past chronic medical illnesses reported.';

    const medText = p.chronicConditions
      .filter((c) => c.medication)
      .map((c) => c.medication)
      .join(', ') || 'No chronic daily medications listed.';

    const allergyText = p.allergies.length
      ? p.allergies.map((a) => `${a.allergen} (Reaction: ${a.reaction}, Severity: ${a.severity.toUpperCase()})`).join('; ')
      : 'No known drug or food allergies (NKDA).';

    const rosText = p.reviewOfSystems.length
      ? `Positive systems: ${p.reviewOfSystems.join(', ')}`
      : 'Review of systems non-contributory beyond presenting illness.';

    const ayushText = p.mode === 'ayush'
      ? `Prakriti: ${p.prakriti} | Agni: ${p.agni} | Koshtha: ${p.koshtha} | Ahara-Vihara: ${p.aharaVihara} | Nidra: ${p.nidra}` +
        (p.ayushResponses?.length ? `\nPariksha Responses: ${p.ayushResponses.map(r => r.answer).join(', ')}` : '')
      : undefined;

    // Department & Room routing
    let assignedDept = 'General Medicine OPD';
    let assignedRoom = 'Room 14, Ground Floor';

    if (p.mode === 'ayush') {
      assignedDept = 'AYUSH / Ayurveda Department';
      assignedRoom = 'Room 401, Heritage Wing';
    } else if (textToScan.includes('chest') || textToScan.includes('heart') || textToScan.includes('सीने') || textToScan.includes('cardio') || triage === 'emergency') {
      assignedDept = 'Cardiology / Emergency OPD';
      assignedRoom = 'Emergency Bay / Room 204';
    } else if (textToScan.includes('fever') || textToScan.includes('बुखार') || textToScan.includes('chill') || textToScan.includes('shivering')) {
      assignedDept = 'General Medicine & Fever Clinic';
      assignedRoom = 'Room 105, Ground Floor';
    } else if (textToScan.includes('stomach') || textToScan.includes('abdomen') || textToScan.includes('पेट') || textToScan.includes('acidity') || textToScan.includes('vomit') || textToScan.includes('loose')) {
      assignedDept = 'Gastroenterology OPD';
      assignedRoom = 'Room 305, 3rd Floor';
    } else if (textToScan.includes('joint') || textToScan.includes('knee') || textToScan.includes('back') || textToScan.includes('कमर') || textToScan.includes('घुटने') || textToScan.includes('headache') || textToScan.includes('सिरदर्द')) {
      assignedDept = 'Orthopedics & Spine Clinic';
      assignedRoom = 'Room 112, 1st Floor';
    }

    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        triageLevel: triage,
        redFlags: redFlags,
        assignedDept,
        assignedRoom,
        structuredSummary: {
          chiefComplaintSummary: p.chiefComplaint || 'Intake completed',
          hpi: hpiText,
          pastHistory: pastText,
          medicationsSummary: medText,
          allergiesSummary: allergyText,
          rosSummary: rosText,
          ayushSummary: ayushText,
          redFlagsSummary: redFlags,
          documentHighlights: docHighlights,
          suggestedWorkup: suggested,
        },
      },
    }));
  },

  saveToDatabase: () => {
    const p = get().currentPatient;
    if (!p.token) {
      get().generatePatientToken();
    }
    const token = get().currentPatient.token;
    const fullPatient = {
      ...get().currentPatient,
      token,
      createdAt: get().currentPatient.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdTimestamp: get().currentPatient.createdTimestamp || Date.now()
    };
    mockDatabase[token] = fullPatient;

    // Sync active visit to currentProfile if logged in
    const prof = get().currentProfile;
    if (prof) {
      const existingVisits = prof.pastVisits || [];
      const newVisit = {
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        hospital: fullPatient.hospitalName || fullPatient.hospitalCode || 'AIIMS New Delhi (Apex)',
        department: fullPatient.assignedDept ? `${fullPatient.assignedDept} (${fullPatient.assignedRoom || fullPatient.doctorNumber || 'OPD Room 14'})` : 'General Medicine OPD (Room 14)',
        reason: fullPatient.chiefComplaint || 'Consultation intake',
        diagnosis: fullPatient.structuredSummary?.chiefComplaintSummary || 'Active consultation in progress',
        prescriptions: [],
        doctorNotesHidden: `Token ${token} - Corridor queue. Desk: ${fullPatient.doctorNumber || 'OPD Room 14'}`
      };
      
      const visitExists = existingVisits.some(v => v.reason === fullPatient.chiefComplaint && v.date === newVisit.date);
      if (!visitExists) {
        get().updateProfile({
          pastVisits: [newVisit, ...existingVisits]
        });
      }
    }

    // Push to Supabase Cloud Database (if table exists)
    try {
      supabase.from('patients').upsert({
        token: fullPatient.token,
        patient_id: fullPatient.patientId,
        abha_id: fullPatient.abhaId,
        name: fullPatient.name,
        age: fullPatient.age,
        gender: fullPatient.gender,
        phone: fullPatient.phone,
        chief_complaint: fullPatient.chiefComplaint,
        triage_level: fullPatient.triageLevel,
        status: fullPatient.status,
        admitted_ward: fullPatient.admittedWard,
        bed_number: fullPatient.bedNumber,
        admission_date: fullPatient.admissionDate,
        ipd_stage: fullPatient.ipdStage,
        data: fullPatient
      }).then(({ error }) => {
        if (error) console.warn('Supabase save note:', error.message);
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }

    // Cross-tab broadcast & localStorage persistence
    broadcastSync({ type: 'PATIENT_SAVED', patient: fullPatient });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medikiosk_latest_patient', JSON.stringify(fullPatient));
        localStorage.setItem('medikiosk_p_' + fullPatient.token, JSON.stringify(fullPatient));
        const tokens: string[] = JSON.parse(localStorage.getItem('medikiosk_tokens') || '[]');
        if (!tokens.includes(fullPatient.token)) {
          tokens.push(fullPatient.token);
          localStorage.setItem('medikiosk_tokens', JSON.stringify(tokens));
        }
      } catch (e) {}
    }

    // Real-time sync to Doctor's Dashboard (50ms latency)
    socket.emit('patient_intake_submitted', fullPatient);
  },

  resetPatient: () => {
    set({ currentPatient: createInitialPatient() });
  },

  loadPatient: (token: string) => {
    const found = mockDatabase[token.trim().toUpperCase()];
    return found || null;
  },

  queueTrigger: 0,
  triggerQueueUpdate: () => set((state) => ({ queueTrigger: state.queueTrigger + 1 })),

  clearQueue: async () => {
    // Clear local memory
    for (const key in mockDatabase) {
      delete mockDatabase[key];
    }
    get().triggerQueueUpdate();

    // Clear Supabase database
    try {
      const { error } = await supabase.from('patients').delete().neq('token', 'DO_NOT_DELETE');
      if (error) console.warn('Supabase clear queue error:', error.message);
    } catch (e) {
      console.warn('Supabase clear error:', e);
    }
  },

  initSocket: () => {
    if (isSocketInitialized) return;
    isSocketInitialized = true;

    socket.off('new_patient_in_queue');
    socket.on('new_patient_in_queue', (data: PatientData) => {
      mockDatabase[data.token] = data;
      get().triggerQueueUpdate();
    });

    // 108 Ambulance Real-Time Telemetry Listener
    socket.off('incoming_ambulance_alert');
    socket.on('incoming_ambulance_alert', (payload: any) => {
      const telemetry: AmbulanceTelemetry = payload?.telemetry || payload;
      const patient: PatientData | undefined = payload?.patient;
      console.log('⚡ Socket event: incoming_ambulance_alert received:', telemetry);
      set({ incomingAmbulance: telemetry });
      if (patient && patient.token) {
        mockDatabase[patient.token] = patient;
      }
      // Play high-acuity trauma chime if sound enabled
      if (get().soundEnabled && typeof window !== 'undefined') {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // A4
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.45);
        } catch (e) {}
      }
      get().triggerQueueUpdate();
    });

    socket.off('ambulance_trauma_patient');
    socket.on('ambulance_trauma_patient', (payload: { telemetry: AmbulanceTelemetry; patient: PatientData }) => {
      console.log('⚡ Socket event: ambulance_trauma_patient received:', payload);
      if (payload?.telemetry) set({ incomingAmbulance: payload.telemetry });
      if (payload?.patient && payload.patient.token) {
        mockDatabase[payload.patient.token] = payload.patient;
      }
      get().triggerQueueUpdate();
    });

    // Roadside Bystander SOS Distress Beacon Listener
    socket.off('trauma_sos_alert');
    socket.on('trauma_sos_alert', (alertData: any) => {
      console.log('🚨 Socket event: trauma_sos_alert received:', alertData);
      set({
        antiPrankVerification: {
          tagId: alertData.tagId,
          status: 'verifying',
          timestamp: Date.now()
        }
      });
      get().triggerQueueUpdate();
    });

    // Anti-Prank Owner Verification Update Listener
    socket.off('owner_safety_update');
    socket.on('owner_safety_update', (resp: any) => {
      console.log('🛡️ Socket event: owner_safety_update received:', resp);
      set({
        antiPrankVerification: {
          tagId: resp.tagId,
          status: resp.isSafe ? 'safe' : 'confirmed',
          timestamp: Date.now()
        }
      });
      get().triggerQueueUpdate();
    });

    // Cross-tab broadcast & localStorage hydration
    if (typeof window !== 'undefined') {
      try {
        const tokens: string[] = JSON.parse(localStorage.getItem('medikiosk_tokens') || '[]');
        tokens.forEach((tok) => {
          try {
            const raw = localStorage.getItem('medikiosk_p_' + tok);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.token) {
                mockDatabase[parsed.token] = parsed;
              }
            }
          } catch (e) {}
        });

        // Hydrate latest active ambulance telemetry if present
        const latestAmb = localStorage.getItem('medikiosk_latest_ambulance');
        if (latestAmb) {
          try {
            const parsedAmb = JSON.parse(latestAmb);
            if (parsedAmb && parsedAmb.telemetryId) {
              set({ incomingAmbulance: parsedAmb });
            }
          } catch (e) {}
        }

        get().triggerQueueUpdate();
      } catch (e) {}

      try {
        const channel = new BroadcastChannel('medikiosk_channel');
        channel.onmessage = (ev) => {
          if (ev.data?.type === 'PATIENT_SAVED' && ev.data.patient) {
            mockDatabase[ev.data.patient.token] = ev.data.patient;
            get().triggerQueueUpdate();
          } else if (ev.data?.type === 'AMBULANCE_DISPATCH') {
            if (ev.data.telemetry) set({ incomingAmbulance: ev.data.telemetry });
            if (ev.data.patient && ev.data.patient.token) {
              mockDatabase[ev.data.patient.token] = ev.data.patient;
            }
            get().triggerQueueUpdate();
          } else if (ev.data?.type === 'DOC_ADDED' && ev.data.patientToken && ev.data.doc) {
            let target: PatientData | undefined = mockDatabase[ev.data.patientToken];
            if (!target) {
              target = Object.values(mockDatabase).find(p => p.token === ev.data.patientToken || p.patientId === ev.data.patientToken);
            }
            if (target) {
              target.uploadedDocuments = [ev.data.doc, ...(target.uploadedDocuments || [])];
              get().triggerQueueUpdate();
            }
          } else if (ev.data?.type === 'EXAM_UPDATED' && ev.data.patientToken) {
            let target: PatientData | undefined = mockDatabase[ev.data.patientToken];
            if (!target) {
              target = Object.values(mockDatabase).find(p => p.token === ev.data.patientToken || p.patientId === ev.data.patientToken);
            }
            if (target) {
              target.dashavidha = { ...(target.dashavidha || {}), ...ev.data.dashavidha };
              target.ashtaSthana = { ...(target.ashtaSthana || {}), ...ev.data.ashtaSthana };
              get().triggerQueueUpdate();
            }
          }
        };
      } catch (e) {}

      window.addEventListener('storage', (ev) => {
        if (ev.key === 'medikiosk_latest_patient' && ev.newValue) {
          try {
            const p = JSON.parse(ev.newValue);
            if (p && p.token) {
              mockDatabase[p.token] = p;
              get().triggerQueueUpdate();
            }
          } catch (e) {}
        }
        if (ev.key === 'medikiosk_latest_ambulance' && ev.newValue) {
          try {
            const amb = JSON.parse(ev.newValue);
            if (amb && amb.telemetryId) {
              set({ incomingAmbulance: amb });
              get().triggerQueueUpdate();
            }
          } catch (e) {}
        }
      });
    }

    // Supabase cloud data initialization
    try {
      supabase.from('patients').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            if (row.data && row.token) {
              mockDatabase[row.token] = row.data;
            }
          });
          get().triggerQueueUpdate();
        }
      });

      // Supabase Realtime channel across devices
      supabase
        .channel('public:patients')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patients' },
          (payload) => {
            const patientData = (payload.new as any)?.data;
            if (patientData && patientData.token) {
              mockDatabase[patientData.token] = patientData;
              get().triggerQueueUpdate();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase Realtime:', e);
    }
  },

  populateDemoPatients: () => {
    const four = getFourActiveDemoPatients();
    four.forEach((p) => {
      mockDatabase[p.token] = { ...p, status: 'waiting' };
      syncPatientToSupabase(mockDatabase[p.token]);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('medikiosk_p_' + p.token, JSON.stringify(mockDatabase[p.token]));
        } catch (e) {}
      }
    });
    broadcastSync({ type: 'DEMO_POPULATED' });
    set((state) => ({ queueTrigger: state.queueTrigger + 1 }));
  },

  clearActiveQueueToRelieved: () => {
    Object.keys(mockDatabase).forEach((tok) => {
      if (mockDatabase[tok].status !== 'admitted') {
        mockDatabase[tok].status = 'accepted';
        syncPatientToSupabase(mockDatabase[tok]);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('medikiosk_p_' + tok, JSON.stringify(mockDatabase[tok]));
          } catch (e) {}
        }
      }
    });
    broadcastSync({ type: 'QUEUE_CLEARED' });
    set((state) => ({ queueTrigger: state.queueTrigger + 1 }));
  },

  injectCustomPatient: (patient: PatientData) => {
    mockDatabase[patient.token] = { ...patient };
    syncPatientToSupabase(mockDatabase[patient.token]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medikiosk_p_' + patient.token, JSON.stringify(mockDatabase[patient.token]));
        localStorage.setItem('medikiosk_latest_patient', JSON.stringify(mockDatabase[patient.token]));
      } catch (e) {}
    }
    broadcastSync({ type: 'PATIENT_SAVED', patient: mockDatabase[patient.token] });
    set((state) => ({ queueTrigger: state.queueTrigger + 1 }));
  },

  // PingME Care / LifeMesh Initial State & Implementations
  vehicleTag: PINGME_DEFAULT_VEHICLE,
  updateVehicleProfile: (data) =>
    set((state) => ({
      vehicleTag: { ...state.vehicleTag, ...data }
    })),

  incomingAmbulance: null,
  setIncomingAmbulance: (telemetry) => set({ incomingAmbulance: telemetry }),

  antiPrankVerification: { tagId: 'TAG-CH01AB1234', status: 'idle' },

  triggerEmergencySos: (tagId, selectedVictim = null, isGuestRider = false) => {
    const payload = {
      tagId: tagId || 'TAG-CH01AB1234',
      selectedVictim,
      isGuestRider,
      timestamp: Date.now(),
      location: 'NH-44 Highway Mile 18, near Ambala-Chandigarh expressway'
    };
    socket.emit('emergency_sos', payload);
    set({ antiPrankVerification: { tagId, status: 'verifying', timestamp: Date.now() } });
  },

  dispatchAmbulanceTelemetry: (telemetry: AmbulanceTelemetry) => {
    set({ incomingAmbulance: telemetry });

    // Dynamically retrieve selected victim profile (not a static preset!)
    const member = telemetry.victimMember || get().vehicleTag.members.find(m => m.id === telemetry.victimId);
    const isGuest = telemetry.victimId === 'guest-rider';
    const victimName = telemetry.victimName || (member ? member.name : (isGuest ? 'Unidentified Guest Borrower' : 'Ramesh Verma'));
    const victimAge = String(telemetry.victimAge || (member ? member.age : 'Unknown'));
    const victimGender = telemetry.victimGender || (member ? member.gender : 'Unknown');
    const victimBlood = telemetry.bloodGroup || (member ? member.bloodGroup : (isGuest ? 'Unknown (O- Standby)' : 'O+'));
    const victimAbha = telemetry.abhaId || (member ? member.abhaId : '14-8921-4402-1923');
    const allergiesList = telemetry.criticalAllergies?.length 
      ? telemetry.criticalAllergies 
      : (member ? member.criticalAllergies : []);
    const chronicList = telemetry.chronicConditions?.length 
      ? telemetry.chronicConditions 
      : (member ? member.chronicConditions : []);
    const medsList = telemetry.currentMedications?.length 
      ? telemetry.currentMedications 
      : (member ? member.currentMedications : []);

    const token = 'TRAUMA-' + Math.floor(100 + Math.random() * 900);

    // Convert live incident/wound photographs to uploadedDocuments so doctor can inspect in chart
    const docImages: UploadedDocument[] = (telemetry.incidentPhotos || []).map((img, idx) => ({
      id: `doc-wound-${Date.now()}-${idx}`,
      name: `Ambulance_Field_Wound_${token}_${idx + 1}.jpg`,
      type: 'Bedside Scan',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      uploadedBy: 'system',
      extractedDiagnoses: telemetry.injuryTags,
      extractedMeds: [],
      extractedLabs: [],
      fileUrl: img,
      notes: `Transmitted live from 108 Ambulance Unit (${telemetry.telemetryId}). Incident wound evaluation.`
    }));

    const traumaPatient: PatientData = {
      ...createInitialPatient(),
      patientId: token,
      token: token,
      abhaId: victimAbha,
      abhaVerified: !isGuest,
      name: victimName,
      age: victimAge,
      gender: victimGender,
      phone: member?.emergencyContact?.realPhone || '+91 98112 24442',
      height: '172',
      weight: '75',
      language: 'en',
      mode: 'modern',
      chiefComplaint: `HIGH-SPEED ROAD TRAFFIC COLLISION (RTC) — ${telemetry.injuryTags.join(' • ')}`,
      symptomDuration: 'Injury sustained 15 mins ago',
      symptomSite: telemetry.injuryTags.join(', '),
      symptomCharacter: 'High kinetic energy polytrauma',
      symptomSeverity: 10,
      triageLevel: 'emergency',
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdTimestamp: Date.now(),
      chronicConditions: chronicList.map(c => ({
        condition: c,
        duration: 'From tag medical profile',
        medication: medsList.join(', ') || 'N/A',
        status: 'Active Profile'
      })),
      allergies: allergiesList.map(a => ({
        allergen: a,
        reaction: 'Allergy alert from emergency profile',
        severity: 'severe' as const
      })),
      redFlags: [
        `CRITICAL: Severe Polytrauma (GCS ${telemetry.gcsScore}/15)`,
        `HEMODYNAMICS: BP ${telemetry.vitals.bp} | HR ${telemetry.vitals.hr} bpm | SpO2 ${telemetry.vitals.spo2}%`,
        ...(allergiesList.length ? [`ALLERGY WARNING: Strictly avoid ${allergiesList.join(', ')}`] : []),
        ...telemetry.injuryTags.map(i => `INJURY DETECTED: ${i}`)
      ],
      esiTriage: {
        level: 1,
        category: 'Resuscitation',
        color: '#ef4444',
        badgeBg: 'bg-red-500/10',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-500/30',
        rationale: `En-route via 108 Ambulance (${telemetry.hospitalName}). ETA: ${telemetry.etaMinutes} mins. GCS: ${telemetry.gcsScore}/15, BP: ${telemetry.vitals.bp}, HR: ${telemetry.vitals.hr} bpm, SpO2: ${telemetry.vitals.spo2}%.`,
        immediateActions: telemetry.criticalDirectives?.length ? telemetry.criticalDirectives : [
          'Emergency casualty bed & resuscitation readiness',
          `Stat 2 Units ${victimBlood} PRBCs`,
          'Bedside FAST Ultrasound & Polytrauma Protocol',
          'Urgent Non-contrast Polytrauma Head/Chest CT'
        ],
        predictedResources: ['Emergency Resuscitation & Trauma Ward', `Standby PRBC Blood Units (${victimBlood})`, 'Bedside FAST Ultrasound', 'Trauma CT Protocol'],
        algorithmSource: '108-ambulance-telemetry'
      },
      structuredSummary: {
        chiefComplaintSummary: `${victimName} (${victimAge} Yrs, ${victimGender}) — High-speed crash with GCS ${telemetry.gcsScore}/15.`,
        hpi: `Field paramedic assessment: GCS ${telemetry.gcsScore}/15, Blood Pressure ${telemetry.vitals.bp}, Heart Rate ${telemetry.vitals.hr} bpm, SpO2 ${telemetry.vitals.spo2}%, Respiratory Rate ${telemetry.vitals.rr}. Identified injuries: ${telemetry.injuryTags.join(', ')}. En-route to ${telemetry.hospitalName} with ETA ${telemetry.etaMinutes} mins.`,
        pastHistory: chronicList.join(', ') || 'No pre-existing chronic conditions noted',
        medicationsSummary: medsList.join(', ') || 'None reported',
        allergiesSummary: allergiesList.length ? `ALLERGIES: ${allergiesList.join(', ')}` : 'No known drug allergies',
        rosSummary: `Vitals measured en-route: BP ${telemetry.vitals.bp}, HR ${telemetry.vitals.hr} bpm, SpO2 ${telemetry.vitals.spo2}%, GCS ${telemetry.gcsScore}/15.`,
        redFlagsSummary: [
          `GCS Score: ${telemetry.gcsScore}/15 (${telemetry.gcsScore <= 8 ? 'Comatose / Intubation indicated' : 'Monitored'})`,
          `Vitals: BP ${telemetry.vitals.bp}, HR ${telemetry.vitals.hr} bpm, SpO2 ${telemetry.vitals.spo2}%`,
          ...telemetry.injuryTags
        ],
        documentHighlights: docImages.length ? [`${docImages.length} live wound / scene photo(s) captured by 108 crew`] : [],
        suggestedWorkup: [
          'Emergency Resuscitation & Casualty Bed Readiness',
          `Standby ${victimBlood} PRBC Units`,
          'Bedside FAST Ultrasound',
          'Whole-Body Polytrauma CT Protocol'
        ]
      },
      uploadedDocuments: docImages
    };

    mockDatabase[token] = traumaPatient;
    syncPatientToSupabase(traumaPatient);

    // Cross-tab broadcast & localStorage persistence
    broadcastSync({ type: 'AMBULANCE_DISPATCH', telemetry, patient: traumaPatient });
    broadcastSync({ type: 'PATIENT_SAVED', patient: traumaPatient });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medikiosk_p_' + token, JSON.stringify(traumaPatient));
        localStorage.setItem('medikiosk_latest_ambulance', JSON.stringify(telemetry));
        localStorage.setItem('medikiosk_latest_patient', JSON.stringify(traumaPatient));
        const tokens: string[] = JSON.parse(localStorage.getItem('medikiosk_tokens') || '[]');
        if (!tokens.includes(token)) {
          tokens.push(token);
          localStorage.setItem('medikiosk_tokens', JSON.stringify(tokens));
        }
      } catch (e) {}
    }

    // Real-time sync via WebSocket
    socket.emit('ambulance_dispatch', { telemetry, patient: traumaPatient });
    socket.emit('patient_intake_submitted', traumaPatient);

    get().triggerQueueUpdate();
  },

  verifyOwnerSafety: (tagId: string, isSafe: boolean) => {
    socket.emit('owner_safety_response', { tagId, isSafe });
    set({
      antiPrankVerification: {
        tagId,
        status: isSafe ? 'safe' : 'confirmed',
        timestamp: Date.now()
      }
    });
  },

  checkInFamilyMemberAsOPD: (member: FamilyMemberProfile, complaint: string, severity: number) => {
    const token = 'OPD-' + Math.floor(100 + Math.random() * 900);
    const newPatient: PatientData = {
      ...createInitialPatient(),
      patientId: token,
      token: token,
      abhaId: member.abhaId,
      abhaVerified: true,
      name: member.name,
      age: String(member.age),
      gender: member.gender,
      phone: member.emergencyContact.realPhone,
      height: '170',
      weight: '72',
      language: 'en',
      mode: 'modern',
      chiefComplaint: complaint || 'Routine Outpatient Consultation',
      symptomDuration: 'Started 2 days ago',
      symptomSeverity: severity || 5,
      triageLevel: severity >= 8 ? 'emergency' : severity >= 6 ? 'priority' : 'normal',
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdTimestamp: Date.now(),
      chronicConditions: member.chronicConditions.map((c) => ({
        condition: c,
        duration: 'Known history',
        medication: 'Prescribed',
        status: 'Active'
      })),
      allergies: member.criticalAllergies.map((a) => ({
        allergen: a,
        reaction: 'Documented in ABHA EHR',
        severity: 'severe'
      })),
      redFlags: severity >= 8 ? ['High acuity pain score reported at kiosk'] : [],
      esiTriage: {
        level: severity >= 8 ? 2 : severity >= 5 ? 3 : 4,
        category: severity >= 8 ? 'Emergent' : severity >= 5 ? 'Urgent' : 'Less Urgent',
        color: severity >= 8 ? '#f97316' : '#eab308',
        badgeBg: severity >= 8 ? 'bg-orange-500/10' : 'bg-amber-500/10',
        badgeText: severity >= 8 ? 'text-orange-700' : 'text-amber-700',
        badgeBorder: severity >= 8 ? 'border-orange-500/30' : 'border-amber-500/30',
        rationale: 'Walk-in outpatient check-in with verified ABHA identity and longitudinal records.',
        immediateActions: ['Routine OPD consultation', 'Clinical history review', 'Symptomatic therapy'],
        predictedResources: ['Physician Exam', 'Outpatient Prescription'],
        algorithmSource: 'abha-opd-intake'
      },
      uploadedDocuments: []
    };

    mockDatabase[token] = newPatient;
    syncPatientToSupabase(newPatient);
    socket.emit('patient_intake_submitted', newPatient);
    get().triggerQueueUpdate();
    return newPatient;
  }
}));

export const syncPatientToSupabase = async (patient: PatientData) => {
  // Always cache locally in offline storage first
  offlineSyncService.cacheOfflinePatient(patient.token, patient);

  // If network is currently offline, queue record locally for auto-sync
  if (!offlineSyncService.isOnline()) {
    offlineSyncService.enqueue('patient_sync', patient.token, patient);
    console.log(`[OfflineSync] Network offline: Queued ${patient.token} in local store.`);
    return;
  }

  try {
    const { error } = await supabase.from('patients').upsert({
      token: patient.token,
      patient_id: patient.patientId,
      abha_id: patient.abhaId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      chief_complaint: patient.chiefComplaint,
      triage_level: patient.triageLevel,
      status: patient.status,
      admitted_ward: patient.admittedWard,
      bed_number: patient.bedNumber,
      admission_date: patient.admissionDate,
      ipd_stage: patient.ipdStage,
      data: patient
    });
    if (error) {
      console.warn('Supabase upsert error, queueing offline:', error.message);
      offlineSyncService.enqueue('patient_sync', patient.token, patient);
    }
  } catch (err) {
    console.warn('Supabase network error, queueing offline:', err);
    offlineSyncService.enqueue('patient_sync', patient.token, patient);
  }
};
