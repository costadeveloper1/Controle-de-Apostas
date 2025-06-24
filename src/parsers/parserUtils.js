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

const normalizeStatus = (betElement) => {
  const winLossIndicator = betElement.querySelector('.myb-WinLossIndicator');
  if (winLossIndicator) {
    if (winLossIndicator.classList.contains('myb-WinLossIndicator-won')) return 'won';
    if (winLossIndicator.classList.contains('myb-WinLossIndicator-lost')) return 'lost';
    if (winLossIndicator.classList.contains('myb-WinLossIndicator-void')) return 'void';
    if (winLossIndicator.classList.contains('myb-WinLossIndicator-cashout')) return 'cashed_out';
  }
  const statusLabelEl = betElement.querySelector('.myb-SettledBetItem_BetStateLabel, .myb-SettledBetItem_BetState');
  const statusText = statusLabelEl?.textContent.trim().toLowerCase();
  return STATUS_MAP[statusText] || 'pending';
};

const months = {
  'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
  'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
};

const extractDateFromHeaderText = (headerText) => {
  if (!headerText) return null;
  const match = headerText.match(/(\d{2}) (\w{3}) (\d{4})/);
  if (match) {
    const day = match[1];
    const month = months[match[2].toLowerCase()];
    const year = match[3];
    if (day && month !== undefined && year) {
      return `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
    }
  }
  return null;
};

export const extractMarketInfo = (betElement, selectedDateForImport, parserType) => {
  const homeTeam =
    betElement.querySelector('.myb-BetParticipant_Team1Name')?.textContent.trim() ||
    betElement.querySelector('.m1-MiniMatchLiveSoccerModule_Team1Name')?.textContent.trim() ||
    'N/A';
  const awayTeam =
    betElement.querySelector('.myb-BetParticipant_Team2Name')?.textContent.trim() ||
    betElement.querySelector('.m1-MiniMatchLiveSoccerModule_Team2Name')?.textContent.trim() ||
    'N/A';
  const selectionText = betElement.querySelector('.myb-BetParticipant_ParticipantSpan')?.textContent.trim() || betElement.querySelector('.myb-SettledBetItemHeader_SubHeaderText')?.textContent.trim() || '';
  const marketDescription = betElement.querySelector('.myb-BetParticipant_MarketDescription')?.textContent.trim() || '';
  const championship = betElement.querySelector('.myb-BetParticipant_SubHeaderLeft')?.textContent.trim() || 'N/A';
  const oddText = betElement.querySelector('.myb-BetParticipant_HeaderOdds')?.textContent.trim() || '0';
  const odd = parseFloat(oddText.replace(',', '.')) || 0;
  const stakeText = betElement.querySelector('.myb-SettledBetItemHeader_Text')?.textContent.trim() || '0';
  const stakeMatch = stakeText.match(/[\d,.]+/);
  const stakeValue = stakeMatch ? parseFloat(stakeMatch[0].replace(/\./g, '').replace(',', '.')) : 0;
  const status = normalizeStatus(betElement);

  const returnAmountEl = betElement.querySelector('.myb-SettledBetItemFooter_BetInformationText');
  let returnValue = 0;
  if (returnAmountEl) {
    const returnMatch = returnAmountEl.textContent.trim().match(/[\d,.]+/);
    if (returnMatch && returnMatch[0]) {
      returnValue = parseFloat(returnMatch[0].replace(/\./g, '').replace(',', '.'));
    }
  }

  let profit = 0;
  if (status === 'won' || status === 'cashed_out') {
    profit = returnValue - stakeValue;
  } else if (status === 'lost') {
    profit = -stakeValue;
  }

  const marketDescriptionLower = marketDescription.toLowerCase();
  const selectionTextLower = selectionText.toLowerCase();
  let marketMinutes = 'N/A';

  if (marketDescriptionLower.includes('escanteios')) {
    const combinedTextForTimeSearch = `${selectionText} ${marketDescription}`;
    const timePattern = combinedTextForTimeSearch.match(/\\d{2}:\\d{2}\\s*-\\s*\\d{2}:\\d{2}/);
    if (timePattern) {
      marketMinutes = timePattern[0].replace(/\\s/g, '');
    } else if (selectionTextLower.includes('40-int')) {
      marketMinutes = '40-Int';
    } else if (selectionTextLower.includes('80-fim')) {
      marketMinutes = '80-Fim';
    }
  }
  
  const extractedDate = extractDateFromHeaderText(betElement.closest('.myb-SettledBetItem_BetHeader')?.querySelector('.myb-SettledBetItem_HeaderText')?.textContent || '');
  const betDate = extractedDate || selectedDateForImport;
  const id = `${betDate}-${homeTeam}-${awayTeam}-${marketMinutes}-${selectionText}-${stakeValue}-${Math.random()}`;

  const betData = {
    id,
    date: betDate,
    championship,
    homeTeam,
    awayTeam,
    market: marketDescription,
    selection: selectionText,
    marketMinutes,
    marketCategory: parserType,
    odd,
    stake: stakeValue,
    status,
    profit: parseFloat(profit.toFixed(2)),
    resultText: betElement.querySelector('.myb-BetParticipant_ScoreSample')?.textContent.trim() || ''
  };

  return betData;
}; 