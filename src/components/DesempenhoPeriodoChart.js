import React from 'react';
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
      performance[key].profit += parseFloat(bet.profit || 0);
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
        performance[key].profit += parseFloat(bet.profit || 0);
    });
    sortedKeys = Object.keys(performance).sort();

  // Agrupar por DIA (< 7 dias)
  } else {
    filteredBets.forEach(bet => {
        const key = bet.date; // A própria data YYYY-MM-DD
        if (!performance[key]) performance[key] = { profit: 0 };
        performance[key].profit += parseFloat(bet.profit || 0);
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