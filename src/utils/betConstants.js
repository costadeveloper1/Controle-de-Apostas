export const BET_STATUS = {
  WON: 'won',
  LOST: 'lost',
  VOID: 'void',
  CASH_OUT: 'cashed_out',
};

export const TIME_INTERVALS = [
  '0-9:59',
  '10-19:59',
  '20-29:59',
  '30-39:59',
  '40-49:59',
  '50-59:59',
  '60-69:59',
  '70-79:59',
  '80-fim',
];

export const BET_RESULT_MAP = {
  Ganha: BET_STATUS.WON,
  Perdida: BET_STATUS.LOST,
  Devolvida: BET_STATUS.VOID,
  Cashout: BET_STATUS.CASH_OUT,
};

export const STATUS_DISPLAY_MAP = {
  [BET_STATUS.WON]: 'Ganha',
  [BET_STATUS.LOST]: 'Perdida',
  [BET_STATUS.VOID]: 'Devolvida',
  [BET_STATUS.CASH_OUT]: 'Cashout',
}; 