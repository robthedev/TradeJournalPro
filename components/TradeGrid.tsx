import React, { useState } from 'react';
import { Trade, INITIAL_TRADE, MOCK_MODELS, SYMBOLS } from '../types';
import { tradeService } from '../services/tradeService';
import { ConditionsInput } from './ConditionsInput';

interface TradeGridProps {
  trades: Trade[];
  onTradeUpdate: () => void;
  onApiError?: (error: any) => void;
}

// Reusable Cell Components for Inline Editing
const TextCell = ({ value, onChange, onBlur, placeholder, className = "" }: any) => (
    <input
        type="text"
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1 text-xs rounded ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
    />
);

const DateCell = ({ value, onChange, onBlur, className = "" }: any) => (
    <input
        type="date"
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1 text-xs rounded ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
    />
);

const TimeCell = ({ value, onChange, onBlur, className = "" }: any) => (
    <input
        type="time"
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1 text-xs rounded ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
    />
);

const NumberCell = ({ value, onChange, onBlur, placeholder, className = "" }: any) => (
    <input
        type="number"
        step="0.01"
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1 text-xs text-right rounded ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
    />
);

const PriceCell = ({ value, onChange, onBlur, placeholder, className = "" }: any) => (
    <input
        type="number"
        step="0.25"
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1 text-xs text-right rounded ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
    />
);

const SelectCell = ({ value, onChange, onBlur, options, className = "" }: any) => (
    <select
        className={`w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-1 py-1 text-xs rounded ${className}`}
        value={value}
        onChange={(e) => { onChange(e.target.value); if(onBlur) onBlur(e.target.value); }}
        onBlur={() => onBlur && onBlur(value)}
    >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

export const TradeGrid: React.FC<TradeGridProps> = ({ trades, onTradeUpdate, onApiError }) => {
  const [newTrade, setNewTrade] = useState<Trade>(INITIAL_TRADE);
  const [isSaving, setIsSaving] = useState(false);

  // Handles adding a new trade (Top Row)
  const handleAddKey = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
       await submitNewTrade();
    }
  };

  const submitNewTrade = async () => {
    if (!newTrade.symbol) return; 
    setIsSaving(true);
    try {
        await tradeService.upsertTrade(newTrade);
        setNewTrade({ ...INITIAL_TRADE, date: newTrade.date, time: new Date().toTimeString().slice(0,5) });
        onTradeUpdate();
    } catch(e: any) {
        if (onApiError) onApiError(e);
        else alert("Error adding trade: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  // Handles updating an existing trade (Inline)
  const handleUpdate = async (trade: Trade, field: keyof Trade, value: any) => {
    const updatedTrade = { ...trade, [field]: value };
    try {
        await tradeService.upsertTrade(updatedTrade);
        onTradeUpdate(); // Refresh to ensure strict sync
    } catch (e: any) {
        if (onApiError) onApiError(e);
        console.error("Failed to update trade", e);
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm("Delete this trade record?")) {
          try {
              await tradeService.deleteTrade(id);
              onTradeUpdate();
          } catch(e: any) {
             if (onApiError) onApiError(e);
          }
      }
  };

  return (
    <div className="w-full bg-white shadow-sm rounded border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm relative">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-28">Date</th>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">Time</th>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Sym</th>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-28">Model</th>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Res</th>
              <th className="px-1 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Entry</th>
              <th className="px-1 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Exit</th>
              <th className="px-1 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">R</th>
              <th className="px-1 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">MFE</th>
              <th className="px-1 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">MAE</th>
              <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Conditions / Notes</th>
              <th className="px-1 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {/* New Entry Row - Always at top */}
            <tr className="bg-blue-50/30 group border-b border-blue-100">
              <td className="px-1 py-1"><DateCell value={newTrade.date} onChange={(v:any)=>setNewTrade({...newTrade, date:v})} /></td>
              <td className="px-1 py-1"><TimeCell value={newTrade.time} onChange={(v:any)=>setNewTrade({...newTrade, time:v})} /></td>
              <td className="px-1 py-1"><SelectCell value={newTrade.symbol} options={SYMBOLS} onChange={(v:any)=>setNewTrade({...newTrade, symbol:v})} className="font-bold uppercase" /></td>
              <td className="px-1 py-1"><SelectCell value={newTrade.model} options={['', ...MOCK_MODELS]} onChange={(v:any)=>setNewTrade({...newTrade, model:v})} /></td>
              <td className="px-1 py-1"><SelectCell value={newTrade.result} options={['WIN','LOSS','BE']} onChange={(v:any)=>setNewTrade({...newTrade, result:v})} className="font-bold" /></td>
              <td className="px-1 py-1"><PriceCell value={newTrade.entry_price} onChange={(v:any)=>setNewTrade({...newTrade, entry_price:v})} placeholder="Ent" /></td>
              <td className="px-1 py-1"><PriceCell value={newTrade.exit_price} onChange={(v:any)=>setNewTrade({...newTrade, exit_price:v})} placeholder="Ex" /></td>
              <td className="px-1 py-1"><NumberCell value={newTrade.r_multiple} onChange={(v:any)=>setNewTrade({...newTrade, r_multiple:v})} placeholder="R" /></td>
              <td className="px-1 py-1"><NumberCell value={newTrade.mfe} onChange={(v:any)=>setNewTrade({...newTrade, mfe:v})} placeholder="MFE" /></td>
              <td className="px-1 py-1"><NumberCell value={newTrade.mae} onChange={(v:any)=>setNewTrade({...newTrade, mae:v})} placeholder="MAE" /></td>
              <td className="px-1 py-1">
                 <div className="flex flex-col gap-1">
                     <ConditionsInput value={newTrade.conditions} onChange={(c) => setNewTrade({...newTrade, conditions: c})} />
                     <input type="text" placeholder="Notes..." className="text-[10px] bg-transparent w-full border-none p-0 focus:ring-0 text-gray-500" value={newTrade.notes} onChange={e => setNewTrade({...newTrade, notes: e.target.value})} onKeyDown={handleAddKey} />
                 </div>
              </td>
              <td className="px-1 py-1 text-center">
                  <button onClick={submitNewTrade} disabled={isSaving} className="text-blue-600 font-bold text-lg hover:bg-blue-100 rounded w-6 h-6 flex items-center justify-center disabled:opacity-50">
                      {isSaving ? '...' : '+'}
                  </button>
              </td>
            </tr>

            {/* Existing Trades */}
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 group">
                <td className="px-1 py-1"><DateCell value={trade.date} onChange={(v:any)=>handleUpdate(trade, 'date', v)} onBlur={(e:any) => handleUpdate(trade, 'date', e.target.value)} /></td>
                <td className="px-1 py-1"><TimeCell value={trade.time} onChange={(v:any)=>handleUpdate(trade, 'time', v)} onBlur={(e:any) => handleUpdate(trade, 'time', e.target.value)} /></td>
                <td className="px-1 py-1"><SelectCell value={trade.symbol} options={SYMBOLS} onChange={(v:any)=>handleUpdate(trade, 'symbol', v)} className="font-bold uppercase" /></td>
                <td className="px-1 py-1"><SelectCell value={trade.model} options={MOCK_MODELS} onChange={(v:any)=>handleUpdate(trade, 'model', v)} /></td>
                <td className="px-1 py-1">
                    <SelectCell 
                        value={trade.result} 
                        options={['WIN','LOSS','BE']} 
                        onChange={(v:any)=>handleUpdate(trade, 'result', v)} 
                        className={`font-bold ${trade.result === 'WIN' ? 'text-green-700' : trade.result === 'LOSS' ? 'text-red-700' : 'text-gray-600'}`} 
                    />
                </td>
                <td className="px-1 py-1"><PriceCell value={trade.entry_price} onChange={(v:any)=>handleUpdate(trade, 'entry_price', v)} onBlur={(e:any) => handleUpdate(trade, 'entry_price', e.target.value)} className="text-gray-600" /></td>
                <td className="px-1 py-1"><PriceCell value={trade.exit_price} onChange={(v:any)=>handleUpdate(trade, 'exit_price', v)} onBlur={(e:any) => handleUpdate(trade, 'exit_price', e.target.value)} className="text-gray-600" /></td>
                <td className="px-1 py-1"><NumberCell value={trade.r_multiple} onChange={(v:any)=>handleUpdate(trade, 'r_multiple', v)} onBlur={(e:any) => handleUpdate(trade, 'r_multiple', e.target.value)} className={Number(trade.r_multiple) > 0 ? "font-bold text-green-600" : "font-bold text-red-600"} /></td>
                <td className="px-1 py-1"><NumberCell value={trade.mfe} onChange={(v:any)=>handleUpdate(trade, 'mfe', v)} onBlur={(e:any) => handleUpdate(trade, 'mfe', e.target.value)} className="text-gray-500" /></td>
                <td className="px-1 py-1"><NumberCell value={trade.mae} onChange={(v:any)=>handleUpdate(trade, 'mae', v)} onBlur={(e:any) => handleUpdate(trade, 'mae', e.target.value)} className="text-gray-500" /></td>
                <td className="px-1 py-1 border-l border-transparent group-hover:border-gray-200">
                    <div className="flex flex-col gap-1 min-h-[40px]">
                        <ConditionsInput value={trade.conditions} onChange={(c) => handleUpdate(trade, 'conditions', c)} />
                        <input 
                            type="text" 
                            className="text-[10px] text-gray-400 focus:text-gray-800 bg-transparent border-none p-0 focus:ring-0 w-full"
                            value={trade.notes || ''}
                            onChange={(e) => handleUpdate(trade, 'notes', e.target.value)}
                            placeholder="Add notes..."
                        />
                    </div>
                </td>
                <td className="px-1 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => trade.id && handleDelete(trade.id)} className="text-gray-300 hover:text-red-500">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
