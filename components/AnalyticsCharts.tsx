import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { Trade } from '../types';
import {
    calculateModelPerformance,
    calculateConditionImpact,
    calculateTimeMetrics,
    calculateExecutionMetrics
} from '../utils/analytics';

interface AnalyticsProps {
    trades: Trade[];
}

// Fix: Made children optional to resolve TS error "Property 'children' is missing"
const TableHeader = ({ children, align = 'left' }: { children?: React.ReactNode, align?: 'left'|'right' }) => (
    <th className={`px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-${align} border-b border-gray-100`}>
        {children}
    </th>
);

// Fix: Made children optional to resolve TS error "Property 'children' is missing"
const TableCell = ({ children, align = 'left', className = '' }: { children?: React.ReactNode, align?: 'left'|'right', className?: string }) => (
    <td className={`px-2 py-2 text-xs text-gray-700 text-${align} ${className} border-b border-gray-50`}>
        {children}
    </td>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
);

// 1. Model Performance
export const ModelPerformance: React.FC<AnalyticsProps> = ({ trades }) => {
    const data = calculateModelPerformance(trades);
    return (
        <div className="bg-white p-5 rounded border border-gray-200">
            <SectionHeader title="Model Performance" subtitle="Win Rate & Expectancy per Setup" />
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Table First */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full min-w-[300px]">
                        <thead>
                            <tr>
                                <TableHeader>Model</TableHeader>
                                <TableHeader align="right">Trades</TableHeader>
                                <TableHeader align="right">Win %</TableHeader>
                                <TableHeader align="right">Avg R</TableHeader>
                                <TableHeader align="right">Net R</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(d => (
                                <tr key={d.model} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{d.model}</TableCell>
                                    <TableCell align="right">{d.count}</TableCell>
                                    <TableCell align="right" className={d.winRate > 50 ? 'text-green-600' : ''}>{d.winRate.toFixed(1)}%</TableCell>
                                    <TableCell align="right">{d.avgR.toFixed(2)}</TableCell>
                                    <TableCell align="right" className={d.totalR > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{d.totalR.toFixed(1)}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chart Second */}
                <div className="w-full md:w-1/3 h-48 md:h-auto min-h-[150px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="model" type="category" width={80} tick={{fontSize: 10}} interval={0} />
                            <Tooltip contentStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="totalR" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.totalR > 0 ? '#3b82f6' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// 2. Condition Impact
export const ConditionImpact: React.FC<AnalyticsProps> = ({ trades }) => {
    const { globalAvgR, impactData } = calculateConditionImpact(trades);

    return (
        <div className="bg-white p-5 rounded border border-gray-200">
             <SectionHeader title="Condition Analysis" subtitle={`Impact on Expectancy (Baseline: ${globalAvgR.toFixed(2)}R)`} />
             
             <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full min-w-[300px]">
                         <thead>
                            <tr>
                                <TableHeader>Condition</TableHeader>
                                <TableHeader align="right">Count</TableHeader>
                                <TableHeader align="right">Win %</TableHeader>
                                <TableHeader align="right">Avg R</TableHeader>
                                <TableHeader align="right">Delta</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {impactData.map(d => (
                                <tr key={d.condition} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{d.condition}</TableCell>
                                    <TableCell align="right">{d.count}</TableCell>
                                    <TableCell align="right">{d.winRate.toFixed(1)}%</TableCell>
                                    <TableCell align="right">{d.avgR.toFixed(2)}</TableCell>
                                    <TableCell align="right" className={d.delta > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                        {d.delta > 0 ? '+' : ''}{d.delta.toFixed(2)}
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-full md:w-1/3 h-48 md:h-auto min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="condition" type="category" width={80} tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ fontSize: '12px' }} />
                            <ReferenceLine x={0} stroke="#ccc" />
                            <Bar dataKey="delta" barSize={20}>
                                {impactData.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.delta > 0 ? '#10b981' : '#f43f5e'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
    );
};

// 3. Time Analysis
export const TimeAnalysis: React.FC<AnalyticsProps> = ({ trades }) => {
    const { hourlyData, dayData, equityCurve } = calculateTimeMetrics(trades);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hourly */}
                <div className="bg-white p-5 rounded border border-gray-200">
                    <SectionHeader title="Hourly Performance" />
                    <div className="h-40 overflow-y-auto mb-4 border border-gray-100">
                         <table className="w-full relative">
                            <thead className="sticky top-0 bg-gray-50">
                                <tr>
                                    <TableHeader>Hour</TableHeader>
                                    <TableHeader align="right">Vol</TableHeader>
                                    <TableHeader align="right">Win%</TableHeader>
                                    <TableHeader align="right">Net R</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {hourlyData.map(d => (
                                    <tr key={d.name}>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell align="right">{d.count}</TableCell>
                                        <TableCell align="right">{d.winRate.toFixed(0)}%</TableCell>
                                        <TableCell align="right" className={d.value > 0 ? 'text-green-600':'text-red-600'}>{d.value.toFixed(1)}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <XAxis dataKey="name" tick={{fontSize: 9}} interval={0} />
                                <Bar dataKey="value" fill="#6366f1" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily */}
                <div className="bg-white p-5 rounded border border-gray-200">
                    <SectionHeader title="Daily Performance" />
                    <div className="mb-4 border border-gray-100">
                         <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <TableHeader>Day</TableHeader>
                                    <TableHeader align="right">Vol</TableHeader>
                                    <TableHeader align="right">Win%</TableHeader>
                                    <TableHeader align="right">Net R</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {dayData.map(d => (
                                    <tr key={d.name}>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell align="right">{d.count}</TableCell>
                                        <TableCell align="right">{d.winRate.toFixed(0)}%</TableCell>
                                        <TableCell align="right" className={d.value > 0 ? 'text-green-600':'text-red-600'}>{d.value.toFixed(1)}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                    <div className="h-32 mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dayData}>
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <Bar dataKey="value" fill="#8b5cf6" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Equity Curve */}
            <div className="bg-white p-5 rounded border border-gray-200">
                <SectionHeader title="Cumulative Performance (R)" />
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityCurve}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{fontSize: 10}} minTickGap={40} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{fontSize: '12px'}} />
                            <Line type="monotone" dataKey="r" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// 4. Execution Quality
export const ExecutionQuality: React.FC<AnalyticsProps> = ({ trades }) => {
    const { scatterData, stats } = calculateExecutionMetrics(trades);

    return (
        <div className="bg-white p-5 rounded border border-gray-200">
            <SectionHeader title="Execution Quality" subtitle="MFE Capture & Drawdown Analysis" />
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 flex-shrink-0 space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">Avg MFE (Winners)</h4>
                        <p className="text-2xl font-mono text-green-600">{stats.avgMfeWinners.toFixed(2)}R</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">Avg MAE (Losers)</h4>
                        <p className="text-2xl font-mono text-red-600">{stats.avgMaeLosers.toFixed(2)}R</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">Capture Efficiency</h4>
                        <p className="text-xl font-mono text-blue-600">{stats.efficiency.toFixed(0)}%</p>
                        <p className="text-[10px] text-gray-400 mt-1">Realized R / Potential MFE</p>
                    </div>
                </div>
                
                <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="mfe" name="MFE" unit="R" tick={{fontSize: 10}} label={{ value: 'Potential (MFE)', position: 'bottom', fontSize: 10 }} />
                            <YAxis type="number" dataKey="r" name="Realized" unit="R" tick={{fontSize: 10}} label={{ value: 'Realized R', angle: -90, position: 'left', fontSize: 10 }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke="#ccc" strokeDasharray="3 3" />
                            <Scatter name="Trades" data={scatterData} fill="#8884d8">
                                {scatterData.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.r > 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};