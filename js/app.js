/**
 * app.js — Inicialização e Roteamento da Aplicação
 *
 * Este é o ponto de entrada principal (executado no DOMContentLoaded).
 * Responsabilidades:
 *   1. Carregar dados mock no primeiro acesso
 *   2. Registrar eventos de navegação no sidebar
 *   3. Fechar modais ao clicar no overlay
 *   4. Renderizar o Dashboard inicial
 *
 * O objeto Dashboard também vive aqui por ser transversal
 * (lê dados de todos os outros módulos).
 */

// ─────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────

const Dashboard = {

  /**
   * Renderiza os 4 cards de estatísticas e as duas listas rápidas:
   * - Próximas chegadas (até 5)
   * - Limpezas pendentes (até 5, com botão rápido de marcar)
   */
  renderizar() {
    const imoveis  = DB.getImoveis();
    const reservas = DB.getReservas();
    const insumos  = DB.getInsumos();
    const hoje     = new Date().toISOString().split('T')[0];

    // Contagens para os cards
    const hospedagensAtivas = reservas.filter(
      r => r.dataEntrada <= hoje && r.dataSaida > hoje
    ).length;

    const limpezasPendentes = reservas.filter(
      r => r.statusLimpeza === 'pendente'
    ).length;

    // ── Cards de estatísticas ─────────────────────────────
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card" style="border-color:#0077b6">
        <div class="stat-icon">🏠</div>
        <div class="stat-info">
          <h4>Imóveis</h4>
          <div class="stat-value">${imoveis.length}</div>
        </div>
      </div>
      <div class="stat-card" style="border-color:#2d9e6b">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h4>Hospedagens Ativas</h4>
          <div class="stat-value">${hospedagensAtivas}</div>
        </div>
      </div>
      <div class="stat-card" style="border-color:#e9a825">
        <div class="stat-icon">🧹</div>
        <div class="stat-info">
          <h4>Limpezas Pendentes</h4>
          <div class="stat-value">${limpezasPendentes}</div>
        </div>
      </div>
      <div class="stat-card" style="border-color:#00b4d8">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h4>Itens em Estoque</h4>
          <div class="stat-value">${insumos.length}</div>
        </div>
      </div>`;

    // ── Próximas chegadas ─────────────────────────────────
    const chegadas = reservas
      .filter(r => r.dataEntrada >= hoje)
      .sort((a, b) => a.dataEntrada.localeCompare(b.dataEntrada))
      .slice(0, 5);

    const chegadasEl = document.getElementById('proximas-chegadas');
    if (chegadas.length === 0) {
      chegadasEl.innerHTML = `
        <p style="color:var(--text-muted); text-align:center; padding:24px">
          Sem próximas chegadas agendadas.
        </p>`;
    } else {
      chegadasEl.innerHTML = chegadas.map(r => {
        const imovel = imoveis.find(i => i.id === r.imovelId);
        return `
          <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border)">
            <div style="font-size:22px">🏖</div>
            <div style="flex:1">
              <p style="font-weight:600; font-size:13px">${r.hospede}</p>
              <p style="font-size:11px; color:var(--text-muted)">
                ${imovel?.nome || '?'} · Entrada ${Utils.formatarData(r.dataEntrada)}
              </p>
            </div>
            ${Utils.badgeStatusReserva(r.dataEntrada, r.dataSaida)}
          </div>`;
      }).join('');
    }

    // ── Limpezas pendentes (com ação rápida) ─────────────
    const pendentes = reservas
      .filter(r => r.statusLimpeza === 'pendente')
      .sort((a, b) => a.dataSaida.localeCompare(b.dataSaida))
      .slice(0, 5);

    const limpEl = document.getElementById('limpezas-pendentes-dash');
    if (pendentes.length === 0) {
      limpEl.innerHTML = `
        <p style="color:var(--success); text-align:center; padding:24px; font-weight:600">
          ✅ Todas as limpezas em dia!
        </p>`;
    } else {
      limpEl.innerHTML = pendentes.map(r => {
        const imovel = imoveis.find(i => i.id === r.imovelId);
        return `
          <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border)">
            <div style="font-size:22px">🔴</div>
            <div style="flex:1">
              <p style="font-weight:600; font-size:13px">${imovel?.nome || 'Imóvel removido'}</p>
              <p style="font-size:11px; color:var(--text-muted)">
                ${r.hospede} · Saída ${Utils.formatarData(r.dataSaida)}
              </p>
            </div>
            <button class="btn btn-success btn-sm"
              onclick="Limpeza.marcarRealizada('${r.id}')">
              ✅
            </button>
          </div>`;
      }).join('');
    }
  },
};

// ─────────────────────────────────────────────────────────
//  ROTEAMENTO (NAVEGAÇÃO ENTRE SEÇÕES)
// ─────────────────────────────────────────────────────────

/**
 * Ativa uma seção e chama seu método de renderização.
 * É o único ponto que precisa conhecer todos os módulos.
 *
 * @param {string} secao - identificador da seção (ex: 'imoveis')
 */
function navegarPara(secao) {
  // Oculta todas as seções
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Exibe a seção alvo
  document.getElementById(`section-${secao}`)?.classList.add('active');

  // Destaca item ativo no menu
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-section="${secao}"]`)?.classList.add('active');

  // Renderiza o conteúdo da seção com dados atualizados do DB
  switch (secao) {
    case 'dashboard':
      Dashboard.renderizar();
      break;
    case 'imoveis':
      Imoveis.renderizar();
      break;
    case 'reservas':
      Reservas.popularSelectImoveis();
      Reservas.renderizar();
      break;
    case 'calendario':
      Calendario.renderizar();
      break;
    case 'limpeza':
      Limpeza.renderizar();
      break;
    case 'insumos':
      Insumos.popularSelectImoveis();
      Insumos.renderizar();
      break;
  }
}

// ─────────────────────────────────────────────────────────
//  INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // 1. Popula o localStorage com dados de exemplo no primeiro acesso
  DB.carregarMock();

  // 2. Cliques no menu lateral → navegar para a seção correspondente
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const secao = item.dataset.section;
      if (secao) navegarPara(secao);
    });
  });

  // 3. Clique no fundo do overlay fecha o modal (sem precisar do botão ✕)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // 4. Exibe o Dashboard como tela inicial
  navegarPara('dashboard');
});
