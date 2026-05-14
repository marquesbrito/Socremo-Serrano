// Recupera dados do associado
const socioDataStr = sessionStorage.getItem('socioData');

if (!socioDataStr) {
    document.getElementById('carteirinhaDigital').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 60px; color: #f39c12;"></i>
            <h2>Nenhum cadastro encontrado</h2>
            <p>Você precisa fazer o cadastro primeiro.</p>
            <a href="index.html" class="btn-baixar" style="display: inline-block; text-decoration: none; margin-top: 20px;">Ir para o site</a>
        </div>
    `;
    document.getElementById('baixarCarteirinha')?.remove();
    document.getElementById('voltarHome')?.remove();
} else {
    const socio = JSON.parse(socioDataStr);
    
    // Preenche os dados na estrutura nova
    const dadosSocioDiv = document.getElementById('socioInfo');
    dadosSocioDiv.innerHTML = `
        <p><strong>Nome:</strong> ${socio.nome}</p>
        <p><strong>CPF:</strong> ${socio.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>
        <p><strong>WhatsApp:</strong> ${socio.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</p>
        <p><strong>E-mail:</strong> ${socio.email}</p>
        <p><strong>Cidade:</strong> ${socio.cidade}</p>
        <p><strong>Plano:</strong> ${socio.plano}</p>
        <p><strong>Adesão:</strong> ${socio.dataAssociacao}</p>
    `;
    
    document.getElementById('dataValidadeFooter').innerText = socio.validade;
    document.getElementById('numeroAssociadoFooter').innerText = socio.numeroAssociado;
    
    // Opcional: gerar QR Code dinâmico com os dados (usar biblioteca? vou deixar apenas visual)
    // Se quiser QR Code real, podemos integrar a lib QRCode.js. Por enquanto, mantemos o ícone.
}

// Função para baixar a carteirinha como imagem
document.getElementById('baixarCarteirinha')?.addEventListener('click', function() {
    const element = document.getElementById('carteirinhaDigital');
    const btn = this;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
    btn.disabled = true;
    
    html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `carteirinha_${socioDataStr ? JSON.parse(socioDataStr).numeroAssociado : 'socio'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }).catch(error => {
        console.error(error);
        alert('Erro ao gerar imagem. Tente novamente.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
});

document.getElementById('voltarHome')?.addEventListener('click', () => {
    window.location.href = 'index.html';
});