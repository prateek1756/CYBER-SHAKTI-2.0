import React, { useState, useEffect } from 'react';
import { Upload, ShieldAlert, Download, Activity, Search, X, Crosshair, BarChart3, Database, Cpu, Zap, Play, Pause } from 'lucide-react';
import GraphView from './GraphView';
import StatsDashboard, { Account } from './StatsDashboard';
import TrendChart from './TrendChart';

// Simplified Error Boundary for safety
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Captured Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-black text-red-500 flex flex-col items-center justify-center p-10 font-mono rounded-2xl border border-red-500/20">
          <ShieldAlert size={48} className="mb-4" />
          <h1 className="text-xl font-bold mb-2">CRITICAL UI FAILURE</h1>
          <p className="text-slate-400 text-center text-xs">The behavioral engine encountered a runtime exception. Check the console.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-500/20 border border-red-500/50 text-white rounded-lg text-xs uppercase font-bold tracking-wider hover:bg-red-500/40 transition-all">RELOAD SYSTEM</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MuleScannerContent: React.FC = () => {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ status: '', percent: 0 });
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationData, setSimulationData] = useState<any>(null);

  // Simulation Loop
  useEffect(() => {
    let interval: any;
    if (isSimulating && data) {
      interval = setInterval(() => {
        setSimulationIndex(prev => {
          const next = prev + 1;
          if (next >= 100) {
            setIsSimulating(false);
            return 100;
          }
          return next;
        });
      }, 100 / simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [isSimulating, data, simulationSpeed]);

  // Compute simulation data
  useEffect(() => {
    if (!data || !isSimulating) {
      setSimulationData(data);
      return;
    }

    const totalNodes = data.graph_data.nodes.length;
    const visibleNodeCount = Math.floor((simulationIndex / 100) * totalNodes);

    const visibleNodes = data.graph_data.nodes.slice(0, Math.max(1, visibleNodeCount));
    const visibleNodeIds = new Set(visibleNodes.map((n: any) => n.id));

    const visibleEdges = data.graph_data.edges.filter((e: any) =>
      visibleNodeIds.has(e.from_node) && visibleNodeIds.has(e.to_node)
    );

    setSimulationData({
      ...data,
      graph_data: {
        nodes: visibleNodes,
        edges: visibleEdges
      }
    });
  }, [data, simulationIndex, isSimulating]);

  const handleAIAnalyze = async (accountId: string) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const response = await fetch(`/api/mule/ai-analyze/${accountId}`, { method: 'POST' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI Analysis Failed (${response.status}): ${text.substring(0, 50)}`);
      }
      const result = await response.json();
      setAiAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const processAnalysisStream = async (response: Response) => {
    if (!response.body) {
      throw new Error("Empty response body from forensic engine.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '');
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                setError(parsed.error);
                setLoading(false);
                return;
              }
              if (parsed.complete) {
                setData(parsed);
                setProgress({ status: 'Analysis Complete', percent: 100 });
              } else {
                setProgress({ status: parsed.status, percent: (parsed.progress || 0) * 100 });
              }
            } catch (e) {
              console.error("JSON parse error during stream:", e);
            }
          }
        }
      }
    } catch (streamErr: any) {
      console.error("Stream reader error:", streamErr);
      setError("Connection Interrupted: The forensic stream was disconnected.");
    }
  };

  const handleGenerateDemo = async () => {
    setLoading(true);
    setError(null);
    setProgress({ status: 'Synthesizing Demo Dataset...', percent: 5 });
    try {
      const response = await fetch('/api/mule/generate-demo', { method: 'POST' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Demo Generation Failed (${response.status}): ${text.substring(0, 100)}`);
      }
      await processAnalysisStream(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;


    setLoading(true);
    setError(null);
    setProgress({ status: 'Initializing Engine...', percent: 5 });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/mule/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `Upload failed (${response.status})`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text.substring(0, 100) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      await processAnalysisStream(response);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!data) return;

    const exportData = {
      suspicious_accounts: data.suspicious_accounts.map((acc: any) => ({
        account_id: acc.account_id,
        suspicion_score: acc.suspicion_score,
        detected_patterns: acc.detected_patterns,
        ring_id: acc.ring_id
      })),
      fraud_rings: data.fraud_rings.map((ring: any) => ({
        ring_id: ring.ring_id,
        member_accounts: ring.member_accounts,
        pattern_type: ring.pattern_type,
        risk_score: ring.risk_score
      })),
      summary: {
        total_accounts_analyzed: data.summary.total_accounts_analyzed,
        suspicious_accounts_flagged: data.summary.suspicious_accounts_flagged,
        fraud_rings_detected: data.summary.fraud_rings_detected,
        processing_time_seconds: data.summary.processing_time_seconds
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money_muling_analysis_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Control panel at top of tab */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-[#080c14]/40 border border-white/5 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs tracking-widest font-bold uppercase">
            <Zap size={12} className="fill-current" />
            <span>Topological Forensic Sweep</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
            Ingest structured ledger logs (CSV) to analyze circular U-turns, smurfing, and pass-through shells.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold rounded-xl cursor-pointer transition-all active:scale-[0.97] text-xs font-tech uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Upload size={14} className={loading ? 'animate-bounce' : ''} />
            <span>{loading ? 'Processing...' : 'Upload Statement'}</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleUpload} disabled={loading} />
          </label>

          <button
            onClick={handleGenerateDemo}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-tech active:scale-[0.97]"
          >
            <Database size={14} />
            <span>Load Mock Network</span>
          </button>

          {data && (
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1b2d]/60 border border-teal-500/20 hover:bg-[#0a1b2d]/90 text-teal-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-tech active:scale-[0.97]"
            >
              <Download size={14} />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress logs */}
      {loading && (
        <div className="glass-panel p-8 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#080c14]/40">
          <Cpu size={36} className="text-teal-400 mb-4 animate-pulse" />
          <h3 className="text-xs font-bold font-tech tracking-widest text-teal-400 uppercase">{progress.status}</h3>
          <div className="w-full max-w-xs h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-teal-400 transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Results UI */}
      {data && !loading && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Statistics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Analytic Scope', value: data.summary.total_accounts_analyzed, sub: 'ACCOUNTS', icon: <Database size={12} /> },
              { label: 'Ingested', value: data.summary.total_transactions, sub: 'TRANSACTIONS', icon: <Activity size={12} /> },
              { label: 'Flagged Mules', value: data.summary.suspicious_accounts_flagged, color: 'text-red-500', sub: 'THREATS', icon: <ShieldAlert size={12} /> },
              { label: 'Clusters', value: data.summary.fraud_rings_detected, sub: 'RINGS DETECTED', icon: <Crosshair size={12} /> },
              { label: 'Avg Risk', value: `${data.summary.avg_risk_score}%`, color: 'text-orange-400', sub: 'LOAD FACTOR', icon: <BarChart3 size={12} /> },
              { label: 'Execution', value: `${data.summary.processing_time_seconds.toFixed(2)}s`, sub: 'LATENCY', icon: <Cpu size={12} /> }
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel p-4 bg-[#080c14]/40 border border-white/5 rounded-xl transition-all hover:translate-y-[-2px]">
                <div className="flex items-center gap-1.5 text-slate-500 text-[8px] font-black tracking-widest mb-2 uppercase font-tech">
                  {stat.icon} {stat.label}
                </div>
                <div className={`text-2xl font-extrabold tracking-tighter font-data ${stat.color || 'text-white'}`}>{stat.value}</div>
                <div className="text-[8px] text-slate-600 mt-1 font-bold tracking-widest font-tech">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Graph View Component */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 font-tech">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Forensic Graph Topology
              </h2>

              <div className="flex flex-wrap items-center gap-4 bg-[#080c14]/30 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (simulationIndex >= 100) setSimulationIndex(0);
                      setIsSimulating(!isSimulating);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${isSimulating ? 'bg-red-500/10 text-red-500' : 'bg-teal-500/10 text-teal-400'}`}
                  >
                    {isSimulating ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-teal-400 transition-all duration-300"
                      style={{ width: `${simulationIndex}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 w-8 text-right">
                    {simulationIndex}%
                  </span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex border border-white/5 rounded-lg overflow-hidden">
                  {[1, 2, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setSimulationSpeed(s)}
                      className={`px-2 py-0.5 text-[8px] font-black uppercase transition-all ${simulationSpeed === s ? 'bg-teal-500 text-slate-900' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <GraphView
              data={simulationData || data}
              onSelectNode={(acc) => {
                setSelectedAcc(acc);
                setAiAnalysis(null);
              }}
              highlightNode={searchQuery.length > 3 ? searchQuery : null}
            />
          </div>

          {/* Search/Filters */}
          <div className="flex gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search account, ring (e.g. CYC, SINK, RING)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 vault-input rounded-xl text-xs text-slate-200 focus:outline-none bg-[#080c14]/40"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <div className="flex items-center gap-3 px-4 bg-[#080c14]/40 border border-white/5 rounded-xl">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-tech">Risk threshold: {riskFilter}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskFilter}
                onChange={(e) => setRiskFilter(parseInt(e.target.value))}
                className="w-24 accent-teal-400"
              />
            </div>
          </div>

          {/* Leaderboard Stats Dashboard */}
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 font-tech">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Forensic Ledger
            </h2>
            <StatsDashboard
              accounts={data.suspicious_accounts.filter((a: any) =>
                a.suspicion_score >= riskFilter && (
                  a.account_id.includes(searchQuery) ||
                  a.detected_patterns.some((p: any) => p.includes(searchQuery.toLowerCase()))
                )
              )}
              rings={data.fraud_rings.filter((r: any) =>
                r.risk_score >= riskFilter && (
                  r.ring_id.includes(searchQuery) ||
                  r.member_accounts.some((m: any) => m.includes(searchQuery))
                )
              )}
              onSelect={(acc) => {
                setSelectedAcc(acc);
                setAiAnalysis(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Default state */}
      {!data && !loading && (
        <div className="w-full py-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center px-6 bg-[#080c14]/10 group">
          <Upload size={48} className="text-slate-600 mb-6 group-hover:scale-105 group-hover:text-teal-400 transition-all duration-500" />
          <h2 className="text-lg font-bold tracking-wider mb-2 font-tech uppercase text-slate-300">Forensics Database Standby</h2>
          <p className="text-slate-500 text-xs max-w-sm font-sans leading-relaxed">
            Ingest structured ledger statement CSVs to trace circular transaction laundering loops and shell-chains. Use "Load Mock Network" for a test demonstration.
          </p>
        </div>
      )}

      {/* Account Details Report Drawer Modal */}
      {selectedAcc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
          <div className="glass-panel max-w-2xl w-full p-0 relative border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] bg-[#030611] rounded-2xl">
            <button
              onClick={() => {
                setSelectedAcc(null);
                setAiAnalysis(null);
              }}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all z-[110]"
            >
              <X size={16} />
            </button>

            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar mt-4">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <div className={`p-4 rounded-2xl shrink-0 ${selectedAcc.suspicion_score > 70 ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-orange-500/10 border border-orange-500/20 text-orange-500'}`}>
                  <ShieldAlert size={32} />
                  <div className="text-center mt-2 text-[8px] font-black opacity-50 font-tech">FLAGGED</div>
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-extrabold font-mono tracking-tighter break-all">{selectedAcc.account_id}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAcc.detected_patterns.map(tag => (
                      <span key={tag} className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400 font-bold uppercase tracking-wider font-tech">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-black opacity-30 tracking-widest mb-1 uppercase font-tech">Suspicion Index</div>
                  <div className={`text-4xl font-extrabold tracking-tighter font-data ${selectedAcc.suspicion_score > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                    {selectedAcc.suspicion_score}<span className="text-lg opacity-40 text-slate-400">%</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-black opacity-30 tracking-widest mb-1 uppercase font-tech">Topology Class</div>
                  <div className="text-base font-bold flex items-center gap-2 mt-1.5 font-tech">
                    {selectedAcc.is_legitimate_hub ? <Activity size={16} className="text-teal-400" /> : <Zap size={16} className="text-red-500" />}
                    {selectedAcc.is_legitimate_hub ? 'Verified Hub' : 'Hostile Node'}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="text-[9px] font-black opacity-30 tracking-widest mb-2 uppercase font-tech">Behavioral Heuristics Summary</div>
                <p className="text-slate-400 leading-relaxed font-light italic border-l-2 border-slate-700 pl-4 text-sm font-sans">
                  "{selectedAcc.explanation}"
                </p>
              </div>

              <div className="mb-8">
                <div className="text-[9px] font-black opacity-30 tracking-widest mb-3.5 uppercase font-tech">Temporal Velocity Metrics</div>
                <TrendChart transactions={selectedAcc.recent_transactions} />
              </div>

              {/* AI Forensic Report Section */}
              <div className="mb-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[9px] font-black text-teal-400 tracking-widest uppercase flex items-center gap-1.5 font-tech">
                    <Cpu size={12} className="animate-pulse" /> AI Laboratory
                  </div>
                  <button
                    onClick={() => handleAIAnalyze(selectedAcc.account_id)}
                    disabled={aiLoading}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aiLoading ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]'}`}
                  >
                    {aiLoading ? 'Analyzing...' : 'Generate AI Deep Dive'}
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="glass-panel p-5 border border-teal-500/20 bg-teal-500/[0.01] animate-in zoom-in-95 duration-500 rounded-xl">
                    <div className="flex items-center gap-1.5 text-teal-400 text-[10px] font-bold mb-3 uppercase font-tech">
                      <ShieldAlert size={12} /> Forensic Intelligence Report
                    </div>
                    <p className="text-slate-200 text-sm font-bold leading-relaxed mb-4">
                      {aiAnalysis.forensic_summary}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {aiAnalysis.behavioral_flags.map((flag: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-[8px] font-black text-slate-500 uppercase mb-1 font-tech">{flag.type} Signal</div>
                          <div className="text-[10px] text-slate-300 font-medium font-sans">{flag.detail}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="text-[8px] font-black text-red-500 uppercase mb-1 font-tech">Protocol Decision</div>
                      <div className="text-xs font-bold text-red-400">{aiAnalysis.recommendation}</div>
                    </div>
                    <div className="mt-3 text-right">
                      <span className="text-[8px] font-black text-slate-500 uppercase font-tech">
                        Topology Risk Score: {((aiAnalysis.topology_risk_score ?? aiAnalysis.prediction_confidence ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  !aiLoading && (
                    <div className="p-8 border border-dashed border-white/5 rounded-xl text-center bg-[#080c14]/20">
                      <Cpu size={24} className="mx-auto text-slate-700 mb-2" />
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-tech">Scan Node to Compile Report</p>
                    </div>
                  )
                )}

                {aiLoading && (
                  <div className="p-8 border border-teal-500/20 rounded-xl text-center glass-panel bg-teal-500/[0.01]">
                    <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[9px] text-teal-400 font-black uppercase tracking-widest animate-pulse font-tech">Running Neural Network Audit...</p>
                  </div>
                )}
              </div>

              {selectedAcc.recent_transactions && selectedAcc.recent_transactions.length > 0 && (
                <div className="space-y-4">
                  <div className="text-[9px] font-black opacity-30 tracking-widest uppercase flex items-center gap-1.5 font-tech">
                    <BarChart3 size={12} /> Transactional History (Latest 10)
                  </div>
                  <div className="space-y-2">
                    {selectedAcc.recent_transactions.map((tx, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                        <div className="space-y-1">
                          <div className="text-[8px] font-bold font-mono opacity-20 tracking-tighter uppercase">{tx.transaction_id}</div>
                          <div className="text-xs font-bold font-mono">
                            <span className={tx.sender_id === selectedAcc.account_id ? 'text-red-400' : 'text-teal-400'}>
                              {tx.sender_id === selectedAcc.account_id ? 'DISBURSED TO' : 'RECEIVED FROM'}
                            </span>
                            {' '}
                            <span className="opacity-80 text-[10px] text-slate-300">
                              {tx.sender_id === selectedAcc.account_id ? tx.receiver_id : tx.sender_id}
                            </span>
                          </div>
                          <div className="text-[9px] opacity-20 font-medium font-data">{tx.timestamp}</div>
                        </div>
                        <div className="text-base font-black font-data text-white">
                          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MuleScanner() {
  return (
    <ErrorBoundary>
      <MuleScannerContent />
    </ErrorBoundary>
  );
}
