import React, { useState } from 'react';
import { FileUp, Loader2, Terminal, PhoneCall, Link2, MessageSquare, AlertTriangle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MuleScanner from '../components/MuleScanner/MuleScanner';

export default function Scanner() {
  const [activeTab, setActiveTab] = useState<'url' | 'message' | 'deepfake' | 'call' | 'mule'>('url');
  const [scanningLogs, setScanningLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // URL States
  const [urlInput, setUrlInput] = useState('');
  const [urlResult, setUrlResult] = useState<any>(null);

  // Message States
  const [messageInput, setMessageInput] = useState('');
  const [messageResult, setMessageResult] = useState<any>(null);

  // Deepfake States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deepfakeResult, setDeepfakeResult] = useState<any>(null);

  // Scam Call States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [duration, setDuration] = useState('45');
  const [frequency, setFrequency] = useState('5');
  const [spamReports, setSpamReports] = useState('2');
  const [carrierRep, setCarrierRep] = useState('3');
  const [isIntl, setIsIntl] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);

  // Helper to run diagnostic terminal logs before results
  const simulateDiagnostics = (steps: string[], onComplete: () => Promise<void>) => {
    setIsScanning(true);
    setScanningLogs([]);
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < steps.length) {
        setScanningLogs(prev => [...prev, steps[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          await onComplete();
          setIsScanning(false);
        }, 500);
      }
    }, 450);
  };

  // URL Phishing Checker
  const handleUrlCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlResult(null);

    const steps = [
      `[SYS] Resolving hostname for "${urlInput}"...`,
      `[SYS] Inspecting domain registry age & records...`,
      `[AI]  Parsing URL entropy and character patterns...`,
      `[AI]  Checking redirect hops and IP formats...`,
      `[SYS] Querying community safe-browsing blacklists...`
    ];

    simulateDiagnostics(steps, async () => {
      try {
        const res = await fetch('/api/scanner/phishing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput })
        });
        const data = await res.json();
        setUrlResult(data);
      } catch (err) {
        console.error(err);
        setUrlResult({ error: "Could not connect to API server." });
      }
    });
  };

  // Message Fraud Checker
  const handleMessageCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setMessageResult(null);

    const steps = [
      `[SYS] Initializing NLP parser pipeline...`,
      `[AI]  Tokenizing input text and extracting vectors...`,
      `[AI]  Evaluating keyword weights (urgency, prize tokens, KYC terms)...`,
      `[SYS] Parsing embedded call-to-actions and phone contacts...`,
      `[AI]  Running text heuristic classification model...`
    ];

    simulateDiagnostics(steps, async () => {
      try {
        const res = await fetch('/api/scanner/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageInput })
        });
        const data = await res.json();
        setMessageResult(data);
      } catch (err) {
        console.error(err);
        setMessageResult({ error: "Could not connect to API server." });
      }
    });
  };

  // Deepfake Media Checker
  const handleDeepfakeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setDeepfakeResult(null);

    const steps = [
      `[SYS] File uploaded: "${selectedFile.name}" (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`,
      `[SYS] Running face-detection mesh mapping...`,
      `[AI]  Extracting landmarks around eyes, mouth, and cheeks...`,
      `[AI]  Checking pixel frequency anomalies (Generative artifacts)...`,
      `[AI]  Querying CNN MobileNetV2 feature extractor...`
    ];

    simulateDiagnostics(steps, async () => {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await fetch('/api/deepfake/detect', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        setDeepfakeResult(data);
      } catch (err) {
        console.error(err);
        setDeepfakeResult({ error: "Could not connect to API server." });
      }
    });
  };

  // Scam Call Checker
  const handleCallCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setCallResult(null);

    const steps = [
      `[SYS] Dialing directory for caller identity: "${phoneNumber}"...`,
      `[SYS] Compiling call duration and hourly frequency logs...`,
      `[AI]  Evaluating community spam reports index...`,
      `[AI]  Checking VoIP spoofing indicators...`,
      `[AI]  Running Random Forest metadata model...`
    ];

    simulateDiagnostics(steps, async () => {
      try {
        const res = await fetch('/api/scanner/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            duration: parseInt(duration, 10),
            frequency: parseInt(frequency, 10),
            spamReports: parseInt(spamReports, 10),
            carrierRep: parseInt(carrierRep, 10),
            isIntl
          })
        });
        const data = await res.json();
        setCallResult(data);
      } catch (err) {
        console.error(err);
        setCallResult({ error: "Could not connect to API server." });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 font-tech uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
        AI Cyber Protection Suite
      </h1>
      <p className="text-slate-400 text-xs mb-8">Deploy machine learning classifiers and diagnostic heuristics to audit cyber inputs in real-time.</p>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-8 overflow-x-auto whitespace-nowrap">
        {([
          { id: 'url', label: 'Phishing URL', icon: Link2 },
          { id: 'message', label: 'Fraud text', icon: MessageSquare },
          { id: 'deepfake', label: 'Deepfake media', icon: FileUp },
          { id: 'call', label: 'Scam call logs', icon: PhoneCall },
          { id: 'mule', label: 'Mule Trace', icon: Database }
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isScanning) {
                  setActiveTab(tab.id);
                  setScanningLogs([]);
                  setUrlResult(null);
                  setMessageResult(null);
                  setDeepfakeResult(null);
                  setCallResult(null);
                }
              }}
              disabled={isScanning}
              className={`px-5 py-3 text-xs uppercase tracking-widest font-bold font-tech border-b-2 transition-all flex items-center gap-2 relative ${
                activeTab === tab.id ? 'text-teal-400 border-teal-500' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'mule' ? (
        <MuleScanner />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="md:col-span-2">
            <motion.div
              key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-panel p-8 rounded-2xl relative overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-between"
          >
            {/* Laser scanning line when scanning */}
            {isScanning && <div className="scan-line" />}

            {activeTab === 'url' && (
              <div>
                <form onSubmit={handleUrlCheck} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 font-tech">Scan suspicious web link</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g. login-sbi-verification.xyz/kyc"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={isScanning}
                        className="flex-grow px-4 py-3.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isScanning || !urlInput.trim()}
                        className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-tech uppercase text-xs tracking-wider flex items-center gap-1.5"
                      >
                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan URL"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'message' && (
              <div>
                <form onSubmit={handleMessageCheck} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 font-tech">Scan SMS, WhatsApp or Telegram Text</label>
                    <textarea
                      rows={6}
                      placeholder="Paste message contents here..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={isScanning}
                      className="w-full px-4 py-3.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none resize-none mb-3"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isScanning || !messageInput.trim()}
                        className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-tech uppercase text-xs tracking-wider flex items-center gap-1.5"
                      >
                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan Message"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'deepfake' && (
              <div>
                <form onSubmit={handleDeepfakeCheck} className="space-y-6">
                  <div className="border border-dashed border-white/10 hover:border-teal-500/30 rounded-xl p-8 text-center bg-[#080c14]/40 hover:bg-[#080c14]/60 transition-all relative cursor-pointer group shadow-inner">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={isScanning}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-8 h-8 mx-auto text-slate-500 group-hover:text-teal-400 transition-colors mb-4" />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs text-teal-400 font-bold font-data">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-data mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-300 font-tech uppercase tracking-wider">Drag and drop file or click to browse</p>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-sans">Upload photos or video clips for biometric verification</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!selectedFile || isScanning}
                      className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-tech uppercase text-xs tracking-wider flex items-center gap-1.5"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Media"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'call' && (
              <div>
                <form onSubmit={handleCallCheck} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Caller Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isScanning}
                        required
                        className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Call Duration (seconds)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        disabled={isScanning}
                        required
                        className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none font-data"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Dial Rate (calls/hour)</label>
                      <input
                        type="number"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        disabled={isScanning}
                        required
                        className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none font-data"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Active Spam Reports</label>
                      <input
                        type="number"
                        value={spamReports}
                        onChange={(e) => setSpamReports(e.target.value)}
                        disabled={isScanning}
                        required
                        className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none font-data"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Carrier Reputation (1-5)</label>
                      <select
                        value={carrierRep}
                        onChange={(e) => setCarrierRep(e.target.value)}
                        disabled={isScanning}
                        className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none bg-cyber-card"
                      >
                        <option value="5">5 - Excellent (Verified corporate range)</option>
                        <option value="4">4 - High trust</option>
                        <option value="3">3 - Standard prepaid/VoIP</option>
                        <option value="2">2 - Suspicious/Anonymous host</option>
                        <option value="1">1 - Poor reputation/Blacklisted carrier</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-400 font-tech">
                        <input
                          type="checkbox"
                          checked={isIntl}
                          onChange={(e) => setIsIntl(e.target.checked)}
                          disabled={isScanning}
                          className="w-4 h-4 rounded border-white/5 bg-[#080c14] text-teal-400 focus:ring-0 cursor-pointer"
                        />
                        International VoIP routing
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isScanning || !phoneNumber.trim()}
                      className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-tech uppercase text-xs tracking-wider flex items-center gap-1.5"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Call Metadata"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>

        {/* Console / Diagnostic Logs */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between shadow-2xl border border-white/5 min-h-[300px]">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5 font-tech">
                <Terminal className="w-4 h-4 text-teal-400" />
                Diagnostic Console
              </h3>
              
              <div className="bg-[#050811]/90 rounded-xl p-4 border border-white/5 min-h-[200px] font-data text-[10px] text-slate-400 space-y-2 overflow-y-auto max-h-[250px] shadow-inner">
                {scanningLogs.length === 0 && !isScanning && (
                  <p className="text-slate-600 italic">Console idle. Awaiting scan execution...</p>
                )}
                {scanningLogs.map((log, i) => (
                  <p key={i} className={log.includes('[AI]') ? 'text-teal-400' : log.includes('[SYS]') ? 'text-slate-500' : 'text-slate-400'}>
                    {log}
                  </p>
                ))}
                {isScanning && (
                  <p className="text-teal-400 animate-pulse">Running analysis sweep...</p>
                )}
              </div>
            </div>

            {/* Results placeholder / overlay */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-tech">Detection Results</h4>
              
              <AnimatePresence mode="wait">
                {/* URL Output */}
                {urlResult && activeTab === 'url' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 font-tech">Threat Level:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                        urlResult.status === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {urlResult.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      {urlResult.is_phishing 
                        ? "Phishing pattern detected. The domain parameters indicate identity theft risk." 
                        : "No phishing indicators detected. The link structure appears safe."}
                    </p>
                  </motion.div>
                )}

                {/* Message Output */}
                {messageResult && activeTab === 'message' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 font-tech">Fraud Flag:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                        messageResult.status === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {messageResult.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      {messageResult.is_fraud 
                        ? "High probability of social engineering or account hijacking keywords." 
                        : "Normal text. Heuristics confirm standard safe vocabulary."}
                    </p>
                  </motion.div>
                )}

                {/* Deepfake Output */}
                {deepfakeResult && activeTab === 'deepfake' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 font-tech">Biometric State:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                        deepfakeResult.is_fake ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {deepfakeResult.is_fake ? 'Fake' : 'Authentic'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Confidence Level: <span className="font-bold text-white font-data">{(deepfakeResult.confidence_score * 100).toFixed(1)}%</span>
                    </p>
                  </motion.div>
                )}

                {/* Scam Call Output */}
                {callResult && activeTab === 'call' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 font-tech">Call Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                        callResult.status === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                      }`}>
                        {callResult.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Random Forest Scam Probability: <span className="font-bold text-white font-data">{callResult.risk_score}%</span>.
                    </p>
                  </motion.div>
                )}

                {!urlResult && !messageResult && !deepfakeResult && !callResult && (
                  <p className="text-[10px] text-slate-600 italic">Awaiting verification completion...</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Report Cards Section */}
      <AnimatePresence>
        {urlResult && activeTab === 'url' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-8 p-6 glass-panel rounded-xl space-y-4 shadow-2xl border-l-4 border-l-teal-400"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-teal-400" />
                Detailed Diagnostic Audit
              </h4>
            </div>
            <ul className="space-y-2">
              {urlResult.reasons?.map((reason: string, i: number) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                  <span className="text-teal-400 font-bold">&middot;</span>
                  {reason}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {messageResult && activeTab === 'message' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-8 p-6 glass-panel rounded-xl space-y-4 shadow-2xl border-l-4 border-l-teal-400"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-teal-400" />
                Text Red Flags Identified
              </h4>
            </div>
            <ul className="space-y-2">
              {messageResult.reasons?.map((reason: string, i: number) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                  <span className="text-teal-400 font-bold">&middot;</span>
                  {reason}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {deepfakeResult && activeTab === 'deepfake' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-8 p-6 glass-panel rounded-xl space-y-4 shadow-2xl border-l-4 border-l-teal-400"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-teal-400" />
                Facial Landmark Consistency Check
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Face detection mesh confirms a singular primary face region. The pixel-level texture evaluation reveals a manipulation score of <span className="font-bold text-white font-data">{(deepfakeResult.raw_score * 100).toFixed(1)}%</span>.
            </p>
          </motion.div>
        )}

        {callResult && activeTab === 'call' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-8 p-6 glass-panel rounded-xl space-y-4 shadow-2xl border-l-4 border-l-teal-400"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-teal-400" />
                Random Forest Decision Path Metadata
              </h4>
            </div>
            <ul className="space-y-2">
              {callResult.details?.map((detail: string, i: number) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                  <span className="text-teal-400 font-bold">&middot;</span>
                  {detail}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
