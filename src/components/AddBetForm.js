import React, { useEffect, useState, useMemo } from 'react';
import { X, CalendarDays, Clock, Shield, Users, BarChartBig, TrendingUp, Percent, Edit3, Save, PlusSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const AddBetForm = ({
  show,
  onClose,
  formData,
  handleInputChange,
  handleSubmit,
  timeIntervals,
  championships,
  calculateProfit,
  editingBet
}) => {
  const [estimatedProfit, setEstimatedProfit] = useState(0);

  useEffect(() => {
    if (formData.odd && formData.result && formData.stake) {
      const profit = calculateProfit(formData.odd, formData.result, formData.stake);
      setEstimatedProfit(profit);
    } else {
      setEstimatedProfit(0);
    }
  }, [formData.odd, formData.result, formData.stake, calculateProfit]);

  const resultOptions = useMemo(() => [
    { value: 'won', label: 'Green (Ganha)' },
    { value: 'lost', label: 'Red (Perdida)' },
    { value: 'void', label: 'Devolvida (Void)' },
    { value: 'cashout', label: 'Cashout' },
  ], []);

  if (!show) {
    return null;
  }

  const formTitle = editingBet ? "Editar Aposta" : "Adicionar Nova Aposta";
  const submitButtonText = editingBet ? "Atualizar Aposta" : "Adicionar Aposta";
  const SubmitIcon = editingBet ? Save : PlusSquare;

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    // Validação manual dos campos obrigatórios
    if (!formData.date) {
      toast.error('Por favor, preencha a data do jogo.');
      return;
    }
    if (!formData.championship) {
      toast.error('Por favor, preencha o nome do campeonato.');
      return;
    }
    if (!formData.homeTeam) {
      toast.error('Por favor, preencha o nome do time da casa.');
      return;
    }
    if (!formData.awayTeam) {
      toast.error('Por favor, preencha o nome do time visitante.');
      return;
    }
    if (!formData.market) {
      toast.error('Por favor, selecione o mercado da aposta.');
      return;
    }
    if (!formData.marketMinutes) {
      toast.error('Por favor, selecione o intervalo de minutos.');
      return;
    }
    if (!formData.odd) {
      toast.error('Por favor, preencha a odd da aposta.');
      return;
    }
    if (!formData.stake) {
      toast.error('Por favor, preencha o valor da entrada (stake).');
      return;
    }
    if (!formData.status) {
      toast.error('Por favor, selecione o resultado da aposta.');
      return;
    }
    handleSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-40">
      <form onSubmit={handleLocalSubmit} className="bg-gray-800 p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 relative border border-gray-700">
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center sm:text-left">
          {formTitle}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data</label>
            <input type="date" name="date" id="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" required />
          </div>
          <div>
            <label htmlFor="championship" className="block text-sm font-medium text-gray-300 mb-1">Campeonato</label>
            <input type="text" list="championships-list" name="championship" id="championship" value={formData.championship} onChange={(e) => handleInputChange('championship', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" placeholder="Nome do Campeonato" required />
            <datalist id="championships-list">
              {championships.map(champ => <option key={champ} value={champ} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-300 mb-1">Time da Casa</label>
            <input type="text" name="homeTeam" id="homeTeam" value={formData.homeTeam} onChange={(e) => handleInputChange('homeTeam', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" placeholder="Nome do time da casa" required />
          </div>
          <div>
            <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-300 mb-1">Time Visitante</label>
            <input type="text" name="awayTeam" id="awayTeam" value={formData.awayTeam} onChange={(e) => handleInputChange('awayTeam', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" placeholder="Nome do time visitante" required />
          </div>
          <div>
            <label htmlFor="market" className="block text-sm font-medium text-gray-300 mb-1">Mercado</label>
            <select name="market" id="market" value={formData.market} onChange={(e) => handleInputChange('market', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500" required>
              <option value="" disabled>Selecione o mercado</option>
              <option value="Over 0.5">Over 0.5</option>
              <option value="0-10">0-10</option>
              <option value="Asiáticos HT">Asiáticos HT</option>
              <option value="Over 1.5">Over 1.5</option>
            </select>
          </div>
          <div>
            <label htmlFor="marketMinutes" className="block text-sm font-medium text-gray-300 mb-1">Intervalo de Minutos</label>
            <select name="marketMinutes" id="marketMinutes" value={formData.marketMinutes} onChange={(e) => handleInputChange('marketMinutes', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500" required>
              <option value="" disabled>Selecione o intervalo</option>
              {timeIntervals.map(interval => <option key={interval} value={interval}>{interval}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="odd" className="block text-sm font-medium text-gray-300 mb-1">Odd</label>
            <input type="text" name="odd" id="odd" value={formData.odd} onChange={(e) => handleInputChange('odd', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" placeholder="Ex: 1,85" required />
          </div>
          <div>
            <label htmlFor="stake" className="block text-sm font-medium text-gray-300 mb-1">Entrada (R$)</label>
            <input type="number" step="0.01" name="stake" id="stake" value={formData.stake} onChange={(e) => handleInputChange('stake', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500 placeholder-gray-400" placeholder="Ex: 100" required />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Resultado</label>
            <select name="status" id="status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-red-500 focus:border-red-500" required>
              <option value="" disabled>Selecione o resultado</option>
              {resultOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end pt-5 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 border-t border-gray-700 mt-5">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors">
            Cancelar
          </button>
          <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center order-first sm:order-last">
            <SubmitIcon size={16} className="mr-2" />
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBetForm; 