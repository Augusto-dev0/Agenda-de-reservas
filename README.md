# 🗓️ Espaço Freire — Agenda de Reservas

<div align="center">

![Status](https://img.shields.io/badge/status-ativo-3b82f6?style=flat-square)
![HTML](https://img.shields.io/badge/HTML5-3b82f6?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-3b82f6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-3b82f6?style=flat-square&logo=javascript&logoColor=white)

Sistema web completo de gerenciamento de reservas para o **Espaço Freire** — controle de clientes, datas, horários, pagamentos, alertas automáticos, calendário visual e geração de contratos individuais em PDF.

[✨ Funcionalidades](#-funcionalidades) · [🚀 Como usar](#-como-usar) · [📁 Estrutura](#-estrutura-do-projeto) · [📱 Responsividade](#-responsividade)

</div>

---

## ✨ Funcionalidades

- **Cadastro completo de reservas** — cliente, data, horário, valor, status do evento e pagamento
- **Edição e exclusão** de reservas com confirmação
- **Calendário visual mensal** — dias com reserva destacados em azul, tooltip com nome do cliente e navegação entre meses
- **Alertas proativos automáticos** — eventos próximos, pagamentos atrasados e reservas sem valor
- **Filtros e busca em tempo real** — por nome do cliente, status do evento e status de pagamento
- **Contrato PDF individual** — gerado por reserva com dados completos, campos de assinatura e cláusula
- **Relatório PDF geral** — exportação de todas as reservas com resumo financeiro
- **Painel financeiro** — total recebido, pendente e número de reservas (com filtro por mês)
- **Indicador visual de observações** — botão com bolinha pulsante quando há observação cadastrada
- **Modo escuro / claro** — alternância suave com preferência salva automaticamente
- **Persistência de dados** via `localStorage` — reservas mantidas mesmo após fechar o navegador
- **Toast de feedback** — notificação visual em todas as ações

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 + CSS3 + JS (ES6+) | Base da aplicação |
| [jsPDF](https://github.com/parallax/jsPDF) | Geração de PDF (relatório e contrato) |
| [Font Awesome 6](https://fontawesome.com/) | Ícones |
| [Google Fonts](https://fonts.google.com/) | Playfair Display + IBM Plex Sans |
| localStorage | Persistência de dados no navegador |

---

## 🎨 Design

| Modo | Fundo | Superfície | Destaque |
|---|---|---|---|
| **Escuro** | `#0d1117` — preto-azulado | `#161b22` | Azul `#3b82f6` |
| **Claro** | `#d8dce6` — cinza-ardósia | `#e2e6f0` | Azul `#1d4ed8` |

- **Fonte de títulos:** Playfair Display — elegante e editorial
- **Fonte de corpo e números:** IBM Plex Sans — limpa e profissional para dados
- **Acento:** azul em botões, badges, calendário, barra lateral dos cards e PDFs

---

## 📁 Estrutura do Projeto

```
agenda_reservas2026/
├── index.html     # Estrutura da aplicação
├── style.css      # Estilos, temas dark/light e responsividade
├── script.js      # Lógica completa (CRUD, calendário, alertas, PDFs)
├── README.md      # Documentação
└── espaço.ico     # Ícone da aba do navegador
```

---

## 🚀 Como usar

### Localmente
1. Baixe ou clone o repositório
2. Abra `index.html` diretamente no navegador
3. Nenhuma instalação ou servidor necessário

```bash
git clone https://github.com/seu-usuario/espaco-freire.git
cd espaco-freire
# Abra o index.html no navegador
```

### Hospedado no GitHub Pages
1. Suba os arquivos em um repositório público no GitHub
2. Vá em **Settings → Pages → Source → main / root**
3. Aguarde ~1 minuto e acesse `https://seu-usuario.github.io/nome-do-repositorio`

> ⚠️ Os dados ficam salvos no `localStorage` do navegador. Limpar os dados do site apagará as reservas.

---

## 📱 Responsividade

| Tela | Comportamento |
|---|---|
| Desktop ≥ 900px | Formulário em 4 colunas, painel financeiro em 3 colunas |
| Tablet ≤ 900px | Formulário em 2 colunas, filtros em 2 colunas |
| Mobile ≤ 768px | Header compacto |
| Mobile ≤ 640px | Layout em 1 coluna, botões em largura total, toast no rodapé |
| Mobile ≤ 420px | Subtítulo oculto, calendário ultra-compacto, tooltip reposicionado |

---

## 📅 Calendário Visual

O calendário mensal exibe automaticamente os dias com reservas destacados. Ao passar o mouse sobre um dia ocupado, aparece um tooltip com o nome do cliente. Clicar num dia ocupado filtra automaticamente a tabela de reservas para aquele mês.

---

## 🔔 Alertas Proativos

O painel de alertas aparece automaticamente quando detecta:

| Nível | Condição |
|---|---|
| 🔴 Urgente | Evento acontecendo hoje ou nos próximos 3 dias |
| 🟡 Aviso | Pagamento pendente após a data do evento |
| 🔵 Info | Reserva confirmada sem valor definido |

---

## 📄 PDFs Gerados

### Relatório Geral
Exporta todas as reservas com:
- Cabeçalho com identidade visual do Espaço Freire
- 3 mini-cards de resumo financeiro (recebido, pendente, total)
- Tabela completa com badges coloridos por status
- Paginação automática com cabeçalho de continuação
- Rodapé com número de páginas em todas as folhas

### Contrato Individual
Gerado por reserva com:
- Dados completos do cliente e do evento
- Observações da reserva (quando houver)
- Duas linhas de assinatura (cliente e Espaço Freire)
- Cláusula de ciência e concordância
- Nome do arquivo com nome do cliente e data

---

## 👁️ Indicador de Observações

O botão de observação na tabela tem dois estados visuais:

| Estado | Visual |
|---|---|
| **Com observação** | Azul com borda accent e bolinha pulsante no canto |
| **Sem observação** | Cinza semi-transparente, cursor padrão |

---

## 🔒 Segurança

- Dados inseridos pelo usuário renderizados via `textContent` — nunca `innerHTML` — prevenindo **XSS**
- Validação de datas duplicadas no formulário
- Validação de nome mínimo e valor positivo antes de salvar
- Nenhum dado enviado a servidores externos

---

## 📬 Contato

**Espaço Freire**

[![Instagram](https://img.shields.io/badge/Instagram-espaco__freire2026-3b82f6?style=flat-square&logo=instagram)](https://instagram.com/espaco_freire2026)

---

<div align="center">
© 2026 Espaço Freire — Todos os direitos reservados
</div>
	
