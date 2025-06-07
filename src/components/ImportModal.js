import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CalendarDays, Loader2, Trash2 } from 'lucide-react';

// Função utilitária para extrair data do nome do arquivo
const parseDateFromFileName = (fileName) => {
  if (!fileName) return null;
  // Tenta encontrar DD_MM_YYYY ou DD-MM-YYYY no início do nome do arquivo (permitindo variações com ou sem .html)
  const match = fileName.match(/^(\d{2})[_-](\d{2})[_-](\d{4})/);
  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];
    // Valida se os componentes formam uma data razoável (não valida dias do mês especificamente aqui, mas o formato)
    if (parseInt(year, 10) > 2000 && parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }
  }
  return null;
};

const ImportModal = ({ 
  isOpen,
  onClose, 
  onConfirmImport, 
  isImporting, 
  feedback,
  clearFeedback,
  onDeleteBetsByDate
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Limpar feedback ao abrir ou se já estava aberto e algo mudou.
      // O feedback é limpo no Dashboard ao fechar, mas aqui limpamos também ao mudar data/arquivo.
      if (feedback && feedback.message && clearFeedback) clearFeedback(); 
    } else {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o valor do input de arquivo real
      }
      //setSelectedDate(new Date().toISOString().split('T')[0]); // Resetar data ao fechar? Ou manter a última?
                                                              // Por ora, não reseta a data ao fechar, apenas o arquivo.
    }
  // Adicionado clearFeedback e feedback às dependências se eles puderem mudar e causar re-execução.
  // No entanto, geralmente são funções estáveis. O principal é o `isOpen`.
  }, [isOpen, clearFeedback, feedback]); 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const dateFromFile = parseDateFromFileName(file.name);
      if (dateFromFile) {
        setSelectedDate(dateFromFile);
      }
    }
    if (feedback && feedback.message && clearFeedback) clearFeedback();
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    if (feedback && feedback.message && clearFeedback) clearFeedback();
  }

  const handleConfirm = () => {
    if (selectedFile && selectedDate) {
      onConfirmImport(selectedFile, selectedDate);
    }
  };

  const handleDeleteByDate = () => {
    if (onDeleteBetsByDate && selectedDate) { // Adicionado selectedDate check
      onDeleteBetsByDate(selectedDate);
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentFeedback = feedback || { type: '', message: '' };

  const feedbackBgColor = currentFeedback.type === 'success' ? 'bg-green-700' : 
                        currentFeedback.type === 'error'   ? 'bg-red-800' :   
                        currentFeedback.type === 'info'    ? 'bg-blue-700' :  
                                                      'bg-gray-700';
  const feedbackTextColor = currentFeedback.type === 'success' ? 'text-green-200' :
                            currentFeedback.type === 'error'   ? 'text-red-200' :
                            currentFeedback.type === 'info'    ? 'text-blue-200' :
                                                          'text-gray-200';
  const formattedSelectedDateForButton = selectedDate 
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') 
    : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 relative border border-gray-700">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          disabled={isImporting}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center">Importar Histórico</h2>
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <label htmlFor="import-modal-date" className="block text-sm font-medium text-gray-300 mb-1 flex items-center justify-center w-full">
              <CalendarDays size={16} className="mr-2 text-gray-400" /> Data das Apostas:
            </label>
            <input 
              type="date" 
              id="import-modal-date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full max-w-xs p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-600 text-center"
              disabled={isImporting}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <p className="block text-sm font-medium text-gray-300 mb-1 flex items-center justify-center w-full">
              <Upload size={16} className="mr-2 text-gray-400"/> Arquivo HTML:
            </p>
            <div className="flex flex-col items-center mt-1 w-full">
              <input 
                type="file" 
                id="import-modal-file-input"
                accept=".html" 
                onChange={handleFileChange}
                className="hidden" 
                disabled={isImporting}
                ref={fileInputRef}
              />
              <label 
                htmlFor="import-modal-file-input"
                className={`inline-block cursor-pointer px-4 py-2 rounded text-sm font-semibold transition-colors ${isImporting ? 'bg-yellow-700 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'}`}
              >
                Escolher arquivo
              </label>
              <p className="mt-1.5 text-xs text-gray-400 truncate text-center w-full px-2" title={selectedFile ? selectedFile.name : 'Nenhum arquivo escolhido'}>
                {selectedFile ? selectedFile.name : 'Nenhum arquivo escolhido'}
              </p>
            </div>
          </div>
        </div>

        {currentFeedback.message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${feedbackBgColor}`}>
            <p className={feedbackTextColor}>{currentFeedback.message}</p>
          </div>
        )}

        {isImporting && (
          <div className="flex items-center justify-center text-yellow-400 mt-4">
            <Loader2 size={20} className="animate-spin mr-2" />
            Processando arquivo...
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-center items-center pt-5 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 border-t border-gray-700 mt-5">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-gray-900 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isImporting || !selectedFile || !selectedDate}
          >
            {isImporting ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Upload size={16} className="mr-2" />
            )}
            {isImporting ? 'Importando...' : 'Importar Apostas'}
          </button>

          <button
            onClick={handleDeleteByDate}
            className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-red-700 hover:bg-red-800 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isImporting || !selectedDate}
            title={selectedDate ? `Excluir todas as apostas do dia ${formattedSelectedDateForButton}` : "Selecione uma data para excluir"}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir Apostas
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isImporting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal; 