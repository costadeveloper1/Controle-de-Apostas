# Progresso do Projeto – 26/06/2025

## Contexto Geral
- O projeto é um sistema de apostas esportivas, com organização baseada na analogia de uma festa (salões = mercados, apostas = convidados, etc.).
- O objetivo atual é implementar a exportação dos dados para Google Sheets e Excel, com cada salão em uma aba e uma aba extra de "Relatórios".
- O sistema deve ser fácil de manter, escalável e seguir as regras de não alterar o que já funciona.

## O que foi feito hoje
- **Leitura e entendimento da analogia da festa** para manter a organização do sistema.
- **Planejamento detalhado da exportação (HOTEL):**
  - Exportação para Google Sheets (com autenticação OAuth) e Excel.
  - Cada salão será uma aba separada, nomes iguais aos salões.
  - Aba "Relatórios" com KPIs (sem média de stake), gráficos e Top G/P.
  - Exportação sempre cria uma nova planilha/arquivo, nomeando com o período exportado.
  - Exportar apenas apostas com data dentro do intervalo selecionado.
  - Se houver apostas com campos obrigatórios vazios, exibir alerta e perguntar se deseja ignorar ou exportar mesmo assim.
  - Planilha Google será privada, acessível apenas pelo usuário autenticado.
- **Criação do botão e modal de exportação na interface.**
- **Configuração do Google Cloud Console:**
  - Criação de projeto, ativação das APIs Google Sheets e Google Drive.
  - Configuração da tela de consentimento OAuth (tipo Externo, e-mail correto).
  - Criação do Client ID OAuth 2.0 para aplicativo web.
  - Adição de `http://localhost:3000` como origem autorizada.
- **Instalação e configuração da biblioteca `@react-oauth/google` no React.**
- **Envolvimento do App com o GoogleOAuthProvider usando o Client ID correto.**
- **Implementação de um botão de teste de login Google no ExportModal.**
- **Testes de login Google:**
  - Inicialmente erro 401 (invalid_client) por Client ID incorreto.
  - Corrigido Client ID e origens autorizadas.
  - Novo erro: "Não é possível continuar com o google.com" (usuário de teste não cadastrado).
- **Criação do arquivo `Configurara_alertas.md`** com passo a passo para configurar alertas de uso/custos no Google Cloud.

## Problema atual
- O login Google ainda não funciona porque o e-mail usado para testar **não está cadastrado como usuário de teste** na tela de consentimento OAuth do Google Cloud Console.

## Próximos passos para continuar
1. **Adicionar o e-mail de teste como usuário de teste** na tela de consentimento OAuth (Google Cloud Console > APIs e serviços > Tela de consentimento OAuth > Usuários de teste).
2. Aguardar alguns minutos para propagação.
3. Testar novamente o login Google no modal de exportação (de preferência em janela anônima).
4. Se o login funcionar, seguir para:
   - Implementar a lógica de exportação real para Google Sheets (usando o token do Google).
   - Implementar exportação para Excel.
   - Implementar a lógica de alerta para apostas com campos obrigatórios vazios (permitir ignorar ou exportar mesmo assim).
   - Gerar a aba "Relatórios" com os KPIs e gráficos definidos.
5. (Opcional) Configurar alertas de uso/custos no Google Cloud conforme o arquivo `Configurara_alertas.md`.

## Observações finais
- O projeto está bem documentado e modular.
- Todas as decisões e regras de negócio estão registradas nesta conversa.
- Quando retomar, basta seguir os próximos passos acima para continuar de onde parou.

---
**Bom descanso!** Quando voltar, é só consultar este arquivo para saber exatamente o que fazer. 