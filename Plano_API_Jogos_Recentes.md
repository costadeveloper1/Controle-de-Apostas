# Plano para Implementação de API para Jogos Recentes

## Objetivo
Integrar uma API de futebol ao sistema de apostas para preencher automaticamente o campo "campeonato" de jogos recentes, utilizando informações como data, time da casa e time visitante.

---

## Etapas do Plano

### 1. Escolher a API de Futebol
- Avaliar opções de APIs disponíveis (ex: API-Football, TheSportsDB, Football-Data.org, etc).
- Verificar limitações do plano gratuito (quantidade de requisições, datas disponíveis, ligas cobertas).
- Registrar-se e obter a chave de acesso (API Key).

### 2. Estudar a Documentação da API
- Analisar os endpoints disponíveis para busca de partidas por data, times ou outros filtros.
- Identificar o formato de resposta (JSON, XML, etc) e os campos relevantes (data, times, campeonato).

### 3. Implementar a Integração no Sistema
- Criar um módulo/função para consultar a API usando data, time da casa e time visitante como parâmetros.
- Tratar possíveis erros (jogo não encontrado, limite de requisições, etc).
- Mapear a resposta da API para preencher o campo "campeonato" no sistema.

### 4. Definir Estratégia de Consulta
- Consultar a API apenas para jogos recentes (ex: últimos 30 dias).
- Implementar cache local para evitar consultas repetidas e economizar requisições.
- Se não encontrar o campeonato via API, deixar o campo em branco ou marcar para revisão manual.

### 5. Testar a Integração
- Realizar testes com diferentes jogos e datas para garantir que o preenchimento está correto.
- Validar o tratamento de erros e limites da API.

### 6. Documentar o Processo
- Documentar como configurar a API Key, como funciona a integração e como atualizar caso a API mude.

### 7. Manutenção e Monitoramento
- Monitorar o uso da API (limites, mudanças de endpoints, etc).
- Atualizar a integração conforme necessário.

---

## Observações
- Priorizar APIs com boa cobertura de ligas e datas.
- Considerar implementar fallback para o banco de dados local caso a API não retorne resultado.
- Manter logs das consultas para facilitar depuração.

---

## Próximos Passos
1. Listar e comparar as APIs disponíveis.
2. Escolher a API e obter a chave de acesso.
3. Implementar e testar a integração conforme o plano acima.

---

## Plano Prático de Implementação com API-Football

### 1. Configuração Inicial
- Garantir que a chave de API (API Key) esteja salva de forma segura (ex: variável de ambiente).
- Instalar biblioteca HTTP para requisições (ex: axios ou fetch, se usar Node.js ou front-end).

### 2. Entendimento dos Endpoints
- Usar o endpoint `/fixtures` para buscar partidas por data, time da casa e time visitante.
- Parâmetros principais:
  - `date`: data do jogo (formato YYYY-MM-DD)
  - `team`: ID do time (pode ser necessário buscar pelo nome antes, usando `/teams`)
  - `season`: ano da temporada (opcional, para refinar)

### 3. Fluxo de Consulta
1. Ao importar uma aposta recente sem campeonato:
   - Extrair data, time da casa e time visitante.
2. Buscar o ID dos times usando o endpoint `/teams` (se necessário).
3. Consultar o endpoint `/fixtures` com os parâmetros adequados.
4. Se encontrar o jogo, extrair o campo "league.name" da resposta para preencher o campeonato.
5. Se não encontrar, deixar em branco ou marcar para revisão manual.

### 4. Tratamento de Erros e Limites
- Implementar tratamento para:
  - Jogo não encontrado
  - Limite de requisições atingido
  - Respostas incompletas ou erro de rede
- Implementar cache local para evitar consultas repetidas ao mesmo jogo.

### 5. Integração no Sistema
- Criar função utilitária (ex: `buscarCampeonatoApiFootball(data, timeCasa, timeFora)`).
- Integrar essa função ao fluxo de importação de apostas.
- Garantir logs para depuração e monitoramento do uso da API.

### 6. Testes
- Testar com diferentes jogos, datas e variações de nomes de times.
- Validar preenchimento correto do campo "campeonato".

### 7. Documentação
- Documentar como configurar a chave da API.
- Explicar o fluxo de consulta e tratamento de erros.

---

### Exemplo de Fluxo (Pseudocódigo)

```js
// 1. Buscar ID dos times
GET /teams?search=BK Hacken
GET /teams?search=GAIS

// 2. Buscar fixture
GET /fixtures?date=2025-06-29&team=ID_BK_HACKEN

// 3. Filtrar pelo adversário na resposta e extrair league.name
```

---

### Observações
- Padronizar nomes dos times antes da busca para evitar erros.
- Respeitar limites do plano gratuito (100 requisições/mês).
- Atualizar integração caso a API mude endpoints ou formato de resposta. 