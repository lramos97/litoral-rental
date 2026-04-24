/**
 * calendario.js — Calendário Mensal de Ocupação
 *
 * Renderiza um grid de 7 colunas (dias da semana) x N linhas (semanas do mês).
 * Cada dia exibe etiquetas coloridas para cada reserva em andamento naquele dia.
 * Cada imóvel tem uma cor fixa para fácil identificação visual.
 *
 * Lógica de ocupação:
 *   Uma reserva ocupa os dias desde dataEntrada até dataSaida (exclusive).
 *   Exemplo: entrada 05/07, saída 08/07 → ocupa dias 5, 6 e 7.
 */

const Calendario = {
  // Mês e ano atualmente exibidos (0-indexed para mês)
  ano: new Date().getFullYear(),
  mes: new Date().getMonth(),

  proximoMes() {
    if (this.mes === 11) { this.mes = 0; this.ano++; }
    else { this.mes++; }
    this.renderizar();
  },

  mesAnterior() {
    if (this.mes === 0) { this.mes = 11; this.ano--; }
    else { this.mes--; }
    this.renderizar();
  },

  /** Monta e exibe o calendário completo para o mês/ano atual */
  renderizar() {
    const imoveis  = DB.getImoveis();
    const reservas = DB.getReservas();
    const hoje     = new Date().toISOString().split('T')[0];

    // Atualiza título (ex: "Julho 2026")
    const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    document.getElementById('calendario-titulo').textContent =
      `${MESES[this.mes]} ${this.ano}`;

    // Legenda: uma bolinha colorida por imóvel
    const legendaEl = document.getElementById('calendario-legenda');
    if (imoveis.length === 0) {
      legendaEl.innerHTML = `<span style="color:var(--text-muted); font-size:13px">
        Cadastre imóveis para visualizar no calendário.
      </span>`;
    } else {
      legendaEl.innerHTML = imoveis.map((im, idx) => `
        <div class="legenda-item">
          <div class="legenda-cor" style="background:${Utils.corImovel(idx)}"></div>
          <span>${im.nome}</span>
        </div>`).join('');
    }

    // Pré-calcula: para cada data ISO, quais reservas ocorrem nela
    // Estrutura: { "2026-07-05": [{ hospede, imovelId }, ...], ... }
    const ocupacaoPorDia = {};

    reservas.forEach(r => {
      const entrada = new Date(r.dataEntrada + 'T00:00:00');
      const saida   = new Date(r.dataSaida   + 'T00:00:00');
      const cur = new Date(entrada);

      // Itera dia a dia, excluindo o dia de saída
      while (cur < saida) {
        const iso = cur.toISOString().split('T')[0];
        if (!ocupacaoPorDia[iso]) ocupacaoPorDia[iso] = [];
        ocupacaoPorDia[iso].push({ hospede: r.hospede, imovelId: r.imovelId });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Mapa rápido: imovelId → índice de cor
    const imovelIdx = {};
    imoveis.forEach((im, idx) => { imovelIdx[im.id] = idx; });

    // Geometria do mês
    const primeiroDia     = new Date(this.ano, this.mes, 1);
    const ultimoDia       = new Date(this.ano, this.mes + 1, 0); // último dia do mês
    const offsetInicio    = primeiroDia.getDay(); // 0=dom ... 6=sáb
    const totalCelulas    = Math.ceil((offsetInicio + ultimoDia.getDate()) / 7) * 7;

    // Cabeçalho com dias da semana
    const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const cabecalho = `
      <div class="cal-header-row">
        ${DIAS_SEMANA.map(d => `<div class="cal-header-cell">${d}</div>`).join('')}
      </div>`;

    // Corpo: células do grid
    let celulas = '';
    for (let c = 0; c < totalCelulas; c++) {
      const diaDoMes = c - offsetInicio + 1;

      // Célula de outro mês (preenchimento)
      if (diaDoMes < 1 || diaDoMes > ultimoDia.getDate()) {
        celulas += `<div class="cal-day outro-mes"><div class="cal-day-num"></div></div>`;
        continue;
      }

      // Monta a data ISO desta célula
      const mesStr = String(this.mes + 1).padStart(2, '0');
      const diaStr = String(diaDoMes).padStart(2, '0');
      const iso    = `${this.ano}-${mesStr}-${diaStr}`;
      const ehHoje = iso === hoje;

      // Etiquetas de reservas para este dia
      const ocupacoes = ocupacaoPorDia[iso] || [];
      const etiquetas = ocupacoes.map(o => {
        const cor       = Utils.corImovel(imovelIdx[o.imovelId] ?? 0);
        const nomeExib  = o.hospede.split(' ')[0]; // só o primeiro nome
        return `<span class="cal-reserva" style="background:${cor}" title="${o.hospede}">${nomeExib}</span>`;
      }).join('');

      celulas += `
        <div class="cal-day ${ehHoje ? 'hoje' : ''}">
          <div class="cal-day-num">${diaDoMes}</div>
          ${etiquetas}
        </div>`;
    }

    document.getElementById('calendario-grid').innerHTML =
      cabecalho + `<div class="cal-body">${celulas}</div>`;
  },
};
