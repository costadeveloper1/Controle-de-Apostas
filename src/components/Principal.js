import React, { useState, useMemo } from 'react';
import { Upload, Plus, X, CalendarDays } from 'lucide-react';
import BettingTable from './BettingTable';

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

const Principal = ({
  bets,
  onEdit,
  onDelete,
  stats,
  uniqueMarketCategories,
  onImport,
  isLoading,
  importFeedback,
  onShowAddForm,
  onDeleteBetsByDate,
}) => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [selectedParser, setSelectedParser] = useState('over05'); // Default parser
  const [importDate, setImportDate] = useState(formatDateForInput(new Date()));
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');

  const [filterDate, setFilterDate] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState('Over 0.5');
  
  const availableParsers = [
    { key: 'over05', label: 'Over 0.5' },
    { key: 'zeroToTen', label: '0-10' },
    { key: 'asiaticosHT', label: 'Asiáticos HT' },
    { key: 'over15', label: 'Over 1.5' }
  ];

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
    setHtmlContent('');
    setFileName('');
  };
  
  const handleFileRead = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);

      // Lógica para extrair data do nome do ficheiro (ex: 23_05_2025.html)
      const dateMatch = file.name.match(/(\d{2})_(\d{2})_(\d{4})/);
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        const formattedDate = `${year}-${month}-${day}`;
        setImportDate(formattedDate);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    if (selectedParser && htmlContent && importDate) {
      onImport(selectedParser, htmlContent, importDate);
    } else {
      alert("Por favor, selecione um tipo de mercado, um ficheiro e uma data.");
    }
  };

  const marketTabs = ['Over 0.5', '0-10', 'Asiáticos HT', 'Over 1.5'];

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

  const filteredDashboardBets = useMemo(() => {
    let filtered = bets;

    if (filterDate) {
      filtered = filtered.filter(bet => bet.date === filterDate);
    }
    
    // Lógica de filtragem por categoria unificada e rigorosa para TODAS as abas.
    const categoryKey = availableParsers.find(p => p.label === activeMarketTab)?.key;
    if (categoryKey) {
      filtered = filtered.filter(bet => bet.marketCategory === categoryKey);
    }
    
    // --- LÓGICA DE ORDENAÇÃO ---
    return filtered.sort((a, b) => {
      // 1. Ordenar por data (mais recente primeiro)
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) {
        return dateComparison;
      }
      
      // 2. Ordenar por jogo (ordem alfabética)
      const matchA = `${a.homeTeam} vs ${a.awayTeam}`;
      const matchB = `${b.homeTeam} vs ${b.awayTeam}`;
      const matchComparison = matchA.localeCompare(matchB);
      if (matchComparison !== 0) {
        return matchComparison;
      }

      // 3. Ordenar por mercado (ordem alfabética)
      return a.market.localeCompare(b.market);
    });
    // --- FIM DA LÓGICA DE ORDENAÇÃO ---
    
  }, [bets, filterDate, activeMarketTab]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-y-3">
          
          <div className="w-full sm:w-auto sm:flex-1 order-2 sm:order-1">
            <div className="flex items-center border border-gray-700 rounded-lg p-0.5 max-w-max">
              {marketTabs.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveMarketTab(category)}
                  className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    activeMarketTab === category
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-auto sm:flex-1 text-center order-1 sm:order-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">Histórico de Apostas</h2>
          </div>
          
          <div className="w-full sm:w-auto sm:flex-1 flex justify-end order-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenImportModal}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md flex items-center justify-center text-xs sm:text-sm"
              >
                <Upload size={16} className="mr-1 sm:mr-2" />
                Importar
              </button>
              <button
                onClick={onShowAddForm}
                className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-medium py-2 px-3 sm:px-4 rounded-md flex items-center text-xs sm:text-sm"
              >
                <Plus size={16} className="mr-1 sm:mr-2" />
                Nova Aposta
              </button>
            </div>
          </div>
        </div>

        <BettingTable 
          bets={filteredDashboardBets} 
          onEditBet={onEdit} 
          onDeleteBet={onDelete} 
          filterDate={filterDate}
          setFilterDate={setFilterDate}
        />
      </div>

       {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700">
            <button onClick={handleCloseImportModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-center mb-6">Importar Histórico</h3>
            
            <div className="space-y-6">
               <div>
                <label htmlFor="parser-select" className="block text-sm font-medium text-gray-300 mb-2">Tipo de Mercado:</label>
                <select 
                  id="parser-select"
                  value={selectedParser}
                  onChange={(e) => setSelectedParser(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md p-2.5"
                >
                  {availableParsers.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="import-date" className="block text-sm font-medium text-gray-300 mb-2">Data das Apostas:</label>
                <input
                  type="date"
                  id="import-date"
                  value={importDate}
                  onChange={(e) => setImportDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md p-2.5"
                />
              </div>
              
              <div>
                <label htmlFor="html-file-upload" className="block text-sm font-medium text-gray-300 mb-2">Arquivo HTML:</label>
                <label htmlFor="html-file-upload" className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-md p-3 flex items-center justify-center gap-3 cursor-pointer transition-colors">
                  <Upload size={20} />
                  <span>{fileName ? 'Trocar arquivo' : 'Escolher arquivo'}</span>
                </label>
                <input
                  type="file"
                  id="html-file-upload"
                  accept=".html,.htm"
                  onChange={handleFileRead}
                  className="hidden"
                />
                {fileName && <p className="text-center text-sm text-gray-400 mt-2">{fileName}</p>}
              </div>
            </div>

            {importFeedback && importFeedback.message && (
              <div className={`mt-6 p-3 rounded-md text-center text-sm ${
                importFeedback.type === 'error' ? 'bg-red-900/50 text-red-300' :
                importFeedback.type === 'success' ? 'bg-green-900/50 text-green-300' :
                'bg-blue-900/50 text-blue-300'
              }`}>
                {importFeedback.message}
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <button 
                  onClick={() => onDeleteBetsByDate(importDate)} 
                  disabled={isLoading}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <X size={16} /> Excluir por Data
              </button>
              <div className="flex justify-end gap-4">
                <button onClick={handleCloseImportModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">
                  Cancelar
                </button>
                <button 
                  onClick={handleImportClick} 
                  disabled={!htmlContent || isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Importando...' : 'Importar Apostas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Principal; 