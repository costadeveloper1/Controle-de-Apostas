import * as XLSX from 'xlsx';

function sanitizeSheetName(name) {
  // Caso especial para '+ 4/6'
  if (name.trim() === '+ 4/6') return '+4_6';
  // Remove caracteres proibidos: \ / ? * [ ]
  return name.replace(/[\\\/\?\*\[\]]/g, '').trim();
}

function formatCurrencyBR(value) {
  if (typeof value !== 'number') value = parseFloat(value) || 0;
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getStatusText(bet) {
  const status = String(bet.status || bet.result).toLowerCase();
  if (status === 'won' || status === 'green' || status === 'ganha') return 'Ganha';
  if (status === 'lost' || status === 'red' || status === 'perdida') return 'Perdida';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Exporta apostas para um arquivo Excel (.xlsx), criando uma aba para cada salão e uma aba de Relatórios.
 * @param {Object[]} bets - Lista de apostas.
 * @param {Object} options - Opções de exportação.
 * @param {string[]} options.saloes - Chaves dos salões a exportar.
 * @param {string} options.startDate - Data inicial (YYYY-MM-DD).
 * @param {string} options.endDate - Data final (YYYY-MM-DD).
 * @param {Object} options.saloesLabels - Mapeamento de chave para nome do salão.
 * @param {Object} options.kpis - KPIs para a aba de Relatórios.
 */
export function exportToExcel(bets, { saloes, startDate, endDate, saloesLabels, kpis }) {
  // Filtra apostas por data e salão
  const filteredBets = bets.filter(bet => {
    if (!bet.date || !bet.marketCategory) return false;
    if (!saloes.includes(bet.marketCategory)) return false;
    // Datas no formato YYYY-MM-DD
    const betDate = bet.date.includes('/')
      ? bet.date.split('/').reverse().join('-')
      : bet.date;
    return betDate >= startDate && betDate <= endDate;
  });

  // Agrupa apostas por salão
  const betsBySaloon = {};
  saloes.forEach(key => {
    betsBySaloon[key] = filteredBets.filter(bet => bet.marketCategory === key);
  });

  // Cria as abas de cada salão
  const sheets = {};
  Object.entries(betsBySaloon).forEach(([key, betsArr]) => {
    if (betsArr.length === 0) return;
    const isRace = key === 'race' || key === 'plus46';
    const data = betsArr.map(bet => {
      const row = {
        'DATA': bet.date,
        'CAMPEONATO': bet.championship,
        'CASA': bet.homeTeam,
        'FORA': bet.awayTeam,
      };
      if (isRace) row['C/F'] = bet.cf || '';
      row['ENTRADA'] = formatCurrencyBR(bet.stake);
      // MERCADO: para over05 e asiaticosHT usar marketMinutes, para zeroToTen aplicar lógica especial
      if (key === 'over05' || key === 'asiaticosHT') {
        row['MERCADO'] = bet.marketMinutes || '';
      } else if (key === 'zeroToTen') {
        const marketLower = (bet.market || '').toLowerCase();
        const selectionLower = (bet.selection || '').toLowerCase();
        if (marketLower.includes('time da casa')) {
          row['MERCADO'] = 'CASA';
        } else if (marketLower.includes('time visitante')) {
          row['MERCADO'] = 'FORA';
        } else if (selectionLower.includes('mais de 1.0')) {
          row['MERCADO'] = '1';
        } else if (selectionLower.includes('mais de 0.0')) {
          row['MERCADO'] = '0';
        } else {
          row['MERCADO'] = bet.marketMinutes || '';
        }
      } else {
        row['MERCADO'] = bet.market;
      }
      row['ODD'] = bet.odd;
      row['STATUS'] = getStatusText(bet);
      row['LUCRO'] = formatCurrencyBR(bet.profit);
      return row;
    });
    // Ordem das colunas igual ao site
    const columns = isRace
      ? ['DATA', 'CAMPEONATO', 'CASA', 'FORA', 'C/F', 'ENTRADA', 'MERCADO', 'ODD', 'STATUS', 'LUCRO']
      : ['DATA', 'CAMPEONATO', 'CASA', 'FORA', 'ENTRADA', 'MERCADO', 'ODD', 'STATUS', 'LUCRO'];
    const sheet = XLSX.utils.json_to_sheet(data, { header: columns });
    // Forçar ordem das colunas
    XLSX.utils.sheet_add_aoa(sheet, [columns], { origin: 'A1' });
    const sheetName = sanitizeSheetName(saloesLabels[key] || key);
    sheets[sheetName] = sheet;
  });

  // Aba de Relatórios (KPIs)
  if (kpis) {
    const relatorioData = [
      { Indicador: 'Lucro Total', Valor: kpis.totalProfit },
      { Indicador: 'Taxa de Acerto (%)', Valor: kpis.winRate },
      { Indicador: 'ROI (%)', Valor: kpis.roi },
      { Indicador: 'Total de Apostas', Valor: kpis.totalBets },
      { Indicador: 'Odd Média', Valor: kpis.averageOdd },
      { Indicador: 'Total Investido', Valor: kpis.totalStaked },
    ];
    sheets[sanitizeSheetName('Relatórios')] = XLSX.utils.json_to_sheet(relatorioData);
  }

  // Monta o workbook
  const wb = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([name, sheet]) => {
    XLSX.utils.book_append_sheet(wb, sheet, name);
  });

  // Nome do arquivo
  const fileName = `Apostas_${startDate}_a_${endDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
} 