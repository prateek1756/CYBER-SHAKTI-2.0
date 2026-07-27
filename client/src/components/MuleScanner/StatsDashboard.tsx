import React from 'react';
import { ShieldAlert, Users, TrendingUp, ChevronRight, Scale } from 'lucide-react';

export interface Account {
  account_id: string;
  suspicion_score: number;
  detected_patterns: string[];
  is_legitimate_hub: boolean;
  explanation: string;
  ring_id: string;
  recent_transactions: any[];
}

export interface Ring {
  ring_id: string;
  member_accounts: string[];
  pattern_type: string;
  risk_score: number;
}

interface StatsDashboardProps {
  accounts: Account[];
  rings: Ring[];
  onSelect: (acc: Account) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ accounts, rings, onSelect }) => {
  const [compact, setCompact] = React.useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Suspicious Entities Leaderboard */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 font-tech">
              <Scale size={12} /> Threat Stream
            </h3>
            <button
              onClick={() => setCompact(!compact)}
              className="text-[9px] font-black text-teal-400 hover:text-teal-300 uppercase tracking-widest transition-colors border border-teal-500/10 px-2 py-0.5 rounded-md bg-teal-500/[0.02]"
            >
              {compact ? 'Expanded View' : 'Compact View'}
            </button>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full font-tech">
            {accounts.length} Entities
          </div>
        </div>

        <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'} gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar`}>
          {accounts.map((acc) => (
            <div
              key={acc.account_id}
              onClick={() => onSelect(acc)}
              className={`glass-panel p-4 group cursor-pointer transition-all hover:translate-y-[-2px] border border-white/5 hover:border-teal-500/30 relative overflow-hidden bg-[#080c14]/40 rounded-xl ${acc.suspicion_score > 70 ? 'bg-red-500/[0.02]' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold font-mono group-hover:text-teal-400 transition-colors uppercase truncate max-w-[140px]">{acc.account_id}</div>
                  {!compact && acc.is_legitimate_hub && (
                    <div className="text-[8px] text-teal-400/60 font-black uppercase tracking-tighter flex items-center gap-1 font-tech">
                      <TrendingUp size={8} /> Hub
                    </div>
                  )}
                </div>
                <div className={`text-lg font-black tracking-tighter font-data ${acc.suspicion_score > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                  {acc.suspicion_score}<span className="text-[10px] opacity-40 text-slate-400">%</span>
                </div>
              </div>

              {!compact && (
                <>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {acc.detected_patterns.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-black uppercase border border-white/5 font-tech">
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-tech">Risk Level</div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`w-2 h-1 rounded-full ${i <= (acc.suspicion_score / 20) ? (acc.suspicion_score > 70 ? 'bg-red-500' : 'bg-orange-500') : 'bg-white/5'}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {compact && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-1000 ${acc.suspicion_score > 70 ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${acc.suspicion_score}%` }}
                  />
                </div>
              )}

              <ChevronRight size={12} className="absolute bottom-4 right-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 bg-[#080c14]/20 rounded-xl">
              <ShieldAlert size={28} className="mx-auto mb-3 opacity-10 text-slate-400" />
              <p className="text-xs font-bold opacity-30 uppercase tracking-widest font-tech text-slate-400">No Matches Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Distributed Fraud Rings */}
      <div className="w-full xl:w-[480px] space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 font-tech">
            <Users size={12} /> Network Clusters
          </h3>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-panel overflow-x-auto border border-white/5 bg-[#080c14]/40 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-3 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech">Ring ID</th>
                  <th className="p-3 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech whitespace-nowrap">Pattern Type</th>
                  <th className="p-3 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech text-center">Members</th>
                  <th className="p-3 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech text-right">Risk Score</th>
                  <th className="p-3 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech">Member IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rings.map((ring) => (
                  <tr key={ring.ring_id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 align-top font-black text-[9px] text-teal-400 font-mono">{ring.ring_id}</td>
                    <td className="p-3 align-top text-[9px] font-bold text-slate-400 uppercase leading-tight font-tech">{ring.pattern_type}</td>
                    <td className="p-3 align-top text-[9px] font-black text-slate-500 text-center font-data">{ring.member_accounts.length}</td>
                    <td className="p-3 align-top text-[9px] font-black text-red-500 text-right font-data">{ring.risk_score}%</td>
                    <td className="p-3 align-top">
                      <div className="text-[8px] font-mono text-slate-500 break-all leading-relaxed max-w-[150px]">
                        {ring.member_accounts.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rings.length === 0 && (
              <div className="p-12 text-center">
                <Users size={28} className="mx-auto mb-3 opacity-10 text-slate-400" />
                <p className="text-xs font-bold opacity-30 uppercase tracking-widest font-tech text-slate-400">No Network Clusters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
