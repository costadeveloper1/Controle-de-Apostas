import React, { useState } from 'react';
import { X, FileText, CalendarDays, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const SALOES = [
  { key: 'over05', label: 'Over 0.5' },
  { key: 'zeroToTen', label: '0-10' },
  { key: 'asiaticosHT', label: 'Asiáticos HT' },
  { key: 'over15', label: 'Over 1.5' },
  { key: 'race', label: 'RACE' },
  { key: 'plus46', label: '+ 4/6' },
];

const ExportModal = ({ isOpen, onClose, onExport, isExporting }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedSaloes, setSelectedSaloes] = useState(SALOES.map(s => s.key));
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [format, setFormat] = useState('google');
  const [googleToken, setGoogleToken] = useState(null);

  const handleSaloonChange = (key) => {
    setSelectedSaloes(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleExport = () => {
    if (selectedSaloes.length && startDate && endDate && format) {
      onExport({ saloes: selectedSaloes, startDate, endDate, format });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          disabled={isExporting}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center">Exportar Dados</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Salões:</label>
            <div className="flex flex-wrap gap-2">
              {SALOES.map(s => (
                <label key={s.key} className="flex items-center gap-2 text-gray-200 bg-gray-700 px-3 py-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSaloes.includes(s.key)}
                    onChange={() => handleSaloonChange(s.key)}
                    className="accent-green-600"
                    disabled={isExporting}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><CalendarDays size={16} className="mr-2 text-gray-400" />Data Inicial:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-green-500 focus:border-green-500"
                disabled={isExporting}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center"><CalendarDays size={16} className="mr-2 text-gray-400" />Data Final:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-green-500 focus:border-green-500"
                disabled={isExporting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Formato:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  value="google"
                  checked={format === 'google'}
                  onChange={() => setFormat('google')}
                  className="accent-green-600"
                  disabled={isExporting}
                />
                Google Sheets (padrão)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={() => setFormat('excel')}
                  className="accent-green-600"
                  disabled={isExporting}
                />
                Excel (.xlsx)
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2 pt-2 pb-2">
          <GoogleLogin
            onSuccess={credentialResponse => {
              setGoogleToken(credentialResponse.credential);
            }}
            onError={() => {
              setGoogleToken('Erro ao fazer login com Google');
            }}
            useOneTap={false}
            width="100%"
            text="signin_with"
            shape="pill"
            theme="filled_black"
          />
          {googleToken && (
            <div className="mt-2 w-full break-all text-xs bg-gray-900 text-green-300 p-2 rounded">
              <strong>Token Google:</strong> {googleToken}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-center items-center pt-5 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 border-t border-gray-700 mt-5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting || !selectedSaloes.length || !startDate || !endDate}
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <FileText size={16} className="mr-2" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 