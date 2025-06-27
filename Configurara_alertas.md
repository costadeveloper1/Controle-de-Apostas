# Como Configurar Alertas de Uso e Custos no Google Cloud

Este guia ensina como configurar alertas para monitorar o uso das APIs (como Google Sheets e Google Drive) e evitar cobranças inesperadas, ideal para projetos pequenos ou testes.

---

## 1. Acesse o Google Cloud Console
- Entre em https://console.cloud.google.com/
- Selecione o projeto desejado no topo da tela.

## 2. Ative o Faturamento (Billing)
- No menu lateral, clique em **Faturamento**.
- Se ainda não tiver uma conta de faturamento, siga as instruções para criar uma (pode ser necessário cadastrar um cartão de crédito, mas não haverá cobrança se ficar dentro da cota gratuita).

## 3. Configure Orçamentos e Alertas
- No menu de **Faturamento**, clique em **Orçamentos e alertas**.
- Clique em **Criar orçamento**.
- Dê um nome para o orçamento (ex: "Limite de APIs do Site Apostas").
- Selecione o projeto correto.
- Defina o valor do orçamento (ex: R$ 1,00 ou US$ 1,00 — só para garantir que será avisado antes de qualquer cobrança).
- Clique em **Avançar**.
- Marque para receber alertas por e-mail quando atingir 50%, 90% e 100% do orçamento.
- Finalize e salve.

## 4. Monitore o Uso das APIs
- No menu lateral, vá em **APIs e serviços > Painel**.
- Aqui você pode ver o uso de cada API (Google Sheets, Google Drive, etc.).
- Se quiser alertas específicos de uso (número de requisições), pode configurar métricas personalizadas no **Cloud Monitoring**.

## 5. (Opcional) Configurar Alertas de Métricas Específicas
- No menu lateral, vá em **Monitoramento**.
- Clique em **Alertas** > **Criar política de alerta**.
- Escolha a métrica desejada (ex: "Solicitações para Google Sheets API").
- Defina o limite (ex: 1.000 requisições/dia).
- Configure para receber e-mail quando atingir o limite.

---

**Resumo:**
- Configure um orçamento baixo para ser avisado antes de qualquer cobrança.
- Monitore o uso das APIs pelo painel.
- (Opcional) Crie alertas personalizados para requisições.

Assim, você garante que nunca será pego de surpresa com custos no Google Cloud! 