import React, { useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
                {[0, 0.25, 0.5, 0.75, 1].map(t => (
                    <line 
                        key={t} 
                        x1="0" 
                        y1={height * t} 
                        x2="100%" 
                        y2={height * t} 
                        stroke="#2b3139" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                    />
                ))}
                
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const open = d.open || d.value;
                    const close = d.close || d.value;
                    const high = d.high || d.value;
                    const low = d.low || d.value;
                    
                    const isGreen = close >= open;
                    const color = isGreen ? '#0ECB81' : '#F6465D';
                    
                    return (
                        <g key={i}>
                            {/* Wick */}
                            <line 
                                x1={`${x}%`} 
                                y1={getY(high)} 
                                x2={`${x}%`} 
                                y2={getY(low)} 
                                stroke={color} 
                                strokeWidth="1" 
                            />
                            {/* Body */}
                            <rect 
                                x={`calc(${x}% - 3px)`} 
                                y={getY(Math.max(open, close))} 
                                width="6" 
                                height={Math.max(1, Math.abs(getY(open) - getY(close)))} 
                                fill={color} 
                            />
                        </g>
                    );
                })}
            </svg>
            
            {/* Current Price Line */}
            {data.length > 0 && (
                <div 
                    className="absolute right-0 flex items-center" 
                    style={{ top: getY(data[data.length - 1].close || 0) }}
                >
                    <div className="w-full h-px bg-white/50 border-t border-dashed border-white/50 absolute right-0" style={{ width: '100vw' }} />
                    <span className="bg-slate-700 text-white text-[10px] px-1 rounded ml-1 z-10">
                        {(data[data.length - 1].close || 0).toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    );
};

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget: React.FC<{ symbol?: string; theme?: 'light' | 'dark'; height?: number | string }> = ({ 
  symbol = "BINANCE:BTCUSDT", 
  theme = 'dark',
  height = "100%" 
}) => {
  const containerId = useRef(`tv_chart_container_${Math.random().toString(36).substring(7)}`);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    // Check if script is already present
    let script = document.getElementById('tv-widget-script') as HTMLScriptElement;
    
    const initWidget = () => {
      if (window.TradingView && document.getElementById(containerId.current)) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": theme === 'dark' ? 'dark' : 'light',
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": containerId.current,
          "hide_side_toolbar": false,
          "withdateranges": true,
          "toolbar_bg": "#1e2329",
          "studies": [
             "MASimple@tv-basicstudies"
          ]
        });
        hasInitialized.current = true;
      }
    };

    if (!script) {
        script = document.createElement("script");
        script.id = 'tv-widget-script';
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
    } else {
        if (window.TradingView) {
            initWidget();
        } else {
            script.addEventListener('load', initWidget);
        }
    }

    return () => {
        // Optional cleanup if necessary
    };
  }, [symbol, theme]);

  return (
    <div className="w-full h-full" style={{ minHeight: typeof height === 'number' ? height : '500px' }}>
        <div id={containerId.current} className="w-full h-full" />
    </div>
  );
};