import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Importar Filler para preenchimento (área abaixo da linha)
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LucroAcumuladoChart = ({ filteredBets }) => {
  if (!filteredBets || filteredBets.length === 0) {
    return <p className="text-gray-400 text-center py-8">Dados insuficientes para exibir o gráfico de lucro acumulado.</p>;
  }

  // Ordenar as apostas por data para garantir a progressão correta do lucro acumulado
  const sortedBets = [...filteredBets].sort((a, b) => new Date(a.date) - new Date(b.date));

  // 1. Agrupar apostas por data
  const betsByDate = sortedBets.reduce((acc, bet) => {
    const date = bet.date;
    if (!acc[date]) {
      acc[date] = { dailyProfit: 0, betCount: 0 };
    }
    acc[date].dailyProfit += parseFloat(bet.profit || 0);
    acc[date].betCount += 1;
    return acc;
  }, {});

  // 2. Ordenar as datas
  const sortedDates = Object.keys(betsByDate).sort((a, b) => new Date(a) - new Date(b));

  let accumulatedProfit = 0;
  const profitData = [];
  const labels = [];

  // 3. Calcular dados do gráfico
  sortedDates.forEach(date => {
    accumulatedProfit += betsByDate[date].dailyProfit;
    profitData.push(accumulatedProfit);

    const dateLabel = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const dailyBetCount = betsByDate[date].betCount;
    labels.push(`${dateLabel} (${dailyBetCount})`);
  });

  const finalProfit = accumulatedProfit;
  const chartColor = finalProfit >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
  const chartBackgroundColor = finalProfit >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)';

  const data = {
    labels,
    datasets: [
      {
        label: 'Lucro Acumulado (R$)',
        data: profitData,
        fill: true, // Preencher a área abaixo da linha
        borderColor: chartColor,
        backgroundColor: chartBackgroundColor,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false, // Pode começar abaixo de zero se houver prejuízo
        ticks: {
          color: '#cbd5e1', // Cor dos ticks do eixo Y (cinza claro)
          callback: function(value) {
            return 'R$ ' + value.toFixed(2);
          }
        },
        grid: {
          color: 'rgba(203, 213, 225, 0.1)', // Cor das linhas de grade do eixo Y
        }
      },
      x: {
        ticks: {
          color: '#cbd5e1', // Cor dos ticks do eixo X
          maxRotation: 70, // Rotaciona os labels do eixo X se forem muitos
          minRotation: 20,
        },
        grid: {
          display: false, // Esconde as linhas de grade do eixo X para um visual mais limpo
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0', // Cor da legenda (cinza mais claro)
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}> {/* Definir altura para o container do gráfico */}
      <Line data={data} options={options} />
    </div>
  );
};

export default LucroAcumuladoChart; 