import React, { useState, useMemo } from 'react';
import { Upload, Plus, X, CalendarDays } from 'lucide-react';
import BettingTable from './BettingTable';
import ImportModal from './ImportModal';

const Principal = ({
  onShowAddForm,
  bets,
  onFileUpload,
  onEditBet,
  onDeleteBet,
  isImporting,
  importFeedback,
  clearImportFeedback,
  onDeleteBetsByDate,
  uniqueMarketCategories
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState('Over 0.5');

  const marketTabs = ['Over 0.5', '0-10', 'Asiáticos HT', 'Over 1.5'];

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    clearImportFeedback();
  };

  const filteredDashboardBets = useMemo(() => {
    let filtered = bets;

    if (filterDate) {
      filtered = filtered.filter(bet => bet.date === filterDate);
    }

    if (activeMarketTab !== 'Over 0.5') {
      filtered = filtered.filter(bet => bet.market === activeMarketTab);
    }
    
    return filtered;
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
                onClick={handleImportClick}
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
          onEditBet={onEditBet} 
          onDeleteBet={onDeleteBet} 
          filterDate={filterDate}
          setFilterDate={setFilterDate}
        />
      </div>

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={handleCloseImportModal}
          onConfirmImport={onFileUpload}
          isImporting={isImporting}
          feedback={importFeedback}
          clearFeedback={clearImportFeedback}
          onDeleteBetsByDate={onDeleteBetsByDate}
        />
      )}
    </div>
  );
};

export default Principal; 