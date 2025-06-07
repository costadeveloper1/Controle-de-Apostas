import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';

const calculateStats = (bets) => {
    const totalBets = bets.length;
    if (totalBets === 0) return { totalBets: 0, profit: 0, hitRate: 0 };
    
    const wonBets = bets.filter(b => b.status === 'Green' || b.status === 'won' || b.status === 'HalfWon').length;
    const profit = bets.reduce((acc, bet) => acc + parseFloat(bet.profit || 0), 0);
    const hitRate = (wonBets / totalBets) * 100;
    
    return { totalBets, profit, hitRate };
};


const RelatorioCampeonato = ({ bets }) => {
  const performanceByChampionship = useMemo(() => {
    if (!bets || bets.length === 0) return [];

    const championships = {};
    bets.forEach(bet => {
      const champ = bet.championship || 'Sem Campeonato';
      if (!championships[champ]) {
        championships[champ] = [];
      }
      championships[champ].push(bet);
    });

    return Object.entries(championships)
      .map(([name, betsInChamp]) => {
        const stats = calculateStats(betsInChamp);
        return { name, ...stats };
      })
      .sort((a, b) => b.totalBets - a.totalBets); // Ordenar por número de apostas

  }, [bets]);

  if (performanceByChampionship.length === 0) {
    return <p className="text-gray-400 text-center py-8">Não há dados de campeonatos para exibir no período selecionado.</p>;
  }

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4">Desempenho por Campeonato</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="px-4 py-3">Campeonato</th>
                        <th scope="col" className="px-4 py-3 text-center">Apostas</th>
                        <th scope="col" className="px-4 py-3 text-center">Taxa de Acerto</th>
                        <th scope="col" className="px-4 py-3 text-right">Lucro (R$)</th>
                    </tr>
                </thead>
                <tbody>
                    {performanceByChampionship.map((item, index) => (
                        <tr key={item.name + index} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">{item.name}</th>
                            <td className="px-4 py-3 text-center">{item.totalBets}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`flex items-center justify-center gap-1 ${item.hitRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.hitRate.toFixed(1)}%
                                    {item.hitRate >= 50 ? <Percent size={14} /> : <Percent size={14} />}
                                </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold ${item.profit > 0 ? 'text-green-400' : item.profit < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                {item.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default RelatorioCampeonato; 