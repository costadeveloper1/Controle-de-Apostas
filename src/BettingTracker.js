import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Plus, TrendingUp, BarChart3, Target, Instagram, Linkedin, Mail, Twitter, TrendingDown, HelpCircle } from 'lucide-react';

import AddBetForm from './components/AddBetForm';
import Dashboard from './components/Dashboard';
import ReportsPage from './components/ReportsPage'; 
import StatsCard from './components/StatsCard';

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
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState({ type: '', message: '' });
  
  const initialFormData = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    championship: '',
    homeTeam: '',
    awayTeam: '',
    marketMinutes: '',
    odd: '',
    result: '',
    stake: 100
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  const timeIntervals = useMemo(() => [
    '0-9:59', '10-19:59', '20-29:59', '30-39:59', '40-49:59',
    '50-59:59', '60-69:59', '70-79:59', '80-fim'
  ], []);

  const uniqueChampionships = useMemo(() => {
    const allChampionships = bets.map(bet => bet.championship).filter(Boolean);
    return Array.from(new Set(allChampionships)).sort();
  }, [bets]);

  useEffect(() => {
    if (editingBet) {
      setFormData({
        date: editingBet.date,
        championship: editingBet.championship,
        homeTeam: editingBet.homeTeam,
        awayTeam: editingBet.awayTeam,
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
    if (!formData.homeTeam || !formData.awayTeam || !formData.marketMinutes || !formData.odd || !formData.result || !formData.championship || !formData.stake) {
      alert('Preencha todos os campos obrigatórios: Data, Campeonato, Time da Casa, Time Visitante, Intervalo de Minutos, Odd, Resultado e Entrada!');
      return;
    }

    const profit = calculateProfit(formData.odd, formData.result, formData.stake);
    
    const betData = {
      date: formData.date,
      championship: formData.championship,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
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

  const extractDateFromHeaderText = (text) => {
    if (!text) return null;

    const months = {
      'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
    };
    
    // Tenta encontrar "DD Mês" ex: "21 Jun"
    const match = text.match(/(\d{1,2})\s(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)/i);
    
    if (match) {
        const day = parseInt(match[1], 10);
        const monthName = match[2].toLowerCase();
        const month = months[monthName];
        
        const currentYear = new Date().getFullYear();
        // Lógica simples: se o mês da aposta for maior que o mês atual, assume o ano anterior.
        const year = new Date().getMonth() < month ? currentYear - 1 : currentYear;

        const date = new Date(year, month, day);
        return date.toISOString().split('T')[0]; // Retorna no formato YYYY-MM-DD
    }
    
    return null;
  };

  const parseBet365HTML = async (htmlString, selectedDateForImport) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        const betElements = doc.querySelectorAll('.myb-SettledBetItem');
        const parsedBetsPromises = []; 

        console.log("Total de elementos .myb-SettledBetItem encontrados:", betElements.length);

        for (let i = 0; i < betElements.length; i++) {
            const item = betElements[i];
            // console.log(`Processando item ${i + 1}`); // Removido para reduzir spam no console

            if (item.textContent && item.textContent.includes("Reembolso(Push)")) {
                // console.log(`Item ${i + 1} ignorado: Contém "Reembolso(Push)".`);
                continue; 
            }
            
            const marketDescriptionEl = item.querySelector('.myb-BetParticipant_MarketDescription');
            let marketDescriptionText = marketDescriptionEl ? marketDescriptionEl.textContent.trim() : '';

            if (marketDescriptionText) {
              const unwantedPattern = /Número de Cartões aos \d+ Minutos/gi;
              marketDescriptionText = marketDescriptionText.replace(unwantedPattern, '').trim();
              marketDescriptionText = marketDescriptionText.replace(/\s{2,}/g, ' ').trim();
              marketDescriptionText = marketDescriptionText.split('\n').map(line => line.trim()).filter(line => line).join(' ');
            }

            let marketMinutes = "Não especificado"; 
            const marketDescriptionLower = marketDescriptionText.toLowerCase();
            if (marketDescriptionLower.includes("1º tempo") && marketDescriptionLower.includes("escanteios asiáticos")) {
                marketMinutes = "40-Int";
            } else if (marketDescriptionLower.includes("primeiro tempo") && marketDescriptionLower.includes("escanteios asiáticos")) {
                marketMinutes = "40-Int";
            } else if (marketDescriptionLower.includes("total de escanteios")) {
                marketMinutes = "80-Fim";
            } else if (marketDescriptionLower.includes("escanteios asiáticos") && 
                       !marketDescriptionLower.includes("1º tempo") && 
                       !marketDescriptionLower.includes("primeiro tempo")) {
                marketMinutes = "80-Fim";
            }
            
            if (marketMinutes === "Não especificado") {
                const subHeaderTextEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
                if (subHeaderTextEl) {
                    const subHeaderText = subHeaderTextEl.textContent.trim();
                    const matchMinute = subHeaderText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                    if (matchMinute && matchMinute[1]) {
                        marketMinutes = matchMinute[1].replace(/\s+/g, '');
                    }
                } else {
                    const participantSpanEl = item.querySelector('.myb-BetParticipant_ParticipantSpan');
                    if (participantSpanEl) {
                        const participantSpanText = participantSpanEl.textContent.trim();
                        const matchMinute = participantSpanText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                        if (matchMinute && matchMinute[1]) {
                            marketMinutes = matchMinute[1].replace(/\s+/g, '');
                        }
                    }
                }
            }
            
            if (marketMinutes === "Não especificado" && !marketDescriptionLower.includes("mais de") && !marketDescriptionLower.includes("menos de")) {
                // console.log(`Item ${i + 1} ignorado: não parece ser de mercado de minutos. Mercado: "${marketDescriptionText}"`);
                 continue; 
            }

            // Lógica para determinar a categoria do mercado
            let marketCategory = 'Outros';
            if (marketMinutes !== "Não especificado" && !marketMinutes.includes("-")) {
                marketCategory = 'Minutos';
            } else if (marketDescriptionLower.includes("escanteios asiáticos")) {
                if (marketDescriptionLower.includes("1º tempo") || marketDescriptionLower.includes("primeiro tempo")) {
                    marketCategory = "Asiáticos HT";
                } else {
                    marketCategory = "Asiáticos FT";
                }
            } else if (marketDescriptionLower.includes("para marcar") && marketDescriptionLower.includes("0-10")) {
                 marketCategory = "0-10";
            }
            // Adicione mais regras aqui conforme necessário para outros mercados

            // Ajuste no filtro para incluir outros mercados como "0-10"
            if (marketCategory === 'Outros' && marketMinutes === "Não especificado" && !marketDescriptionLower.includes("mais de") && !marketDescriptionLower.includes("menos de")) {
                // console.log(`Item ${i + 1} ignorado: mercado não identificado. Mercado: "${marketDescriptionText}"`);
                 continue; 
            }

            const stakeEl = item.querySelector('.myb-SettledBetItemHeader_Text');
            const selectionEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
            const oddEl = item.querySelector('.myb-BetParticipant_HeaderOdds');
            const team1NameEl = item.querySelector('.myb-BetParticipant_Team1Name');
            const team2NameEl = item.querySelector('.myb-BetParticipant_Team2Name');
            const winLossIndicator = item.querySelector('.myb-WinLossIndicator');
            const returnAmountEl = item.querySelector('.myb-SettledBetItemFooter_BetInformationText');

            const stakeText = stakeEl ? stakeEl.textContent.trim() : '0';
            let stakeValue = 0;
            const stakeMatch = stakeText.match(/[\d,.]+/);
            if (stakeMatch && stakeMatch[0]) {
                stakeValue = parseFloat(stakeMatch[0].replace(/\./g, '').replace(',', '.'));
            }

            const homeTeam = team1NameEl ? team1NameEl.textContent.trim() : "Time Casa não encontrado";
            const awayTeam = team2NameEl ? team2NameEl.textContent.trim() : "Time Visitante não encontrado";
            const selection = selectionEl ? selectionEl.textContent.trim() : "Seleção não encontrada";
            const oddText = oddEl ? oddEl.textContent.trim() : '0';
            const oddValue = parseFloat(oddText.replace(',', '.')) || 0;

            let returnValue = 0;
            if (returnAmountEl) {
                const returnText = returnAmountEl.textContent.trim();
                const returnMatch = returnText.match(/[\d,.]+/);
                if (returnMatch && returnMatch[0]) {
                    returnValue = parseFloat(returnMatch[0].replace(/\./g, '').replace(',', '.'));
                }
            }

            let finalOdd = oddValue;
            let internalStatus = 'pending';
            let profit = 0;

            if (winLossIndicator) {
                if (winLossIndicator.classList.contains('myb-WinLossIndicator-won')) {
                    internalStatus = 'won'; profit = returnValue - stakeValue;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-lost')) {
                    internalStatus = 'lost'; profit = -stakeValue;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-void')) {
                    internalStatus = 'void'; profit = 0; finalOdd = 1.0;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-cashout')) {
                    internalStatus = 'cashed_out'; profit = returnValue - stakeValue;
                    if (profit > 0 && stakeValue > 0) finalOdd = (profit / stakeValue) + 1;
                    else if (profit === 0) finalOdd = 1.0;
                } else {
                    const statusLabelEl = item.querySelector('.myb-SettledBetItem_BetStateLabel');
                    const statusText = statusLabelEl ? statusLabelEl.textContent.trim().toLowerCase() : '';
                    if (statusText.includes('ganha')) { internalStatus = 'won'; profit = returnValue - stakeValue; }
                    else if (statusText.includes('perdida')) { internalStatus = 'lost'; profit = -stakeValue; }
                    else if (statusText.includes('devolvida')) { internalStatus = 'void'; profit = 0; finalOdd = 1.0; }
                    else if (statusText.includes('encerrada')) { internalStatus = 'cashed_out'; profit = returnValue - stakeValue;
                        if (profit > 0 && stakeValue > 0) finalOdd = (profit / stakeValue) + 1;
                        else if (profit === 0) finalOdd = 1.0;
                    }
                }
            } else {
                const statusLabelEl = item.querySelector('.myb-SettledBetItem_BetStateLabel');
                if (statusLabelEl) {
                    const statusText = statusLabelEl.textContent.trim().toLowerCase();
                    if (statusText.includes('ganha')) { internalStatus = 'won'; profit = returnValue - stakeValue; }
                    else if (statusText.includes('perdida')) { internalStatus = 'lost'; profit = -stakeValue; }
                    else if (statusText.includes('devolvida')) { internalStatus = 'void'; profit = 0; finalOdd = 1.0; }
                    else if (statusText.includes('encerrada')) { internalStatus = 'cashed_out'; profit = returnValue - stakeValue;
                        if (profit > 0 && stakeValue > 0) finalOdd = (profit / stakeValue) + 1;
                        else if (profit === 0) finalOdd = 1.0;
                    }
                } else {
                    // console.warn(`Item ${i + 1}: Status não pôde ser determinado.`);
                }
            }
            
            // Tenta extrair a data do texto do header. Usa a data da importação como fallback.
            const extractedDate = extractDateFromHeaderText(selection);
            const betDate = extractedDate || selectedDateForImport;

            let championship = "Aguardando busca...";
            if (homeTeam.toLowerCase().includes("flamengo") || awayTeam.toLowerCase().includes("flamengo")) championship = "Brasileirão Série A (Simulado)";
            else if (homeTeam.toLowerCase().includes("real madrid") || awayTeam.toLowerCase().includes("real madrid")) championship = "La Liga (Simulado)";
            else if (homeTeam.toLowerCase().includes("manchester city") || awayTeam.toLowerCase().includes("manchester city")) championship = "Premier League (Simulado)";
            else championship = "Campeonato Genérico (Simulado)";

            const bet = {
                id: `${betDate}-${homeTeam}-${awayTeam}-${marketMinutes}-${selection}-${stakeValue}`.replace(/\s+/g, '-').toLowerCase(),
                date: betDate,
                championship: championship,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                market: marketDescriptionText,
                marketCategory: marketCategory,
                marketMinutes: marketMinutes,
                stake: stakeValue,
                odd: parseFloat(finalOdd.toFixed(4)),
                status: internalStatus, 
                profit: parseFloat(profit.toFixed(2)),
                selection: selection,
            };
            
            if (stakeValue > 0 && finalOdd > 0 && homeTeam !== "Time Casa não encontrado" && marketMinutes !== "Não especificado") {
                parsedBetsPromises.push(Promise.resolve(bet));
            } else {
                // console.log(`Item ${i + 1}: Aposta inválida ou incompleta, não adicionada.`);
            }
        } 

        const parsedBets = await Promise.all(parsedBetsPromises);
        if (parsedBets.length === 0) {
            console.log("Nenhuma aposta válida foi encontrada no HTML.");
            // alert("Nenhuma aposta válida foi encontrada no arquivo HTML."); // Feedback já é dado via setImportFeedback
        }
        return parsedBets;

    } catch (error) {
        console.error("Erro ao processar o HTML da Bet365:", error);
        // alert("Erro ao processar o HTML. Verifique o console."); // Feedback já é dado via setImportFeedback
        return [];
    }
  };

  const clearImportFeedback = useCallback(() => {
    setImportFeedback({ type: '', message: '' });
  }, [setImportFeedback]); 

  const handleDeleteBetsByDate = useCallback((dateToDelete) => {
    if (!dateToDelete) {
      setImportFeedback({ type: 'error', message: 'Nenhuma data selecionada para exclusão.' });
      return;
    }
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir TODAS as apostas do dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')}?`);
    if (confirmDelete) {
      const actualDeletedCount = bets.filter(bet => bet.date === dateToDelete).length;
      setBets(prevBets => prevBets.filter(bet => bet.date !== dateToDelete));
      if (actualDeletedCount > 0) {
        setImportFeedback({ type: 'success', message: `${actualDeletedCount} aposta(s) do dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')} foram excluídas.` });
      } else {
        setImportFeedback({ type: 'info', message: `Nenhuma aposta encontrada para o dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')} para excluir.` });
      }
    } else {
      setImportFeedback({ type: 'info', message: 'Exclusão de apostas cancelada.' });
    }
  }, [bets, setBets, setImportFeedback]);

  const handleFileUpload = async (file, selectedDateForImport) => {
    clearImportFeedback();
    if (!selectedDateForImport) {
      setImportFeedback({ type: 'error', message: 'Por favor, selecione uma data para as apostas.' });
      return;
    }
    if (!file || file.type !== "text/html") {
      setImportFeedback({ type: 'error', message: 'Por favor, selecione um arquivo HTML válido.' });
      return;
    }
    setIsImporting(true);
    try {
      const htmlString = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
      const parsedBets = await parseBet365HTML(htmlString, selectedDateForImport);
      if (parsedBets && parsedBets.length > 0) {
        setBets(prevBets => {
          const newBetsToAdd = parsedBets.filter(newBet => 
            !prevBets.some(existingBet => existingBet.id === newBet.id)
          );
          if (newBetsToAdd.length > 0) {
            setImportFeedback({ type: 'success', message: `${newBetsToAdd.length} novas apostas importadas com sucesso para ${selectedDateForImport}!` });
            return [...newBetsToAdd, ...prevBets];
          }
          setImportFeedback({ type: 'info', message: 'Nenhuma nova aposta encontrada ou todas já existem.' });
          return prevBets;
        });
      } else {
        // Se parseBet365HTML já deu feedback (ex: Nenhuma aposta encontrada), respeitamos isso.
        // Caso contrário, damos um feedback genérico aqui.
        if (!importFeedback.message && parsedBets.length === 0) { // Verifica se parsedBets está vazio e nenhum feedback foi setado
            setImportFeedback({ type: 'info', message: 'Nenhuma aposta válida para importação foi encontrada no arquivo.' });
        }
      }
    } catch (error) {
      console.error("Erro em handleFileUpload:", error);
      setImportFeedback({ type: 'error', message: `Erro ao processar o arquivo: ${error.message || 'Erro desconhecido.'}` });
    }
    finally {
      setIsImporting(false);
    }
  };

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
        <div className="max-w-full mx-auto px-4">
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
              Dashboard
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
        </div>
      </div>

      <main className="flex-grow max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 w-full">
        <Routes>
          <Route 
            index
            element={
              <Dashboard 
                stats={stats}
                todayBetsCount={todayBetsCount}
                onShowAddForm={handleOpenAddForm}
                bets={bets}
                onFileUpload={handleFileUpload}
                onEditBet={handleEditBet}
                onDeleteBet={handleDeleteBet}
                isImporting={isImporting}
                importFeedback={importFeedback}
                clearImportFeedback={clearImportFeedback}
                onDeleteBetsByDate={handleDeleteBetsByDate}
                uniqueMarketCategories={uniqueMarketCategories}
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