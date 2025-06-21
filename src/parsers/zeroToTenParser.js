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

const normalizeStatus = (statusText) => {
  if (!statusText) return null;
  const lowerCaseStatus = statusText.toLowerCase().trim();
  return STATUS_MAP[lowerCaseStatus] || null;
};

/**
 * Extrai e padroniza os dados de um único elemento de aposta do HTML da Bet365,
 * especificamente para a categoria "0-10".
 * @param {Element} betElement - O elemento do DOM que representa uma aposta.
 * @param {string} importDate - A data de importação no formato YYYY-MM-DD.
 * @returns {Object|null} - Um objeto de aposta padronizado ou null.
 */
const parseSingleBet = (betElement, importDate) => {
  if (betElement.textContent?.toLowerCase().includes("reembolso(push)")) {
    console.log('[DESCARTADA] Reembolso(push) detectado');
    return null;
  }

  const team1 = betElement.querySelector('.myb-BetParticipant_Team1Name')?.textContent.trim() || '';
  const team2 = betElement.querySelector('.myb-BetParticipant_Team2Name')?.textContent.trim() || '';
  const match = (team1 && team2) ? `${team1} vs ${team2}` : 'Jogo não identificado';

  const championshipEl = betElement.querySelector('.myb-Market-breadcrumb');
  const championship = championshipEl ? championshipEl.textContent.trim().split('/').pop().trim() : 'Campeonato não identificado';

  const oddEl = betElement.querySelector('.myb-BetParticipant_Odds');
  const oddText = oddEl ? oddEl.textContent.trim() : '0';
  const odd = parseFloat(oddText.replace(',', '.')) || 0;

  let stake = 0;
  let stakeText = '';
  const stakeEl = betElement.querySelector('.myb-Bet-StakeAmount');
  if (stakeEl) {
    stakeText = stakeEl.textContent.trim().replace('R$', '');
  } else {
    const stakeAltEl = betElement.querySelector('.myd-StakeDisplay_StakeWrapper');
    if (stakeAltEl) {
      stakeText = stakeAltEl.textContent.trim().replace('R$', '');
    }
  }
  stake = parseFloat(stakeText.replace(',', '.')) || 0;
  
  const statusTextEl = betElement.querySelector('.myb-Bet-ResultIndicator--WON, .myb-Bet-ResultIndicator--LOST, .myb-Bet-ResultIndicator--PUSH');
  const status = normalizeStatus(statusTextEl ? statusTextEl.textContent : 'void');

  let profit = 0;
  if (status === 'won') {
    profit = (odd - 1) * stake;
  } else if (status === 'lost') {
    profit = -stake;
  }

  // A lógica de mercado para "0-10" parece focar no 'sub-header'
  const subHeaderTextEl = betElement.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
  let market = 'Mercado não identificado';
  let marketMinutes = '0-10'; // Fixo para esta categoria

  if (subHeaderTextEl) {
    market = subHeaderTextEl.textContent.trim();
  } else {
    // Fallback se a estrutura do HTML for diferente
    const marketDescriptionEl = betElement.getElementsByClassName('myb-BetParticipant_MarketDescription')[0];
    if (marketDescriptionEl) {
      market = marketDescriptionEl.textContent.trim();
    }
  }

  if (!match || stake === 0) {
    console.log('[DESCARTADA] Motivo:', !match ? 'Match vazio' : 'Stake zero', { match, stake, odd, market, status });
    return null;
  }

  console.log('[IMPORTADA] Aposta válida:', { match, stake, odd, market, status });

  return {
    id: `imported-${Date.now()}-${Math.random()}`,
    date: importDate,
    timestamp: new Date().toISOString(),
    match,
    championship,
    market,
    marketCategory: "0-10", // Categoria fixa para este parser
    marketMinutes,
    odd,
    stake,
    status,
    profit,
  };
};

/**
 * Faz o parsing de uma string HTML da Bet365 para extrair as apostas do mercado 0-10.
 * @param {string} htmlText - O conteúdo HTML da página de apostas resolvidas.
 * @param {string} selectedDate - A data a ser associada com as apostas importadas (formato YYYY-MM-DD).
 * @returns {Array<Object>} - Uma lista de objetos de aposta padronizados.
 */
export const parseZeroToTenBets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    // Chama o nosso "Engenheiro" para analisar a aposta, informando o tipo de mercado
    const betData = extractMarketInfo(betElement, selectedDate, 'zeroToTen');

    // FILTRO FINAL: Apenas importar apostas do mercado 0-10 (primeiros 10 minutos de escanteios)
    if (
      betData &&
      (
        betData.marketMinutes === '00:00-09:59' ||
        (betData.market && betData.market.toLowerCase().includes('10 minutos - escanteios - 3 opções')) ||
        (betData.market && betData.market.toLowerCase().includes('10 minutos - escanteios - 3 opcoes'))
      )
    ) {
      allBetsData.push(betData);
    }
  });

  return allBetsData;
};
