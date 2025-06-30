# 🎉 Analogia da Festa — Sistema de Importação e Organização de Apostas
Essa analogia é porque eu não sou programador e preciso de explicações simples do que estamos trabalhando e o que você está alterando.
## Personagens e Funções

- **MC (Mestre de Cerimônias) — Você:**  
  É quem comanda a festa. Decide para onde cada convidado (aposta) vai, escolhendo o salão (Tipo de Mercado) no momento certo.

- **Ônibus:**  
  É o arquivo HTML importado, trazendo vários convidados (apostas) de diferentes tipos.

- **Convidados:**  
  São as apostas individuais dentro do ônibus. Alguns podem ser aceitos em mais de um salão, outros não têm convite para nenhum.

- **Entrada Principal ("Importar Histórico"):**  
  Onde o ônibus para e os convidados descem para serem organizados.

- **Porteiro (Tipo de Mercado):**  
  Muito rigoroso! Só deixa entrar no salão os convidados que o MC escolher naquele momento.  
  Mesmo que um convidado possa entrar em vários salões, ele só entra no salão que o MC selecionar.

- **Salões (Abas/Filtros):**  
  Cada salão representa um tipo de mercado (ex: Over 0.5, 0-10, Asiáticos HT, Over 1.5).

- **Recepcionista:**  
  Dentro de cada salão, organiza os convidados nas mesas corretas (por exemplo, por intervalo de minutos, times, etc).

- **Mesas (Mercados):**  
  São as subdivisões dentro de cada salão, onde os convidados se agrupam por características específicas.  
  **No sistema, o campo "Mercado" representa a mesa onde o convidado (aposta) vai sentar.** Por exemplo: "30:00-39:59", "Mais de 0.5", "10 Minutos - Escanteios" etc.

- **Convidados não permitidos:**  
  Alguns convidados (apostas de cartão, gols, etc) não têm convite para nenhum salão e são barrados — não entram na festa.

---

## Fluxo da Festa (Importação e Organização das Apostas)

1. **O ônibus chega na entrada principal (Importar Histórico).**
2. **Você, como MC, supervisiona os convidados (apostas) que desceram do ônibus.**
3. **Você escolhe, através do Tipo de Mercado, para qual salão quer direcionar os convidados naquele momento.**
4. **O Porteiro só deixa entrar no salão escolhido os convidados que têm convite para aquele salão.**
   - Se você mudar o Tipo de Mercado, o Porteiro faz uma nova triagem, deixando entrar apenas os convidados daquele novo salão.
   - Mesmo que um convidado possa entrar em mais de um salão, ele só entra quando você (MC) escolher aquele salão.
5. **Dentro do salão, a recepcionista organiza os convidados nas mesas certas (por exemplo, por intervalo de tempo, times, etc).**
6. **Convidados que não têm convite para o salão escolhido ficam esperando do lado de fora, até que você escolha um salão para o qual eles tenham convite.**
7. **Convidados que não têm convite para nenhum salão (apostas de outros tipos) são barrados e não entram na festa.**

---

## Resumindo

- **Você (MC) tem o controle total sobre para onde cada aposta vai.**
- **O Porteiro só executa sua ordem, filtrando os convidados conforme o salão (Tipo de Mercado) que você escolher.**
- **Apostas podem ser elegíveis para mais de um salão, mas só entram quando você decidir.**
- **A organização dentro do salão é feita pela recepcionista, que direciona para as mesas corretas.**
- **O campo "Mercado" no sistema representa a mesa onde o convidado senta.**
- **Convidados sem convite para nenhum salão são barrados.** 