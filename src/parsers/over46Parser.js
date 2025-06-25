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
    const isMaisDe4 = /mais\s*de\s*4\.0/i.test(selectionText);
    const isMaisDe6 = /mais\s*de\s*6\.0/i.test(selectionText);
    const isEscanteios = /escanteio/i.test(marketDescription);
    const isTotalDeEscanteios = /total de escanteios/i.test(marketDescription);
    if ((isMaisDe4 || isMaisDe6) && isEscanteios && isTotalDeEscanteios) {
      const betData = extractMarketInfo(betElement, selectedDate, 'plus46');
      if (isMaisDe4) {
        betData.market = '+4';
      } else if (isMaisDe6) {
        betData.market = '+6';
      }
      betData.marketCategory = 'plus46';
      allBetsData.push(betData);
    }
  });
  return allBetsData.filter(bet => bet.status !== 'void');
}; 