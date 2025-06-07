import React, { useMemo } from 'react';
import { Percent } from 'lucide-react';

const calculateWeekdayStats = (bets) => {
    const totalBets = bets.length;
    if (totalBets === 0) return { totalBets: 0, hitRate: 0 };
    
    const wonBets = bets.filter(b => b.status === 'Green' || b.status === 'won' || b.status === 'HalfWon').length;
    const hitRate = (wonBets / totalBets) * 100;
    
    return { totalBets, hitRate };
};

const RelatorioDiaSemana = ({ bets }) => {
  const performanceByWeekday = useMemo(() => {
    if (!bets || bets.length === 0) return [];

    const weekdays = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 0:[] }; // Ordem de Seg a Dom
    const weekdayNames = {
        1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira', 
        4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado', 0: 'Domingo'
    };
    
    bets.forEach(bet => {
      const date = new Date(bet.date + "T00:00:00Z");
      const dayIndex = date.getUTCDay(); // 0=Dom, 1=Seg...
      weekdays[dayIndex].push(bet);
    });

    return Object.keys(weekdays).map(dayIndex => {
      const betsOnDay = weekdays[dayIndex];
      const stats = calculateWeekdayStats(betsOnDay);
      return { name: weekdayNames[dayIndex], ...stats };
    });

  }, [bets]);

  if (bets.length === 0) {
    return <p className="text-gray-400 text-center py-8">Não há dados para exibir o desempenho por dia da semana.</p>;
  }

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4">Desempenho por Dia da Semana</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="px-4 py-3">Dia da Semana</th>
                        <th scope="col" className="px-4 py-3 text-center">Apostas</th>
                        <th scope="col" className="px-4 py-3 text-center">Taxa de Acerto</th>
                    </tr>
                </thead>
                <tbody>
                    {performanceByWeekday.map((item, index) => (
                        <tr key={item.name + index} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">{item.name}</th>
                            <td className="px-4 py-3 text-center">{item.totalBets}</td>
                            <td className="px-4 py-3 text-center">
                                {item.totalBets > 0 ? (
                                    <span className={`flex items-center justify-center gap-1 ${item.hitRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.hitRate.toFixed(1)}%
                                        <Percent size={14} />
                                    </span>
                                ) : (
                                    <span className="text-gray-500">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default RelatorioDiaSemana; 