import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartProps {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  hideAxis?: boolean;
}

export const SimpleAreaChart: React.FC<ChartProps> = ({ 
  data, 
  color = '#f59e0b', 
  height = 300,
  hideAxis = false
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          {!hideAxis && (
            <>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                minTickGap={30}
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
            </>
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: color }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#colorGradient-${color})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const Sparkline: React.FC<{ data: { value: number }[]; color: string; isPositive: boolean }> = ({ data, color, isPositive }) => (
  <div style={{ width: 100, height: 40 }}>
    <ResponsiveContainer>
      <AreaChart data={data}>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={isPositive ? '#10b981' : '#f43f5e'} 
          fill="transparent" 
          strokeWidth={2} 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Custom Candlestick implementation using SVG for precision control without heavy libs
export const CandlestickChart: React.FC<{ data: ChartDataPoint[], height?: number }> = ({ data, height = 400 }) => {
    // Calculate scales
    const allValues = data.flatMap(d => [d.high || d.value, d.low || d.value]);
    const minPrice = Math.min(...allValues);
    const maxPrice = Math.max(...allValues);
    const padding = (maxPrice - minPrice) * 0.1;
    const yMin = minPrice - padding;
    const yMax = maxPrice + padding;
    const yRange = yMax - yMin;

    const getY = (price: number) => height - ((price - yMin) / yRange) * height;

    return (
        <div className="relative w-full select-none" style={{ height }}>
            <svg width="100%" height="100%" className="overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => {
                    const y = height * p;
                    const price = yMax - (p * yRange);
                    return (
                        <g key={p}>
                            <line x1="0" y1={y} x2="100%" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                            <text x="100%" y={y - 4} textAnchor="end" fill="#64748b" fontSize="10">{price.toFixed(2)}</text>
                        </g>
                    )
                })}
                
                {/* Candles */}
                {data.map((d, i) => {
                    const open = d.open || d.value;
                    const close = d.close || d.value;
                    const high = d.high || Math.max(open, close);
                    const low = d.low || Math.min(open, close);
                    
                    const x = `${(i / data.length) * 100}%`;
                    const widthPct = 100 / data.length;
                    const barCenter = `${(i / data.length) * 100 + (widthPct/2)}%`;
                    
                    const isUp = close >= open;
                    const color = isUp ? '#10b981' : '#f43f5e';
                    
                    const yHigh = getY(high);
                    const yLow = getY(low);
                    const yOpen = getY(open);
                    const yClose = getY(close);
                    
                    const bodyTop = Math.min(yOpen, yClose);
                    const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));

                    return (
                        <g key={i} className="hover:opacity-80 transition-opacity">
                             {/* Wick */}
                             <line x1={barCenter} y1={yHigh} x2={barCenter} y2={yLow} stroke={color} strokeWidth="1" />
                             {/* Body */}
                             <rect 
                                x={`calc(${x} + 2px)`} 
                                y={bodyTop} 
                                width={`calc(${widthPct}% - 4px)`} 
                                height={bodyHeight} 
                                fill={color} 
                             />
                        </g>
                    );
                })}
            </svg>
            {/* X Axis Labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-slate-500 px-2 pointer-events-none">
                {data.filter((_, i) => i % 6 === 0).map((d, i) => (
                    <span key={i}>{d.time}</span>
                ))}
            </div>
        </div>
    );
};