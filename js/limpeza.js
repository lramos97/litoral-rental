/**
 * limpeza.js — Controle de Limpeza
 *
 * Cada reserva carrega um campo 'statusLimpeza' ('pendente' | 'realizada').
 * Este módulo lista todas as reservas e permite alternar esse status.
 *
 * Regra de negócio:
 *   - Toda nova reserva nasce com statusLimpeza = 'pendente'
 *   - O proprietário marca como 'realizada' após limpar o imóvel
 *   - É possível reabrir (voltar para 'pendente') se necessário
 */

const Limpeza = {
  _filtro: 'todos', // estado interno do filtro ativo

  /**
   * Renderiza os cards de limpeza aplicando o filtro atual.
   * Ordena: pendentes primeiro, depois por data de saída mais recente.
   */
  renderizar() {
    let reservas  = DB.getReservas();
    const imoveis = DB.getImoveis();

    if (this._filtro !== 'todos') {
      reservas = reservas.filter(r => r.statusLimpeza === this._filtro);
    }

    reservas.sort((a, b) => {
      // Pendentes vêm antes das realizadas
      if (a.statusLimpeza !== b.statusLimpeza) {
        return a.statusLimpeza === 'pendente' ? -1 : 1;
      }
      // Desempate: saída mais recente primeiro
      return b.dataSaida.localeCompare(a.dataSaida);
    });

    const container = document.getElementById('lista-limpeza');

    if (reservas.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🧹</div>
          <p>Nenhuma limpeza ${this._filtro !== 'todos' ? this._filtro : ''} encontrada.</p>
        </div>`;
      return;
    }

    container.innerHTML = reservas.map(r => {
      const imovel  = imoveis.find(i => i.id === r.imovelId);
      const isPend  = r.statusLimpeza === 'pendente';

      return `
        <div class="limpeza-card ${isPend ? '' : 'realizada'}">
          <div style="font-size:28px">${isPend ? '🔴' : '🟢'}</div>

          <div class="limpeza-info">
            <h4>${imovel ? imovel.nome : '<em>Imóvel removido</em>'}</h4>
            <p>👤 ${r.hospede}${r.telefone ? ` · ${r.telefone}` : ''}</p>
            <p>🚪 Saída: ${Utils.formatarData(r.dataSaida)}</p>
            ${r.observacoes ? `<p>📝 ${r.observacoes}</p>` : ''}
            <div style="margin-top:6px">${Utils.badgeStatusReserva(r.dataEntrada, r.dataSaida)}</div>
          </div>

          <div>
            ${isPend
              ? `<button class="btn btn-success btn-sm" onclick="Limpeza.marcarRealizada('${r.id}')">✅ Realizada</button>`
              : `<button class="btn btn-outline  btn-sm" onclick="Limpeza.marcarPendente('${r.id}')">🔄 Reabrir</button>`
            }
          </div>
        </div>`;
    }).join('');
  },

  /**
   * Altera o filtro ativo e re-renderiza.
   * @param {'todos'|'pendente'|'realizada'} status
   * @param {HTMLElement} btnEl - botão clicado (para destacar visualmente)
   */
  filtrar(status, btnEl) {
    this._filtro = status;

    // Atualiza visual dos botões de filtro desta seção
    document.querySelectorAll('[data-limpeza-filtro]').forEach(b => {
      b.classList.remove('active-filter');
    });
    if (btnEl) btnEl.classList.add('active-filter');

    this.renderizar();
  },

  /** Marca a limpeza da reserva como realizada */
  marcarRealizada(id) {
    DB.atualizarReserva(id, { statusLimpeza: 'realizada' });
    Utils.toast('Limpeza marcada como realizada! ✅', 'success');
    this.renderizar();
    Dashboard.renderizar();
  },

  /** Volta o status da limpeza para pendente */
  marcarPendente(id) {
    DB.atualizarReserva(id, { statusLimpeza: 'pendente' });
    Utils.toast('Limpeza reaberta como pendente.');
    this.renderizar();
    Dashboard.renderizar();
  },
};
