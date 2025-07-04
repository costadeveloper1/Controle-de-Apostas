import { extractMarketInfo } from './parserUtils.js';

// Mapeamento dos status para o novo padrão.
const STATUS_MAP = {
  'ganha': 'won',
  'ganhou': 'won',
  'venceu': 'won',
  'perdida': 'lost',
  'perdeu': 'lost',
  'devolvida': 'void',
  'reembolso(push)': 'void',
  'reembolso': 'void',
  'push': 'void',
};

/**
 * Normaliza uma string de status para um valor padronizado.
 * @param {string} statusText - O texto do status (ex: "Ganha", "Perdida").
 * @returns {('won'|'lost'|'void'|null)} - O status normalizado.
 */
const normalizeStatus = (statusText) => {
  if (!statusText) return null;
  const lowerCaseStatus = statusText.toLowerCase().trim();
  return STATUS_MAP[lowerCaseStatus] || null;
};

/**
 * Faz o parsing de uma string HTML da Bet365 para extrair as apostas Over 0.5.
 * @param {string} htmlText - O conteúdo HTML da página de apostas resolvidas.
 * @param {string} selectedDate - A data a ser associada com as apostas importadas (formato YYYY-MM-DD).
 * @returns {Array<Object>} - Uma lista de objetos de aposta padronizados.
 */
export const parseOver05Bets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    // Extrai informações básicas
    const selectionText = betElement.querySelector('.myb-BetParticipant_ParticipantSpan')?.textContent.trim() || '';
    const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';
    const subHeaderText = betElement.querySelector('.myb-SettledBetItemHeader_SubHeaderText')?.textContent.trim() || '';

    // NOVO: Extrai status diretamente do HTML
    const statusText = betElement.querySelector('.myb-HalfAndHalfPill_TextStatusLHS')?.textContent.trim() || '';
    if (statusText.toLowerCase() === 'reembolso(push)') {
      // Ignora apostas com status Reembolso(Push)
      return;
    }

    // Função de normalização
    const normalize = str => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

    // Checagem robusta para "Mais de 0.5" e escanteios
    const isMaisDe05 = /mais\s*de\s*0\.5/i.test(selectionText) || /mais\s*de\s*0\.5/i.test(subHeaderText);
    const isEscanteios = /escanteio/i.test(marketDescription);
    const isAsiaticosPrimeiroTempo = normalize(marketDescription) === normalize('1º Tempo - Escanteios Asiáticos');
    const isMaisDeLinha = /mais\s*de/i.test(selectionText);
    const isEscanteiosAsiaticos = [normalize('Escanteios Asiáticos'), normalize('Total de Escanteios')].includes(normalize(marketDescription));

    if (isMaisDe05 && isEscanteios) {
      let marketMinutes = 'N/A';
      const timeMatch = (selectionText + ' ' + subHeaderText).match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        marketMinutes = `${timeMatch[1]}-${timeMatch[2]}`.replace(/\s/g, '');
      }
      const betData = extractMarketInfo(betElement, selectedDate, 'over05');
      betData.marketCategory = 'over05';
      betData.marketMinutes = marketMinutes;
      if (betData.marketMinutes !== 'N/A') {
        allBetsData.push(betData);
      }
    } else if (isAsiaticosPrimeiroTempo && isMaisDeLinha) {
      const betData = extractMarketInfo(betElement, selectedDate, 'over05');
      betData.marketCategory = 'over05';
      betData.marketMinutes = '40-Int';
      allBetsData.push(betData);
    } else if (isEscanteiosAsiaticos && isMaisDeLinha) {
      const betData = extractMarketInfo(betElement, selectedDate, 'over05');
      betData.marketCategory = 'over05';
      betData.marketMinutes = '80-Fim';
      allBetsData.push(betData);
    }
    // Caso contrário, ignora a aposta (não é Over 0.5 de escanteios nem asiáticos do 1º tempo)
    // OBS: Essa lógica de mesas especiais pode ser adaptada para outros salões futuramente!
  });

  // No final, retorna apenas apostas que não são void (Reembolso/Push)
  return allBetsData.filter(bet => bet.status !== 'void');
}; 