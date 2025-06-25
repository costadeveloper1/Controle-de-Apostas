import { parseOver05Bets } from './over05Parser.js';
import { parseZeroToTenBets } from './zeroToTenParser.js';
import { parseAsiaticosHTBets } from './asiaticosHTParser.js';
import { parseOver15Bets } from './over15Parser.js';
import { parseRaceBets } from './raceParser.js';
import { parseOver46Bets } from './over46Parser.js';

/**
 * Um objeto central que mapeia identificadores de tipo de aposta
 * para as suas respectivas funções de parsing.
 *
 * Ao adicionar um novo tipo de aposta/parser:
 * 1. Importe a função de parsing do seu ficheiro.
 * 2. Adicione uma nova entrada neste objeto.
 *    - A chave deve ser um identificador único (ex: 'cantosAsiaticosHT').
 *    - O valor deve ser a função de parsing que importou.
 */
export const parsers = {
  'over05': parseOver05Bets,
  'zeroToTen': parseZeroToTenBets,
  'asiaticosHT': parseAsiaticosHTBets,
  'over15': parseOver15Bets,
  'race': parseRaceBets,
  'plus46': parseOver46Bets,
  // Adicione outros parsers aqui no futuro
}; 