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

---

## Plano para Busca Pós-Importação do Campeonato (Processamento em Lote)

### Objetivo
Permitir que o usuário importe todas as apostas rapidamente, mesmo sem o campo "campeonato" preenchido, e depois rode uma rotina para buscar e preencher automaticamente os campeonatos faltantes usando a API-Football.

### Etapas do Plano

1. **Importação Normal das Apostas**
   - Permitir que todas as apostas sejam importadas, mesmo que o campo "campeonato" esteja vazio, "N/A" ou "Campeonato não identificado".

2. **Identificação das Apostas Incompletas**
   - Criar uma função que filtre todas as apostas salvas que estejam sem o campo "campeonato" preenchido corretamente.

3. **Interface para o Usuário**
   - Adicionar um botão ou opção no sistema: "Buscar Campeonatos Faltantes".
   - Ao clicar, o sistema mostra uma lista das apostas sem campeonato ou já inicia o processamento automático.

4. **Processamento em Lote**
   - Para cada aposta sem campeonato, usar a função `buscarCampeonatoApiFootball` passando data, time da casa e time visitante.
   - Atualizar o campo "campeonato" das apostas conforme o resultado da API.
   - Adicionar logs e feedback visual para o usuário acompanhar o progresso.

5. **Tratamento de Erros e Limites**
   - Se a API não retornar resultado, manter o campo como está e marcar para revisão manual, se necessário.
   - Respeitar limites de requisições da API (ex: processar em lotes menores, se necessário).

6. **Feedback ao Usuário**
   - Mostrar mensagem de sucesso ao final do processo, indicando quantos campeonatos foram preenchidos.
   - Exibir mensagem de alerta se algum jogo não foi encontrado.

7. **Documentação**
   - Documentar o funcionamento da rotina e como o usuário pode utilizá-la.

---

### Observações
- O processamento pós-importação deixa o sistema mais rápido e fácil de debugar.
- Permite que o usuário revise e corrija manualmente, se necessário.
- Pode ser expandido no futuro para buscar outras informações faltantes.

---

### Próximos Passos
1. Permitir importação de apostas mesmo sem campeonato.
2. Implementar a função de busca pós-importação.
3. Adicionar botão/opção na interface para acionar a rotina.
4. Testar e documentar o fluxo.

---

# Plano para Preenchimento Automático de Campeonato usando TheSportsDB

## Objetivo
Utilizar a API gratuita do TheSportsDB para buscar e preencher automaticamente o campo "campeonato" das apostas importadas, usando data, time da casa e time visitante.

---

## Etapas do Plano

### 1. Cadastro e Configuração
- Criar uma conta gratuita no TheSportsDB (https://www.thesportsdb.com/api.php) para obter a chave da API.
- Salvar a chave de API em local seguro (ex: arquivo .env).

### 2. Entendimento dos Endpoints
- Estudar os principais endpoints da API:
  - Buscar eventos passados por time: `/eventslast.php?id=ID_DO_TIME`
  - Buscar eventos por data: `/eventsday.php?d=YYYY-MM-DD&s=Soccer`
  - Buscar ID do time: `/searchteams.php?t=NOME_DO_TIME`
- Testar manualmente no navegador ou Postman para entender o formato da resposta.

### 3. Implementação da Função de Busca
- Criar uma função utilitária que:
  1. Busca o ID dos times pelo nome usando `/searchteams.php?t=NOME_DO_TIME`.
  2. Busca os eventos do time na data desejada usando `/eventsday.php?d=YYYY-MM-DD&s=Soccer`.
  3. Filtra o evento pelo confronto (time casa x time visitante).
  4. Retorna o nome do campeonato (campo `strLeague` ou similar).
- Adicionar logs para facilitar a depuração.

### 4. Integração ao Sistema de Apostas
- Adicionar um botão ou rotina para buscar campeonatos faltantes usando a função criada.
- Para cada aposta sem campeonato, buscar e preencher automaticamente.
- Exibir feedback visual do progresso para o usuário.

### 5. Tratamento de Erros e Limitações
- Se a API não retornar resultado, manter o campo como está e marcar para revisão manual.
- Respeitar limites de requisições da API gratuita.
- Tratar possíveis variações de nomes de times (acentos, abreviações, etc).

### 6. Atualização e Manutenção
- Periodicamente, revisar se a API está funcionando e cobrindo os campeonatos desejados.
- Atualizar a integração caso a API mude endpoints ou formato de resposta.

---

## Observações
- TheSportsDB é colaborativo, então pode haver pequenas falhas em campeonatos menos populares.
- Para grandes ligas e seleções, a cobertura é muito boa.
- Documentar o processo para facilitar futuras atualizações.

---

## Próximos Passos
1. Criar conta e obter chave da API TheSportsDB.
2. Implementar e testar a função de busca automática.
3. Integrar ao sistema de apostas.
4. Testar e documentar o fluxo. 