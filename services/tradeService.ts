import { supabase, isConfigured } from '../lib/supabaseClient';
import { Trade } from '../types';

export const tradeService = {
  async getAllTrades(): Promise<Trade[]> {
    if (!isConfigured) return [];

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      // Throwing error allows App.tsx to catch 42P01 (missing table)
      throw error;
    }
    return data as Trade[];
  },

  async upsertTrade(trade: Trade): Promise<Trade | null> {
    if (!isConfigured) throw new Error("Supabase not configured");

    // Remove empty strings for numeric fields to respect DB types or handle logic
    const cleanTrade = {
        ...trade,
        r_multiple: trade.r_multiple === '' ? 0 : Number(trade.r_multiple),
        entry_price: trade.entry_price === '' ? null : Number(trade.entry_price),
        exit_price: trade.exit_price === '' ? null : Number(trade.exit_price),
        mfe: trade.mfe === '' ? null : Number(trade.mfe),
        mae: trade.mae === '' ? null : Number(trade.mae),
    };

    const { data, error } = await supabase
      .from('trades')
      .upsert(cleanTrade)
      .select()
      .single();

    if (error) {
      console.error('Error saving trade:', error);
      throw error;
    }
    return data as Trade;
  },

  async deleteTrade(id: string): Promise<boolean> {
    if (!isConfigured) return false;

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
    return true;
  }
};
