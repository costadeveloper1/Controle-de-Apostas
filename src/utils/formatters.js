export const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const formatOdd = (value) => {
  if (typeof value !== 'number') {
    value = parseFloat(String(value).replace(',', '.')) || 0;
  }
  return value.toFixed(2).replace('.', ',');
};

export const getStatusClassAndText = (bet) => {
  let statusText = 'Pendente';
  let className = 'text-yellow-300'; // Cor padrão para pendente, devolvida, cashout

  // Prioriza o campo 'status' da importação se existir, senão usa 'result' do formulário manual
  const currentStatus = bet.status || bet.result;

  if (currentStatus === 'won' || currentStatus === 'green' || currentStatus === 'Ganha') {
    statusText = 'Green';
    className = 'text-green-400 font-semibold';
  } else if (currentStatus === 'lost' || currentStatus === 'red' || currentStatus === 'Perdida') {
    statusText = 'Red';
    className = 'text-red-400 font-semibold';
  } else if (currentStatus === 'void' || currentStatus === 'Devolvida') {
    statusText = 'Devolvida';
    className = 'text-gray-400'; // Cinza para devolvida
  } else if (currentStatus === 'cashed_out' || currentStatus === 'Cashout') {
    statusText = 'Cashout';
    className = 'text-blue-400'; // Azul para cashout
  } else if (currentStatus) { 
      statusText = String(currentStatus).charAt(0).toUpperCase() + String(currentStatus).slice(1);
  }
  
  return { statusText, className };
};

export const formatDateDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-'); // YYYY-MM-DD
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString; // Retorna original se não estiver no formato esperado
}; 