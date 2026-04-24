/**
 * reservas.js — Módulo de Reservas
 *
 * Responsabilidades:
 *   - Renderizar a tabela de reservas com filtros
 *   - Criar, editar e remover reservas
 *   - Validar que a data de saída é posterior à entrada
 */

const Reservas = {

  /**
   * Renderiza a tabela de reservas.
   * Aplica os filtros de imóvel e status selecionados nos selects.
   */
  renderizar() {
    const filtroImovel = document.getElementById('filtro-imovel-reserva')?.value || '';
    const filtroStatus = document.getElementById('filtro-status-reserva')?.value || '';

    let reservas = DB.getReservas();
    const imoveis = DB.getImoveis();

    // Aplica filtro de imóvel
    if (filtroImovel) {
      reservas = reservas.filter(r => r.imovelId === filtroImovel);
    }

    // Aplica filtro de status (futura / ativa / passada)
    if (filtroStatus) {
      reservas = reservas.filter(r =>
        Utils.statusReserva(r.dataEntrada, r.dataSaida) === filtroStatus
      );
    }

    // Ordena do mais recente para o mais antigo
    reservas.sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));

    const tbody = document.getElementById('tbody-reservas');

    if (reservas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted)">
            Nenhuma reserva encontrada com os filtros selecionados.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = reservas.map(r => {
      const imovel = imoveis.find(i => i.id === r.imovelId);
      const noites = Utils.calcularNoites(r.dataEntrada, r.dataSaida);

      return `
        <tr>
          <td>
            <strong>${r.hospede}</strong>
            ${r.telefone ? `<br><small style="color:var(--text-muted)">${r.telefone}</small>` : ''}
            ${r.observacoes ? `<br><small style="color:var(--text-muted)">📝 ${r.observacoes}</small>` : ''}
          </td>
          <td>${imovel ? imovel.nome : '<em style="color:var(--text-muted)">Imóvel removido</em>'}</td>
          <td>${Utils.formatarData(r.dataEntrada)}</td>
          <td>${Utils.formatarData(r.dataSaida)}</td>
          <td style="text-align:center">${noites}n</td>
          <td>${Utils.badgeStatusReserva(r.dataEntrada, r.dataSaida)}</td>
          <td>
            <div style="display:flex; gap:6px">
              <button class="btn btn-outline btn-sm" onclick="Reservas.editar('${r.id}')">✏️</button>
              <button class="btn btn-danger  btn-sm" onclick="Reservas.remover('${r.id}')">🗑</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  /**
   * Preenche os selects de imóvel (filtro e formulário).
   * Chamado sempre que a lista de imóveis pode ter mudado.
   */
  popularSelectImoveis() {
    const imoveis = DB.getImoveis();
    const opts = imoveis.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');

    const filtroEl = document.getElementById('filtro-imovel-reserva');
    if (filtroEl) {
      const val = filtroEl.value;
      filtroEl.innerHTML = `<option value="">Todos os imóveis</option>${opts}`;
      filtroEl.value = val; // preserva a seleção atual
    }

    const formEl = document.getElementById('reserva-imovel');
    if (formEl) {
      formEl.innerHTML = `<option value="">Selecione o imóvel</option>${opts}`;
    }
  },

  /** Abre modal para criar nova reserva */
  abrirModal() {
    this.popularSelectImoveis();
    document.getElementById('modal-reserva-titulo').textContent = 'Nova Reserva';
    document.getElementById('reserva-id').value       = '';
    document.getElementById('reserva-imovel').value   = '';
    document.getElementById('reserva-hospede').value  = '';
    document.getElementById('reserva-telefone').value = '';
    document.getElementById('reserva-entrada').value  = '';
    document.getElementById('reserva-saida').value    = '';
    document.getElementById('reserva-obs').value      = '';
    Utils.abrirModal('modal-reserva');
  },

  /** Abre modal preenchido para editar reserva existente */
  editar(id) {
    this.popularSelectImoveis();
    const r = DB.getReservas().find(r => r.id === id);
    if (!r) return;

    document.getElementById('modal-reserva-titulo').textContent = 'Editar Reserva';
    document.getElementById('reserva-id').value       = r.id;
    document.getElementById('reserva-imovel').value   = r.imovelId;
    document.getElementById('reserva-hospede').value  = r.hospede;
    document.getElementById('reserva-telefone').value = r.telefone   || '';
    document.getElementById('reserva-entrada').value  = r.dataEntrada;
    document.getElementById('reserva-saida').value    = r.dataSaida;
    document.getElementById('reserva-obs').value      = r.observacoes || '';
    Utils.abrirModal('modal-reserva');
  },

  /** Salva (cria ou atualiza) a reserva a partir do formulário */
  salvar(event) {
    event.preventDefault();

    const entrada = document.getElementById('reserva-entrada').value;
    const saida   = document.getElementById('reserva-saida').value;

    // Validação: saída deve ser posterior à entrada
    if (saida <= entrada) {
      Utils.toast('A data de saída deve ser posterior à de entrada.', 'error');
      return;
    }

    const id = document.getElementById('reserva-id').value;
    const dados = {
      imovelId:    document.getElementById('reserva-imovel').value,
      hospede:     document.getElementById('reserva-hospede').value.trim(),
      telefone:    document.getElementById('reserva-telefone').value.trim(),
      dataEntrada: entrada,
      dataSaida:   saida,
      observacoes: document.getElementById('reserva-obs').value.trim(),
    };

    if (id) {
      DB.atualizarReserva(id, dados);
      Utils.toast('Reserva atualizada!', 'success');
    } else {
      DB.adicionarReserva(dados);
      Utils.toast('Reserva criada com sucesso!', 'success');
    }

    this.fecharModal();
    this.renderizar();

    // Mantém outros módulos sincronizados
    Calendario.renderizar();
    Limpeza.renderizar();
    Dashboard.renderizar();
  },

  /** Remove reserva após confirmação */
  remover(id) {
    const r = DB.getReservas().find(r => r.id === id);
    if (!confirm(`Remover a reserva de "${r?.hospede}"?`)) return;

    DB.removerReserva(id);
    Utils.toast('Reserva removida.', 'success');
    this.renderizar();
    Calendario.renderizar();
    Limpeza.renderizar();
    Dashboard.renderizar();
  },

  fecharModal() {
    Utils.fecharModal('modal-reserva');
  },
};
