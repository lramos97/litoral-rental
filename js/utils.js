/**
 * utils.js — Funções utilitárias compartilhadas
 *
 * Centraliza operações reutilizadas por vários módulos:
 * formatação de datas, cálculos, badges HTML, notificações e modais.
 */

const Utils = {

  /**
   * Converte data ISO "YYYY-MM-DD" para formato brasileiro "DD/MM/AAAA".
   * Exemplo: "2026-07-15" → "15/07/2026"
   */
  formatarData(iso) {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  },

  /**
   * Calcula a diferença em dias entre entrada e saída.
   * O sufixo T00:00:00 força interpretação como horário local, não UTC.
   */
  calcularNoites(dataEntrada, dataSaida) {
    const entrada = new Date(dataEntrada + 'T00:00:00');
    const saida   = new Date(dataSaida   + 'T00:00:00');
    return Math.round((saida - entrada) / (1000 * 60 * 60 * 24));
  },

  /**
   * Classifica o status temporal de uma reserva comparando com a data de hoje.
   * @returns {'futura'|'ativa'|'passada'}
   */
  statusReserva(dataEntrada, dataSaida) {
    const hoje = new Date().toISOString().split('T')[0];
    if (dataSaida  < hoje) return 'passada';
    if (dataEntrada > hoje) return 'futura';
    return 'ativa';
  },

  /**
   * Retorna o HTML de um badge colorido para o status da reserva.
   * Reutilizado na tabela de reservas e no dashboard.
   */
  badgeStatusReserva(dataEntrada, dataSaida) {
    const status = this.statusReserva(dataEntrada, dataSaida);
    const mapa = {
      futura:  { cls: 'badge-info',    txt: '🗓 Futura'    },
      ativa:   { cls: 'badge-success', txt: '✅ Ativa'     },
      passada: { cls: 'badge-muted',   txt: '✔ Concluída' },
    };
    const { cls, txt } = mapa[status];
    return `<span class="badge ${cls}">${txt}</span>`;
  },

  /**
   * Exibe uma mensagem de feedback (toast) no canto inferior direito.
   * Desaparece automaticamente após 3 segundos.
   * @param {string} mensagem
   * @param {'default'|'success'|'error'} tipo
   */
  toast(mensagem, tipo = 'default') {
    const el = document.getElementById('toast');
    const cores = { success: '#2d9e6b', error: '#e05252', default: '#1e293b' };
    el.textContent   = mensagem;
    el.style.background = cores[tipo] || cores.default;
    el.classList.add('show');
    clearTimeout(Utils._toastTimer);
    Utils._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  },

  /** Abre um modal adicionando a classe CSS 'open' */
  abrirModal(id) {
    document.getElementById(id)?.classList.add('open');
  },

  /** Fecha um modal removendo a classe CSS 'open' */
  fecharModal(id) {
    document.getElementById(id)?.classList.remove('open');
  },

  /**
   * Paleta de cores para diferenciar imóveis no calendário.
   * Cada imóvel recebe uma cor pelo seu índice na lista.
   */
  CORES: ['#0077b6', '#e05252', '#2d9e6b', '#e9a825', '#7c3aed', '#db2777', '#0891b2'],

  /** Retorna a cor para o imóvel no índice fornecido */
  corImovel(idx) {
    return this.CORES[idx % this.CORES.length];
  },
};
