import { extractMarketInfo } from './parserUtils.js';

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

const normalize = str => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

const normalizeStatus = (statusText) => {
  if (!statusText) return null;
  const lowerCaseStatus = statusText.toLowerCase().trim();
  return STATUS_MAP[lowerCaseStatus] || null;
};

export const parseOver46Bets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    const selectionText = betElement.querySelector('.myb-BetParticipant_ParticipantSpan')?.textContent.trim() || '';
    const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';
    const statusText = betElement.querySelector('.myb-HalfAndHalfPill_TextStatusLHS')?.textContent.trim() || '';
    if (statusText.toLowerCase() === 'reembolso(push)') {
      return;
    }
    let mesa = '';
    if (/mais\s*de\s*4\.0/i.test(selectionText)) {
      mesa = '+4';
    } else if (/mais\s*de\s*6\.0/i.test(selectionText)) {
      mesa = '+6';
    } else if (/mais\s*de\s*8\.0/i.test(selectionText)) {
      mesa = '+8';
    } else {
      return;
    }
    let cf = '';
    if (/time da casa/i.test(marketDescription)) {
      cf = 'CASA';
    } else if (/time visitante/i.test(marketDescription)) {
      cf = 'FORA';
    }
    const betData = extractMarketInfo(betElement, selectedDate, 'plus46');
    betData.market = mesa;
    betData.marketCategory = 'plus46';
    betData.cf = cf;
    allBetsData.push(betData);
  });
  return allBetsData.filter(bet => bet.status !== 'void');
}; 