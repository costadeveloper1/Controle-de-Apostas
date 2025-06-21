import { BET_STATUS } from './betConstants';

/**
 * Calculates the profit of a bet based on its odd, stake, and status.
 * @param {number} odd - The odd of the bet.
 * @param {string} status - The status of the bet (e.g., 'won', 'lost').
 * @param {number} stake - The amount staked on the bet.
 * @returns {number} The calculated profit.
 */
export const calculateProfit = (odd, status, stake) => {
  const numericOdd = parseFloat(String(odd).replace(',', '.'));
  const numericStake = parseFloat(stake);

  if (isNaN(numericOdd) || isNaN(numericStake)) {
    return 0;
  }

  switch (status) {
    case BET_STATUS.WON:
      return (numericOdd - 1) * numericStake;
    case BET_STATUS.LOST:
      return -numericStake;
    case BET_STATUS.VOID:
    case BET_STATUS.CASH_OUT:
      return 0;
    default:
      return 0;
  }
}; 