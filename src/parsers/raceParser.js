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

const normalizeStatus = (statusText) => {
  if (!statusText) return null;
  const lowerCaseStatus = statusText.toLowerCase().trim();
  return STATUS_MAP[lowerCaseStatus] || null;
};

export const parseRaceBets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    // Verifica se é aposta do tipo "Primeiro a marcar X Escanteios"
    const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';
    const mesaMatch = marketDescription.match(/Primeiro a marcar (\d+) Escanteios/i);
    if (!mesaMatch) return; // Não é do tipo Race

    const mesa = `Race ${mesaMatch[1]}`;

    // Usa extractMarketInfo para extrair todos os campos padronizados
    const betData = extractMarketInfo(betElement, selectedDate, 'race');
    betData.market = mesa; // Garante que o campo market seja a mesa correta
    betData.marketCategory = 'race';
    // Mantém o campo cf (Casa/Fora) se já estiver sendo extraído, senão pode ser ajustado depois
    allBetsData.push(betData);
  });

  // Retorna apenas apostas que não são void (Reembolso/Push)
  return allBetsData.filter(bet => bet.status !== 'void');
}; 