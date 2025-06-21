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
 * Faz o parsing de uma string HTML da Bet365 para extrair as apostas.
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
    // Chama o nosso "Engenheiro" para analisar a aposta, informando o tipo de mercado
    const betData = extractMarketInfo(betElement, selectedDate, 'over05');

    // FILTRO FINAL: Apenas importar apostas que foram categorizadas com sucesso.
    // Isto ignora automaticamente "Escanteios Asiáticos", "Cartões", etc.,
    // pois a "Decisão" para eles no nosso log era "N/A".
    if (betData && betData.marketMinutes !== 'N/A') {
      allBetsData.push(betData);
    }
  });

  return allBetsData;
}; 