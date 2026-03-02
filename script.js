function exportarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(106, 27, 154);
    doc.text("Relatório de Reservas - Espaço Freire", 20, y);

    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Gerado em: " + new Date().toLocaleString(), 20, y);

    y += 15;

    doc.setFontSize(12);

    reservas.forEach((r, index) => {

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(`Cliente: ${r.client}`, 20, y);
        y += 6;
        doc.text(`Data: ${r.date} | Hora: ${r.time}`, 20, y);
        y += 6;
        doc.text(`Valor: R$ ${parseFloat(r.value).toFixed(2)}`, 20, y);
        y += 6;
        doc.text(`Status: ${r.eventStatus} | Pagamento: ${r.paymentStatus}`, 20, y);
        y += 10;

        doc.line(20, y, 190, y);
        y += 8;
    });

    doc.save("Relatorio_Reservas_Espaco_Freire.pdf");
}

let reservas = JSON.parse(localStorage.getItem("espacoLazer")) || [];

const form = document.getElementById("form");
const tableBody = document.getElementById("table-body");

let editIndex = -1;

/* ===============================
   BLOQUEAR DATAS DUPLICADAS
=================================*/
function dataJaExiste(data, indexAtual = -1){
return reservas.some((r, index) => 
r.date === data && index !== indexAtual
);
}

/* ===============================
   RENDER + FILTRO POR MÊS
=================================*/
function render(){

const filtroMes = document.getElementById("filtroMes")?.value;

tableBody.innerHTML="";

let reservasFiltradas = reservas;

if(filtroMes){
reservasFiltradas = reservas.filter(r => r.date.startsWith(filtroMes));
}

reservasFiltradas.forEach((r)=>{

const indexOriginal = reservas.indexOf(r);

const tr = document.createElement("tr");

tr.innerHTML = `
<td>${r.client}</td>
<td>${r.date}</td>
<td>${r.time}</td>
<td>R$ ${parseFloat(r.value).toFixed(2)}</td>
<td><span class="status ${r.eventStatus}">${r.eventStatus}</span></td>
<td>
<span class="pagamento ${r.paymentStatus === 'Pago' ? 'pago' : 'pagamento-pendente'}">
${r.paymentStatus}
</span>
</td>
<td>
<button class="btn-ver"><i class="fas fa-eye"></i></button>
<button class="btn-edit"><i class="fas fa-edit"></i></button>
<button class="btn-del"><i class="fas fa-trash"></i></button>
</td>
`;

function mostrarObs(i){
const r = reservas[i];

if(r.obs && r.obs.trim() !== ""){
alert("Observação:\n\n" + r.obs);
}else{
alert("Essa reserva não possui observações.");
}
}

tr.querySelector(".btn-ver").addEventListener("click", ()=>{
mostrarObs(indexOriginal);
});

tr.querySelector(".btn-edit").addEventListener("click", ()=>{
editarReserva(indexOriginal);
});

tr.querySelector(".btn-del").addEventListener("click", ()=>{
removeReserva(indexOriginal);
});

tableBody.appendChild(tr);

});

atualizarPainelFinanceiro();
}


/* ===============================
   SALVAR OU EDITAR
=================================*/
form.addEventListener("submit",e=>{
e.preventDefault();

if(dataJaExiste(date.value, editIndex)){
alert("Já existe uma reserva para essa data!");
return;
}

const novaReserva = {
client:client.value,
date:date.value,
time:time.value,
value:value.value,
eventStatus:eventStatus.value,
paymentStatus:paymentStatus.value,
obs:obs.value
};

if(editIndex === -1){
reservas.push(novaReserva);
}else{
reservas[editIndex] = novaReserva;
editIndex = -1;
form.querySelector("button").innerHTML = `<i class="fas fa-save"></i> Salvar Reserva`;
}

localStorage.setItem("espacoLazer",JSON.stringify(reservas));
form.reset();
render();
});

/* ===============================
   EDITAR
=================================*/
function editarReserva(i){
const r = reservas[i];

client.value = r.client;
date.value = r.date;
time.value = r.time;
value.value = r.value;
eventStatus.value = r.eventStatus;
paymentStatus.value = r.paymentStatus;
obs.value = r.obs;

editIndex = i;

form.querySelector("button").innerHTML = `<i class="fas fa-edit"></i> Atualizar Reserva`;

window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===============================
   REMOVER
=================================*/
function removeReserva(i){
if(confirm("Deseja realmente excluir esta reserva?")){
reservas.splice(i,1);
localStorage.setItem("espacoLazer",JSON.stringify(reservas));
render();
}
}

/* ===============================
   PAINEL FINANCEIRO
=================================*/
function atualizarPainelFinanceiro(){

let totalRecebido = 0;
let totalPendente = 0;

reservas.forEach(r=>{
if(r.paymentStatus === "Pago"){
totalRecebido += parseFloat(r.value);
}else{
totalPendente += parseFloat(r.value);
}
});

document.getElementById("totalRecebido").innerText =
"R$ " + totalRecebido.toFixed(2);

document.getElementById("totalPendente").innerText =
"R$ " + totalPendente.toFixed(2);

document.getElementById("totalReservas").innerText =
reservas.length;
}

/* ===============================
   DARK MODE
=================================*/
function toggleDark(){

    document.body.classList.toggle("dark-mode");

    const icon = document.getElementById("themeIcon");

    if(document.body.classList.contains("dark-mode")){
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        localStorage.setItem("theme","dark");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
        localStorage.setItem("theme","light");
    }
}

/* ===============================
   CARREGAR TEMA SALVO
=================================*/
(function(){

    const temaSalvo = localStorage.getItem("theme");

    if(temaSalvo === "dark"){
        document.body.classList.add("dark-mode");

        const icon = document.getElementById("themeIcon");
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }

})();
render();