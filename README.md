# 🏖️ Litoral Rental — Gerenciador de Temporada

Sistema web simples para pequenos proprietários do litoral organizarem reservas, limpeza e insumos de suas casas de temporada.

> Projeto desenvolvido como trabalho de extensão universitária — Curso de Análise e Desenvolvimento de Sistemas.

---

## 📋 Funcionalidades

| Módulo | O que faz |
|---|---|
| **Dashboard** | Visão geral: imóveis, hospedagens ativas, limpezas pendentes e estoque |
| **Imóveis** | Cadastro e gerenciamento das propriedades |
| **Reservas** | Registro de hóspedes com datas de entrada e saída |
| **Calendário** | Visualização mensal da ocupação por imóvel |
| **Limpeza** | Controle de status de limpeza pós check-out |
| **Insumos** | Inventário de produtos por propriedade |

---

## 🖥️ Telas

**Dashboard**
- 4 cards de estatísticas em tempo real
- Lista de próximas chegadas
- Limpezas pendentes com ação rápida

**Calendário de Ocupação**
- Grid mensal com navegação entre meses
- Cada imóvel com cor distinta
- Etiqueta com nome do hóspede em cada dia ocupado

**Controle de Limpeza**
- Filtros: Todos / Pendentes / Realizadas
- Marcar limpeza como realizada com um clique
- Opção de reabrir caso necessário

**Insumos**
- Botões `+` e `−` para ajuste rápido de quantidade
- Alerta visual para estoque baixo (≤ 2 unidades)
- Filtro por imóvel

---

## 🗂️ Estrutura do Projeto

```
litoral-rental/
├── index.html          # Página única da aplicação (SPA)
├── css/
│   └── style.css       # Estilização completa (tema oceano)
└── js/
    ├── data.js         # Camada de dados (localStorage)
    ├── utils.js        # Funções auxiliares compartilhadas
    ├── imoveis.js      # Módulo de imóveis
    ├── reservas.js     # Módulo de reservas
    ├── calendario.js   # Módulo do calendário
    ├── limpeza.js      # Módulo de limpeza
    ├── insumos.js      # Módulo de insumos
    └── app.js          # Dashboard + roteamento + inicialização
```

---

## 🛠️ Tecnologias

- **HTML5** — estrutura semântica
- **CSS3** — variáveis CSS, Grid, Flexbox, animações
- **JavaScript (ES6+)** — módulos, localStorage, template strings
- Sem frameworks, sem dependências externas, sem build tools

---

## 🚀 Como executar

O projeto roda diretamente no navegador, sem necessidade de servidor.

**Opção 1 — Abrir direto:**
```bash
# Clone o repositório
git clone git@github.com:lramos97/litoral-rental.git
cd litoral-rental

# Abra o arquivo no navegador
# Windows: start index.html
# Mac:     open index.html
# Linux:   xdg-open index.html
```

**Opção 2 — Servidor local (recomendado):**
```bash
# Python 3
python3 -m http.server 8080

# Acesse: http://localhost:8080
```

Na primeira abertura, o sistema carrega automaticamente dados de exemplo (3 imóveis, 5 reservas, 7 insumos) para demonstração.

---

## 🏗️ Arquitetura

```
Navegador
  └── index.html
       ├── css/style.css   (apresentação)
       └── js/
            ├── data.js    (Model — CRUD no localStorage)
            ├── utils.js   (helpers compartilhados)
            ├── *.js       (Controller+View de cada módulo)
            └── app.js     (roteamento + Dashboard)
```

Padrão adotado: **MVC simplificado** sem frameworks.  
Persistência: **localStorage** do navegador (os dados ficam salvos entre sessões).

---

## 👩‍💻 Autora

Desenvolvido por **Larissa Ramos** como projeto de extensão universitária.  
Curso de Análise e Desenvolvimento de Sistemas.
