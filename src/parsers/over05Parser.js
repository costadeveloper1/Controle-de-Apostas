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

    // Checagem robusta para "Mais de 0.5" e escanteios
    const isMaisDe05 = /mais\s*de\s*0\.5/i.test(selectionText) || /mais\s*de\s*0\.5/i.test(subHeaderText);
    const isEscanteios = /escanteio/i.test(marketDescription);

    if (isMaisDe05 && isEscanteios) {
      // Extrai o intervalo de minutos
      let marketMinutes = 'N/A';
      const timeMatch = (selectionText + ' ' + subHeaderText).match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        marketMinutes = `${timeMatch[1]}-${timeMatch[2]}`.replace(/\s/g, '');
      }
      // Usa extractMarketInfo para preencher os outros campos
      const betData = extractMarketInfo(betElement, selectedDate, 'over05');
      betData.marketCategory = 'over05';
      betData.marketMinutes = marketMinutes;
      // Só adiciona se o intervalo de minutos foi encontrado
      if (betData.marketMinutes !== 'N/A') {
        allBetsData.push(betData);
      }
    }
    // Caso contrário, ignora a aposta (não é Over 0.5 de escanteios)
  });

  return allBetsData;
}; 