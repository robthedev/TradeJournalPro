export interface Trade {
  id?: string; // Optional for new trades
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  symbol: string;
  model: string;
  result: 'WIN' | 'LOSS' | 'BE';
  entry_price: number | '';
  exit_price: number | '';
  r_multiple: number | '';
  mfe: number | '';
  mae: number | '';
  notes: string;
  conditions: Record<string, boolean>;
}

export interface TradeFilter {
  startDate: string;
  endDate: string;
  symbol?: string;
  model?: string;
}

export const INITIAL_TRADE: Trade = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  symbol: 'MES',
  model: '',
  result: 'WIN',
  entry_price: '',
  exit_price: '',
  r_multiple: '',
  mfe: '',
  mae: '',
  notes: '',
  conditions: {},
};

export const MOCK_CONDITIONS = [
  'HR Open', 'VWAP', 'Gap Up', 'Gap Down', 'News', 'Counter Trend'
];

export const MOCK_MODELS = [
  'Breakout', 'Reversal', 'Mean Reversion', 'Trend Pullback'
];

export const SYMBOLS = ['MES', 'MNQ'];
