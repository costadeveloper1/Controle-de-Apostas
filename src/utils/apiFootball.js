import axios from 'axios';

// Configuração base do axios para a API-Football
const apiFootball = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.REACT_APP_API_FOOTBALL_KEY,
  },
});

/**
 * Busca o nome do campeonato de um jogo recente usando a API-Football.
 * @param {string} data - Data do jogo no formato YYYY-MM-DD
 * @param {string} timeCasa - Nome do time da casa
 * @param {string} timeFora - Nome do time visitante
 * @returns {Promise<string|null>} - Nome do campeonato ou null se não encontrado
 */
export async function buscarCampeonatoApiFootball(data, timeCasa, timeFora) {
  // Aqui vamos implementar o passo a passo:
  // 1. Buscar o ID dos times
  // 2. Buscar o fixture (jogo) usando data e ID do time
  // 3. Filtrar pelo adversário e retornar o nome do campeonato
  // (Implementação virá nos próximos passos)
  return null;
} 