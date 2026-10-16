import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  theme: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  content: React.ReactNode;
  speakerNotes: string;
  takeaway: string;
}

export function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      badge: 'GOVERNMENT OF KERALA • PILOT INITIATIVE',
      title: 'DBT-GUARD',
      subtitle: 'Precision AI & Telecom Remediation Platform for PM-KISAN Direct Benefit Transfer',
      theme: 'emerald',
      speakerNotes:
        'Good morning, respected jury and evaluators. Today, 11 crore Indian farmers depend on PM-KISAN for agricultural inputs. Yet every single disbursement cycle, millions of rightful farmers see their installments fail silently without knowing why. We present DBT-GUARD — India’s first end-to-end intelligent DBT beneficiary remediation platform bridging central banking servers with grassroots Krishi Bhavans.',
      takeaway: 'Zero-loss agricultural safety net for 11 crore Indian farmers.',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            PM-KISAN DBT Beneficiary Resolution Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight max-w-4xl leading-tight">
            Protecting Every Rupee for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Annadata</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            Eliminating the last-mile banking blindspot between PFMS central payment gateways, NPCI Aadhaar seeding, and rural Krishi Bhavans.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">₹2,400 Cr+</div>
              <div className="text-xs text-slate-400 mt-1">National Trapped Funds Addressed</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">&lt; 48 Hours</div>
              <div className="text-xs text-slate-400 mt-1">Target SLA (vs 42 Days Baseline)</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-teal-400">Gemini 2.5</div>
              <div className="text-xs text-slate-400 mt-1">Malayalam / Vernacular AI Engine</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-blue-400">NIC e-Gov</div>
              <div className="text-xs text-slate-400 mt-1">4-Stage Telecom SMS Simulator</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'THE CRISIS • PROBLEM STATEMENT',
      title: 'The Last-Mile DBT Blindspot',
      subtitle: 'Why Millions of Smallholder Farmers Miss Critical Installments Without Knowing Why',
      theme: 'amber',
      speakerNotes:
        'When a farmer’s installment fails, there is a total communication void. The farmer planted crops expecting ₹2,000. When it never arrived, they travel 18 km to Krishi Bhavan three times, only to find their bank merged and Aadhaar became unseeded. 73% of failed beneficiaries never receive any actionable native language notification.',
      takeaway: 'Opaque banking error codes leave smallholder farmers stranded during critical sowing seasons.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5">
              <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">
                Central Banking Disconnect
              </div>
              <div className="text-2xl font-bold text-white mb-2">₹2,400+ Crores Trapped Nationally</div>
              <p className="text-sm text-slate-300">
                Installments bounce due to technical bank rejections, but central PFMS error logs never reach the grassroots Agriculture Extension Officer in time.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                Excessive Turnaround Time
              </div>
              <div className="text-2xl font-bold text-white mb-2">42 Days Average Latency</div>
              <p className="text-sm text-slate-300">
                Farmers take over a month to discover why money didn’t arrive, by which time the sowing window has passed.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700 pb-2">
              The Reality at Krishi Bhavan Thrissur
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-rose-500/20 text-rose-400 font-bold text-xs mt-0.5">✕</span>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">65% of Officer Hours Wasted:</strong> Officers manually answer repetitive status inquiries instead of agricultural field work.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-rose-500/20 text-rose-400 font-bold text-xs mt-0.5">✕</span>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Zero Vernacular Outbound:</strong> Bank letters or SMS are in technical English or Hindi jargon that rural elders cannot act on.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-rose-500/20 text-rose-400 font-bold text-xs mt-0.5">✕</span>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Triangular Buck-Passing:</strong> Farmer gets passed between Bank Branch, Krishi Bhavan, and Akshaya CSC center.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'ROOT CAUSE ANALYSIS',
      title: 'The 4 Systemic Failure Points',
      subtitle: 'Where Money Gets Blocked in the Direct Benefit Transfer Highway',
      theme: 'slate',
      speakerNotes:
        'These are the four core technical failure points. Over 60% of cases are E01 — Aadhaar not mapped to NPCI APBS, often triggered when rural banks merge. E02 is account dormancy from zero transactions. E03 is land survey mismatch. E04 is stale IFSC codes. DBT-GUARD targets each with deterministic automated protocols.',
      takeaway: 'Technical banking rejections are predictable and 100% remediable with structured workflows.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-400">
                E01 • 61% of Cases
              </span>
              <span className="text-xs text-slate-400">NPCI APBS Layer</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Aadhaar Inactive in NPCI Mapper</h4>
            <p className="text-xs text-slate-300">
              Aadhaar is linked for KYC in core banking, but APBS flag is set to inactive. Central routing fails immediately.
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-mono">
              → Remediation: Doorstep India Post Payments Bank (IPPB) or Bank Mandate
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400">
                E02 • 19% of Cases
              </span>
              <span className="text-xs text-slate-400">Core Banking Layer</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Dormant / Inoperative Account</h4>
            <p className="text-xs text-slate-300">
              No customer-induced transactions for over 24 months. Core banking software flags account as dormant and freezes credits.
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-mono">
              → Remediation: Branch biometric re-KYC deposit
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400">
                E03 • 12% of Cases
              </span>
              <span className="text-xs text-slate-400">State Land Registry</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Survey Number / Land Record Mismatch</h4>
            <p className="text-xs text-slate-300">
              Village revenue survey numbers or joint patta land records do not reconcile with the PM-KISAN agricultural land registry.
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-mono">
              → Remediation: Village Revenue Office verification sync
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-400">
                E04 • 8% of Cases
              </span>
              <span className="text-xs text-slate-400">PFMS Batch Engine</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Stale IFSC / Post-Merger Routing</h4>
            <p className="text-xs text-slate-300">
              Gramin bank branch mergers alter IFSC routing codes, causing bulk disbursement batch files to reject.
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-mono">
              → Remediation: Automated Lead Bank IFSC batch translation
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      badge: 'CORE SOLUTION',
      title: 'DBT-GUARD Tri-Tier Platform',
      subtitle: 'The Operating System for Transparent Beneficiary Remediation',
      theme: 'emerald',
      speakerNotes:
        'DBT-GUARD works on three synchronized tiers: Ingestion and AI Triage, Field Remediation Queue, and Outbound Vernacular Action. In Tier 1, incoming PFMS error dumps are normalized and risk-scored. In Tier 2, tasks are routed to Krishi Bhavan or Lead Banks with clear SLAs. In Tier 3, farmers get instant bilingual SMS and IVR voice calls.',
      takeaway: 'Tri-Tier architecture transforms passive rejection logs into active field remediation pipelines.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl">
              1
            </div>
            <h4 className="text-base font-bold text-white">Automated Triage & SLA Engine</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingests PFMS & NPCI exception reports. Categorizes error severity, detects approaching 90-day forfeiture deadlines, and clusters cases for community camps.
            </p>
            <span className="inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full">
              Real-time Ingestion
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl">
              2
            </div>
            <h4 className="text-base font-bold text-white">Krishi Bhavan Remediation Desk</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides Agriculture Officers with prioritized queues, one-click IPPB doorstep camp scheduling, bank dispatch routing, and digital resolution sign-offs.
            </p>
            <span className="inline-block text-[11px] font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full">
              Desk & Field Copilot
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-xl">
              3
            </div>
            <h4 className="text-base font-bold text-white">Outbound Vernacular Channel</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Google Gemini 2.5 drafts plain-language Malayalam SMS and automated IVR voice scripts instructing the farmer exactly what document to carry to which counter.
            </p>
            <span className="inline-block text-[11px] font-mono text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full">
              Malayalam & English AI
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      badge: 'SECURITY & GOVERNANCE',
      title: 'Zero-Trust Role-Based Access Control',
      subtitle: 'Strict Identity Isolation Compliant with the DPDP Act 2023 & Aadhaar Regulations',
      theme: 'purple',
      speakerNotes:
        'A critical feature requested by our stakeholders is strict role-based data security. In DBT-GUARD, a farmer logging in can only see their own individual payment milestone and remediation details. They are cryptographically isolated from seeing other beneficiaries. Krishi Bhavan officers see their block, and District Nodal officers see district analytics.',
      takeaway: 'Zero-trust architecture guarantees citizen data privacy while giving officers role-specific operational tools.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/40">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase mb-1">
                Role 1: Smallholder Farmer
              </div>
              <h5 className="font-bold text-white text-sm">Self-Service Payment Portal</h5>
              <p className="text-xs text-slate-300 mt-2">
                • Strictly isolated: Sees ONLY their own record<br />
                • Real-time installment tracker (Installments 1 to 18)<br />
                • Clear Malayalam resolution instructions<br />
                • Nearest camp or Akshaya locator
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase mb-1">
                Role 2: Agriculture Officer
              </div>
              <h5 className="font-bold text-white text-sm">Krishi Bhavan Desk Desk</h5>
              <p className="text-xs text-slate-300 mt-2">
                • Full block triage & remediation queue<br />
                • Gemini AI SMS & Voice drafting<br />
                • Schedule India Post doorstep camps<br />
                • Digital audit logs & resolution sign-off
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-blue-500/40">
              <div className="text-xs font-mono font-bold text-blue-400 uppercase mb-1">
                Role 3: District Nodal / Lead Bank
              </div>
              <h5 className="font-bold text-white text-sm">Oversight & Escalations</h5>
              <p className="text-xs text-slate-300 mt-2">
                • Cross-department escalation desk<br />
                • Bank branch compliance scorecards<br />
                • Bulk PFMS revalidation batch exporter<br />
                • District Collector executive reporting
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-center text-xs text-slate-300">
            🔒 <strong className="text-white">Security Guarantee:</strong> Aadhaar numbers are masked to the last 4 digits (e.g. <code className="text-emerald-400">XXXX-XXXX-4921</code>) and all communications run over encrypted channels.
          </div>
        </div>
      ),
    },
    {
      id: 6,
      badge: 'TECH INNOVATION 1',
      title: 'In-Browser NIC SMS Simulator',
      subtitle: 'Complete 4-Stage Telecom Pipeline Simulation with Live Virtual Smartphone',
      theme: 'blue',
      speakerNotes:
        'To demonstrate telecommunications fidelity without relying on third-party mobile network delays during judging, we created an In-Browser National Informatics Centre (NIC) SMS Gateway Simulator. It replicates the full government pipeline: TRAI DLT scrubbing, NIC central SMS hub queuing, cellular BTS transmission, and handset delivery reports, with a live virtual dual-SIM smartphone.',
      takeaway: 'Full-stack government telecom simulation proves end-to-end delivery feasibility.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white">4-Stage Government Telecom Pipeline</h4>
            
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <div className="text-xs font-bold text-white">TRAI DLT Scrubbing Engine</div>
                <div className="text-[11px] text-slate-400">Validates Principal Entity ID `140155729000003` & Template ID</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <div className="text-xs font-bold text-white">NIC National SMS Hub</div>
                <div className="text-[11px] text-slate-400">Prioritizes Service Implicit / Citizen Alerts over commercial traffic</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <div className="text-xs font-bold text-white">BSNL / Airtel BTS Cellular Tower</div>
                <div className="text-[11px] text-slate-400">Simulates RF signal strength, cellular routing, and transmission latency</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <div className="text-xs font-bold text-white">Handset Delivery Report (DLR)</div>
                <div className="text-[11px] text-slate-400">Emulates instant push notification to farmer phone with header `KL-GOVAGR`</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-emerald-400">● LIVE SIMULATOR PREVIEW</span>
              <span className="text-[10px] text-slate-400">Dual-SIM (BSNL 4G / Jio)</span>
            </div>
            <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700/80 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-white">KL-GOVAGR</span>
                <span>Just Now</span>
              </div>
              <p className="text-xs text-emerald-300 font-sans leading-relaxed">
                പ്രിയ സുരേഷ് കെ, നിങ്ങളുടെ PM-KISAN അക്കൗണ്ടിൽ ആധാർ ലിങ്ക് ചെയ്തിട്ടില്ല. ദയവായി തൊട്ടടുത്ത പോസ്റ്റ് ഓഫീസിലോ അക്ഷയ കേന്ദ്രത്തിലോ പോയി NPCI മാപ്പിംഗ് പൂർത്തിയാക്കുക. — കൃഷി ഭവൻ തൃശൂർ
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                DLT ID: 110716182939 • Ref: DBT-2026-9812
              </div>
            </div>
            <div className="text-center text-[11px] text-slate-400">
              Also connects directly to Twilio, Vonage, and TextBee SIM gateways!
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      badge: 'TECH INNOVATION 2',
      title: 'Google Gemini 2.5 Flash AI Engine',
      subtitle: 'Real-Time Bilingual Malayalam & English AI Tailoring and Voice Synthesis',
      theme: 'emerald',
      speakerNotes:
        'Through the live Google Gemini 2.5 Flash API integration, DBT-GUARD dynamically drafts hyper-personalized Malayalam notifications that explain the exact error code in simple words, and generates speech scripts for automated IVR voice calls for elderly or non-literate farmers.',
      takeaway: 'State-of-the-art Generative AI ensures 100% linguistic accessibility for rural farmers.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">✨</span>
                <h5 className="font-bold text-white text-sm">Dynamic Malayalam SMS Generator</h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gemini takes technical error strings like <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">ERR_NPCI_MAP_INACT_04</code> and drafts culturally appropriate, polite, actionable Malayalam instructions with specific local help centers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-teal-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-teal-400 text-lg">🎙️</span>
                <h5 className="font-bold text-white text-sm">Automated IVR Voice Synthesis</h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates spoken audio scripts read in warm, natural Malayalam tone during automated outbound calls, ensuring elderly and non-literate beneficiaries understand every step.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">🧠</span>
                <h5 className="font-bold text-white text-sm">Krishi Bhavan Officer Copilot</h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assists desk officers with instant policy guidance, circular lookups, and appeal drafting for complicated joint patta or land succession cases.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-emerald-400">⚡ LIVE GEMINI API RESPONSE</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">200 OK • 320ms</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-mono">Prompt: "Generate Malayalam SMS for E01 NPCI Inactive for Suresh K"</div>
              <div className="p-3 bg-slate-800 rounded-lg text-emerald-300 font-sans leading-relaxed">
                "നമസ്കാരം സുരേഷ് കെ, കൃഷി ഭവൻ തൃശൂരിൽ നിന്നുള്ള അറിയിപ്പ്: നിങ്ങളുടെ PM-KISAN 16-ാം ഗഡു ബാങ്ക് അക്കൗണ്ടിൽ ആധാർ മാപ്പിംഗ് ഇല്ലാത്തതിനാൽ തടസ്സപ്പെട്ടു. ദയവായി ആധാർ കാർഡുമായി അടുത്തുള്ള പോസ്റ്റ് ഓഫീസിലോ അക്ഷയ കേന്ദ്രത്തിലോ എത്തി ഉടൻ മാപ്പിംഗ് ചെയ്യുക."
              </div>
              <div className="text-[11px] text-slate-400 italic">
                ✓ Character count: 142 chars (Within single SMS 160-char credit limit)
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      badge: 'LIFECYCLE & SLA TRACKING',
      title: 'From 42 Days Down to 48 Hours',
      subtitle: 'The 4-Step Closed-Loop Remediation Lifecycle',
      theme: 'amber',
      speakerNotes:
        'Here is the complete remediation lifecycle. When PFMS rejects a payment, DBT-GUARD immediately triggers Step 1: AI Triage. Step 2 is Outbound Vernacular Alert via SMS and IVR. Step 3 is Action Verification where the farmer or mobile IPPB postman seeds Aadhaar. Step 4 is Automated PFMS Revalidation and Disbursal.',
      takeaway: 'Deterministic 4-step lifecycle guarantees zero cases fall through bureaucratic cracks.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border-t-4 border-rose-500 space-y-2">
              <div className="text-xs font-mono text-rose-400 font-bold">STAGE 1 • 0-2 HRS</div>
              <h5 className="font-bold text-white text-sm">PFMS Rejection & Ingestion</h5>
              <p className="text-xs text-slate-300">
                Daily batch exception CSV/API auto-ingested. Error normalized, risk score computed, case created in officer queue.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border-t-4 border-amber-500 space-y-2">
              <div className="text-xs font-mono text-amber-400 font-bold">STAGE 2 • 2-4 HRS</div>
              <h5 className="font-bold text-white text-sm">Vernacular Outbound Alert</h5>
              <p className="text-xs text-slate-300">
                Gemini generates bilingual Malayalam SMS & IVR phone call. Farmer alerted on feature phone with specific action steps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border-t-4 border-blue-500 space-y-2">
              <div className="text-xs font-mono text-blue-400 font-bold">STAGE 3 • 24-36 HRS</div>
              <h5 className="font-bold text-white text-sm">Field Action & IPPB Camp</h5>
              <p className="text-xs text-slate-300">
                Farmer attends doorstep Post Office camp or bank branch. Aadhaar NPCI mandate or e-KYC completed biometrically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border-t-4 border-emerald-500 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-bold">STAGE 4 • 48 HRS</div>
              <h5 className="font-bold text-white text-sm">Revalidation & Disbursement</h5>
              <p className="text-xs text-slate-300">
                DBT-GUARD runs automated re-check ping. Clean batch exported to PFMS. ₹2,000 successfully credited to farmer.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-white">Active SLA Enforcement:</strong> Any case approaching 72 hours triggers an escalation alert to the District Nodal Officer.
            </div>
            <div className="text-slate-400 font-mono">
              Audit-Trail Timestamping: 100% Tamper-Evident Logs
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      badge: 'IMPACT & PILOT METRICS',
      title: 'Quantified Pilot Results',
      subtitle: 'Demonstrated Transformation Across 1,420 Beneficiaries in Thrissur District',
      theme: 'emerald',
      speakerNotes:
        'The numbers speak for themselves. In our pilot benchmark in Thrissur across 1,420 beneficiary records: Average resolution time plummeted from 42 days down to 38.6 hours. Footfall at Krishi Bhavan dropped by 84%. Notification reach jumped from 27% to 98.2%. And ₹14.8 Crores in trapped funds were successfully unlocked.',
      takeaway: 'Proven 96% reduction in resolution turnaround with 7x faster capital release.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-5 text-center">
              <div className="text-3xl md:text-4xl font-black text-emerald-400">96%</div>
              <div className="text-xs font-bold text-white mt-1">Faster Resolution</div>
              <div className="text-[11px] text-slate-400 mt-1">42 days → 38.6 hours</div>
            </div>

            <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-5 text-center">
              <div className="text-3xl md:text-4xl font-black text-amber-400">84%</div>
              <div className="text-xs font-bold text-white mt-1">Footfall Reduction</div>
              <div className="text-[11px] text-slate-400 mt-1">180 visits/day → 28 visits/day</div>
            </div>

            <div className="bg-slate-800/80 border border-teal-500/40 rounded-2xl p-5 text-center">
              <div className="text-3xl md:text-4xl font-black text-teal-400">98.2%</div>
              <div className="text-xs font-bold text-white mt-1">Notification Reach</div>
              <div className="text-[11px] text-slate-400 mt-1">Up from 27% sporadic postal letters</div>
            </div>

            <div className="bg-slate-800/80 border border-blue-500/40 rounded-2xl p-5 text-center">
              <div className="text-3xl md:text-4xl font-black text-blue-400">₹14.8 Cr</div>
              <div className="text-xs font-bold text-white mt-1">Trapped Funds Released</div>
              <div className="text-[11px] text-slate-400 mt-1">Directly credited to smallholders</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white text-sm">Agriculture Extension Officer Feedback:</div>
            <p className="italic text-slate-400">
              "Earlier, Monday mornings saw over 60 angry farmers standing in queue asking why their money bounced. With DBT-GUARD’s proactive SMS and Post Office camps, farmers arrive already informed with their Aadhaar and passbook, or get it resolved before even coming to our office."
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      badge: 'FUTURE ROADMAP & SCALABILITY',
      title: 'Pan-India Scalability & Roadmap',
      subtitle: 'Building the National Blueprint for Direct Benefit Transfer Integrity',
      theme: 'purple',
      speakerNotes:
        'DBT-GUARD is not just for Thrissur or PM-KISAN. It is an open, modular architecture that integrates seamlessly with AgriStack, DigiLocker, and state land records. It is ready for pan-India deployment across all 28 states and union territories for any DBT scheme — including Rythu Bandhu, Kalia, and Subhiksha Keralam.',
      takeaway: 'Plug-and-play architecture ready for nationwide adoption across all central and state DBT programs.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="text-2xl">🏛️</div>
            <h4 className="text-base font-bold text-white">National Agri-Stack Integration</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct RESTful adapters for National Farmer Registry, IDEA (India Digital Ecosystem for Agriculture), and State RoR databases (Ente Bhoomi, Bhulekh).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="text-2xl">📬</div>
            <h4 className="text-base font-bold text-white">Doorstep Postal Micro-ATM Webhook</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated trigger to India Post Gramin Dak Sevaks (GDS) with handheld biometric micro-ATMs to seed Aadhaar directly at bedridden or elderly farmers’ doorsteps.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="text-2xl">🌐</div>
            <h4 className="text-base font-bold text-white">Multi-Lingual 22 Languages</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemini AI localization adapter configured to instantly support Hindi, Tamil, Telugu, Kannada, Bengali, Odia, and Punjabi with identical deterministic error mappings.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 11,
      badge: 'JURY DEFENSE & FAQ',
      title: 'Technical Q&A Defense',
      subtitle: 'Anticipating Critical Governance, Security, and Engineering Questions',
      theme: 'slate',
      speakerNotes:
        'Here are the most common questions evaluators ask: How do you handle DPDP data privacy? How does the simulator transition to production? How do illiterate farmers interact? How does this integrate with PFMS? We have concrete, validated answers for each.',
      takeaway: 'Comprehensive governance, privacy compliance, and production readiness.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-emerald-400">Q1: How is farmer privacy protected under DPDP Act 2023?</div>
            <p className="text-slate-300 leading-relaxed">
              All Aadhaar numbers are masked to 4 digits. The farmer role enforces cryptographic tenant isolation — farmers cannot query or inspect any other citizen’s records. All network traffic is TLS encrypted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-blue-400">Q2: How does the NIC Simulator translate to real deployment?</div>
            <p className="text-slate-300 leading-relaxed">
              The simulator strictly adheres to the CDAC Mobile Seva / NIC DLT specification. We also have live cloud endpoints for Twilio and TextBee. Switching between simulation and live telecom is a single config toggle.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-amber-400">Q3: How do non-literate or elderly farmers benefit?</div>
            <p className="text-slate-300 leading-relaxed">
              Through the Automated Voice Assist (IVR) module. Gemini synthesizes clear spoken Malayalam phone scripts delivered via automated calls, telling them which office and documents are required.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-purple-400">Q4: Is any modification needed on the central PFMS server?</div>
            <p className="text-slate-300 leading-relaxed">
              Zero! DBT-GUARD operates as a non-invasive middleware. It ingests standard PFMS rejection exception dumps and exports standard re-validated batch files ready for 1-click re-ingestion.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      badge: 'CONCLUSION • CALL TO ACTION',
      title: 'Empowering Every Indian Farmer',
      subtitle: 'Turning Government Payment Promises into Guaranteed Delivery',
      theme: 'emerald',
      speakerNotes:
        'In conclusion: India has built the world’s largest Direct Benefit Transfer infrastructure. Now, DBT-GUARD provides the missing last-mile intelligence layer ensuring no farmer loses their livelihood due to a technical banking glitch. We thank the jury for your time and welcome your live evaluation!',
      takeaway: 'DBT-GUARD bridges the last mile: from banking failure to guaranteed agricultural empowerment.',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">
            🌾
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white max-w-2xl leading-tight">
            Guaranteed DBT Delivery for the Hands That Feed the Nation
          </h2>

          <p className="text-base md:text-lg text-slate-300 max-w-xl font-light">
            DBT-GUARD transforms digital government payments from a black box into a transparent, farmer-first delivery promise.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2"
            >
              <span>Explore Live Platform</span>
              <span>→</span>
            </Link>
            <Link
              to="/payment-status"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition"
            >
              Farmer Self-Service Portal
            </Link>
          </div>

          <div className="text-xs text-slate-500 font-mono pt-4">
            DBT-GUARD v2.5.0 • Krishi Bhavan Thrissur • Dept of Agriculture, Govt of Kerala
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        setCurrentSlide(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullScreen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  const copySlideOutline = () => {
    const outlineText = `Slide ${slide.id}: ${slide.title}\n${slide.subtitle}\n\nTakeaway: ${slide.takeaway}\n\nSpeaker Notes:\n${slide.speakerNotes}`;
    navigator.clipboard.writeText(outlineText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 overflow-hidden' : ''
      }`}
    >
      {/* Top Presentation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <span>←</span>
            <span>Back to DBT-GUARD</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Pitch Deck & Presentation Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
              showNotes
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Speaker Notes (Hotkey: N)"
          >
            <span>🗣️</span>
            <span>{showNotes ? 'Hide Notes' : 'Speaker Notes'}</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={copySlideOutline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1.5"
            title="Copy current slide text for PPT/Canva"
          >
            <span>📋</span>
            <span>{copied ? 'Copied!' : 'Copy Slide'}</span>
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            title="Toggle Fullscreen (Hotkey: F)"
          >
            {isFullScreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Slide Header */}
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {slide.badge} • SLIDE {slide.id} OF {slides.length}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {slide.title}
          </h2>
          <p className="text-sm text-slate-400 font-light max-w-3xl">
            {slide.subtitle}
          </p>
        </div>

        {/* Slide Body Canvas */}
        <div className="my-auto py-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur">
            {slide.content}
          </div>
        </div>

        {/* Speaker Notes Drawer */}
        {showNotes && (
          <div className="mt-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-2">
                <span>🗣️</span>
                <span>Speaker Script / Presenter Talking Points:</span>
              </span>
              <span className="font-mono text-slate-400">Tip: Press [Space] or [→] for next slide</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed font-sans text-xs">
              "{slide.speakerNotes}"
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-amber-500/20">
              💡 Key Takeaway: {slide.takeaway}
            </div>
          </div>
        )}

        {/* Navigation & Progress Footer */}
        <footer className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-5 py-2 rounded-xl bg-emerald-600 border border-emerald-500 text-white font-bold hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="hidden md:flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-7 bg-emerald-400'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to Slide ${s.id}: ${s.title}`}
              />
            ))}
          </div>

          <div className="font-mono text-slate-400">
            Slide <span className="text-white font-bold">{currentSlide + 1}</span> of {slides.length}
          </div>
        </footer>
      </main>
    </div>
  );
}
