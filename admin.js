import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// COLE AQUI O SEU firebaseConfig (igual ao usado no script.js)
const firebaseConfig = {
    apiKey: "AIzaSyA5EbYuiuvPtT1C7wjlEg86R8zg_T_NbA0",
  authDomain: "socio-torcedor-6bbd4.firebaseapp.com",
  projectId: "socio-torcedor-6bbd4",
  storageBucket: "socio-torcedor-6bbd4.firebasestorage.app",
  messagingSenderId: "841363123959",
  appId: "1:841363123959:web:17eb1a432921fd34d82df2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
;

// Elementos DOM
const loginScreen = document.getElementById("loginScreen");
const painelScreen = document.getElementById("painelScreen");
const senhaAdminInput = document.getElementById("senhaAdmin");
const btnEntrar = document.getElementById("btnEntrar");
const btnSair = document.getElementById("btnSair");
const msgErro = document.getElementById("msgErro");
const statusFirebase = document.getElementById("statusFirebase");
const filtroNome = document.getElementById("filtroNome");

const SENHA_CORRETA = "admin123"; // Você pode mudar
let db = null;
let unsubscribe = null;
let todosSocios = []; // armazenar para filtro

// Verifica login salvo
if (localStorage.getItem("adminLogado") === "true") {
    liberarPainel();
}

btnEntrar.addEventListener("click", () => {
    if (senhaAdminInput.value === SENHA_CORRETA) {
        localStorage.setItem("adminLogado", "true");
        liberarPainel();
    } else {
        msgErro.style.display = "block";
    }
});

btnSair.addEventListener("click", () => {
    localStorage.removeItem("adminLogado");
    if (unsubscribe) unsubscribe();
    painelScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    senhaAdminInput.value = "";
    msgErro.style.display = "none";
});

function liberarPainel() {
    loginScreen.classList.add("hidden");
    painelScreen.classList.remove("hidden");
    iniciarFirebase();
}

function iniciarFirebase() {
    if (db) return;
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("🔥 Firebase conectado");
        statusFirebase.innerHTML = '<i class="fas fa-circle"></i> Conectado';
        statusFirebase.style.background = "#22c55e";
        carregarTabela();

        document.getElementById("btnLimparTudo").addEventListener("click", limparTodosSocios);
    } catch (e) {
        console.error("Erro Firebase:", e);
        statusFirebase.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro';
        statusFirebase.style.background = "#ef4444";
    }
}

function formatarData(timestamp) {
    if (!timestamp) return "-";
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleString('pt-BR');
}

async function limparTodosSocios() {
    if (!confirm("⚠️ ATENÇÃO! Isso vai apagar TODOS os sócios permanentemente.\n\nTem certeza?")) return;
    const confirmacao = prompt("Digite 'SIM' para confirmar a exclusão TOTAL:");
    if (confirmacao !== "SIM") return;

    try {
        const snapshot = await getDocs(collection(db, "socios"));
        let deletados = 0;
        for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, "socios", docSnap.id));
            deletados++;
        }
        alert(`✅ ${deletados} sócios removidos.`);
        // Não precisa recarregar, o onSnapshot atualiza sozinho
    } catch (error) {
        alert("Erro: " + error.message);
    }
}

async function excluirSocio(id) {
    if (!confirm("Excluir este sócio? Esta ação é irreversível.")) return;
    try {
        await deleteDoc(doc(db, "socios", id));
        alert("✅ Sócio excluído.");
    } catch (error) {
        alert("Erro: " + error.message);
    }
}

function carregarTabela() {
    const tabelaBody = document.getElementById("tabelaSocios");
    const labelTotal = document.getElementById("totalSocios");

    const sociosRef = collection(db, "socios");
    unsubscribe = onSnapshot(sociosRef, (snapshot) => {
        todosSocios = [];
        snapshot.forEach(doc => {
            todosSocios.push({ id: doc.id, ...doc.data() });
        });
        aplicarFiltro();
    }, (error) => {
        console.error(error);
        tabelaBody.innerHTML = `<tr><td colspan="10" style="color:#ef4444;">Erro: ${error.message}</td></tr>`;
    });

    // Evento de filtro
    filtroNome.addEventListener("input", () => aplicarFiltro());
}

function aplicarFiltro() {
    const tabelaBody = document.getElementById("tabelaSocios");
    const labelTotal = document.getElementById("totalSocios");
    const termo = filtroNome.value.toLowerCase().trim();

    let filtrados = todosSocios;
    if (termo) {
        filtrados = todosSocios.filter(s => 
            s.nome?.toLowerCase().includes(termo) || 
            s.cpf?.toLowerCase().includes(termo)
        );
    }

    labelTotal.innerText = filtrados.length;

    if (filtrados.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">✅ Nenhum sócio encontrado.</td></tr>`;
        return;
    }

    tabelaBody.innerHTML = "";
    filtrados.forEach(socio => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatarData(socio.dataCadastro)}</td>
            <td><strong>${socio.nome || '-'}</strong></td>
            <td>${socio.cpf || '-'}</td>
            <td>${socio.whatsapp || '-'}</td>
            <td>${socio.email || '-'}</td>
            <td>${socio.cidade || '-'}</td>
            <td><span class="badge-plano">${socio.plano || '-'}</span></td>
            <td>${socio.numeroAssociado || '-'}</td>
            <td>${socio.validade || '-'}</td>
            <td>
                <button class="btn-delete" data-id="${socio.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tabelaBody.appendChild(row);
    });

    // Adiciona eventos de excluir
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.getAttribute("data-id");
            excluirSocio(id);
        });
    });
}