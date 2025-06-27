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

// Função utilitária para normalizar nomes e remover palavras comuns
function normalizeName(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove só acentos
    .replace(/\b(fc|sc|united|city|club|team)\b/gi, '') // remove palavras comuns
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // remove caracteres especiais
    .replace(/\s+/g, ' ')
    .trim();
}

function isSimilar(a, b) {
  return a.includes(b) || b.includes(a) ||
         a.split(' ')[0] === b.split(' ')[0];
}

// Função utilitária para normalizar texto
function normalizeText(str) {
  return str
    .normalize('NFD').replace(/[0-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Função utilitária local para normalizar texto
function normalizeMarketDesc(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove só acentos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export const parseRaceBets = (htmlText, selectedDate) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const betElements = doc.querySelectorAll(".myb-SettledBetItem");

  const allBetsData = [];

  betElements.forEach((betElement) => {
    // Verifica se é aposta do tipo "Primeiro a marcar X Escanteios"
    const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';
    const normDesc = normalizeMarketDesc(marketDescription);
    const mesaMatch = normDesc.match(/primeiro a marcar (\d+) escanteios/i);
    if (!mesaMatch) return; // Não é do tipo Race
    const mesa = `Race ${mesaMatch[1]}`;
    console.log('DEBUG RACE: mesa identificada:', mesa);

    // Usa extractMarketInfo para extrair todos os campos padronizados
    const betData = extractMarketInfo(betElement, selectedDate, 'race');
    betData.market = mesa; // Garante que o campo market seja a mesa correta
    console.log('DEBUG RACE: betData.market final:', betData.market);
    betData.marketCategory = 'race';
    // Preenche o campo cf
    const participant = betElement.querySelector('.myb-BetParticipant_ParticipantSpan')?.textContent.trim() || '';
    const homeTeam = betElement.querySelector('.myb-BetParticipant_Team1Name')?.textContent.trim() || '';
    const awayTeam = betElement.querySelector('.myb-BetParticipant_Team2Name')?.textContent.trim() || '';
    const nParticipant = normalizeName(participant);
    const nHome = normalizeName(homeTeam);
    const nAway = normalizeName(awayTeam);
    if (nParticipant && nHome && isSimilar(nParticipant, nHome)) {
      betData.cf = 'CASA';
    } else if (nParticipant && nAway && isSimilar(nParticipant, nAway)) {
      betData.cf = 'FORA';
    } else {
      betData.cf = '';
    }
    allBetsData.push(betData);
  });

  // Retorna apenas apostas que não são void (Reembolso/Push)
  return allBetsData.filter(bet => bet.status !== 'void');
}; 