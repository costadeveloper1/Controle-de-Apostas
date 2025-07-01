# Plano para Montar Banco de Dados Local de Jogos Antigos (CSV)

## Objetivo
Montar um banco de dados local, em formato CSV, contendo jogos antigos (data, time da casa, time visitante, campeonato) para preencher automaticamente o campo "campeonato" no sistema de apostas. O banco será alimentado cruzando dados de múltiplas fontes confiáveis.

---

## Etapas do Plano

### 1. Definir Escopo dos Campeonatos
- Listar quais ligas/campeonatos são prioritários (ex: Brasileirão, Premier League, La Liga, etc).
- Definir o período desejado (ex: últimos 10 anos).

### 2. Identificar e Baixar Fontes de Dados
- Baixar arquivos CSV das seguintes fontes:
  - [Football-Data.co.uk](https://www.football-data.co.uk/data.php)
  - [Kaggle](https://www.kaggle.com/datasets)
  - [GitHub - openfootball](https://github.com/openfootball)
  - Outras fontes relevantes, se necessário.
- Salvar todos os arquivos em uma pasta dedicada (ex: `dados_jogos_brutos/`).

### 3. Padronizar e Limpar os Dados
- Unificar o formato dos arquivos CSV (nomes das colunas, formato de data, nomes dos times, etc).
- Remover colunas desnecessárias, mantendo apenas: data, time da casa, time visitante, campeonato.
- Padronizar nomes de times para evitar duplicidade (ex: "Man United" vs "Manchester United").

### 4. Cruzar e Unificar os Dados
- Juntar todos os arquivos CSV em um único arquivo mestre.
- Remover jogos duplicados (mesma data, time da casa e time visitante).
- Se houver divergência de campeonato para o mesmo jogo, definir uma regra de prioridade de fonte ou marcar para revisão manual.

### 5. Gerar o Banco de Dados Final
- Salvar o arquivo final como `jogos_antigos.csv`.
- Estrutura sugerida:
  ```csv
  data,time_casa,time_fora,campeonato
  29/06/2025,BK Hacken,GAIS,Allsvenskan
  ```

### 6. Integrar ao Sistema de Apostas
- Implementar uma rotina de busca no arquivo `jogos_antigos.csv` ao importar apostas sem campeonato.
- Se encontrar correspondência (data, time casa, time fora), preencher automaticamente o campo "campeonato".

### 7. Atualização e Manutenção
- Periodicamente, baixar novos arquivos e repetir o processo para manter o banco atualizado.
- Adicionar novos campeonatos conforme necessidade.

---

## Observações
- Documentar o processo para facilitar futuras atualizações.
- Considerar automatizar as etapas com scripts (Python, Node.js, etc).
- Manter backup dos arquivos brutos e do arquivo final.

---

## Próximos Passos
1. Definir os campeonatos e período desejado.
2. Baixar os arquivos CSV das fontes sugeridas.
3. Padronizar e unificar os dados conforme o plano acima.
4. Integrar a busca automática ao sistema de apostas. 