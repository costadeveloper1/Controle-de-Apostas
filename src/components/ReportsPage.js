import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TrendingUp, Target, BarChart3, HelpCircle, TrendingDown, Filter, CalendarDays, Trophy, CandlestickChart, ListOrdered, BarChartHorizontal } from 'lucide-react';
import StatsCard from './StatsCard';
import LucroAcumuladoChart from './LucroAcumuladoChart';
import DesempenhoPeriodoChart from './DesempenhoPeriodoChart';
import RelatorioCampeonato from './RelatorioCampeonato';
import RelatorioMercado from './RelatorioMercado';
import RelatorioTopBets from './RelatorioTopBets';
import RelatorioDiaSemana from './RelatorioDiaSemana';
import TopGPReport from './TopGPReport';

// Função auxiliar para formatar datas para input (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const ReportsPage = ({ allBetsFromTracker, uniqueMarketCategories }) => {
  // console.log("--- ReportsPage Iniciada, allBetsFromTracker count:", allBetsFromTracker?.length);

  const [activeView, setActiveView] = useState('overview'); // overview, campeonato, mercado, etc.

  // Estados para datas
  const [inputStartDate, setInputStartDate] = useState('');
  const [inputEndDate, setInputEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [activeMarketCategory, setActiveMarketCategory] = useState('Todos');

  const categoryDisplayMap = {
    'Todos': 'Over 0.5',
    'Minutos': 'Minutos',
    'Asiáticos HT': 'Asiáticos HT',
    'Asiáticos FT': '0-10',
    '0-10': '0-10',
    'Outros': 'Over 1.5'
  };

  useEffect(() => {
    // Se a aba ativa não existir mais nas categorias, volte para a primeira disponível
    if (uniqueMarketCategories && uniqueMarketCategories.length > 0 && !uniqueMarketCategories.includes(activeMarketCategory)) {
      setActiveMarketCategory(uniqueMarketCategories[0]);
    }
  }, [uniqueMarketCategories, activeMarketCategory]);

  const handleFilterApply = () => {
    setAppliedStartDate(inputStartDate);
    setAppliedEndDate(inputEndDate);
  };
  
  const setPeriodToday = () => {
    const today = formatDateForInput(new Date());
    setInputStartDate(today);
    setInputEndDate(today);
    setAppliedStartDate(today);
    setAppliedEndDate(today);
  }

  const setDefaultPeriod = useCallback(() => {
    let start, end;
    if (allBetsFromTracker && allBetsFromTracker.length > 0) {
      const sortedBets = [...allBetsFromTracker].sort((a, b) => new Date(a.date) - new Date(b.date));
      start = formatDateForInput(new Date(sortedBets[0]?.date || new Date()));
      end = formatDateForInput(new Date());
    } else {
      const todayFormatted = formatDateForInput(new Date());
      start = todayFormatted;
      end = todayFormatted;
    }
    setInputStartDate(start);
    setInputEndDate(end);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
  }, [allBetsFromTracker]);
  
  useEffect(() => {
    setDefaultPeriod();
  }, [setDefaultPeriod]);

  const filteredBets = useMemo(() => {
    if (!allBetsFromTracker || !appliedStartDate || !appliedEndDate) return []; 
    
    const filterStart = new Date(appliedStartDate + "T00:00:00Z");
    const filterEnd = new Date(appliedEndDate + "T23:59:59Z");

    if (filterStart > filterEnd) {
        // console.warn("Data inicial é posterior à data final. Retornando array vazio para filteredBets.");
        return [];
    }

    let filtered = allBetsFromTracker.filter(bet => {
      if (!bet.date) return false; 
      const betDate = new Date(bet.date + "T00:00:00Z"); 
      return betDate >= filterStart && betDate <= filterEnd;
    });

    if (activeMarketCategory !== 'Todos') {
      filtered = filtered.filter(bet => bet.marketCategory === activeMarketCategory);
    }
    
    return filtered;
  }, [allBetsFromTracker, appliedStartDate, appliedEndDate, activeMarketCategory]);

  const stats = useMemo(() => {
    const betsToAnalyze = filteredBets;
    // console.log("[Stats Calculation] betsToAnalyze count:", betsToAnalyze.length);

    const totalBets = betsToAnalyze.length;
    const wonBets = betsToAnalyze.filter(bet => bet.status === 'Green' || bet.status === 'won').length;
    const voidBets = betsToAnalyze.filter(bet => bet.status === 'Void' || bet.status === 'Devolvida' || bet.status === 'Cancelada').length;
    const halfWonBets = betsToAnalyze.filter(bet => bet.status === 'HalfWon').length;
    const halfLostBets = betsToAnalyze.filter(bet => bet.status === 'HalfLost').length;
    
    const totalInvested = betsToAnalyze.reduce((acc, bet) => {
        // Considerar stake apenas se não for void/devolvida/cancelada
        if (bet.status !== 'Void' && bet.status !== 'Devolvida' && bet.status !== 'Cancelada') {
            return acc + parseFloat(bet.value || bet.stake || 0); // Suportando 'value' ou 'stake'
        }
        return acc;
    }, 0);
    // console.log("[Stats Calculation] totalInvested:", totalInvested);
    
    const totalReturn = betsToAnalyze.reduce((acc, bet) => {
        const value = parseFloat(bet.value || bet.stake || 0);
        const odd = parseFloat(bet.odd || 0);
        const profitValue = parseFloat(bet.profit || 0); // Usar o profit se disponível

        // Se o profit já estiver calculado na aposta, podemos usá-lo para ter mais precisão,
        // especialmente para HalfWon/HalfLost, onde o cálculo do retorno pode ser complexo.
        // No entanto, para consistência, vamos recalcular o retorno com base no status, stake e odd.

        if (bet.status === 'Green' || bet.status === 'won') return acc + (value * odd);
        if (bet.status === 'HalfWon') return acc + value + (value * (odd - 1) / 2); 
        if (bet.status === 'HalfLost') return acc + (value / 2);
        if (bet.status === 'Void' || bet.status === 'Devolvida' || bet.status === 'Cancelada') return acc + value; // Retorna o stake
        // Para apostas perdidas ('Red', 'lost'), o retorno é 0, então não adiciona nada a acc.
        return acc;
    }, 0);
    // console.log("[Stats Calculation] totalReturn:", totalReturn);

    const profit = totalReturn - totalInvested;
    const roi = totalInvested > 0 ? (profit / totalInvested * 100) : 0;
        
    // Cálculos de hitRate, roi, averageOdd removidos daqui pois não são mais exibidos nos cards desta página
    // Mantendo apenas profit e totalBets para os cards locais.

    return { profit, totalBets, roi, totalInvested };
  }, [filteredBets]);

  const roiTooltipText = "ROI (Retorno Sobre o Investimento) mede o lucro ou prejuízo de um investimento em relação ao custo.";

  const renderContent = () => {
    switch (activeView) {
      case 'campeonato':
        return <RelatorioCampeonato bets={filteredBets} />;
      case 'mercado':
        return <RelatorioMercado bets={filteredBets} />;
      case 'top_gp':
        return <RelatorioTopBets bets={filteredBets} />;
      case 'dia_semana':
        return <RelatorioDiaSemana bets={filteredBets} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Lucro Acumulado</h3>
              <LucroAcumuladoChart filteredBets={filteredBets} />
            </div>
            <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Desempenho por Período</h3>
              <DesempenhoPeriodoChart filteredBets={filteredBets} startDate={appliedStartDate} endDate={appliedEndDate} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-6">Relatórios Detalhados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Coluna 1: Período (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-gray-800 shadow-lg rounded-lg p-3 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-200 mb-3 text-center">Período</h3>
            <div className="flex-grow flex flex-col justify-between">
              <div className="flex gap-2 w-full">
                <div className="flex-1 space-y-1">
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-400">Inicial:</label>
                  <input type="date" id="startDate" value={inputStartDate} onChange={(e) => setInputStartDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md p-1.5 text-sm"/>
                </div>
                <div className="flex-1 space-y-1">
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-400">Final:</label>
                  <input type="date" id="endDate" value={inputEndDate} onChange={(e) => setInputEndDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md p-1.5 text-sm"/>
                </div>
                <div className="flex-shrink-0 flex items-end">
                   <button onClick={handleFilterApply} title="Aplicar Filtro" className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-md flex items-center justify-center transition-colors h-[38px]">
                      <Filter size={16} />
                   </button>
                </div>
              </div>
              <div className="flex items-center shadow-lg rounded-md overflow-hidden mt-3">
                 {(uniqueMarketCategories || []).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveMarketCategory(category)}
                      className={`flex-1 px-2 py-2 text-xs font-bold transition-colors border-r border-gray-900/50 last:border-r-0
                        ${activeMarketCategory === category
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      {categoryDisplayMap[category] || category}
                    </button>
                  ))}
              </div>
            </div>
        </div>

        {/* Coluna 2: Stats (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col">
            <div className="bg-gray-800 shadow-lg rounded-lg p-3 flex-grow flex flex-col justify-center">
              <StatsCard title="TOTAL DE APOSTAS (Período)" value={stats.totalBets || 0} icon={<BarChart3 size={18} className="text-yellow-400" />} isCompact={true} />
              <hr className="border-gray-700 my-2" />
              <StatsCard title="LUCRO TOTAL (Período)" value={typeof stats.profit === 'number' ? `R$ ${stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'} icon={<TrendingUp size={18} className="text-green-400" />} isCompact={true} />
            </div>
        </div>
        
        {/* Coluna 3: Análises Detalhadas (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-gray-800 shadow-lg rounded-lg p-3">
           <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">Análises Detalhadas</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveView('campeonato')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold p-2 rounded-md flex items-center justify-center gap-2"><Trophy size={14}/> Campeonato</button>
                <button onClick={() => setActiveView('mercado')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold p-2 rounded-md flex items-center justify-center gap-2"><CandlestickChart size={14}/> Mercado</button>
                <button onClick={() => setActiveView('top_gp')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold p-2 rounded-md flex items-center justify-center gap-2"><ListOrdered size={14}/> Top G/P</button>
                <button onClick={() => setActiveView('dia_semana')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold p-2 rounded-md flex items-center justify-center gap-2"><CalendarDays size={14}/> Dia da Semana</button>
            </div>
             {activeView !== 'overview' && (
              <button onClick={() => setActiveView('overview')} className="mt-3 w-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold p-2 rounded-md flex items-center justify-center gap-2">
                <BarChartHorizontal size={14} /> Voltar à Visão Geral
              </button>
            )}
        </div>

        {/* Coluna 4: Top G/P (lg:col-span-4) */}
        <div className="lg:col-span-4">
            <TopGPReport bets={filteredBets} />
        </div>
      </div>

      {/* Área de Conteúdo Dinâmico */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsPage;