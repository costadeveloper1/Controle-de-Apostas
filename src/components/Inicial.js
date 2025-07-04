import React, { useEffect, useMemo, useState } from 'react';
import CardKPI from './CardKPI';
import { TrendingUp, TrendingDown, Percent, BarChartBig, Users, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

function getBetsFromStorage() {
  try {
    const bets = localStorage.getItem('bets');
    return bets ? JSON.parse(bets) : [];
  } catch {
    return [];
  }
}

function filterBetsByPeriod(bets, startDate, endDate) {
  return bets.filter(bet => {
    if (!bet.date) return false;
    const betDate = bet.date.includes('/')
      ? bet.date.split('/').reverse().join('-')
      : bet.date;
    return betDate >= startDate && betDate <= endDate;
  });
}

function getKPIs(bets) {
  const totalBets = bets.length;
  const totalProfit = bets.reduce((acc, b) => acc + (parseFloat(b.profit) || 0), 0);
  const totalStaked = bets.reduce((acc, b) => acc + (parseFloat(b.stake) || 0), 0);
  const wonBets = bets.filter(b => {
    const status = String(b.status).toLowerCase();
    const result = String(b.result).toLowerCase();
    const profit = parseFloat(b.profit) || 0;
    return status === 'won' || result === 'green' || result === 'ganha' || ((status === 'cashed_out' || result === 'cashout') && profit > 0);
  }).length;
  const lostBets = bets.filter(b => {
    const status = String(b.status).toLowerCase();
    const result = String(b.result).toLowerCase();
    return status === 'lost' || result === 'red' || result === 'perdida';
  }).length;
  const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(2) : '0.00';
  const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(2) : '0.00';
  const avgProfit = totalBets > 0 ? (totalProfit / totalBets).toFixed(2) : '0.00';

  // Sequência máxima de greens/reds
  let maxGreen = 0, maxRed = 0, currGreen = 0, currRed = 0;
  bets.forEach(b => {
    const status = String(b.status).toLowerCase();
    const result = String(b.result).toLowerCase();
    const isGreen = status === 'won' || result === 'green' || result === 'ganha';
    const isRed = status === 'lost' || result === 'red' || result === 'perdida';
    if (isGreen) {
      currGreen++;
      maxGreen = Math.max(maxGreen, currGreen);
      currRed = 0;
    } else if (isRed) {
      currRed++;
      maxRed = Math.max(maxRed, currRed);
      currGreen = 0;
    } else {
      currGreen = 0;
      currRed = 0;
    }
  });

  return {
    totalBets,
    totalProfit: totalProfit.toFixed(2),
    winRate,
    roi,
    avgProfit,
    maxGreen,
    maxRed,
    totalStaked: totalStaked.toFixed(2),
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// Função para normalizar nomes de salões (remover acentos, minúsculas, sem espaços extras)
function normalizeSaloonName(name) {
  if (!name) return '';
  return name
    .normalize('NFD').replace(/[ -]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, '') // remove caracteres especiais, exceto +
    .replace(/\s+/g, '');
}

// Mapeamento de marketCategory para nome amigável do salão
const MARKET_CATEGORY_TO_SALAO = {
  over05: 'Over 0.5',
  zeroToTen: '0-10',
  asiaticosHT: 'Asiáticos HT',
  plus46: '+ 4/6',
  race: 'RACE',
};
const MAIN_SALOES = [
  'Over 0.5',
  '0-10',
  'Asiáticos HT',
  'Over 1.5', // manter para compatibilidade futura
  'RACE',
  '+ 4/6',
];

function getMarketStatsBySaloon(bets) {
  // Agrupa por salão usando marketCategory mapeado
  const saloes = {};
  bets.forEach(bet => {
    const salao = MARKET_CATEGORY_TO_SALAO[bet.marketCategory] || null;
    if (!salao) return;
    if (!saloes[salao]) saloes[salao] = [];
    saloes[salao].push(bet);
  });
  // Para cada salão, calcula stats agregados e detalha por mercado (mesa)
  return MAIN_SALOES.map(salao => {
    const betsSalao = saloes[salao] || [];
    const count = betsSalao.length;
    const totalStaked = betsSalao.reduce((acc, b) => acc + (parseFloat(b.stake) || 0), 0);
    const totalProfit = betsSalao.reduce((acc, b) => acc + (parseFloat(b.profit) || 0), 0);
    const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(2) : '0.00';
    // Agrupa por mercado (mesa)
    const mesas = {};
    betsSalao.forEach(bet => {
      const mesa = bet.market || 'Não especificado';
      if (!mesas[mesa]) mesas[mesa] = [];
      mesas[mesa].push(bet);
    });
    const mesasDetalhe = Object.entries(mesas).map(([mesa, betsMesa]) => {
      const countMesa = betsMesa.length;
      const totalStakedMesa = betsMesa.reduce((acc, b) => acc + (parseFloat(b.stake) || 0), 0);
      const totalProfitMesa = betsMesa.reduce((acc, b) => acc + (parseFloat(b.profit) || 0), 0);
      const roiMesa = totalStakedMesa > 0 ? ((totalProfitMesa / totalStakedMesa) * 100).toFixed(2) : '0.00';
      return {
        mesa,
        count: countMesa,
        totalStaked: totalStakedMesa.toFixed(2),
        totalProfit: totalProfitMesa.toFixed(2),
        roi: roiMesa,
      };
    });
    return {
      salao,
      count,
      totalStaked: totalStaked.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      roi,
      mesasDetalhe,
    };
  });
}

const Inicial = () => {
  // Filtro de período
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [expandMarkets, setExpandMarkets] = useState(false);
  const [expandedSaloon, setExpandedSaloon] = useState(null);

  const bets = useMemo(() => getBetsFromStorage(), []);
  const filteredBets = useMemo(() => filterBetsByPeriod(bets, startDate, endDate), [bets, startDate, endDate]);
  const kpis = useMemo(() => getKPIs(filteredBets), [filteredBets]);
  const saloesStats = useMemo(() => getMarketStatsBySaloon(filteredBets), [filteredBets]);

  // Painel temporário para debug: mostrar todos os valores únicos de market e marketCategory
  const uniqueMarkets = useMemo(() => {
    const set = new Set();
    filteredBets.forEach(bet => {
      if (bet.market) set.add(bet.market);
    });
    return Array.from(set);
  }, [filteredBets]);
  const uniqueMarketCategories = useMemo(() => {
    const set = new Set();
    filteredBets.forEach(bet => {
      if (bet.marketCategory) set.add(bet.marketCategory);
    });
    return Array.from(set);
  }, [filteredBets]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Painel Inicial</h1>
      {/* Painel temporário para debug dos mercados encontrados */}
      <div className="mb-6 p-4 bg-yellow-900/30 rounded-lg text-yellow-200 text-sm">
        <div><b>Mercados únicos (market):</b> {uniqueMarkets.join(', ') || 'Nenhum'}</div>
        <div><b>Mercados únicos (marketCategory):</b> {uniqueMarketCategories.join(', ') || 'Nenhum'}</div>
      </div>
      {/* Placeholder para o primeiro KPI: análise geral (mensagem futura) */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg text-center text-gray-300 text-lg font-semibold">
        [Em breve] Aqui aparecerá uma análise geral inteligente do seu desempenho, com uma mensagem personalizada.
      </div>
      <h2 className="text-xl font-bold mb-4 text-center">Lucro por Mercado</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">Mercado</th>
              <th className="px-4 py-2 text-left text-gray-300">Qtd. Apostas</th>
              <th className="px-4 py-2 text-left text-gray-300">Total Apostado (R$)</th>
              <th className="px-4 py-2 text-left text-gray-300">Lucro (R$)</th>
              <th className="px-4 py-2 text-left text-gray-300">ROI (%)</th>
              <th className="px-4 py-2 text-left text-gray-300">Detalhar</th>
            </tr>
          </thead>
          <tbody>
            {saloesStats.map(s => (
              <React.Fragment key={s.salao}>
                <tr className="border-t border-gray-700 hover:bg-gray-700/40">
                  <td className="px-4 py-2 font-semibold text-gray-100">{s.salao}</td>
                  <td className="px-4 py-2">{s.count}</td>
                  <td className="px-4 py-2">{s.totalStaked}</td>
                  <td className={`px-4 py-2 ${parseFloat(s.totalProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.totalProfit}</td>
                  <td className={`px-4 py-2 ${parseFloat(s.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.roi}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-xs"
                      onClick={() => setExpandedSaloon(exp => exp === s.salao ? null : s.salao)}
                    >
                      {expandedSaloon === s.salao ? 'Ocultar' : 'Detalhar'}
                    </button>
                  </td>
                </tr>
                {expandedSaloon === s.salao && (
                  <tr>
                    <td colSpan={6} className="bg-gray-900 p-0">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-200">Detalhe das Mesas ({s.salao})</h3>
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              <th className="px-3 py-1 text-left text-gray-300">Mesa</th>
                              <th className="px-3 py-1 text-left text-gray-300">Qtd. Apostas</th>
                              <th className="px-3 py-1 text-left text-gray-300">Total Apostado (R$)</th>
                              <th className="px-3 py-1 text-left text-gray-300">Lucro (R$)</th>
                              <th className="px-3 py-1 text-left text-gray-300">ROI (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.mesasDetalhe.map(m => (
                              <tr key={m.mesa} className="border-t border-gray-700 hover:bg-gray-700/40">
                                <td className="px-3 py-1 font-semibold text-gray-100">{m.mesa}</td>
                                <td className="px-3 py-1">{m.count}</td>
                                <td className="px-3 py-1">{m.totalStaked}</td>
                                <td className={`px-3 py-1 ${parseFloat(m.totalProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{m.totalProfit}</td>
                                <td className={`px-3 py-1 ${parseFloat(m.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{m.roi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardKPI title="Lucro Total (R$)" value={kpis.totalProfit} icon={TrendingUp} description="Soma de todos os lucros e prejuízos no período." />
        <CardKPI title="Taxa de Acerto (%)" value={kpis.winRate} icon={Percent} description="Percentual de apostas vencedoras." />
        <CardKPI title="ROI (%)" value={kpis.roi} icon={BarChartBig} description="Retorno sobre o valor apostado." />
        <CardKPI title="Qtd. de Apostas" value={kpis.totalBets} icon={Users} description="Total de apostas feitas no período." />
        <CardKPI title="Lucro Médio por Aposta (R$)" value={kpis.avgProfit} icon={TrendingUp} description="Média de lucro/prejuízo por aposta." />
        <CardKPI title="Maior Sequência de Greens" value={kpis.maxGreen} icon={TrendingUp} description="Maior sequência de apostas ganhas." />
        <CardKPI title="Maior Sequência de Reds" value={kpis.maxRed} icon={TrendingDown} description="Maior sequência de apostas perdidas." />
        <CardKPI title="Total Apostado (R$)" value={kpis.totalStaked} icon={CalendarDays} description="Soma de todos os valores apostados." />
      </div>
    </div>
  );
};

export default Inicial; 