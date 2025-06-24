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
 * Extrai e padroniza os dados de um único elemento de aposta do HTML da Bet365.
 * @param {Element} betElement - O elemento do DOM que representa uma aposta.
 * @param {string} importDate - A data de importação no formato YYYY-MM-DD.
 * @returns {Object|null} - Um objeto de aposta padronizado ou null se não for possível processar.
 */
const parseSingleBet = (betElement, importDate) => {
  // Ignora apostas de reembolso
  if (betElement.textContent?.toLowerCase().includes("reembolso(push)")) {
    return null;
  }

  const teams = Array.from(betElement.querySelectorAll('.myb-Market-Header-TeamA, .myb-Market-Header-TeamB')).map(el => el.textContent.trim());
  const match = teams.length === 2 ? `${teams[0]} vs ${teams[1]}` : 'Jogo não identificado';

  const championshipEl = betElement.querySelector('.myb-Market-breadcrumb');
  const championship = championshipEl ? championshipEl.textContent.trim().split('/').pop().trim() : 'Campeonato não identificado';
  
  const oddEl = betElement.querySelector('.myb-BetParticipant_Odds');
  const oddText = oddEl ? oddEl.textContent.trim() : '0';
  const odd = parseFloat(oddText.replace(',', '.')) || 0;

  const stakeEl = betElement.querySelector('.myb-Bet-StakeAmount');
  const stakeText = stakeEl ? stakeEl.textContent.trim().replace('R$', '') : '0';
  const stake = parseFloat(stakeText.replace(',', '.')) || 0;

  const resultEl = betElement.querySelector('.myb-Bet-ReturnsAmount');
  const resultText = resultEl ? resultEl.textContent.trim() : '';

  const statusText = betElement.querySelector('.myb-Bet-ResultIndicator--WON, .myb-Bet-ResultIndicator--LOST, .myb-Bet-ResultIndicator--PUSH');
  const status = normalizeStatus(statusText ? statusText.textContent : 'void'); // Default to void if no clear indicator

  let profit = 0;
  if (status === 'won') {
    profit = (odd - 1) * stake;
  } else if (status === 'lost') {
    profit = -stake;
  }

  const marketDescriptionEl = betElement.querySelector('.myb-BetParticipant_MarketDescription');
  const marketDescriptionText = marketDescriptionEl ? marketDescriptionEl.textContent.trim() : '';
  const market = marketDescriptionText || 'Mercado não identificado';
  
  // Como este parser é para "Asiáticos HT", definimos marketMinutes como "HT"
  const marketMinutes = "HT";

  // Validação básica para garantir que a aposta tem o mínimo de informação.
  if (!match || stake === 0) {
    return null;
  }

  return {
    id: `imported-${Date.now()}-${Math.random()}`,
    date: importDate,
    timestamp: new Date().toISOString(),
    match,
    championship,
    market,
    marketCategory: "asiaticosHT", // Categoria padronizada para este parser
    marketMinutes,
    odd,
    stake,
    status,
    profit,
  };
};

/**
 * Faz o parsing de uma string HTML da Bet365 para extrair as apostas de Asiáticos HT.
 * @param {string} htmlText - O conteúdo HTML da página de apostas resolvidas.
 * @param {string} selectedDate - A data a ser associada com as apostas importadas (formato YYYY-MM-DD).
 * @returns {Array<Object>} - Uma lista de objetos de aposta padronizados.
 */
export const parseAsiaticosHTBets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    // Extrai os textos relevantes
    const selectionText = betElement.querySelector('.myb-BetParticipant_ParticipantSpan')?.textContent.trim() || '';
    const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';

    // Normalização para comparar ignorando acentos e maiúsculas/minúsculas
    const normalize = str => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';
    const isAsiaticosHT = normalize(marketDescription) === normalize('1º Tempo - Escanteios Asiáticos');
    const linhaMatch = selectionText.match(/mais\s*de\s*([\d,.]+)/i);
    const linha = linhaMatch ? linhaMatch[1].replace('.', ',') : null;

    if (isAsiaticosHT && linha) {
      // Extrai os dados normalmente
      const betData = extractMarketInfo(betElement, selectedDate, 'asiaticosHT');
      betData.marketCategory = 'asiaticosHT';
      betData.marketMinutes = linha;
      allBetsData.push(betData);
    }
    // Caso contrário, ignora a aposta (não é Asiáticos HT ou não tem linha válida)
  });

  return allBetsData;
}; 