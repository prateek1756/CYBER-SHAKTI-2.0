import React from 'react';

interface Transaction {
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  timestamp: string;
}

interface TrendChartProps {
  transactions: Transaction[];
  color?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ transactions, color = '#14b8a6' }) => {
  if (!transactions || transactions.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-tech">Insufficient Temporal Data</span>
      </div>
    );
  }

  // Process transactions into buckets (Daily or Hourly)
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const firstTx = new Date(sortedTxs[0].timestamp);
  const lastTx = new Date(sortedTxs[sortedTxs.length - 1].timestamp);
  const durationHrs = (lastTx.getTime() - firstTx.getTime()) / (1000 * 60 * 60);

  const useHourly = durationHrs < 48;

  const data = transactions.reduce((acc: { [key: string]: number }, tx) => {
    const dateObj = new Date(tx.timestamp);
    let key: string;
    if (useHourly) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hour = String(dateObj.getHours()).padStart(2, '0');
      key = `${year}-${month}-${day} ${hour}:00`;
    } else {
      key = tx.timestamp.split(' ')[0];
    }
    acc[key] = (acc[key] || 0) + tx.amount;
    return acc;
  }, {});

  const sortedLabels = Object.keys(data).sort();
  const values = sortedLabels.map(d => data[d]);
  const max = Math.max(...values, 1);

  // SVG Dimensions
  const width = 400;
  const height = 100;
  const padding = 10;

  const points = values.map((v, i) => {
    const x = padding + (i / Math.max(1, values.length - 1)) * (width - 2 * padding);
    const y = (height - padding) - (v / max) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${points} ${width - padding},${height - padding} ${padding},${height - padding}`;

  return (
    <div className="relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="white" strokeOpacity="0.05" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="white" strokeOpacity="0.05" strokeWidth="1" />

        {/* The Graph Area */}
        <polyline
          points={areaPoints}
          fill="url(#areaGradient)"
          className="transition-all duration-700"
        />

        {/* The Graph Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
        />

        {/* Data Points */}
        {values.map((v, i) => {
          const x = padding + (i / Math.max(1, values.length - 1)) * (width - 2 * padding);
          const y = (height - padding) - (v / max) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{sortedLabels[i]}: ${v.toLocaleString()}</title>
            </circle>
          );
        })}
      </svg>

      <div className="flex justify-between mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest font-tech">
        <span>{sortedLabels[0]}</span>
        <span className="text-teal-400/50">{useHourly ? 'HOURLY ANALYSIS' : 'DAILY AGGREGATION'}</span>
        <span>{sortedLabels[sortedLabels.length - 1]}</span>
      </div>
    </div>
  );
};

export default TrendChart;
