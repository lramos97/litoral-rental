/**
 * data.js — Camada de dados (Data Layer)
 *
 * Toda a persistência da aplicação passa por aqui.
 * Usamos localStorage para manter os dados mesmo após recarregar a página.
 *
 * Entidades gerenciadas:
 *   - Imóveis   → propriedades cadastradas pelo proprietário
 *   - Reservas  → reservas de hóspedes (com status de limpeza embutido)
 *   - Insumos   → produtos de estoque por propriedade
 */

const DB = {

  // Chaves utilizadas no localStorage para cada entidade
  KEYS: {
    IMOVEIS:  'litoralrental_imoveis',
    RESERVAS: 'litoralrental_reservas',
    INSUMOS:  'litoralrental_insumos',
  },

  /**
   * Gera um ID único combinando timestamp e número aleatório.
   * Exemplo de saída: "lrx8k2a9f3m"
   */
  gerarId() {
    return 'lr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // ─────────────────────────────────────────────────────────
  //  IMÓVEIS
  // ─────────────────────────────────────────────────────────

  /** Retorna a lista completa de imóveis (array de objetos) */
  getImoveis() {
    return JSON.parse(localStorage.getItem(this.KEYS.IMOVEIS) || '[]');
  },

  _salvarImoveis(lista) {
    localStorage.setItem(this.KEYS.IMOVEIS, JSON.stringify(lista));
  },

  /**
   * Cria um novo imóvel.
   * @param {object} dados - { nome, endereco, quartos, capacidade, descricao }
   * @returns {object} o imóvel criado (com id gerado)
   */
  adicionarImovel(dados) {
    const lista = this.getImoveis();
    const novo  = { id: this.gerarId(), ...dados };
    lista.push(novo);
    this._salvarImoveis(lista);
    return novo;
  },

  /**
   * Atualiza campos de um imóvel existente.
   * @param {string} id
   * @param {object} dados - campos a sobrescrever
   */
  atualizarImovel(id, dados) {
    const lista = this.getImoveis().map(i => i.id === id ? { ...i, ...dados } : i);
    this._salvarImoveis(lista);
  },

  /** Remove um imóvel pelo ID */
  removerImovel(id) {
    this._salvarImoveis(this.getImoveis().filter(i => i.id !== id));
  },

  // ─────────────────────────────────────────────────────────
  //  RESERVAS
  // ─────────────────────────────────────────────────────────

  /** Retorna a lista completa de reservas */
  getReservas() {
    return JSON.parse(localStorage.getItem(this.KEYS.RESERVAS) || '[]');
  },

  _salvarReservas(lista) {
    localStorage.setItem(this.KEYS.RESERVAS, JSON.stringify(lista));
  },

  /**
   * Cria uma nova reserva.
   * O statusLimpeza começa sempre como 'pendente'.
   * @param {object} dados - { imovelId, hospede, telefone, dataEntrada, dataSaida, observacoes }
   * @returns {object} a reserva criada
   */
  adicionarReserva(dados) {
    const lista = this.getReservas();
    const nova  = { id: this.gerarId(), statusLimpeza: 'pendente', ...dados };
    lista.push(nova);
    this._salvarReservas(lista);
    return nova;
  },

  /**
   * Atualiza uma reserva (ex: marcar limpeza como 'realizada').
   * @param {string} id
   * @param {object} dados - campos a sobrescrever
   */
  atualizarReserva(id, dados) {
    const lista = this.getReservas().map(r => r.id === id ? { ...r, ...dados } : r);
    this._salvarReservas(lista);
  },

  /** Remove uma reserva pelo ID */
  removerReserva(id) {
    this._salvarReservas(this.getReservas().filter(r => r.id !== id));
  },

  // ─────────────────────────────────────────────────────────
  //  INSUMOS
  // ─────────────────────────────────────────────────────────

  /** Retorna a lista completa de insumos */
  getInsumos() {
    return JSON.parse(localStorage.getItem(this.KEYS.INSUMOS) || '[]');
  },

  _salvarInsumos(lista) {
    localStorage.setItem(this.KEYS.INSUMOS, JSON.stringify(lista));
  },

  /**
   * Adiciona um insumo ao estoque.
   * @param {object} dados - { produto, quantidade, unidade, imovelId }
   */
  adicionarInsumo(dados) {
    const lista = this.getInsumos();
    const novo  = { id: this.gerarId(), ...dados };
    lista.push(novo);
    this._salvarInsumos(lista);
    return novo;
  },

  atualizarInsumo(id, dados) {
    const lista = this.getInsumos().map(i => i.id === id ? { ...i, ...dados } : i);
    this._salvarInsumos(lista);
  },

  removerInsumo(id) {
    this._salvarInsumos(this.getInsumos().filter(i => i.id !== id));
  },

  // ─────────────────────────────────────────────────────────
  //  DADOS DE EXEMPLO (MOCK)
  // ─────────────────────────────────────────────────────────

  /**
   * Popula o banco com dados fictícios se estiver completamente vazio.
   * Garante que a aplicação tenha conteúdo logo na primeira abertura.
   */
  carregarMock() {
    if (this.getImoveis().length > 0) return; // já tem dados, não sobrescreve

    // Helper: retorna data ISO relativa a hoje (+/- dias)
    const d = (dias) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + dias);
      return dt.toISOString().split('T')[0];
    };

    this._salvarImoveis([
      { id: 'im1', nome: 'Casa Azul',      endereco: 'Rua das Conchas, 10 — Praia do Forte', quartos: 3, capacidade: 8,  descricao: 'Casa ampla com piscina, churrasqueira e 30m da praia.' },
      { id: 'im2', nome: 'Bangalô Mar',    endereco: 'Av. Beira Mar, 45 — Guarajuba',        quartos: 2, capacidade: 5,  descricao: 'Bangalô com vista privilegiada para o mar, ideal para casais.' },
      { id: 'im3', nome: 'Chalé Coqueiro', endereco: 'Trav. dos Pescadores, 3 — Imbassaí',   quartos: 4, capacidade: 10, descricao: 'Chalé rústico com área verde e redes de descanso.' },
    ]);

    this._salvarReservas([
      { id: 'rv1', imovelId: 'im1', hospede: 'João Silva',    telefone: '71 99999-1234', dataEntrada: d(2),  dataSaida: d(7),  statusLimpeza: 'pendente',  observacoes: 'Chegada prevista às 14h' },
      { id: 'rv2', imovelId: 'im2', hospede: 'Maria Souza',   telefone: '71 98888-5678', dataEntrada: d(-5), dataSaida: d(-1), statusLimpeza: 'realizada', observacoes: 'Pet friendly' },
      { id: 'rv3', imovelId: 'im1', hospede: 'Carlos Mendes', telefone: '11 97777-9012', dataEntrada: d(10), dataSaida: d(15), statusLimpeza: 'pendente',  observacoes: '' },
      { id: 'rv4', imovelId: 'im3', hospede: 'Ana Paula',     telefone: '21 96666-3456', dataEntrada: d(-2), dataSaida: d(3),  statusLimpeza: 'pendente',  observacoes: 'Família com crianças' },
      { id: 'rv5', imovelId: 'im2', hospede: 'Roberto Lima',  telefone: '85 95555-7890', dataEntrada: d(8),  dataSaida: d(12), statusLimpeza: 'pendente',  observacoes: '' },
    ]);

    this._salvarInsumos([
      { id: 'in1', produto: 'Papel Higiênico',     quantidade: 24, unidade: 'rolos',    imovelId: 'im1' },
      { id: 'in2', produto: 'Detergente',          quantidade: 4,  unidade: 'frascos',  imovelId: 'im1' },
      { id: 'in3', produto: 'Sabonete',            quantidade: 10, unidade: 'unidades', imovelId: 'im2' },
      { id: 'in4', produto: 'Toalhas de Banho',    quantidade: 6,  unidade: 'peças',    imovelId: 'im2' },
      { id: 'in5', produto: 'Amaciante',           quantidade: 2,  unidade: 'litros',   imovelId: '' },
      { id: 'in6', produto: 'Desinfetante',        quantidade: 3,  unidade: 'litros',   imovelId: 'im3' },
      { id: 'in7', produto: 'Esponjas de Limpeza', quantidade: 12, unidade: 'unidades', imovelId: '' },
    ]);
  },
};
