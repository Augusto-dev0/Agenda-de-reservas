/* ===============================
   STORAGE KEY
================================= */
const STORAGE_KEY = "espacoLazer";

/* ===============================
   ESTADO
================================= */
let reservas  = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editIndex = -1;
let calAno, calMes;

/* ===============================
   ELEMENTOS
================================= */
const tableBody = document.getElementById("table-body");
const btnSubmit = document.getElementById("btnSubmit");

/* ===============================
   UTILITÁRIOS
================================= */
function formatBRL(value) {
    return parseFloat(value || 0).toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
}

function dataJaExiste(data, indexAtual = -1) {
    return reservas.some((r, i) => r.date === data && i !== indexAtual);
}

function formatarDataBR(isoDate) {
    if (!isoDate) return "—";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
}

function statusLabel(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ===============================
   TOAST — sem emojis duplicados
================================= */
function showToast(msg, tipo = "ok") {
    const toast = document.getElementById("toast");
    const icon  = document.getElementById("toastIcon");
    document.getElementById("toastMsg").textContent = msg;
    const mapa = {
        ok:    { cls: "fa-circle-check",        cor: "var(--accent)"  },
        aviso: { cls: "fa-triangle-exclamation", cor: "var(--warning)" },
        erro:  { cls: "fa-circle-xmark",         cor: "var(--danger)"  },
        info:  { cls: "fa-circle-info",          cor: "var(--accent)"  },
    };
    const t = mapa[tipo] || mapa.ok;
    icon.className = `fas ${t.cls}`;
    icon.style.color = t.cor;
    toast.style.borderLeftColor = t.cor;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ===============================
   MODAL OBSERVAÇÃO
================================= */
function abrirModal(texto) {
    document.getElementById("modal-body").textContent =
        texto?.trim() ? texto : "Essa reserva não possui observações.";
    document.getElementById("modal").classList.add("open");
}

function fecharModal() {
    document.getElementById("modal").classList.remove("open");
}

document.getElementById("modal").addEventListener("click", function(e) {
    if (e.target === this) fecharModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") { fecharModal(); fecharContrato(); }
});

/* ===============================
   ALERTAS PROATIVOS
================================= */
function verificarAlertas() {
    const alertas = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    reservas.forEach(r => {
        const dataEvento = new Date(r.date + "T00:00:00");
        const diffDias = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));

        if (diffDias >= 0 && diffDias <= 3 && r.eventStatus !== "finalizado") {
            const txt = diffDias === 0
                ? "HOJE"
                : diffDias === 1
                    ? "amanhã"
                    : `em ${diffDias} dias`;
            alertas.push({
                tipo: "urgente",
                icon: "fa-calendar-exclamation",
                msg: `<strong>${r.client}</strong> — evento <strong>${txt}</strong> (${formatarDataBR(r.date)} às ${r.time})`
            });
        }

        if (r.paymentStatus === "Pendente" && dataEvento < hoje) {
            const diasAtraso = Math.abs(Math.floor((hoje - dataEvento) / (1000 * 60 * 60 * 24)));
            alertas.push({
                tipo: "aviso",
                icon: "fa-circle-dollar-to-slot",
                msg: `<strong>${r.client}</strong> — pagamento pendente há <strong>${diasAtraso} dia${diasAtraso !== 1 ? "s" : ""}</strong>`
            });
        }

        if (r.eventStatus === "confirmado" && (!r.value || parseFloat(r.value) === 0)) {
            alertas.push({
                tipo: "info",
                icon: "fa-triangle-exclamation",
                msg: `<strong>${r.client}</strong> — reserva confirmada sem <strong>valor definido</strong>`
            });
        }
    });

    const section = document.getElementById("alertas-section");
    const lista   = document.getElementById("alertas-lista");
    lista.innerHTML = "";

    if (alertas.length === 0) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";
    alertas.forEach(a => {
        const div = document.createElement("div");
        div.className = `alerta-item ${a.tipo}`;
        div.innerHTML = `<i class="fas ${a.icon}"></i><span>${a.msg}</span>`;
        lista.appendChild(div);
    });
}

/* ===============================
   CALENDÁRIO
================================= */
function iniciarCalendario() {
    const hoje = new Date();
    calAno = hoje.getFullYear();
    calMes = hoje.getMonth();
    renderCalendario();
}

function mudarMesCal(dir) {
    calMes += dir;
    if (calMes < 0)  { calMes = 11; calAno--; }
    if (calMes > 11) { calMes = 0;  calAno++; }
    renderCalendario();
}

function renderCalendario() {
    const nomesMeses = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    document.getElementById("cal-titulo").textContent =
        `${nomesMeses[calMes]} ${calAno}`;

    const grid = document.getElementById("cal-grid");
    grid.innerHTML = "";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const primeiroDia = new Date(calAno, calMes, 1).getDay();
    const totalDias   = new Date(calAno, calMes + 1, 0).getDate();
    const diasMesAnt  = new Date(calAno, calMes, 0).getDate();

    const mapaReservas = {};
    reservas.forEach(r => {
        if (!r.date) return;
        const [y, m] = r.date.split("-").map(Number);
        if (y === calAno && m - 1 === calMes) {
            if (!mapaReservas[r.date]) mapaReservas[r.date] = [];
            mapaReservas[r.date].push(r.client);
        }
    });

    for (let i = primeiroDia - 1; i >= 0; i--) {
        const div = document.createElement("div");
        div.className = "cal-dia outro-mes";
        div.textContent = diasMesAnt - i;
        grid.appendChild(div);
    }

    for (let d = 1; d <= totalDias; d++) {
        const div   = document.createElement("div");
        const mm    = String(calMes + 1).padStart(2, "0");
        const dd    = String(d).padStart(2, "0");
        const chave = `${calAno}-${mm}-${dd}`;
        const dataD = new Date(calAno, calMes, d);

        div.className = "cal-dia";
        div.textContent = d;

        if (dataD.getTime() === hoje.getTime()) {
            div.classList.add("hoje");
        }

        if (mapaReservas[chave]) {
            div.classList.add("ocupado");
            const nomes = mapaReservas[chave].join(", ");
            div.setAttribute("data-tooltip", nomes.length > 40 ? nomes.substring(0, 38) + "…" : nomes);
            div.addEventListener("click", () => {
                document.getElementById("filtro-busca").value = "";
                document.getElementById("filtroMes").value = `${calAno}-${mm}`;
                render();
                document.querySelector(".tabela-container").scrollIntoView({ behavior: "smooth" });
            });
        }

        grid.appendChild(div);
    }

    const totalCelulas = primeiroDia + totalDias;
    const restante = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);
    for (let i = 1; i <= restante; i++) {
        const div = document.createElement("div");
        div.className = "cal-dia outro-mes";
        div.textContent = i;
        grid.appendChild(div);
    }
}

/* ===============================
   FILTROS DA TABELA
================================= */
function limparFiltros() {
    document.getElementById("filtro-busca").value  = "";
    document.getElementById("filtro-status").value = "";
    document.getElementById("filtro-pag").value    = "";
    render();
}

function limparFiltro() {
    document.getElementById("filtroMes").value = "";
    render();
}

function getReservasFiltradas() {
    const filtroMes    = document.getElementById("filtroMes")?.value;
    const filtroBusca  = document.getElementById("filtro-busca").value.toLowerCase().trim();
    const filtroStatus = document.getElementById("filtro-status").value;
    const filtroPag    = document.getElementById("filtro-pag").value;

    return reservas.filter(r => {
        if (filtroMes    && !r.date.startsWith(filtroMes))                        return false;
        if (filtroBusca  && !r.client.toLowerCase().includes(filtroBusca))        return false;
        if (filtroStatus && r.eventStatus !== filtroStatus)                        return false;
        if (filtroPag    && r.paymentStatus !== filtroPag)                         return false;
        return true;
    });
}

document.getElementById("filtro-busca").addEventListener("input", render);
document.getElementById("filtro-status").addEventListener("change", render);
document.getElementById("filtro-pag").addEventListener("change", render);

/* ===============================
   RENDER
================================= */
function render() {
    tableBody.innerHTML = "";
    const lista = getReservasFiltradas();

    const countLabel = document.getElementById("countLabel");
    countLabel.textContent = lista.length
        ? `${lista.length} reserva${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`
        : reservas.length > 0 ? "Nenhum resultado para os filtros aplicados." : "";

    if (lista.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 7;
        td.innerHTML = `<div class="empty-state">
            <i class="fas fa-calendar-xmark"></i>
            <p>Nenhuma reserva encontrada.</p>
        </div>`;
        tr.appendChild(td);
        tableBody.appendChild(tr);
        atualizarPainel(lista);
        return;
    }

    lista.forEach((r) => {
        // BUG FIX: usar id único em vez de indexOf para evitar colisão de objetos idênticos
        const idx = reservas.findIndex(res => res.id === r.id);
        const tr  = document.createElement("tr");

        const tdC = document.createElement("td");
        tdC.style.fontWeight = "500";
        tdC.textContent = r.client;
        tr.appendChild(tdC);

        const tdD = document.createElement("td");
        tdD.textContent = formatarDataBR(r.date);
        tr.appendChild(tdD);

        const tdH = document.createElement("td");
        tdH.textContent = r.time || "—";
        tr.appendChild(tdH);

        const tdV = document.createElement("td");
        tdV.className = "td-valor";
        tdV.textContent = formatBRL(r.value);
        tr.appendChild(tdV);

        const tdS = document.createElement("td");
        const bS  = document.createElement("span");
        bS.className = `badge badge-${r.eventStatus}`;
        bS.textContent = statusLabel(r.eventStatus);
        tdS.appendChild(bS);
        tr.appendChild(tdS);

        const tdP = document.createElement("td");
        const bP  = document.createElement("span");
        bP.className = `badge ${r.paymentStatus === "Pago" ? "badge-pago" : "badge-nao-pago"}`;
        bP.textContent = r.paymentStatus;
        tdP.appendChild(bP);
        tr.appendChild(tdP);

        const tdA = document.createElement("td");
        tdA.className = "acoes-cel";

        const temObs = r.obs?.trim();
        const bVer   = document.createElement("button");
        bVer.className = `btn btn-sm ${temObs ? "btn-obs-sim" : "btn-obs-nao"}`;
        bVer.title = temObs ? "Ver observações" : "Sem observações";
        bVer.setAttribute("aria-label", temObs ? "Ver observações" : "Sem observações");
        bVer.innerHTML = `<i class="fas fa-eye"></i>`;
        if (temObs) {
            const dot = document.createElement("span");
            dot.className = "obs-badge";
            bVer.appendChild(dot);
        }
        bVer.addEventListener("click", () => abrirModal(r.obs));

        const bContrato = document.createElement("button");
        bContrato.className = "btn btn-info-sm btn-sm";
        bContrato.title = "Gerar contrato";
        bContrato.setAttribute("aria-label", "Gerar contrato");
        bContrato.innerHTML = '<i class="fas fa-file-contract"></i>';
        bContrato.addEventListener("click", () => abrirContrato(idx));

        const bEdit = document.createElement("button");
        bEdit.className = "btn btn-warn-sm btn-sm";
        bEdit.innerHTML = '<i class="fas fa-pen"></i>';
        bEdit.title = "Editar reserva";
        bEdit.setAttribute("aria-label", "Editar reserva");
        bEdit.addEventListener("click", () => editarReserva(idx));

        const bDel = document.createElement("button");
        bDel.className = "btn btn-danger-sm btn-sm";
        bDel.innerHTML = '<i class="fas fa-trash"></i>';
        bDel.title = "Excluir reserva";
        bDel.setAttribute("aria-label", "Excluir reserva");
        bDel.addEventListener("click", () => removeReserva(idx));

        tdA.appendChild(bVer);
        tdA.appendChild(bContrato);
        tdA.appendChild(bEdit);
        tdA.appendChild(bDel);
        tr.appendChild(tdA);

        tableBody.appendChild(tr);
    });

    atualizarPainel(lista);
    renderCalendario();
}

/* ===============================
   PAINEL FINANCEIRO
================================= */
function atualizarPainel(lista) {
    let recebido = 0, pendente = 0;
    lista.forEach(r => {
        const v = parseFloat(r.value) || 0;
        r.paymentStatus === "Pago" ? (recebido += v) : (pendente += v);
    });
    document.getElementById("totalRecebido").textContent = formatBRL(recebido);
    document.getElementById("totalPendente").textContent = formatBRL(pendente);
    document.getElementById("totalReservas").textContent = lista.length;
}

/* ===============================
   SALVAR / EDITAR — função separada (BUG FIX: não mais via form submit)
================================= */
function salvarReserva() {
    const clientVal = document.getElementById("client").value.trim();
    const dateVal   = document.getElementById("date").value;
    const timeVal   = document.getElementById("time").value;
    const valueRaw  = document.getElementById("value").value;
    const valueVal  = parseFloat(valueRaw);

    // BUG FIX: validação completa de todos os campos obrigatórios
    if (clientVal.length < 2) { showToast("Nome precisa ter ao menos 2 caracteres.", "aviso"); return; }
    if (!dateVal)              { showToast("Informe uma data para a reserva.", "aviso"); return; }
    if (!timeVal)              { showToast("Informe o horário da reserva.", "aviso"); return; }
    if (valueRaw === "" || isNaN(valueVal) || valueVal < 0) { showToast("Informe um valor válido.", "aviso"); return; }
    if (dataJaExiste(dateVal, editIndex)) { showToast("Já existe uma reserva para essa data!", "aviso"); return; }

    const nova = {
        // BUG FIX: id único por reserva para evitar indexOf incorreto
        id:            editIndex === -1 ? Date.now() : reservas[editIndex].id,
        client:        clientVal,
        date:          dateVal,
        time:          timeVal,
        value:         valueVal,
        eventStatus:   document.getElementById("eventStatus").value,
        paymentStatus: document.getElementById("paymentStatus").value,
        obs:           document.getElementById("obs").value.trim()
    };

    if (editIndex === -1) {
        reservas.push(nova);
        showToast("Reserva salva com sucesso!");
    } else {
        reservas[editIndex] = nova;
        editIndex = -1;
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Salvar Reserva';
        showToast("Reserva atualizada com sucesso!");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    limparFormulario();
    render();
    verificarAlertas();
}

function limparFormulario() {
    document.getElementById("client").value        = "";
    document.getElementById("date").value          = "";
    document.getElementById("time").value          = "";
    document.getElementById("value").value         = "";
    document.getElementById("eventStatus").value   = "pendente";
    document.getElementById("paymentStatus").value = "Pendente";
    document.getElementById("obs").value           = "";
}

/* ===============================
   EDITAR
================================= */
function editarReserva(i) {
    const r = reservas[i];
    document.getElementById("client").value        = r.client;
    document.getElementById("date").value          = r.date;
    document.getElementById("time").value          = r.time;
    document.getElementById("value").value         = r.value;
    document.getElementById("eventStatus").value   = r.eventStatus;
    document.getElementById("paymentStatus").value = r.paymentStatus;
    document.getElementById("obs").value           = r.obs || "";
    editIndex = i;
    btnSubmit.innerHTML = '<i class="fas fa-pen"></i> Atualizar Reserva';
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===============================
   REMOVER
================================= */
function removeReserva(i) {
    if (confirm("Deseja realmente excluir esta reserva?")) {
        reservas.splice(i, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
        showToast("Reserva removida.", "aviso");
        if (editIndex === i) {
            editIndex = -1;
            limparFormulario();
            btnSubmit.innerHTML = '<i class="fas fa-save"></i> Salvar Reserva';
        }
        render();
        verificarAlertas();
    }
}

/* ===============================
   CONTRATO INDIVIDUAL
================================= */
let contratoIdx = -1;

function abrirContrato(i) {
    contratoIdx = i;
    const r = reservas[i];
    const preview = document.getElementById("contrato-preview");

    const linhas = [
        ["Cliente",        r.client],
        ["Data do Evento", formatarDataBR(r.date)],
        ["Horário",        r.time || "—"],
        ["Valor",          formatBRL(r.value)],
        ["Status",         statusLabel(r.eventStatus)],
        ["Pagamento",      r.paymentStatus],
    ];

    preview.innerHTML = `
        <h4><i class="fas fa-calendar-check" style="color:var(--accent);margin-right:6px"></i>Espaço Freire — Contrato de Reserva</h4>
        ${linhas.map(([k, v]) => `
            <div class="contrato-linha">
                <span>${k}</span>
                <span>${v}</span>
            </div>
        `).join("")}
        ${r.obs?.trim() ? `
            <div class="contrato-obs-box">
                <strong style="color:var(--accent)">Observações:</strong><br>${r.obs}
            </div>
        ` : ""}
        <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border-soft);font-size:0.78rem;color:var(--text-muted);">
            <p>Ao confirmar esta reserva, o cliente concorda com os termos do Espaço Freire.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">
                <div>
                    <div style="border-top:1px solid var(--border-soft);padding-top:6px;margin-top:24px;">Assinatura do Cliente</div>
                </div>
                <div>
                    <div style="border-top:1px solid var(--border-soft);padding-top:6px;margin-top:24px;">Espaço Freire</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("btn-baixar-contrato").onclick = () => gerarContratoPDF(i);
    document.getElementById("modal-contrato").classList.add("open");
}

function fecharContrato() {
    document.getElementById("modal-contrato").classList.remove("open");
}

document.getElementById("modal-contrato").addEventListener("click", function(e) {
    if (e.target === this) fecharContrato();
});

function gerarContratoPDF(i) {
    const { jsPDF } = window.jspdf;
    const r   = reservas[i];
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, H = 297, ML = 20, MR = 20;

    const C = {
        bg:      [13, 17, 23],
        surface: [22, 27, 34],
        surface2:[30, 37, 48],
        accent:  [59, 130, 246],
        success: [52, 211, 153],
        danger:  [248, 113, 113],
        warning: [245, 158, 11],
        text:    [230, 237, 243],
        muted:   [125, 133, 144],
        border:  [40, 50, 65],
        white:   [255, 255, 255],
    };

    const F = c => doc.setFillColor(c[0], c[1], c[2]);
    const S = c => doc.setDrawColor(c[0], c[1], c[2]);
    const T = c => doc.setTextColor(c[0], c[1], c[2]);

    F(C.bg); doc.rect(0, 0, W, H, "F");
    F(C.surface); doc.rect(0, 0, W, 52, "F");
    F(C.accent);  doc.rect(0, 0, 5, 52, "F");

    F(C.accent); doc.roundedRect(12, 12, 28, 28, 5, 5, "F");
    T(C.white); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("EF", 26, 29, { align: "center" });

    T(C.text); doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("ESPAÇO FREIRE", 47, 24);
    T(C.muted); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Contrato de Reserva de Espaço", 47, 32);

    T(C.muted); doc.setFontSize(7);
    doc.text("Emitido em: " + new Date().toLocaleDateString("pt-BR"), W - MR, 20, { align: "right" });

    S(C.accent); doc.setLineWidth(0.4);
    doc.line(ML, 54, W - MR, 54);

    T(C.text); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("DADOS DA RESERVA", ML, 66);
    S(C.border); doc.setLineWidth(0.3);
    doc.line(ML, 69, W - MR, 69);

    const campos = [
        ["Cliente",         r.client],
        ["Data do Evento",  formatarDataBR(r.date)],
        ["Horário",         r.time || "—"],
        ["Valor Total",     formatBRL(r.value)],
        ["Status do Evento",statusLabel(r.eventStatus)],
        ["Status Pagamento",r.paymentStatus],
    ];

    let rY = 80;
    campos.forEach(([label, valor], idx) => {
        if (idx % 2 === 0) {
            F(C.surface); doc.rect(ML, rY - 3, W - ML - MR, 11, "F");
        }
        T(C.muted); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
        doc.text(label.toUpperCase(), ML + 4, rY + 3);
        T(C.text); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text(valor, W - MR - 4, rY + 3, { align: "right" });
        S(C.border); doc.setLineWidth(0.2);
        doc.line(ML, rY + 8, W - MR, rY + 8);
        rY += 11;
    });

    if (r.obs?.trim()) {
        rY += 6;
        T(C.accent); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("OBSERVAÇÕES", ML, rY);
        rY += 6;
        F(C.surface2); doc.roundedRect(ML, rY - 3, W - ML - MR, 24, 3, 3, "F");
        T(C.text); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        const linhasObs = doc.splitTextToSize(r.obs, W - ML - MR - 10);
        doc.text(linhasObs.slice(0, 3), ML + 5, rY + 5);
        rY += 30;
    }

    rY = Math.max(rY + 20, 210);
    S(C.border); doc.setLineWidth(0.3);
    doc.line(ML, rY, ML + 65, rY);
    doc.line(W - MR - 65, rY, W - MR, rY);

    T(C.muted); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
    doc.text("Assinatura do Cliente", ML, rY + 6);
    doc.text("Espaço Freire", W - MR - 65, rY + 6);

    T(C.muted); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(r.client, ML, rY + 13);
    doc.text(formatarDataBR(r.date), W - MR, rY + 13, { align: "right" });

    rY += 28;
    F(C.surface); doc.roundedRect(ML, rY, W - ML - MR, 20, 3, 3, "F");
    T(C.muted); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    const clausula = "Ao assinar este contrato, o cliente confirma estar ciente das condições de uso do Espaço Freire, incluindo políticas de cancelamento e pagamento conforme acordado previamente.";
    const linhasC = doc.splitTextToSize(clausula, W - ML - MR - 10);
    doc.text(linhasC, ML + 5, rY + 7);

    F(C.surface); doc.rect(0, H - 14, W, 14, "F");
    S(C.border);  doc.setLineWidth(0.3);
    doc.line(0, H - 14, W, H - 14);
    T(C.muted); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text("Espaço Freire © 2026 — instagram.com/espaco_freire2026", ML, H - 5.5);
    doc.text("Página 1 de 1", W - MR, H - 5.5, { align: "right" });

    const nomeArq = `Contrato_${r.client.replace(/\s+/g, "_")}_${r.date}.pdf`;
    doc.save(nomeArq);
    showToast("Contrato gerado com sucesso!");
}

/* ===============================
   TEMA
================================= */
function toggleDark() {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    document.getElementById("themeIcon").className = light ? "fas fa-sun" : "fas fa-moon";
    localStorage.setItem("theme", light ? "light" : "dark");
}

(function () {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        const icon = document.getElementById("themeIcon");
        if (icon) icon.className = "fas fa-sun";
    }
})();

/* ===============================
   PDF RELATÓRIO GERAL
================================= */
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, H = 297;
    const ML = 14, MR = 14;

    const C = {
        bg:      [13, 17, 23],   surface:  [22, 27, 34],
        surface2:[30, 37, 48],   accent:   [59, 130, 246],
        success: [52, 211, 153], danger:   [248, 113, 113],
        warning: [245, 158, 11], text:     [230, 237, 243],
        muted:   [125, 133, 144],border:   [40, 50, 65],
        white:   [255, 255, 255],
    };

    const F = c => doc.setFillColor(c[0], c[1], c[2]);
    const S = c => doc.setDrawColor(c[0], c[1], c[2]);
    const T = c => doc.setTextColor(c[0], c[1], c[2]);

    F(C.bg); doc.rect(0, 0, W, H, "F");
    F(C.surface); doc.rect(0, 0, W, 48, "F");
    F(C.accent);  doc.rect(0, 0, 5, 48, "F");

    F(C.accent); doc.roundedRect(13, 11, 26, 26, 4, 4, "F");
    T(C.white); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("EF", 26, 27, { align: "center" });

    T(C.text); doc.setFontSize(17); doc.setFont("helvetica", "bold");
    doc.text("Espaço Freire", 46, 22);
    T(C.muted); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Relatório de Reservas · 2026", 46, 30);

    const dataGer = new Date().toLocaleString("pt-BR");
    T(C.muted); doc.setFontSize(7);
    doc.text("Gerado em: " + dataGer, W - MR, 20, { align: "right" });
    T(C.accent); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text(`${reservas.length} reserva${reservas.length !== 1 ? "s" : ""} no sistema`, W - MR, 30, { align: "right" });

    S(C.accent); doc.setLineWidth(0.4);
    doc.line(ML, 50, W - MR, 50);

    let recebido = 0, pendente = 0;
    reservas.forEach(r => {
        const v = parseFloat(r.value) || 0;
        r.paymentStatus === "Pago" ? (recebido += v) : (pendente += v);
    });

    const cards = [
        { label: "RECEBIDO",       value: formatBRL(recebido),    bar: C.success },
        { label: "PENDENTE",       value: formatBRL(pendente),    bar: C.danger  },
        { label: "TOTAL RESERVAS", value: String(reservas.length),bar: C.accent  },
    ];

    const cW = 57, cH = 20, cY = 55, gap = 7;
    cards.forEach((c, i) => {
        const x = ML + i * (cW + gap);
        F(C.surface2); doc.roundedRect(x, cY, cW, cH, 3, 3, "F");
        F(c.bar);      doc.roundedRect(x, cY, 3, cH, 2, 2, "F");
        T(C.muted); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
        doc.text(c.label, x + 7, cY + 7);
        T(C.text); doc.setFontSize(9.5); doc.setFont("helvetica", "bold");
        doc.text(c.value, x + 7, cY + 15);
    });

    const tY = 83;
    const cols  = ["CLIENTE", "DATA", "HORA", "VALOR", "STATUS", "PAGAMENTO"];
    const colXs = [ML, 56, 86, 110, 138, 167];

    F(C.surface2); doc.roundedRect(ML, tY, W - ML - MR, 8.5, 2, 2, "F");
    T(C.muted); doc.setFontSize(6); doc.setFont("helvetica", "bold");
    cols.forEach((col, i) => doc.text(col, colXs[i] + 2, tY + 5.8));

    let rY = tY + 10;

    reservas.forEach((r, idx) => {
        if (rY > H - 22) {
            doc.addPage();
            F(C.bg); doc.rect(0, 0, W, H, "F");
            F(C.surface); doc.rect(0, 0, W, 14, "F");
            F(C.accent);  doc.rect(0, 0, 3, 14, "F");
            T(C.muted); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
            doc.text("Espaço Freire — Relatório de Reservas (continuação)", ML + 4, 9);
            rY = 20;
        }

        if (idx % 2 === 0) { F(C.surface); doc.rect(ML, rY - 0.5, W - ML - MR, 9.5, "F"); }
        S(C.border); doc.setLineWidth(0.25);
        doc.line(ML, rY + 9, W - ML - MR + ML, rY + 9);

        const cy = rY + 6;

        T(C.text); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        const nome = r.client.length > 22 ? r.client.substring(0, 20) + "…" : r.client;
        doc.text(nome, colXs[0] + 2, cy);

        T(C.muted); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        doc.text(formatarDataBR(r.date), colXs[1] + 2, cy);
        doc.text(r.time || "—", colXs[2] + 2, cy);

        T(C.accent); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.text(formatBRL(r.value), colXs[3] + 2, cy);

        const sC = r.eventStatus === "confirmado" ? C.success :
                   r.eventStatus === "finalizado"  ? C.accent  : C.warning;
        doc.setFillColor(sC[0], sC[1], sC[2], 0.15);
        doc.roundedRect(colXs[4] + 1, rY + 1.5, 27, 6, 2, 2, "F");
        T(sC); doc.setFont("helvetica", "bold"); doc.setFontSize(6.2);
        doc.text(statusLabel(r.eventStatus), colXs[4] + 14.5, cy, { align: "center" });

        const pago = r.paymentStatus === "Pago";
        const pC   = pago ? C.success : C.danger;
        doc.setFillColor(pC[0], pC[1], pC[2], 0.15);
        doc.roundedRect(colXs[5] + 1, rY + 1.5, 25, 6, 2, 2, "F");
        T(pC); doc.setFontSize(6.2);
        doc.text(r.paymentStatus, colXs[5] + 13.5, cy, { align: "center" });

        rY += 9.5;
    });

    const totalPages = doc.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);
        F(C.surface); doc.rect(0, H - 12, W, 12, "F");
        S(C.border);  doc.setLineWidth(0.3);
        doc.line(0, H - 12, W, H - 12);
        T(C.muted); doc.setFontSize(6.2); doc.setFont("helvetica", "normal");
        doc.text("Espaço Freire © 2026 — instagram.com/espaco_freire2026", ML, H - 4.5);
        doc.text(`Página ${pg} de ${totalPages}`, W - MR, H - 4.5, { align: "right" });
    }

    doc.save("Relatorio_Espaco_Freire_2026.pdf");
    showToast("PDF exportado com sucesso!");
}

/* ===============================
   INICIALIZAR
================================= */
// BUG FIX: garantir ids em reservas antigas que não tinham id
reservas = reservas.map((r, i) => r.id ? r : { ...r, id: Date.now() + i });
localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));

iniciarCalendario();
render();
verificarAlertas();
