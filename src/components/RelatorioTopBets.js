import React, { useMemo } from 'react';

const BetRow = ({ bet, index }) => {
  const getBetDescription = (b) => {
    // 1. Prioriza a descrição manual, se existir.
    if (b.description && b.description.trim() !== '') {
      return b.description;
    }
    // 2. Se não, constrói a partir dos times.
    if (b.homeTeam && b.awayTeam) {
      return `${b.homeTeam} x ${b.awayTeam}`;
    }
    // 3. Como último recurso, usa o texto padrão.
    return 'Aposta sem descrição';
  };

  return (
    <tr className="border-b border-gray-700 text-sm">
        <td className="px-4 py-2 text-center">{index + 1}</td>
        <th scope="row" className="px-4 py-2 font-medium text-white whitespace-nowrap">
            {getBetDescription(bet)}
            <div className="text-xs text-gray-400">{bet.championship || 'N/A'} - {bet.date}</div>
        </th>
        <td className={`px-4 py-2 text-right font-semibold ${bet.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(bet.profit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </td>
    </tr>
  );
};

const RelatorioTopBets = ({ bets }) => {
  const { topGains, topLosses } = useMemo(() => {
    if (!bets || bets.length === 0) return { topGains: [], topLosses: [] };

    const sortedBets = [...bets].sort((a, b) => {
        const profitA = parseFloat(a.profit || 0);
        const profitB = parseFloat(b.profit || 0);
        return profitB - profitA;
    });

    const gains = sortedBets.filter(b => parseFloat(b.profit || 0) > 0).slice(0, 10);
    const losses = sortedBets.filter(b => parseFloat(b.profit || 0) < 0).reverse().slice(0, 10);
    
    return { topGains: gains, topLosses: losses };
  }, [bets]);

  const hasData = topGains.length > 0 || topLosses.length > 0;

  if (!hasData) {
    return <p className="text-gray-400 text-center py-8">Não há dados de ganhos ou perdas para exibir no período selecionado.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gains */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-4">Top 10 Maiores Ganhos</h3>
            {topGains.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead>
                            <tr className="text-xs uppercase bg-gray-700">
                                <th scope="col" className="px-4 py-2 text-center">#</th>
                                <th scope="col" className="px-4 py-2">Aposta</th>
                                <th scope="col" className="px-4 py-2 text-right">Lucro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topGains.map((bet, index) => <BetRow key={bet.id || index} bet={bet} index={index} />)}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-gray-400">Nenhum ganho registrado no período.</p>}
        </div>

        {/* Top Losses */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-4">Top 10 Maiores Perdas</h3>
             {topLosses.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                         <thead>
                            <tr className="text-xs uppercase bg-gray-700">
                                <th scope="col" className="px-4 py-2 text-center">#</th>
                                <th scope="col" className="px-4 py-2">Aposta</th>
                                <th scope="col" className="px-4 py-2 text-right">Prejuízo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topLosses.map((bet, index) => <BetRow key={bet.id || index} bet={bet} index={index} />)}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-gray-400">Nenhuma perda registrada no período.</p>}
        </div>
    </div>
  );
};

export default RelatorioTopBets; 