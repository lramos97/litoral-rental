/**
 * imoveis.js — Módulo de Imóveis
 *
 * Responsabilidades:
 *   - Renderizar os cards de imóveis cadastrados
 *   - Abrir modal para criar ou editar um imóvel
 *   - Salvar e remover imóveis via DB
 */

const Imoveis = {

  /**
   * Renderiza todos os imóveis como cards no grid.
   * Para cada imóvel, exibe status de ocupação atual e total de reservas.
   */
  renderizar() {
    const imoveis  = DB.getImoveis();
    const reservas = DB.getReservas();
    const hoje     = new Date().toISOString().split('T')[0];
    const container = document.getElementById('lista-imoveis');

    if (imoveis.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🏠</div>
          <p>Nenhum imóvel cadastrado ainda.</p>
          <p>Clique em <strong>+ Novo Imóvel</strong> para começar.</p>
        </div>`;
      return;
    }

    container.innerHTML = imoveis.map((imovel, idx) => {
      const reservasDoImovel = reservas.filter(r => r.imovelId === imovel.id);

      // Verifica se há uma reserva ativa hoje
      const ocupadoAgora = reservasDoImovel.some(
        r => r.dataEntrada <= hoje && r.dataSaida > hoje
      );

      const cor = Utils.corImovel(idx);

      return `
        <div class="imovel-card">
          <div class="imovel-card-header" style="background: linear-gradient(135deg, ${cor} 0%, ${cor}bb 100%)">
            <h3>🏠 ${imovel.nome}</h3>
            <p>📍 ${imovel.endereco || 'Endereço não informado'}</p>
          </div>
          <div class="imovel-card-body">
            <div class="imovel-meta">
              <span>🛏 ${imovel.quartos || 1} quarto${imovel.quartos !== 1 ? 's' : ''}</span>
              <span>👥 até ${imovel.capacidade || 4} pessoas</span>
            </div>

            ${imovel.descricao ? `<p class="imovel-desc">${imovel.descricao}</p>` : ''}

            <div style="margin-bottom:12px">
              ${ocupadoAgora
                ? `<span class="badge badge-success">✅ Ocupado agora</span>`
                : `<span class="badge badge-muted">🔓 Disponível</span>`
              }
              <span class="badge badge-info" style="margin-left:6px">
                ${reservasDoImovel.length} reserva${reservasDoImovel.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div class="imovel-actions">
              <button class="btn btn-outline btn-sm" onclick="Imoveis.editar('${imovel.id}')">✏️ Editar</button>
              <button class="btn btn-danger  btn-sm" onclick="Imoveis.remover('${imovel.id}')">🗑 Remover</button>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  /** Abre o modal em modo de criação (formulário em branco) */
  abrirModal() {
    document.getElementById('modal-imovel-titulo').textContent = 'Novo Imóvel';
    document.getElementById('imovel-id').value         = '';
    document.getElementById('imovel-nome').value       = '';
    document.getElementById('imovel-endereco').value   = '';
    document.getElementById('imovel-quartos').value    = 2;
    document.getElementById('imovel-capacidade').value = 4;
    document.getElementById('imovel-descricao').value  = '';
    Utils.abrirModal('modal-imovel');
  },

  /** Abre o modal preenchido com os dados do imóvel para edição */
  editar(id) {
    const imovel = DB.getImoveis().find(i => i.id === id);
    if (!imovel) return;

    document.getElementById('modal-imovel-titulo').textContent = 'Editar Imóvel';
    document.getElementById('imovel-id').value         = imovel.id;
    document.getElementById('imovel-nome').value       = imovel.nome;
    document.getElementById('imovel-endereco').value   = imovel.endereco   || '';
    document.getElementById('imovel-quartos').value    = imovel.quartos    || 2;
    document.getElementById('imovel-capacidade').value = imovel.capacidade || 4;
    document.getElementById('imovel-descricao').value  = imovel.descricao  || '';
    Utils.abrirModal('modal-imovel');
  },

  /**
   * Chamado pelo onsubmit do form.
   * Decide entre criar ou atualizar com base no campo oculto 'imovel-id'.
   */
  salvar(event) {
    event.preventDefault();

    const id = document.getElementById('imovel-id').value;
    const dados = {
      nome:       document.getElementById('imovel-nome').value.trim(),
      endereco:   document.getElementById('imovel-endereco').value.trim(),
      quartos:    parseInt(document.getElementById('imovel-quartos').value),
      capacidade: parseInt(document.getElementById('imovel-capacidade').value),
      descricao:  document.getElementById('imovel-descricao').value.trim(),
    };

    if (id) {
      DB.atualizarImovel(id, dados);
      Utils.toast('Imóvel atualizado com sucesso!', 'success');
    } else {
      DB.adicionarImovel(dados);
      Utils.toast('Imóvel cadastrado!', 'success');
    }

    this.fecharModal();
    this.renderizar();

    // Atualiza os selects de outros módulos que listam imóveis
    Reservas.popularSelectImoveis();
    Insumos.popularSelectImoveis();
    Calendario.renderizar();
    Dashboard.renderizar();
  },

  /** Remove imóvel após confirmação do usuário */
  remover(id) {
    const imovel = DB.getImoveis().find(i => i.id === id);
    if (!confirm(`Remover o imóvel "${imovel?.nome}"?\nAs reservas associadas permanecerão no sistema.`)) return;

    DB.removerImovel(id);
    Utils.toast('Imóvel removido.', 'success');
    this.renderizar();
    Dashboard.renderizar();
  },

  fecharModal() {
    Utils.fecharModal('modal-imovel');
  },
};
