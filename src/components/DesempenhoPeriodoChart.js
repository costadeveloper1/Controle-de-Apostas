import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DesempenhoPeriodoChart = ({ filteredBets, startDate, endDate }) => {
  // O hook useCallback foi movido para o topo do componente para seguir as "Regras dos Hooks" do React.
  // Desta forma, ele é chamado incondicionalmente a cada renderização.
  const calculateProfit = useCallback((odd, status, stake) => {
    const numericOdd = parseFloat(String(odd).replace(',', '.'));
    const numericStake = parseFloat(stake);

    if (!numericOdd || !numericStake || !status) return 0;

    if (status === 'won') {
      return (numericOdd - 1) * numericStake;
    } else if (status === 'lost') {
      return -numericStake;
    } else if (status === 'void' || status === 'cashout') {
      return 0;
    }
    return 0;
  }, []);

  const stats = useMemo(() => {
    // Esta função auxiliar fornece retrocompatibilidade enquanto os dados estão mistos.
    // Permite-nos obter um status padronizado para qualquer aposta, antiga ou nova.
    const getBetStatus = (bet) => {
      if (bet.status) return bet.status;
      if (bet.result) {
        const resultLower = bet.result.toLowerCase();
        if (resultLower.includes('ganha') || resultLower.includes('green')) return 'won';
        if (resultLower.includes('perdida') || resultLower.includes('red')) return 'lost';
        if (resultLower.includes('devolvida') || resultLower.includes('void')) return 'void';
        if (resultLower.includes('cashout')) return 'cashout';
      }
      return 'unknown';
    };

    const totalBets = filteredBets.length;
    const greenBetsCount = filteredBets.filter(bet => getBetStatus(bet) === 'won').length;
    const redBetsCount = filteredBets.filter(bet => getBetStatus(bet) === 'lost').length;
    
    const relevantBetsForWinRate = greenBetsCount + redBetsCount;

    const totalProfit = filteredBets.reduce((sum, bet) => {
      // Se o lucro já estiver calculado e guardado, usa-o.
      if (bet.profit !== undefined && bet.profit !== null) {
        return sum + bet.profit;
      }
      // Caso contrário, calcula-o em tempo real para retrocompatibilidade.
      const status = getBetStatus(bet);
      const odd = parseFloat(String(bet.odd).replace(',', '.')) || 0;
      const stake = parseFloat(String(bet.stake).replace(',', '.')) || 0;

      if (status === 'won') return sum + (odd - 1) * stake;
      if (status === 'lost') return sum - stake;
      return sum;
    }, 0);

    const winRate = relevantBetsForWinRate > 0 ? (greenBetsCount / relevantBetsForWinRate * 100) : 0;
    
    const greenBetsList = filteredBets.filter(bet => getBetStatus(bet) === 'won');
    const greenBetsOddsSum = greenBetsList.reduce((sum, bet) => sum + (parseFloat(String(bet.odd).replace(',', '.')) || 0), 0);
    const averageOdd = greenBetsCount > 0 ? (greenBetsOddsSum / greenBetsCount) : 0;

    const totalInvestido = filteredBets.reduce((sum, bet) => sum + (parseFloat(String(bet.stake).replace(',', '.')) || 0), 0);
    const roi = totalInvestido > 0 ? (totalProfit / totalInvestido * 100) : 0;

    return {
      totalProfit: totalProfit,
      totalBets: totalBets,
      greenBets: greenBetsCount,
      redBets: redBetsCount, 
      winRate: winRate,
      averageOdd: averageOdd,
      totalInvestido: totalInvestido,
      roi: roi
    };
  }, [filteredBets]);

  const initialFormData = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    championship: '',
    homeTeam: '',
    awayTeam: '',
    market: '',
    marketMinutes: '',
    odd: '',
    status: '',
    stake: 100
  }), []);

  if (!filteredBets || filteredBets.length === 0) {
    return <p className="text-gray-400 text-center py-8">Dados insuficientes para exibir o desempenho por período.</p>;
  }

  const getDayDiff = (d1, d2) => {
    if (!d1 || !d2) return 0;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  };

  const dayDiff = getDayDiff(startDate, endDate);
  let performance = {};
  let sortedKeys = [];

  // Agrupar por MÊS (default, > 30 dias)
  if (dayDiff > 30) {
    filteredBets.forEach(bet => {
      const date = new Date(bet.date + "T00:00:00Z");
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      if (!performance[key]) performance[key] = { profit: 0, year, month };
      performance[key].profit += calculateProfit(bet.odd, bet.status, bet.stake);
    });
    sortedKeys = Object.keys(performance).sort();
  
  // Agrupar por SEMANA (< 30 dias)
  } else if (dayDiff >= 7) {
    // Função para obter o início da semana (Segunda-feira) para uma data
    const getWeekStart = (date) => {
        const d = new Date(date + "T00:00:00Z");
        const day = d.getUTCDay(); // Dom=0, Seg=1, ..., Sáb=6
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
        return new Date(d.setUTCDate(diff));
    };
    
    filteredBets.forEach(bet => {
        const weekStartDate = getWeekStart(bet.date);
        const key = weekStartDate.toISOString().split('T')[0]; // Chave YYYY-MM-DD da segunda
        if (!performance[key]) performance[key] = { profit: 0, date: weekStartDate };
        performance[key].profit += calculateProfit(bet.odd, bet.status, bet.stake);
    });
    sortedKeys = Object.keys(performance).sort();

  // Agrupar por DIA (< 7 dias)
  } else {
    filteredBets.forEach(bet => {
        const key = bet.date; // A própria data YYYY-MM-DD
        if (!performance[key]) performance[key] = { profit: 0 };
        performance[key].profit += calculateProfit(bet.odd, bet.status, bet.stake);
    });
    sortedKeys = Object.keys(performance).sort();
  }

  const labels = sortedKeys.map(key => {
    if (dayDiff > 30) { // Label Mês
      const { year, month } = performance[key];
      const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'short' });
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${String(year).slice(-2)}`;
    }
    if (dayDiff >= 7) { // Label Semana
      const d = new Date(key + "T00:00:00Z");
      return `Sem ${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    }
    // Label Dia
    const [year, month, day] = key.split('-');
    return `${day}/${month}`;
  });

  const profitData = sortedKeys.map(key => performance[key].profit);
  
  // Definir cores das barras com base no lucro positivo ou negativo
  const backgroundColors = profitData.map(profit => profit >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)');
  const borderColors = profitData.map(profit => profit >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');

  const data = {
    labels,
    datasets: [
      {
        label: 'Lucro por Período (R$)',
        data: profitData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#cbd5e1', callback: (value) => `R$ ${value.toFixed(2)}` },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      },
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e2e8f0' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            return label;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DesempenhoPeriodoChart; 