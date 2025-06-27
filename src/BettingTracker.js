import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Plus, TrendingUp, BarChart3, Target, Instagram, Linkedin, Mail, Twitter, TrendingDown, HelpCircle } from 'lucide-react';

import AddBetForm from './components/AddBetForm';
import Principal from './components/Principal';
import ReportsPage from './components/ReportsPage';
import StatsCard from './components/StatsCard';
import { parsers } from './parsers/parserManager.js';

const BettingTracker = () => {
  const location = useLocation();
  const [bets, setBets] = useState(() => {
    const savedBets = localStorage.getItem('bets');
    try {
      return savedBets ? JSON.parse(savedBets) : [];
    } catch (error) {
      console.error("Erro ao parsear apostas do localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bets', JSON.stringify(bets));
  }, [bets]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBet, setEditingBet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importFeedback, setImportFeedback] = useState({ type: '', message: '' });
  
  const initialFormData = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    championship: '',
    homeTeam: '',
    awayTeam: '',
    market: '',
    marketMinutes: '',
    odd: '',
    result: '',
    stake: 100
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  const timeIntervals = useMemo(() => {
    if (formData.market === 'Over 1.5') {
      return ['0-14', '15-29', '30-Int', '45-60', '60-75', '80-fim'];
    }
    return [
      '0-9:59', '10-19:59', '20-29:59', '30-39:59', '40-49:59',
      '50-59:59', '60-69:59', '70-79:59', '80-fim'
    ];
  }, [formData.market]);

  const uniqueChampionships = useMemo(() => {
    const allChampionships = bets.map(bet => bet.championship).filter(Boolean);
    return Array.from(new Set(allChampionships)).sort();
  }, [bets]);

  const handleImport = useCallback((parserType, htmlString, importDate) => {
    setImportFeedback({ type: '', message: '' });
    setIsLoading(true);

    const parser = parsers[parserType];

    if (!parser) {
      console.error(`Nenhum parser encontrado para o tipo: ${parserType}`);
      setImportFeedback({ type: 'error', message: `Erro: Parser para '${parserType}' não foi encontrado.` });
      setIsLoading(false);
      return;
    }

    if (!htmlString || !importDate) {
        setImportFeedback({ type: 'error', message: 'Por favor, forneça o conteúdo HTML e selecione uma data.' });
        setIsLoading(false);
        return;
    }

    try {
      const parsedBets = parser(htmlString, importDate);

      if (parsedBets && parsedBets.length > 0) {
        const newBets = parsedBets.filter(pBet => 
          !bets.some(eBet => 
            eBet.match === pBet.match && 
            eBet.market === pBet.market && 
            eBet.date === pBet.date &&
            eBet.odd === pBet.odd &&
            eBet.stake === pBet.stake &&
            eBet.homeTeam === pBet.homeTeam &&
            eBet.awayTeam === pBet.awayTeam &&
            eBet.marketMinutes === pBet.marketMinutes &&
            eBet.championship === pBet.championship
          )
        );

        if (newBets.length > 0) {
          setBets(prevBets => [...newBets, ...prevBets]);
          setImportFeedback({ type: 'success', message: `${newBets.length} de ${parsedBets.length} apostas importadas com sucesso!` });
        } else {
          setImportFeedback({ type: 'info', message: 'Nenhuma aposta nova para importar. As apostas já existem.' });
        }
      } else {
        setImportFeedback({ type: 'info', message: 'Nenhuma aposta encontrada no HTML fornecido para este mercado.' });
      }
    } catch (error) {
      console.error("Erro durante o parsing:", error);
      setImportFeedback({ type: 'error', message: 'Ocorreu um erro ao processar o HTML. Verifique o console.' });
    } finally {
      setIsLoading(false);
    }
  }, [bets]);

  const handleDeleteBetsByDate = (dateToDelete) => {
    if (!dateToDelete) {
      alert("Por favor, selecione uma data para excluir.");
      return;
    }
    const formattedDate = dateToDelete.split('-').reverse().join('/');
    const userConfirmed = window.confirm(`Tem certeza que deseja excluir todas as apostas do dia ${formattedDate}? Esta ação não pode ser desfeita.`);
    if (userConfirmed) {
      setBets(prevBets => prevBets.filter(bet => bet.date !== dateToDelete));
      setImportFeedback({ type: 'success', message: `Apostas do dia ${formattedDate} foram excluídas.` });
    }
  };

  useEffect(() => {
    if (editingBet) {
      setFormData({
        date: editingBet.date,
        championship: editingBet.championship,
        homeTeam: editingBet.homeTeam,
        awayTeam: editingBet.awayTeam,
        market: editingBet.market || '',
        marketMinutes: editingBet.marketMinutes,
        odd: String(editingBet.odd).replace('.', ','), 
        result: editingBet.result || (editingBet.status === 'won' ? 'Ganha' : editingBet.status === 'lost' ? 'Perdida' : editingBet.status === 'void' ? 'Devolvida' : editingBet.status === 'cashed_out' ? 'Cashout' : ''),
        stake: editingBet.stake
      });
      setShowAddForm(true);
    } else {
      setFormData(initialFormData);
    }
  }, [editingBet, initialFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateProfit = (odd, result, stake) => {
    const numericOdd = parseFloat(String(odd).replace(',', '.'));
    const numericStake = parseFloat(stake);

    if (result === 'green' || result === 'Ganha') {
      return (numericOdd - 1) * numericStake;
    } else if (result === 'red' || result === 'Perdida') {
      return -numericStake;
    } else if (result === 'Devolvida' || result === 'Cashout' || result === 'void') {
      return 0;
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!formData.homeTeam || !formData.awayTeam || !formData.market || !formData.marketMinutes || !formData.odd || !formData.result || !formData.championship || !formData.stake) {
      alert('Preencha todos os campos obrigatórios: Data, Campeonato, Time da Casa, Time Visitante, Mercado, Intervalo de Minutos, Odd, Resultado e Entrada!');
      return;
    }

    const profit = calculateProfit(formData.odd, formData.result, formData.stake);
    
    const betData = {
      date: formData.date,
      championship: formData.championship,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      market: formData.market,
      marketMinutes: formData.marketMinutes,
      odd: parseFloat(String(formData.odd).replace(',', '.')),
      result: formData.result,
      stake: parseFloat(formData.stake),
      profit: profit,
    };

    if (editingBet) {
      setBets(prevBets => prevBets.map(b => b.id === editingBet.id ? { ...b, ...betData, id: editingBet.id, timestamp: editingBet.timestamp || new Date().toISOString() } : b));
      setEditingBet(null);
      alert('Aposta atualizada com sucesso!');
    } else {
      const newBet = {
        ...betData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      setBets(prev => [newBet, ...prev]);
      alert('Aposta adicionada com sucesso!');
    }
    
    setFormData(initialFormData);
    setShowAddForm(false);
  };

  const handleOpenAddForm = () => {
    setEditingBet(null);
    setFormData(initialFormData);
    setShowAddForm(true);
  };

  const handleEditBet = (betToEdit) => {
    setEditingBet(betToEdit);
  };

  const handleDeleteBet = (betId) => {
    setBets(prevBets => prevBets.filter(bet => bet.id !== betId));
    alert('Aposta excluída com sucesso!');
  };

  const stats = useMemo(() => {
    const totalBets = bets.length;
    const greenBetsList = bets.filter(bet => bet.status === 'won' || bet.result === 'green' || bet.result === 'Ganha');
    const greenBetsCount = greenBetsList.length;
    const redBetsCount = bets.filter(bet => bet.status === 'lost' || bet.result === 'red' || bet.result === 'Perdida').length;
    
    const relevantBetsForWinRate = bets.filter(bet => 
        (bet.status === 'won' || bet.result === 'green' || bet.result === 'Ganha') || 
        (bet.status === 'lost' || bet.result === 'red' || bet.result === 'Perdida')
    ).length;

    const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const winRate = relevantBetsForWinRate > 0 ? (greenBetsCount / relevantBetsForWinRate * 100) : 0;
    
    const greenBetsOddsSum = greenBetsList.reduce((sum, bet) => sum + (parseFloat(String(bet.odd).replace(',', '.')) || 0), 0);
    const averageOdd = greenBetsCount > 0 ? (greenBetsOddsSum / greenBetsCount) : 0;

    const totalInvestido = bets.reduce((sum, bet) => sum + (parseFloat(String(bet.stake).replace(',', '.')) || 0), 0);
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
  }, [bets]);

  const uniqueMarketCategories = useMemo(() => {
    const categories = bets.map(bet => bet.marketCategory).filter(Boolean);
    return ['Todos', ...Array.from(new Set(categories)).sort()];
  }, [bets]);

  const todayBetsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bets.filter(bet => bet.date === today).length;
  }, [bets]);

  let profitIcon;
  let profitIconColor = 'text-gray-400';
  if (stats.totalProfit > 0) {
    profitIcon = <TrendingUp />; profitIconColor = 'text-green-500';
  } else if (stats.totalProfit < 0) {
    profitIcon = <TrendingDown />; profitIconColor = 'text-red-500';
  } else { 
    profitIcon = <TrendingUp />;
  }

  const roiTooltipText = "ROI (Retorno Sobre o Investimento) mede o lucro ou prejuízo de um investimento em relação ao custo.";
  const dashboardLinkPath = "/";
  const reportsLinkPath = "/reports";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="bg-gray-200 shadow-md w-full border-b border-gray-300 py-4">
        <div className="max-w-full mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-x-6 gap-y-4">
            <div className="flex-shrink-0 order-1 sm:order-1">
              <img src="/logo.png" alt="Corner System Logo" className="h-28 sm:h-32" /> 
            </div>
            <div className="flex-grow text-center order-3 sm:order-2 my-2 sm:my-0"> 
              <p className="text-2xl sm:text-3xl font-sans text-gray-700 font-semibold">
                Em busca do <span className="text-3xl sm:text-4xl font-bold text-green-700">Green</span>
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full sm:w-auto order-2 sm:order-3">
              <StatsCard title="Lucro Total" value={`R$ ${stats.totalProfit.toFixed(2).replace('.', ',')}`} icon={profitIcon} bgColor="bg-gray-700" titleColor="text-gray-300" valueColor="text-white" iconColor={profitIconColor} valueSize="text-lg" textSize="text-base"/>
              <StatsCard title="Taxa de Acerto" value={`${stats.winRate.toFixed(1).replace('.', ',')}%`} icon={<BarChart3 />} bgColor="bg-gray-700" titleColor="text-gray-300" valueColor="text-white" iconColor="text-blue-500" valueSize="text-lg" textSize="text-base"/>
              <StatsCard title="ROI" value={`${stats.roi.toFixed(1).replace('.', ',')}%`} icon={<HelpCircle />} bgColor="bg-gray-700" titleColor="text-gray-300" valueColor="text-white" iconColor="text-blue-400" tooltipText={roiTooltipText} valueSize="text-lg" textSize="text-base" iconPosition="top-right"/>
              <div className="flex flex-col space-y-1.5 h-full">
                <StatsCard title="Total de Apostas" value={`${stats.totalBets}`} bgColor="bg-gray-700" titleColor="text-gray-300" valueColor="text-white" textSize="text-xs" valueSize="text-xs"/>
                <StatsCard title="Odd Média" value={`${stats.averageOdd.toFixed(2).replace('.', ',')}`} bgColor="bg-gray-700" titleColor="text-gray-300" valueColor="text-white" textSize="text-xs" valueSize="text-xs"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 border-b border-gray-600">
        <div className="max-w-full mx-auto px-4 flex items-center justify-between">
          <nav className="flex space-x-6 sm:space-x-8 justify-center sm:justify-start">
            <NavLink
              to={dashboardLinkPath}
              end
              className={({ isActive }) =>
                `py-2 sm:py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-300 hover:text-red-400'
                }`
              }
            >
              Principal
            </NavLink>
            <NavLink
              to={reportsLinkPath}
              className={({ isActive }) =>
                `py-2 sm:py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-300 hover:text-red-400'
                }`
              }
            >
              Relatórios
            </NavLink>
          </nav>
          <button
            className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md transition-colors text-sm"
            style={{ minWidth: '120px' }}
            // onClick={handleOpenExportModal} // Função a ser implementada
          >
            Exportar
          </button>
        </div>
      </div>

      <main className="flex-grow max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 w-full">
        <Routes>
          <Route 
            path="/" 
            element={
              <Principal
                bets={bets}
                onEdit={handleEditBet}
                onDelete={handleDeleteBet}
                onShowAddForm={handleOpenAddForm}
                stats={stats}
                uniqueMarketCategories={uniqueMarketCategories}
                onImport={handleImport}
                isLoading={isLoading}
                importFeedback={importFeedback}
                onDeleteBetsByDate={handleDeleteBetsByDate}
              />
            } 
          />
          <Route 
            path={reportsLinkPath}
            element={<ReportsPage allBetsFromTracker={bets} uniqueMarketCategories={uniqueMarketCategories} />}
          />
        </Routes>
      </main>

      <AddBetForm 
        show={showAddForm}
        onClose={() => { setShowAddForm(false); setEditingBet(null); }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        timeIntervals={timeIntervals}
        championships={uniqueChampionships}
        calculateProfit={calculateProfit}
        editingBet={editingBet}
      />

      <footer className="bg-gray-800 border-t border-gray-700 py-4 text-gray-400 text-xs mt-auto">
        <div className="max-w-full mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-y-2">
          <div className="text-center md:text-left space-y-1">
            <p>Developed by: <span className="font-bold text-gray-200">Bruno Costa</span></p>
            <div className="flex items-center justify-center md:justify-start space-x-3 flex-wrap">
              <a href="mailto:costa.developer1@gmail.com" className="flex items-center hover:text-red-400 whitespace-nowrap">
                <Mail size={14} className="mr-1.5" />
                costa.developer1@gmail.com
              </a>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <a href="https://www.instagram.com/costa.developer1" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-400 whitespace-nowrap">
                <Instagram size={14} className="mr-1.5" />
                @costa.developer1
              </a>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <a href="https://twitter.com/costa_developer" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-400 whitespace-nowrap">
                <Twitter size={14} className="mr-1.5" />
                @costa_developer
              </a>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <a href="https://www.linkedin.com/in/costadeveloper1/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-400 whitespace-nowrap">
                <Linkedin size={14} className="mr-1.5" />
                costadeveloper1
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BettingTracker;