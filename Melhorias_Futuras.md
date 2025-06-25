# 🚀 Melhorias Futuras

Este arquivo serve como checklist e documentação das melhorias planejadas para o sistema, organizadas do mais fácil para o mais difícil. Conforme cada melhoria for implementada, marque o checkbox correspondente.

---

## ALFA - Backend e Persistência de Dados
- [ ] **Persistência de Dados**
  - *Problema*: Dados ficam apenas no navegador, risco de perda.
  - *Solução*: Implementar backend (ex: Firebase, Supabase, Node.js + MongoDB) para salvar apostas de forma segura.

## BRAVO - Sistema de Autenticação
- [ ] **Controle de Usuários**
  - *Problema*: Sem controle de usuários.
  - *Solução*: Login via Google/Gmail, com aprovação manual do administrador.

## CHARLIE - Validação e Tratamento de Erros
- [ ] **Validações e Erros**
  - *Problema*: Validações básicas, erros não tratados adequadamente.
  - *Solução*: Melhorar mensagens de erro, validação de campos obrigatórios e feedback ao usuário.

## DELTA - Melhorias de Análise e Relatórios
- [ ] **Dashboard Avançado com KPIs**
  - *O que é KPI?* KPI significa "Indicador-Chave de Performance". São métricas que mostram rapidamente como está o desempenho das apostas, como: lucro total, taxa de acerto, ROI, maior sequência de greens/reds, etc. Um dashboard com KPIs mostra esses números em destaque, facilitando a análise rápida, como um painel de carro mostrando velocidade, combustível, etc.

## ECHO - Sistema de Alertas e Notificações
- [ ] **Alertas e Notificações**
  - *O que é?* São avisos automáticos que aparecem para o usuário quando algo importante acontece, como: aposta importada com erro, meta de lucro atingida, saldo negativo, etc. Pode ser um pop-up, um badge vermelho, ou até um e-mail.
  - *Futuro*: Criar uma nova aba de "Apostas Futuras" onde será possível informar os jogos do dia seguinte e configurar alertas automáticos para esses jogos, sendo enviados 1 hora antes e 15 minutos antes do início de cada partida.

## FOXTROTE - Análise de Mercados Específicos
- [ ] **Relatórios Detalhados por Mercado**
  - *Solução*: Permitir análises mais profundas para cada tipo de mercado/salão.

## GOLF - Busca de Campeonato e Times Dinâmicos
- [ ] **Busca Automática de Campeonato por Evento/Data**
  - *Nota*: Exige integração com API externa ou base de dados de jogos.
- [ ] **Times por Campeonato no Formulário**
  - *Nota*: Requer estrutura de dados mapeando campeonatos para times.

## HOTEL - Exportação para Google Sheets/Excel
- [ ] **Exportação Detalhada**
  - *Sugestão de colunas*: Data, Campeonato, Time da Casa, Time Visitante, Mercado, Intervalo, Odd, Stake, Resultado, Lucro, Status, Observações. Adicionar filtros e ordenação.

## INDIA - Login Restrito e Aprovação Manual
- [ ] **Login Google/Gmail com Aprovação**
  - *Solução*: Usuário só acessa após ser aprovado manualmente pelo administrador.

---

## Sugestões Extras para o Futuro
- [ ] **Modo escuro/claro automático**
- [ ] **Gráficos comparativos entre salões**
- [ ] **Histórico de alterações (log de auditoria)**
- [ ] **Backup automático para download**
- [ ] **Ajuda interativa (tour pelo sistema)**
- [ ] **Integração com Telegram/WhatsApp para alertas**

---

*Atualize este arquivo sempre que uma melhoria for concluída ou uma nova ideia surgir!* 