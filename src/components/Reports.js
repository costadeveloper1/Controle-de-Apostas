import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatsCard from './StatsCard'; // Supondo que StatsCard possa ser reutilizado
import { DollarSign, Percent, Hash, TrendingUp, TrendingDown, ListFilter, HelpCircle, CalendarDays } from 'lucide-react';

const Reports = ({ bets, timeIntervals, championships }) => {
  const [selectedChampionship, setSelectedChampionship] = useState('all');
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayISO = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayISO);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  
  const performanceByInterval = useMemo(() => {
    const intervalMap = timeIntervals.reduce((acc, interval) => {
      acc[interval] = { total: 0, green: 0, red: 0, profit: 0 };
      return acc;
    }, {});

    bets.forEach(bet => {
      if (selectedChampionship !== 'all' && bet.championship !== selectedChampionship) {
        return; // Pular aposta se não pertencer ao campeonato filtrado
      }
      if (bet.marketMinutes && intervalMap[bet.marketMinutes]) {
        intervalMap[bet.marketMinutes].total++;
        const profit = parseFloat(bet.profit) || 0;
        intervalMap[bet.marketMinutes].profit += profit;
        if (profit > 0) {
          intervalMap[bet.marketMinutes].green++;
        } else if (profit < 0) {
          intervalMap[bet.marketMinutes].red++;
        }
      }
    });
    return intervalMap;
  }, [bets, timeIntervals, selectedChampionship]);

  const performanceByChampionship = useMemo(() => {
    const championshipMap = {};
    bets.forEach(bet => {
      if (!bet.championship) return;
      if (!championshipMap[bet.championship]) {
        championshipMap[bet.championship] = { total: 0, green: 0, red: 0, profit: 0 };
      }
      championshipMap[bet.championship].total++;
      const profit = parseFloat(bet.profit) || 0;
      championshipMap[bet.championship].profit += profit;
      if (profit > 0) {
        championshipMap[bet.championship].green++;
      } else if (profit < 0) {
        championshipMap[bet.championship].red++;
      }
    });
    return championshipMap;
  }, [bets]);
  
  const renderPerformanceTable = (data, title, dataKeyIsName = false) => {
    const entries = Object.entries(data).filter(([_, stats]) => stats.total > 0); // Filtrar entradas com 0 apostas
    if (entries.length === 0) {
      return <p className="text-gray-400 text-sm">Nenhum dado para exibir {selectedChampionship !== 'all' ? `para ${selectedChampionship}` : ''}.</p>;
    }

    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">{title} {selectedChampionship !== 'all' && dataKeyIsName === false ? `(${selectedChampionship})` : ''}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-300 uppercase">{dataKeyIsName ? 'Campeonato' : 'Intervalo'}</th>
                <th className="px-3 py-2 text-center font-medium text-gray-300 uppercase">Total</th>
                <th className="px-3 py-2 text-center font-medium text-gray-300 uppercase">Green</th>
                <th className="px-3 py-2 text-center font-medium text-gray-300 uppercase">Red</th>
                <th className="px-3 py-2 text-center font-medium text-gray-300 uppercase">Taxa Acerto</th>
                <th className="px-3 py-2 text-right font-medium text-gray-300 uppercase">Lucro (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {entries.map(([key, stats]) => {
                const winRate = stats.total > 0 ? (stats.green / (stats.green + stats.red)) * 100 : 0;
                const winRateFixed = (stats.green + stats.red) > 0 ? winRate.toFixed(1) : 'N/A';
                return (
                  <tr key={key} className="hover:bg-gray-750">
                    <td className="px-3 py-2 text-gray-200 whitespace-nowrap">{key}</td>
                    <td className="px-3 py-2 text-gray-200 text-center">{stats.total}</td>
                    <td className="px-3 py-2 text-green-400 font-semibold text-center">{stats.green}</td>
                    <td className="px-3 py-2 text-red-400 font-semibold text-center">{stats.red}</td>
                    <td className={`px-3 py-2 font-semibold text-center ${winRate >= 50 ? 'text-green-400' : (winRateFixed === 'N/A' ? 'text-gray-300' : 'text-red-400')}`}>
                      {winRateFixed === 'N/A' ? winRateFixed : `${winRateFixed}%`}
                    </td>
                    <td className={`px-3 py-2 font-semibold text-right ${stats.profit > 0 ? 'text-green-400' : stats.profit < 0 ? 'text-red-400' : 'text-yellow-500'}`}>
                      R$ {stats.profit.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Memoizar as apostas filtradas para evitar recálculos desnecessários
  const filteredBets = useMemo(() => {
    if (!bets || bets.length === 0) return [];
    return bets.filter(bet => {
      if (!bet.date) return false;
      // As datas no objeto bet estão como DD/MM/YYYY, precisamos converter para YYYY-MM-DD para comparação
      const [day, month, year] = bet.date.split('/');
      const betDateISO = `${year}-${month}-${day}`;
      
      const sDate = startDate ? new Date(startDate + 'T00:00:00Z') : null;
      const eDate = endDate ? new Date(endDate + 'T23:59:59Z') : null;
      const bDate = new Date(betDateISO + 'T12:00:00Z'); // Usar meio-dia para evitar problemas de fuso de um dia

      if (sDate && bDate < sDate) return false;
      if (eDate && bDate > eDate) return false;
      return true;
    });
  }, [bets, startDate, endDate]);

  // TODO: Implementar cálculos de estatísticas e geração de dados para gráficos
  // Por enquanto, apenas exibiremos o número de apostas filtradas.

  const stats = useMemo(() => {
    if (!filteredBets || filteredBets.length === 0) {
      return {
        totalProfit: 0,
        winRate: 0,
        roi: 0,
        totalBets: 0,
        averageOdd: 0,
        totalStaked: 0,
      };
    }

    const totalBets = filteredBets.length;
    let totalProfit = 0;
    let totalStaked = 0;
    let wonBets = 0;
    let totalOddForWonBets = 0;

    filteredBets.forEach(bet => {
      const profit = parseFloat(bet.profit) || 0;
      const stake = parseFloat(bet.stake) || 0;
      totalProfit += profit;
      totalStaked += stake;

      // Considera green para taxa de acerto e odd média
      // Incluindo cashouts com lucro como 'won' para estatísticas
      const status = String(bet.status).toLowerCase();
      const result = String(bet.result).toLowerCase();
      
      let isWon = false;
      if (status === 'won' || result === 'green' || result === 'ganha') {
        isWon = true;
      } else if ((status === 'cashed_out' || result === 'cashout') && profit > 0) {
        isWon = true;
      }

      if (isWon) {
        wonBets++;
        if (bet.odd) {
            totalOddForWonBets += parseFloat(bet.odd);
        }
      }
    });

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
    const averageOdd = wonBets > 0 ? totalOddForWonBets / wonBets : 0;

    return {
      totalProfit,
      winRate,
      roi,
      totalBets,
      averageOdd,
      totalStaked
    };
  }, [filteredBets]);


  // Dados para o Gráfico de Lucro Acumulado
  const cumulativeProfitData = useMemo(() => {
    if (!filteredBets || filteredBets.length === 0) return [];

    const sortedByDate = [...filteredBets].sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/');
        const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
        const [dayB, monthB, yearB] = b.date.split('/');
        const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
        return dateA - dateB;
    });
    
    let accumulated = 0;
    const profitByDay = {};

    sortedByDate.forEach(bet => {
        const dateKey = bet.date; // DD/MM/YYYY
        const profit = parseFloat(bet.profit) || 0;
        if (!profitByDay[dateKey]) {
            profitByDay[dateKey] = 0;
        }
        profitByDay[dateKey] += profit;
    });

    // Agora transformar para o formato do gráfico, acumulando
    const chartData = [];
    // Precisamos garantir que as datas estejam ordenadas para o gráfico de linha
    const uniqueSortedDates = Object.keys(profitByDay).sort((a,b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
        const [dayB, monthB, yearB] = b.split('/');
        const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
        return dateA - dateB;
    });

    uniqueSortedDates.forEach(dateKey => {
        accumulated += profitByDay[dateKey];
        chartData.push({ date: dateKey, profit: accumulated });
    });
    
    return chartData;
  }, [filteredBets]);
  

  return (
    <div className="p-4 sm:p-6 bg-gray-900 text-gray-100 min-h-screen">
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
          <ListFilter size={24} className="mr-3"/>
          Filtros de Relatório
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="report-start-date" className="block text-sm font-medium text-gray-300 mb-1">
              <CalendarDays size={16} className="inline mr-1" /> Data Inicial:
            </label>
            <input 
              type="date"
              id="report-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="report-end-date" className="block text-sm font-medium text-gray-300 mb-1">
              <CalendarDays size={16} className="inline mr-1" /> Data Final:
            </label>
            <input 
              type="date"
              id="report-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
         <p className="mt-4 text-sm text-gray-400">
           Apostas encontradas para o período: <span className="font-bold text-yellow-400">{filteredBets.length}</span>
         </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Visão Geral do Período</h3>
        {filteredBets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatsCard 
              title="Lucro Total" 
              value={`R$ ${stats.totalProfit.toFixed(2).replace('.', ',')}`}
              icon={stats.totalProfit >= 0 ? TrendingUp : TrendingDown} 
              iconColor={stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}
              bgColor="bg-gray-700"
              titleSize="text-sm"
              valueSize="text-xl"
              isLoading={false} // Adicionar isLoading se for carregar dados async
            />
            <StatsCard 
              title="Taxa de Acerto" 
              value={`${stats.winRate.toFixed(1).replace('.', ',')}%`}
              icon={Percent} 
              iconColor="text-blue-400"
              bgColor="bg-gray-700"
              titleSize="text-sm"
              valueSize="text-xl"
            />
            <StatsCard 
              title="ROI" 
              value={`${stats.roi.toFixed(2).replace('.', ',')}%`}
              icon={HelpCircle} // Placeholder, pode ser um ícone mais específico para ROI
              iconColor="text-purple-400"
              bgColor="bg-gray-700"
              titleSize="text-sm"
              valueSize="text-xl"
              tooltipText="Retorno Sobre o Investimento: (Lucro Total / Total Investido) * 100"
            />
            <StatsCard 
              title="Total de Apostas" 
              value={stats.totalBets.toString()}
              icon={Hash} 
              iconColor="text-gray-400"
              bgColor="bg-gray-700"
              titleSize="text-sm"
              valueSize="text-xl"
            />
            <StatsCard 
              title="Odd Média (Ganha)" 
              value={stats.averageOdd > 0 ? stats.averageOdd.toFixed(2).replace('.', ',') : 'N/A'}
              icon={DollarSign} // Placeholder
              iconColor="text-orange-400"
              bgColor="bg-gray-700"
              titleSize="text-sm"
              valueSize="text-xl"
            />
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Nenhum dado para exibir as estatísticas.</p>
        )}
      </div>
      
      {/* Gráfico de Lucro Acumulado */}
      {filteredBets.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Lucro Acumulado no Período</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={cumulativeProfitData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A0AEC0" tickFormatter={(value) => `R$${value.toFixed(0)}`} tick={{ fontSize: 12 }}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.375rem' }}
                  labelStyle={{ color: '#F7FAFC', fontWeight: 'bold' }}
                  itemStyle={{ color: '#E2E8F0' }}
                  formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, "Lucro Acumulado"]}
                />
                <Legend wrapperStyle={{ color: '#A0AEC0' }}/>
                <Line type="monotone" dataKey="profit" name="Lucro Acumulado" stroke="#38A169" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Placeholder para as próximas seções (Fase 3 em diante) */}
      {/* 
      <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Desempenho por Campeonato (Em breve)</h3>
        <p className="text-gray-400">Análise detalhada por campeonato será adicionada aqui.</p>
      </div>
      */}

      {/* Adicionar mais seções conforme o plano */}
    </div>
  );
};

export default Reports; 