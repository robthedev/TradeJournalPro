import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TradeGrid } from './components/TradeGrid';
import { ModelPerformance, ConditionImpact, TimeAnalysis, ExecutionQuality } from './components/AnalyticsCharts';
import { tradeService } from './services/tradeService';
import { isConfigured } from './lib/supabaseClient';
import { Trade, SYMBOLS, MOCK_MODELS } from './types';

// Schema Setup Component
const SchemaSetup = ({ onRetry }: { onRetry: () => void }) => {
  const [copied, setCopied] = useState(false);
  const sql = `-- Run this in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

create table public.trades (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    date date not null,
    time time without time zone not null,
    symbol text not null,
    model text not null,
    result text check (result in ('WIN', 'LOSS', 'BE')) not null,
    entry_price numeric,
    exit_price numeric,
    r_multiple numeric not null,
    mfe numeric,
    mae numeric,
    notes text,
    conditions jsonb default '{}'::jsonb
);

create index idx_trades_date on public.trades(date);
create index idx_trades_model on public.trades(model);
create index idx_trades_symbol on public.trades(symbol);

alter table public.trades enable row level security;
create policy "Enable access to all users" on public.trades for all using (true) with check (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl w-full border border-red-200">
        <h1 className="text-xl font-bold text-red-700 mb-2">Database Connection Issue</h1>
        <p className="text-gray-700 mb-4 text-sm">
            We cannot find the <code>public.trades</code> table. If you just created it, the API cache might be stale.
        </p>
        
        <div className="flex gap-4 mb-6">
            <button 
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
            >
                Retry Connection
            </button>
        </div>
        
        <div className="mb-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-1">If "Retry" fails:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Go to Supabase Project Dashboard &gt; SQL Editor.</li>
                <li>Run the SQL below.</li>
                <li>Go to Settings &gt; API and click "Reload schema cache".</li>
            </ol>
        </div>

        <div className="relative">
            <pre className="bg-slate-900 text-slate-50 p-4 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap h-48 border border-slate-700">
                {sql}
            </pre>
            <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded transition-colors"
            >
                {copied ? 'Copied!' : 'Copy SQL'}
            </button>
        </div>
      </div>
    </div>
  );
};

// Setup Screen Component (Credentials)
const SetupScreen = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-gray-200 text-center">
      <div className="text-4xl mb-4">🛠️</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Supabase credentials not found.
      </p>
    </div>
  </div>
);

const NavLink = ({ to, label, icon }: { to: string, label: string, icon: string }) => {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <Link to={to} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>{icon}</span>
            <span>{label}</span>
        </Link>
    );
};

// Analytics Filter Component
const FilterBar = ({ filters, onChange }: { filters: any, onChange: (f:any) => void }) => {
    const update = (key: string, val: string) => onChange({...filters, [key]: val});
    
    return (
        <div className="bg-white p-3 rounded border border-gray-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Start Date</label>
                <input type="date" className="text-xs border-gray-200 rounded focus:border-blue-500 focus:ring-0" 
                    value={filters.startDate} onChange={e => update('startDate', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">End Date</label>
                <input type="date" className="text-xs border-gray-200 rounded focus:border-blue-500 focus:ring-0" 
                    value={filters.endDate} onChange={e => update('endDate', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Symbol</label>
                <select className="text-xs border-gray-200 rounded focus:border-blue-500 focus:ring-0 min-w-[100px]"
                    value={filters.symbol} onChange={e => update('symbol', e.target.value)}>
                    <option value="">All Symbols</option>
                    {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Model</label>
                <select className="text-xs border-gray-200 rounded focus:border-blue-500 focus:ring-0 min-w-[120px]"
                    value={filters.model} onChange={e => update('model', e.target.value)}>
                    <option value="">All Models</option>
                    {MOCK_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
             <button onClick={() => onChange({startDate:'', endDate:'', symbol:'', model:''})} className="text-xs text-blue-500 hover:underline pb-2">
                Clear
            </button>
        </div>
    )
}

const Dashboard = ({ trades }: { trades: Trade[] }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        symbol: '',
        model: ''
    });

    const filteredTrades = useMemo(() => {
        return trades.filter(t => {
            if (filters.startDate && t.date < filters.startDate) return false;
            if (filters.endDate && t.date > filters.endDate) return false;
            if (filters.symbol && t.symbol !== filters.symbol) return false;
            if (filters.model && t.model !== filters.model) return false;
            return true;
        });
    }, [trades, filters]);

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
                 <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{filteredTrades.length} trades</span>
            </div>
           
            <FilterBar filters={filters} onChange={setFilters} />

            <div className="space-y-8">
                <ModelPerformance trades={filteredTrades} />
                <ConditionImpact trades={filteredTrades} />
                <TimeAnalysis trades={filteredTrades} />
                <ExecutionQuality trades={filteredTrades} />
            </div>
        </div>
    );
}

const Journal = ({ trades, refresh, onApiError }: { trades: Trade[], refresh: () => void, onApiError: (err: any) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex justify-between items-end flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Trade Journal</h2>
                <div className="text-xs text-gray-500">
                    {trades.length} trades logged
                </div>
            </div>
            <TradeGrid trades={trades} onTradeUpdate={refresh} onApiError={onApiError} />
        </div>
    );
}

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);

  // Centralized error handler to switch views if DB is missing
  const handleApiError = (err: any) => {
      console.error("API Error:", err);
      // Check for Postgres error "relation does not exist" (42P01) or PostgREST missing table (PGRST205)
      if (err.code === '42P01' || err.code === 'PGRST205' || err.message?.includes('does not exist')) {
          setSchemaError(true);
      }
  };

  const fetchTrades = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setSchemaError(false);
    
    try {
        const data = await tradeService.getAllTrades();
        setTrades(data);
    } catch (err: any) {
        handleApiError(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  if (!isConfigured) {
    return <SetupScreen />;
  }

  if (schemaError) {
      return <SchemaSetup onRetry={fetchTrades} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-blue-600 text-xl">⚡</span> 
                    TradeJournal
                </h1>
            </div>
            <nav className="p-4 space-y-1">
                <NavLink to="/" label="Journal" icon="📝" />
                <NavLink to="/analytics" label="Analytics" icon="📊" />
            </nav>
            <div className="p-4 mt-auto">
                 <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
                    <p className="font-bold">Pro Tip:</p>
                    <p>Journaling is about patterns, not just P&L. Tag everything.</p>
                 </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-screen">
             <div className="max-w-full mx-auto h-full">
                 {loading ? (
                     <div className="flex items-center justify-center h-64 text-gray-400">Loading trades...</div>
                 ) : (
                    <Routes>
                        <Route path="/" element={<Journal trades={trades} refresh={fetchTrades} onApiError={handleApiError} />} />
                        <Route path="/analytics" element={<Dashboard trades={trades} />} />
                    </Routes>
                 )}
             </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
