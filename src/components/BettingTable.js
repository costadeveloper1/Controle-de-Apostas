import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit3, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Hourglass, X } from 'lucide-react'; // Ícones para paginação

const BETS_PER_PAGE = 30;

const BettingTable = ({ bets, onEditBet, onDeleteBet, filterDate, setFilterDate }) => {
  const [activeDropdown, setActiveDropdown] = useState(null); // ID da aposta cujo dropdown está ativo
  const [currentPage, setCurrentPage] = useState(1);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [datePickerRef]);

  const toggleDropdown = (betId) => {
    setActiveDropdown(activeDropdown === betId ? null : betId);
  };

  const handleEdit = (bet) => {
    onEditBet(bet); // onEdit deve receber o objeto da aposta completo
    setActiveDropdown(null);
  };

  const handleDelete = (betId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aposta?')) {
      onDeleteBet(betId);
    }
    setActiveDropdown(null);
  };

  if (!bets || bets.length === 0) {
    return <p className="text-center text-gray-400 py-10">Nenhuma aposta registrada ainda.</p>;
  }

  const formatMarketMinutes = (marketMinutes) => {
    if (!marketMinutes || String(marketMinutes).trim() === 'Não especificado') return 'N/A';
    return String(marketMinutes).replace(/\s+/g, ''); 
  };

  const getStatusColor = (status, result, profit) => {
    const s = status ? String(status).toLowerCase() : '';
    const r = result ? String(result).toLowerCase() : '';

    if (s === 'won' || r === 'green' || r === 'ganha') return 'text-green-400';
    if (s === 'lost' || r === 'red' || r === 'perdida') return 'text-red-400';
    if (s === 'void' || r === 'devolvida') return 'text-yellow-400';
    
    if (s === 'cashed_out' || r === 'cashout') {
      if (typeof profit === 'number') {
        if (profit > 0) return 'text-green-400'; // Cashout com lucro -> Verde
        if (profit < 0) return 'text-red-400';   // Cashout com prejuízo -> Vermelho
      }
      return 'text-blue-400'; // Cashout sem lucro/prejuízo ou profit não numérico -> Azul
    }
    return 'text-gray-300'; // Cor padrão para status pendente ou não mapeado
  };

  const formatStatusDisplay = (status, result, profit) => {
    const s = status ? String(status).toLowerCase() : '';
    const r = result ? String(result).toLowerCase() : '';

    if (s === 'won' || r === 'green' || r === 'ganha') return 'Green';
    if (s === 'lost' || r === 'red' || r === 'perdida') return 'Perdida';
    if (s === 'void' || r === 'devolvida') return 'Devolvida';
    
    if (s === 'cashed_out' || r === 'cashout') {
      if (typeof profit === 'number') {
        if (profit > 0) return 'Green';
        if (profit < 0) return 'Perdida';
      }
      return 'Cashout'; // Se profit não for número ou for 0, exibe Cashout
    }

    if (s === 'pending' || r === 'pendente') return 'Pendente';
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pendente'; 
  };

  // Ordenar as apostas por data, times e mercado
  const sortedBets = [...bets].sort((a, b) => {
    // Primeiro, comparar as datas (ordem decrescente)
    const dateA = new Date(a.date.split('/').reverse().join('-') + 'T00:00:00');
    const dateB = new Date(b.date.split('/').reverse().join('-') + 'T00:00:00');
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    
    // Se as datas forem iguais, criar uma chave única para o jogo
    const getGameKey = (bet) => {
      return `${bet.homeTeam || ''}|${bet.awayTeam || ''}`.toLowerCase();
    };
    
    const gameKeyA = getGameKey(a);
    const gameKeyB = getGameKey(b);
    
    if (gameKeyA !== gameKeyB) {
      return gameKeyA.localeCompare(gameKeyB);
    }
    
    // Se for o mesmo jogo, ordenar pelo mercado (minutos) em ordem decrescente
    const getMinutes = (market) => {
      const match = market?.match(/(\d+)/);
      return match ? parseInt(match[1]) : -1;
    };
    
    const aMinutes = getMinutes(a.marketMinutes);
    const bMinutes = getMinutes(b.marketMinutes);
    return bMinutes - aMinutes;
  });

  // Lógica de Paginação
  const indexOfLastBet = currentPage * BETS_PER_PAGE;
  const indexOfFirstBet = indexOfLastBet - BETS_PER_PAGE;
  const currentBetsToDisplay = sortedBets.slice(indexOfFirstBet, indexOfLastBet);
  const totalPages = Math.ceil(sortedBets.length / BETS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full w-full table-auto bg-gray-800 rounded-b-lg">
        <thead className="bg-gray-700">
          <tr>
            {['DATA', 'CAMPEONATO', 'CASA', 'FORA', 'ENTRADA', 'MERCADO', 'ODD', 'STATUS', 'LUCRO', 'AÇÕES'].map(header => (
              <th key={header} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-yellow-400 uppercase tracking-wider whitespace-nowrap">
                {header === 'DATA' ? (
                  <div className="flex items-center justify-center gap-2 relative" ref={datePickerRef}>
                    <span>DATA</span>
                    <Hourglass size={16} className="cursor-pointer text-yellow-400 hover:text-yellow-300" onClick={() => setIsDatePickerVisible(!isDatePickerVisible)} />
                    {isDatePickerVisible && (
                      <div className="absolute top-full mt-2 right-0 z-10 bg-gray-600 p-2 rounded-md shadow-lg">
                         <div className="relative">
                           <input
                              type="date"
                              id="tableFilterDate"
                              value={filterDate}
                              onChange={(e) => setFilterDate(e.target.value)}
                              className="bg-gray-700 border border-gray-500 text-gray-200 p-1 rounded-md text-sm focus:ring-red-500 focus:border-red-500 w-full"
                           />
                           {filterDate && (
                              <button onClick={() => setFilterDate('')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                <X size={14} />
                              </button>
                           )}
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {currentBetsToDisplay.map((bet) => (
            <tr key={bet.id} className="hover:bg-gray-750 transition-colors duration-150">
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">
                {bet.date ? new Date(bet.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}
              </td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">{bet.championship || 'N/A'}</td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">{bet.homeTeam || 'N/A'}</td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">{bet.awayTeam || 'N/A'}</td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-right">
                {typeof bet.stake === 'number' ? `R$ ${bet.stake.toFixed(2).replace('.', ',')}` : 'N/A'}
              </td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">{formatMarketMinutes(bet.marketMinutes)}</td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200 text-center">{typeof bet.odd === 'number' ? bet.odd.toFixed(2).replace('.', ',') : 'N/A'}</td>
              <td className={`px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold ${getStatusColor(bet.status, bet.result, bet.profit)} text-center`}>
                {formatStatusDisplay(bet.status, bet.result, bet.profit)}
              </td>
              <td className={`px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold ${bet.profit > 0 ? 'text-green-400' : bet.profit < 0 ? 'text-red-400' : 'text-yellow-400'} text-right`}>
                {typeof bet.profit === 'number' ? `R$ ${bet.profit.toFixed(2).replace('.', ',')}` : 'N/A'}
              </td>
              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-400 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button onClick={() => handleEdit(bet)} className="hover:text-yellow-400 transition-colors duration-150" title="Editar Aposta">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(bet.id)} className="hover:text-red-400 transition-colors duration-150" title="Excluir Aposta">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="py-3 flex items-center justify-center gap-3 text-sm text-green-200">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Próxima <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BettingTable; 