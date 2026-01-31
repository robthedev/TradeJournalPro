import { Trade } from '../types';

// Helper to handle mixed numeric/string types from forms
const num = (v: number | string) => (typeof v === 'string' ? parseFloat(v) : v) || 0;

export const calculateModelPerformance = (trades: Trade[]) => {
  const models: Record<string, { wins: number; count: number; totalR: number }> = {};

  trades.forEach(t => {
    const modelName = t.model || 'Unspecified';
    if (!models[modelName]) models[modelName] = { wins: 0, count: 0, totalR: 0 };
    models[modelName].count++;
    models[modelName].totalR += num(t.r_multiple);
    if (num(t.r_multiple) > 0) models[modelName].wins++;
  });

  return Object.entries(models).map(([model, data]) => ({
    model,
    count: data.count,
    winRate: data.count ? (data.wins / data.count) * 100 : 0,
    avgR: data.count ? data.totalR / data.count : 0,
    totalR: data.totalR
  })).sort((a, b) => b.totalR - a.totalR);
};

export const calculateConditionImpact = (trades: Trade[]) => {
  const allConditions = new Set<string>();
  trades.forEach(t => Object.keys(t.conditions).forEach(k => {
      if(t.conditions[k]) allConditions.add(k);
  }));

  const globalAvgR = trades.reduce((sum, t) => sum + num(t.r_multiple), 0) / (trades.length || 1);

  const impactData = Array.from(allConditions).map(condition => {
    const withCondition = trades.filter(t => t.conditions[condition]);
    const withoutCondition = trades.filter(t => !t.conditions[condition]);

    const avgRWith = withCondition.reduce((sum, t) => sum + num(t.r_multiple), 0) / (withCondition.length || 1);
    const avgRWithout = withoutCondition.reduce((sum, t) => sum + num(t.r_multiple), 0) / (withoutCondition.length || 1);
    
    const wins = withCondition.filter(t => num(t.r_multiple) > 0).length;

    return {
      condition,
      count: withCondition.length,
      winRate: withCondition.length ? (wins / withCondition.length) * 100 : 0,
      avgR: avgRWith,
      delta: avgRWith - globalAvgR,
      deltaVsWithout: avgRWith - avgRWithout
    };
  });

  return { globalAvgR, impactData: impactData.sort((a, b) => b.delta - a.delta) };
};

export const calculateTimeMetrics = (trades: Trade[]) => {
    const hourly: Record<string, { totalR: number, count: number, wins: number }> = {};
    const daily: Record<string, { totalR: number, count: number, wins: number }> = {};

    trades.forEach(t => {
        const hour = parseInt(t.time.split(':')[0]);
        // Parse date safely avoiding UTC shifts
        const [y, m, d] = t.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const r = num(t.r_multiple);
        const isWin = r > 0;

        if (!hourly[hour]) hourly[hour] = { totalR: 0, count: 0, wins: 0 };
        hourly[hour].totalR += r;
        hourly[hour].count++;
        if(isWin) hourly[hour].wins++;

        if (!daily[day]) daily[day] = { totalR: 0, count: 0, wins: 0 };
        daily[day].totalR += r;
        daily[day].count++;
        if(isWin) daily[day].wins++;
    });

    const hourlyData = Object.entries(hourly).map(([hour, d]) => ({ 
        name: `${hour}:00`, 
        value: d.totalR,
        count: d.count,
        winRate: d.count ? (d.wins / d.count) * 100 : 0
    })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
    
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayData = dayOrder.map(day => {
        const d = daily[day] || { totalR: 0, count: 0, wins: 0 };
        return { 
            name: day, 
            value: d.totalR,
            count: d.count,
            winRate: d.count ? (d.wins / d.count) * 100 : 0
        };
    });

    const sortedTrades = [...trades].sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
    let cumulative = 0;
    const equityCurve = sortedTrades.map(t => {
        cumulative += num(t.r_multiple);
        return { date: t.date, r: cumulative };
    });

    return { hourlyData, dayData, equityCurve };
};

export const calculateExecutionMetrics = (trades: Trade[]) => {
    // MFE vs R Scatter
    const scatterData = trades.map(t => ({
        r: num(t.r_multiple),
        mfe: num(t.mfe),
        mae: num(t.mae),
        result: t.result
    })).filter(t => t.mfe !== 0);

    // Summary Stats
    const winners = trades.filter(t => num(t.r_multiple) > 0);
    const losers = trades.filter(t => num(t.r_multiple) <= 0);

    const avgMfeWinners = winners.length ? winners.reduce((a,b) => a + num(b.mfe), 0) / winners.length : 0;
    const avgMaeLosers = losers.length ? losers.reduce((a,b) => a + num(b.mae), 0) / losers.length : 0;
    
    // Efficiency: Total Realized R / Total Potential MFE (for winners)
    const totalRealizedWinners = winners.reduce((a,b) => a + num(b.r_multiple), 0);
    const totalMfeWinners = winners.reduce((a,b) => a + num(b.mfe), 0);
    const efficiency = totalMfeWinners ? (totalRealizedWinners / totalMfeWinners) * 100 : 0;

    return { 
        scatterData, 
        stats: {
            avgMfeWinners,
            avgMaeLosers,
            efficiency,
            winCount: winners.length,
            lossCount: losers.length
        } 
    };
};
