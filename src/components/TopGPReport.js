import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TopGPReport = ({ bets }) => {
  if (!bets || bets.length === 0) {
    return (
      <div className="bg-gray-800 shadow-lg rounded-lg p-3 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm text-center">Nenhum dado para o período.</p>
      </div>
    );
  }

  const sortedBets = [...bets].sort((a, b) => b.profit - a.profit);
  const topGains = sortedBets.slice(0, 3);
  const topLosses = sortedBets.filter(b => b.profit < 0).slice(-3).reverse();

  const BetRow = ({ bet, color }) => (
    <div className={`flex justify-between items-center text-xs p-1 rounded ${color === 'green' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
      <span className="truncate text-gray-300 flex-1">{`${bet.homeTeam} v ${bet.awayTeam}`}</span>
      <span className={`font-semibold ml-2 ${color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
        {bet.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-3 h-full">
      <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">Top G/P (Período)</h3>
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <h4 className="flex items-center text-sm font-semibold text-green-400 mb-1">
            <TrendingUp size={16} className="mr-2" /> Maiores Ganhos
          </h4>
          <div className="space-y-1">
            {topGains.length > 0 ? (
              topGains.map(bet => <BetRow key={`gain-${bet.id}`} bet={bet} color="green" />)
            ) : <p className="text-gray-400 text-xs text-center">Nenhum ganho no período.</p>}
          </div>
        </div>
        <div>
          <h4 className="flex items-center text-sm font-semibold text-red-400 mb-1">
            <TrendingDown size={16} className="mr-2" /> Maiores Perdas
          </h4>
          <div className="space-y-1">
             {topLosses.length > 0 ? (
              topLosses.map(bet => <BetRow key={`loss-${bet.id}`} bet={bet} color="red" />)
            ) : <p className="text-gray-400 text-xs text-center">Nenhuma perda no período.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopGPReport; 