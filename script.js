// script.js - com Firebase, usando CPF como ID único, sem duplicatas
console.log("🚀 Site Sócio Torcedor carregado com sucesso!");

// Menu mobile
const menuToggle = document.getElementById('mobile-menu');
const nav = document.querySelector('nav');
if (menuToggle) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
}
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('active'));
});

// Header scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.style.background = 'rgba(0, 22, 59, 0.98)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = 'rgba(0, 22, 59, 0.95)';
  }
});

// Máscaras
window.mascararCPF = function(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length <= 3) input.value = value;
  else if (value.length <= 6) input.value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  else if (value.length <= 9) input.value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  else input.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
};

window.mascararTelefone = function(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length <= 2) input.value = value;
  else if (value.length <= 6) input.value = value.replace(/(\d{2})(\d{1,4})/, '($1) $2');
  else if (value.length <= 10) input.value = value.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  else input.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Validação CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  let digito1 = (resto === 10 || resto === 11) ? 0 : resto;
  if (digito1 !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  let digito2 = (resto === 10 || resto === 11) ? 0 : resto;
  return digito2 === parseInt(cpf.charAt(10));
}

// Pré-seleção do plano
function preselectPlan(planoValue) {
  const selectPlan = document.getElementById('planoSelect');
  if (selectPlan) {
    selectPlan.value = planoValue;
    selectPlan.style.borderColor = '#27ae60';
    selectPlan.style.boxShadow = '0 0 0 3px rgba(39,174,96,0.2)';
    setTimeout(() => {
      selectPlan.style.borderColor = '#e0e0e0';
      selectPlan.style.boxShadow = 'none';
    }, 2000);
  }
}

document.querySelectorAll('.btn-card').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const planoSelecionado = btn.getAttribute('data-plano-select');
    if (planoSelecionado) {
      sessionStorage.setItem('planoSelecionado', planoSelecionado);
      showToastMessage(`🎉 Você selecionou o plano ${planoSelecionado.split(' - ')[0]}! Vá até o formulário.`);
      document.getElementById('cadastro').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => preselectPlan(planoSelecionado), 800);
    }
  });
});

function showToastMessage(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ------------------------------------------------------------------
// Submissão do formulário com Firebase usando CPF como ID (único)
// ------------------------------------------------------------------
const form = document.getElementById('signup-form');
let isSubmitting = false;

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      alert('⏳ Aguarde, já estamos processando seu cadastro...');
      return;
    }

    isSubmitting = true;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    submitButton.disabled = true;

    try {
      const nome = document.getElementById('nome').value.trim();
      const cpf = document.getElementById('cpf').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const email = document.getElementById('email').value.trim();
      const cidade = document.getElementById('cidade').value.trim();
      const plano = document.getElementById('planoSelect').value;

      if (!nome || !cpf || !whatsapp || !email || !cidade || !plano) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      if (!validarCPF(cpf)) {
        alert('❌ CPF inválido. Digite um CPF válido.');
        document.getElementById('cpf').classList.add('error');
        return;
      } else {
        document.getElementById('cpf').classList.remove('error');
      }

      const whatsappNumeros = whatsapp.replace(/\D/g, '');
      if (whatsappNumeros.length < 10 || whatsappNumeros.length > 11) {
        alert('⚠️ WhatsApp inválido. Digite com DDD e número (ex: (11) 91234-5678)');
        document.getElementById('whatsapp').classList.add('error');
        return;
      } else {
        document.getElementById('whatsapp').classList.remove('error');
      }

      const cpfLimpo = cpf.replace(/\D/g, '');

      // Verificar se já existe documento com esse CPF (ID)
      const docRef = doc(window.db, "socios", cpfLimpo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert('❌ Este CPF já está cadastrado! Cada CPF pode ter apenas uma inscrição.');
        return;
      }

      // Gerar número associado único
      const numeroAssociado = 'SOC' + Math.floor(Math.random() * 1000000);
      const dataAssociacao = new Date().toLocaleDateString('pt-BR');
      const validade = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('pt-BR');

      const socioData = {
        nome,
        cpf: cpfLimpo,
        whatsapp: whatsappNumeros,
        email,
        cidade,
        plano,
        numeroAssociado,
        dataAssociacao,
        validade,
        confirmado: false,
        createdAt: new Date().toISOString()
      };

      // Usa setDoc com o CPF como ID
      await setDoc(doc(window.db, "socios", cpfLimpo), socioData);
      socioData.id = cpfLimpo; // ID é o CPF
      sessionStorage.setItem('socioData', JSON.stringify(socioData));
      window.location.href = 'obrigado.html';

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      isSubmitting = false;
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
  });
}

// Carregar plano salvo
window.addEventListener('load', () => {
  const planoSaved = sessionStorage.getItem('planoSelecionado');
  if (planoSaved) {
    preselectPlan(planoSaved);
    sessionStorage.removeItem('planoSelecionado');
  }
});

// Animações
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);
document.querySelectorAll('.card, .benefit-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});