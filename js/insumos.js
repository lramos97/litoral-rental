/**
 * insumos.js — Controle de Insumos (Estoque)
 *
 * Gerencia o inventário de produtos por propriedade.
 * Funcionalidades:
 *   - Listagem com filtro por imóvel
 *   - Destaque visual para itens com estoque baixo (≤ 2)
 *   - Botões rápidos +/− para ajustar quantidade sem abrir o modal
 *   - CRUD completo via modal
 */

const Insumos = {

  /**
   * Renderiza a tabela de insumos.
   * Filtra pelo imóvel selecionado no select de filtro.
   */
  renderizar() {
    const filtroImovel = document.getElementById('filtro-imovel-insumo')?.value || '';
    let insumos        = DB.getInsumos();
    const imoveis      = DB.getImoveis();

    if (filtroImovel) {
      insumos = insumos.filter(i => i.imovelId === filtroImovel);
    }

    // Ordena alfabeticamente por produto
    insumos.sort((a, b) => a.produto.localeCompare(b.produto));

    const tbody = document.getElementById('tbody-insumos');

    if (insumos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted)">
            Nenhum insumo encontrado.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = insumos.map(insumo => {
      const imovel       = imoveis.find(i => i.id === insumo.imovelId);
      const baixoEstoque = insumo.quantidade <= 2;

      return `
        <tr>
          <td><strong>${insumo.produto}</strong></td>
          <td>
            <span style="font-size:16px; font-weight:700; color:${baixoEstoque ? 'var(--danger)' : 'var(--text)'}">
              ${insumo.quantidade}
            </span>
            ${baixoEstoque ? ' <span class="badge badge-danger">Baixo</span>' : ''}
          </td>
          <td>${insumo.unidade || '—'}</td>
          <td>${imovel ? imovel.nome : '<em style="color:var(--text-muted)">Geral</em>'}</td>
          <td>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap">
              <button class="btn btn-outline btn-sm" onclick="Insumos.ajustar('${insumo.id}', -1)" title="Diminuir">−</button>
              <button class="btn btn-outline btn-sm" onclick="Insumos.ajustar('${insumo.id}', +1)" title="Aumentar">+</button>
              <button class="btn btn-outline btn-sm" onclick="Insumos.editar('${insumo.id}')">✏️</button>
              <button class="btn btn-danger  btn-sm" onclick="Insumos.remover('${insumo.id}')">🗑</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  /**
   * Preenche os selects de imóvel (filtro e formulário).
   * Preserva o valor selecionado no filtro ao atualizar.
   */
  popularSelectImoveis() {
    const imoveis = DB.getImoveis();
    const opts    = imoveis.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');

    const filtroEl = document.getElementById('filtro-imovel-insumo');
    if (filtroEl) {
      const val = filtroEl.value;
      filtroEl.innerHTML = `<option value="">Todos os imóveis</option>${opts}`;
      filtroEl.value = val;
    }

    const formEl = document.getElementById('insumo-imovel');
    if (formEl) {
      formEl.innerHTML = `<option value="">Geral / Sem imóvel específico</option>${opts}`;
    }
  },

  /** Abre modal para adicionar novo insumo */
  abrirModal() {
    this.popularSelectImoveis();
    document.getElementById('modal-insumo-titulo').textContent = 'Novo Insumo';
    document.getElementById('insumo-id').value        = '';
    document.getElementById('insumo-produto').value   = '';
    document.getElementById('insumo-quantidade').value = 1;
    document.getElementById('insumo-unidade').value   = '';
    document.getElementById('insumo-imovel').value    = '';
    Utils.abrirModal('modal-insumo');
  },

  /** Abre modal preenchido para editar insumo */
  editar(id) {
    this.popularSelectImoveis();
    const insumo = DB.getInsumos().find(i => i.id === id);
    if (!insumo) return;

    document.getElementById('modal-insumo-titulo').textContent = 'Editar Insumo';
    document.getElementById('insumo-id').value        = insumo.id;
    document.getElementById('insumo-produto').value   = insumo.produto;
    document.getElementById('insumo-quantidade').value = insumo.quantidade;
    document.getElementById('insumo-unidade').value   = insumo.unidade  || '';
    document.getElementById('insumo-imovel').value    = insumo.imovelId || '';
    Utils.abrirModal('modal-insumo');
  },

  /** Salva (cria ou atualiza) o insumo a partir do formulário */
  salvar(event) {
    event.preventDefault();

    const id = document.getElementById('insumo-id').value;
    const dados = {
      produto:    document.getElementById('insumo-produto').value.trim(),
      quantidade: parseInt(document.getElementById('insumo-quantidade').value),
      unidade:    document.getElementById('insumo-unidade').value.trim(),
      imovelId:   document.getElementById('insumo-imovel').value,
    };

    if (id) {
      DB.atualizarInsumo(id, dados);
      Utils.toast('Insumo atualizado!', 'success');
    } else {
      DB.adicionarInsumo(dados);
      Utils.toast('Insumo adicionado ao estoque!', 'success');
    }

    this.fecharModal();
    this.renderizar();
  },

  /**
   * Ajusta a quantidade em +1 ou -1 diretamente na tabela (sem modal).
   * Garante que a quantidade não fique negativa.
   */
  ajustar(id, delta) {
    const insumo = DB.getInsumos().find(i => i.id === id);
    if (!insumo) return;
    const novaQtd = Math.max(0, insumo.quantidade + delta);
    DB.atualizarInsumo(id, { quantidade: novaQtd });
    this.renderizar();
  },

  /** Remove insumo após confirmação */
  remover(id) {
    const insumo = DB.getInsumos().find(i => i.id === id);
    if (!confirm(`Remover "${insumo?.produto}" do estoque?`)) return;
    DB.removerInsumo(id);
    Utils.toast('Insumo removido.');
    this.renderizar();
  },

  fecharModal() {
    Utils.fecharModal('modal-insumo');
  },
};
