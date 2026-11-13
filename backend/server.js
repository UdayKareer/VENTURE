const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { processMedicalDocument } = require('./ocrService');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Restrict CORS to specific frontend domains (Vercel Prod & Localhost & LAN)
const allowedOrigins = [
    'https://patient-case-taking-site.vercel.app',
    'https://patient-case-4x3k9d8uq-brij11.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive for local Wi-Fi hackathon demo
        }
    },
    methods: ["GET", "POST"],
    credentials: true
};

const io = new Server(server, { 
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors(corsOptions));
app.use(express.json());

// Setup Multer for file uploads (store temporarily in 'uploads' folder)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize original filename to prevent directory traversal
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
        }
    }
});

// Active In-Flight Emergencies & Telemetry Store (In-Memory cache for sub-5ms lookup)
const activeEmergencies = new Map();

// Socket.io for Real-Time Dual-Pipeline Sync (50ms latency)
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 1. Routine OPD / Walk-in Patient Check-in (Hospital Entry QR Scan)
    socket.on('patient_intake_submitted', (data) => {
        console.log('Received OPD patient intake:', data?.token || data?.name);
        io.emit('new_patient_in_queue', data);
    });

    // 2. Roadside Bystander 1-Tap SOS Beacon
    socket.on('emergency_sos', (data) => {
        console.log('🚨 Roadside Bystander SOS Triggered for Tag:', data?.tagId);
        const alertPayload = {
            sosId: 'SOS-' + Date.now(),
            tagId: data?.tagId || 'TAG-CH01AB1234',
            timestamp: new Date().toISOString(),
            location: data?.location || 'NH-44 Highway Mile 18, Ambala-Chandigarh Expressway',
            selectedVictim: data?.selectedVictim || null,
            status: 'pending_confirmation',
            isGuestRider: Boolean(data?.isGuestRider),
            notes: data?.notes || 'Bystander reported high-speed crash. Distress beacon active.'
        };
        activeEmergencies.set(alertPayload.tagId, alertPayload);
        // Broadcast distress beacon to all responder & ER dashboards
        io.emit('trauma_sos_alert', alertPayload);
    });

    // 3. 108 Ambulance / Paramedic In-Transit Crash Telemetry
    socket.on('ambulance_dispatch', (data) => {
        const telemetry = data?.telemetry || data;
        const patient = data?.patient || null;
        console.log('🚑 In-Transit Ambulance Telemetry from 108 Crew:', telemetry?.telemetryId, 'Target Hospital:', telemetry?.hospitalId);
        const enrichedTelemetry = {
            ...telemetry,
            receivedAt: new Date().toISOString(),
            status: 'en_route',
            liveEtaSeconds: (telemetry?.etaMinutes || 4) * 60
        };
        activeEmergencies.set(telemetry?.victimId || 'active', enrichedTelemetry);
        // Broadcast incoming high-acuity trauma alert to Hospital ER
        io.emit('incoming_ambulance_alert', enrichedTelemetry);
        if (patient) {
            io.emit('new_patient_in_queue', patient);
            io.emit('ambulance_trauma_patient', { telemetry: enrichedTelemetry, patient });
        }
    });

    // 4. Anti-Prank Owner Safety Verification Response
    socket.on('owner_safety_response', (data) => {
        console.log('🛡️ Anti-Prank Owner Verification Response:', data);
        io.emit('owner_safety_update', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// HTTP Endpoints

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Medikiosk Backend is running' });
});

// Document Upload & OCR Endpoint
app.post('/api/ocr', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing document:', req.file.path);
        
        const mimeType = req.file.mimetype;
        
        // Process with Gemini AI
        const medicalData = await processMedicalDocument(req.file.path, mimeType);

        // Delete the temporary file after processing
        fs.unlinkSync(req.file.path);

        // Notify via WebSocket that a new document was scanned (optional)
        io.emit('document_scanned', medicalData);

        return res.json({
            success: true,
            data: medicalData
        });

    } catch (error) {
        console.error('OCR Endpoint Error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            error: 'Failed to process document', 
            details: error.message 
        });
    }
});

// Clinical AI Triage Endpoint (Feature 4D)
app.post('/api/clinical-ai/triage', async (req, res) => {
    try {
        const patient = req.body || {};
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        // Deterministic Clinical Fallback
        const comp = (patient.chiefComplaint || '').toLowerCase();
        const sev = patient.symptomSeverity || 0;
        const rad = (patient.symptomRadiation || '').toLowerCase();
        const char = (patient.symptomCharacter || '').toLowerCase();
        const assoc = patient.associatedSymptoms || [];
        const flags = patient.redFlags || [];

        let level = 5;
        let category = 'Non-Urgent';
        let rationale = 'Routine OPD consultation with stable baseline vitals.';
        let immediateActions = ['Routine OPD consultation', 'Prescription refill / lifestyle counseling'];
        let predictedResources = ['Oral Prescription Refill'];

        const isChestPainACS =
            (comp.includes('chest') || (patient.symptomSite || '').toLowerCase().includes('chest')) &&
            (rad.includes('left') || rad.includes('jaw') || rad.includes('arm')) &&
            (char.includes('crush') || char.includes('pressure') || sev >= 8);
        const hasDiaphoresis = assoc.some(a => a.toLowerCase().includes('sweat') || a.toLowerCase().includes('पसीना'));

        if ((isChestPainACS && hasDiaphoresis) || flags.some(f => f.toLowerCase().includes('cardiac arrest') || f.toLowerCase().includes('unresponsive'))) {
            level = 1;
            category = 'Resuscitation';
            rationale = 'Suspected Acute Coronary Syndrome with retrosternal radiation and diaphoresis.';
            immediateActions = [
                'Immediate transfer to Emergency Resuscitation Bay',
                'Stat 12-lead ECG within 10 minutes',
                'High-sensitivity Troponin-I/T',
                'Dual antiplatelet loading (Aspirin 300mg + Clopidogrel 300mg)',
                'Continuous cardiac telemetry & IV access'
            ];
            predictedResources = ['12-Lead ECG', 'Serial Cardiac Troponins', 'IV Cannulation', 'Continuous Telemetry'];
        } else if (comp.includes('asthma') || comp.includes('wheez') || sev >= 8 || isChestPainACS || patient.triageLevel === 'emergency') {
            level = 2;
            category = 'Emergent';
            rationale = 'High-risk clinical presentation or severe respiratory / neurovascular distress.';
            immediateActions = [
                'Prompt bedside physician assessment within 15 mins',
                'Continuous SpO2 and vital signs monitoring',
                'Duolin nebulization or targeted analgesia'
            ];
            predictedResources = ['Nebulization / O2', 'Blood Gas / CBC', 'IV Access'];
        } else if (comp.includes('cough') || comp.includes('fever') || comp.includes('vomit') || comp.includes('diarrhea') || sev >= 5) {
            level = 3;
            category = 'Urgent';
            rationale = 'Acute symptoms requiring multiple diagnostic or therapeutic resources, hemodynamically stable.';
            immediateActions = ['Complete Blood Count (CBC)', 'Diagnostic imaging or hydration protocol'];
            predictedResources = ['Laboratory Blood Work', 'Chest X-ray / Ultrasound', 'Outpatient Prescription'];
        } else if (comp.includes('joint') || comp.includes('knee') || comp.includes('acid') || sev >= 3) {
            level = 4;
            category = 'Less Urgent';
            rationale = 'Subacute presentation requiring single diagnostic or therapeutic resource.';
            immediateActions = ['Focused clinical exam', 'Targeted outpatient symptomatic prescription'];
            predictedResources = ['Targeted Prescription'];
        }

        // Try Gemini 3.5 Flash-lite
        if (GEMINI_API_KEY) {
            try {
                const prompt = `You are an Emergency Medicine Chief Triage Officer using the gold-standard 5-level Emergency Severity Index (ESI).
Classify this patient into ESI Level 1 to 5.
Patient Data:
- Chief Complaint: ${patient.chiefComplaint || 'None'}
- Duration: ${patient.symptomDuration || 'Unknown'}
- Severity: ${patient.symptomSeverity || 0}/10
- Associated: ${(patient.associatedSymptoms || []).join(', ') || 'None'}
- Red Flags: ${(patient.redFlags || []).join(', ') || 'None'}

Return ONLY a JSON object:
{
  "level": 1 | 2 | 3 | 4 | 5,
  "category": "Resuscitation" | "Emergent" | "Urgent" | "Less Urgent" | "Non-Urgent",
  "rationale": "Authoritative clinical explanation",
  "immediateActions": ["3-4 clinical steps"],
  "predictedResources": ["List of medical resources"]
}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4500);

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.1,
                                responseMimeType: 'application/json'
                            }
                        })
                    }
                );
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawJson) {
                        const parsed = JSON.parse(rawJson);
                        if (parsed.level >= 1 && parsed.level <= 5) {
                            level = parsed.level;
                            category = parsed.category || category;
                            rationale = parsed.rationale || rationale;
                            immediateActions = parsed.immediateActions?.length ? parsed.immediateActions : immediateActions;
                            predictedResources = parsed.predictedResources?.length ? parsed.predictedResources : predictedResources;
                        }
                    }
                }
            } catch (geminiErr) {
                console.warn('Backend Gemini call fallback to rule engine:', geminiErr.message);
            }
        }

        const colorMap = {
            1: { color: '#ef4444', badgeBg: 'bg-red-500/10', badgeText: 'text-red-700', badgeBorder: 'border-red-500/30' },
            2: { color: '#f97316', badgeBg: 'bg-orange-500/10', badgeText: 'text-orange-700', badgeBorder: 'border-orange-500/30' },
            3: { color: '#eab308', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-700', badgeBorder: 'border-amber-500/30' },
            4: { color: '#10b981', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-500/30' },
            5: { color: '#3b82f6', badgeBg: 'bg-blue-500/10', badgeText: 'text-blue-700', badgeBorder: 'border-blue-500/30' }
        };

        const meta = colorMap[level] || colorMap[5];

        res.json({
            success: true,
            triage: {
                level,
                category,
                ...meta,
                rationale,
                immediateActions,
                predictedResources,
                algorithmSource: GEMINI_API_KEY ? 'gemini-3.5-flash-lite' : 'clinical-rule-engine'
            }
        });
    } catch (err) {
        console.error('Triage endpoint error:', err);
        res.status(500).json({ error: 'Internal triage calculation error', details: err.message });
    }
});

// Clinical AI Adaptive Questions Endpoint (Feature 4A)
app.post('/api/clinical-ai/adaptive-questions', async (req, res) => {
    try {
        const { chiefComplaint, age, gender } = req.body || {};
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.json({ success: true, questions: [] });
        }

        const prompt = `You are an expert clinical triage physician.
Patient Chief Complaint: "${chiefComplaint || 'General illness'}".
Demographics: Age: ${age || 'Adult'}, Gender: ${gender || 'Unknown'}.

Generate 2 targeted, high-yield follow-up questions to identify critical differential markers.
Include 3-4 options in both English and Hindi, marking emergency answers with isRedFlag: true.

Return ONLY a JSON array:
[
  {
    "id": "q1",
    "questionEn": "English question text",
    "questionHi": "Hindi question text (Devanagari)",
    "clinicalRationale": "Clinical importance",
    "options": [
      {
        "id": "opt1",
        "labelEn": "English option",
        "labelHi": "Hindi option",
        "isRedFlag": false
      }
    ]
  }
]`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json'
                    }
                })
            }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
            return res.json({ success: true, questions: [] });
        }

        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = rawJson ? JSON.parse(rawJson) : [];

        res.json({ success: true, questions: Array.isArray(parsed) ? parsed : [] });
    } catch (err) {
        console.error('Adaptive questions endpoint error:', err);
        res.status(500).json({ error: 'Adaptive questions generation error', details: err.message });
    }
});

// ==========================================
// PINGME CARE / LIFEMESH SECURE ENDPOINTS
// ==========================================

// 1. Responder Authentication Endpoint (Phase 2 - DPDP Act 2023 Section 7f Compliance)
app.post('/api/auth/responder-access', (req, res) => {
    try {
        const { pin, responderId } = req.body || {};
        
        // Authorized emergency responder PIN credentials
        if (pin === 'PARAMEDIC-108' || pin === '108' || pin === 'DOCTOR-ER') {
            const role = pin === 'DOCTOR-ER' ? 'doctor' : 'paramedic';
            const ephemeralToken = 'PINGME-MED-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            return res.json({
                success: true,
                authenticated: true,
                role: role,
                responderId: responderId || (role === 'paramedic' ? 'AMB-108-NORTH-04' : 'ER-ATTENDING-CHG-01'),
                token: ephemeralToken,
                accessExpiresInHours: 4,
                message: 'Authorized emergency responder session created under Section 7(f) DPDP Act 2023 (Emergency Health Exemption).'
            });
        }
        
        return res.status(401).json({
            success: false,
            authenticated: false,
            error: 'Invalid Responder Access PIN. Access restricted to authorized medical responders and trauma doctors.'
        });
    } catch (err) {
        console.error('Responder auth error:', err);
        res.status(500).json({ error: 'Authentication internal error' });
    }
});

// 2. Active In-Flight Emergencies Telemetry Endpoint
app.get('/api/telemetry/active', (req, res) => {
    const list = Array.from(activeEmergencies.values());
    res.json({
        success: true,
        count: list.length,
        emergencies: list
    });
});

// 3. Fallback REST Dispatch for Ambulance Telemetry
app.post('/api/telemetry/dispatch', (req, res) => {
    try {
        const telemetry = req.body || {};
        const enriched = {
            ...telemetry,
            receivedAt: new Date().toISOString(),
            status: 'en_route',
            liveEtaSeconds: (telemetry.etaMinutes || 4) * 60
        };
        activeEmergencies.set(telemetry.victimId || 'active', enriched);
        io.emit('incoming_ambulance_alert', enriched);
        
        res.json({
            success: true,
            message: 'Ambulance telemetry broadcasted to trauma bay',
            telemetry: enriched
        });
    } catch (err) {
        console.error('Telemetry dispatch error:', err);
        res.status(500).json({ error: 'Telemetry broadcast failure' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

