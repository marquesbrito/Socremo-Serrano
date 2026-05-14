// Recupera os dados do sócio
const socioDataStr = sessionStorage.getItem('socioData');
if (!socioDataStr) {
    window.location.href = 'index.html'; // sem dados, volta para cadastro
}

const socio = JSON.parse(socioDataStr);

// Exibir resumo dos dados
const dadosDiv = document.getElementById('dadosResumo');
dadosDiv.innerHTML = `
    <p><strong>Nome:</strong> ${socio.nome}</p>
    <p><strong>CPF:</strong> ${socio.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>
    <p><strong>WhatsApp:</strong> ${socio.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</p>
    <p><strong>E-mail:</strong> ${socio.email}</p>
    <p><strong>Cidade:</strong> ${socio.cidade}</p>
    <p><strong>Plano escolhido:</strong> ${socio.plano}</p>
    <p><strong>Nº Associado:</strong> ${socio.numeroAssociado}</p>
    <p><strong>Data de adesão:</strong> ${socio.dataAssociacao}</p>
    <p><strong>Válido até:</strong> ${socio.validade}</p>
`;

// Link de pagamento conforme plano
let linkPagamento = '';
if (socio.plano.includes('Gavião')) linkPagamento = 'https://mpago.la/2Q53uif';
else if (socio.plano.includes('Lobo')) linkPagamento = 'https://mpago.la/2uQ81mb';
else if (socio.plano.includes('Elite')) linkPagamento = 'https://mpago.la/221dn4R';

document.getElementById('btnPagamento').addEventListener('click', (e) => {
    e.preventDefault();
    if (linkPagamento) {
        window.location.href = linkPagamento;
    } else {
        alert('Link de pagamento não encontrado.');
    }
});

// Gerar carteirinha digital (abre em nova aba ou redireciona)
document.getElementById('btnCarteirinha').addEventListener('click', () => {
    window.location.href = 'carteirinha.html';
});

// Enviar dados por WhatsApp (mensagem formatada)
document.getElementById('btnWhatsApp').addEventListener('click', () => {
    const mensagem = `Olá, realizei meu cadastro como sócio torcedor do SOCREMO SERRANO! Meus dados: 
Nome: ${socio.nome}
CPF: ${socio.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
Plano: ${socio.plano}
Nº Associado: ${socio.numeroAssociado}
E-mail: ${socio.email}
WhatsApp: ${socio.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
Estou aguardando o link de pagamento? Já tenho o link: ${linkPagamento || 'não disponível'}`;
    
    const url = `https://wa.me/55${socio.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
});

// Enviar por e-mail (mailto)
document.getElementById('btnEmail').addEventListener('click', () => {
    const assunto = 'Confirmação de cadastro - Sócio Torcedor';
    const corpo = `Olá ${socio.nome}, seu cadastro foi realizado com sucesso!

Dados do Associado:
- Nome: ${socio.nome}
- CPF: ${socio.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
- Nº Associado: ${socio.numeroAssociado}
- Plano: ${socio.plano}
- Data de adesão: ${socio.dataAssociacao}
- Validade: ${socio.validade}

Link para pagamento: ${linkPagamento || 'não disponível'}

Após o pagamento, acesse: ${window.location.origin}/carteirinha.html para gerar sua carteirinha digital.

Atenciosamente,
SOCREMO SERRANO`;
    
    window.location.href = `mailto:${socio.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
});