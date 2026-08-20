const BASE_URL = 'https://pet-register-api.onrender.com';
const AUTH_API_URL = `${BASE_URL}/api/auth`;
const API_URL = `${BASE_URL}/api/pets`;

let currentPage = 1;
const limit = 6;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('pet_register_jwt');
  if (!options.headers) options.headers = {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, options);
  if (res.status === 401) {
    showToast('Sessão expirada. Faça login novamente.', true);
    logout();
    throw new Error('Não autorizado');
  }
  return res;
}

window.handleGoogleLogin = async function (response) {
  try {
    const res = await fetch(`${AUTH_API_URL}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });

    if (!res.ok) {
      showToast('Falha no login com Google', true);
      return;
    }

    const data = await res.json();
    salvarSessao(data.token, data.user);
  } catch (error) {
    showToast('Erro ao conectar com o servidor', true);
  }
};

window.switchAuthTab = function (tab) {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tab === 'login') {
    loginTab.className = 'flex-1 py-3.5 text-sm font-semibold text-emerald-400 border-b-2 border-emerald-400 transition-colors bg-slate-900';
    registerTab.className = 'flex-1 py-3.5 text-sm font-semibold text-slate-400 border-b-2 border-transparent transition-colors hover:text-slate-300 hover:bg-slate-800/50';
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  } else {
    registerTab.className = 'flex-1 py-3.5 text-sm font-semibold text-indigo-400 border-b-2 border-indigo-400 transition-colors bg-slate-900';
    loginTab.className = 'flex-1 py-3.5 text-sm font-semibold text-slate-400 border-b-2 border-transparent transition-colors hover:text-slate-300 hover:bg-slate-800/50';
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
};

document.getElementById('form-login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no login');
    salvarSessao(data.token, data.user);
    document.getElementById('form-login').reset();
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('form-register')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('register-nome').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no cadastro');
    salvarSessao(data.token, data.user);
    document.getElementById('form-register').reset();
  } catch (err) {
    showToast(err.message, true);
  }
});

window.demoLogin = async function () {
  try {
    const res = await fetch(`${AUTH_API_URL}/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha no Demo');

    localStorage.setItem('pet_register_jwt', data.token);
    localStorage.setItem('pet_register_user', JSON.stringify(data.user));

    showToast('Bem-vindo ao Modo Demonstração!');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    showToast(err.message, true);
  }
};

function salvarSessao(token, user) {
  localStorage.setItem('pet_register_jwt', token);
  localStorage.setItem('pet_register_user', JSON.stringify(user));
  checkAuth();
}

window.logout = function () {
  localStorage.removeItem('pet_register_jwt');
  localStorage.removeItem('pet_register_user');
  checkAuth();
};

function checkAuth() {
  const token = localStorage.getItem('pet_register_jwt');
  const userStr = localStorage.getItem('pet_register_user');

  const overlay = document.getElementById('login-overlay');
  const mainApp = document.getElementById('main-app');
  const userProfile = document.getElementById('user-profile');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');

  if (token && userStr) {
    const user = JSON.parse(userStr);
    overlay.classList.add('hidden');
    mainApp.classList.remove('hidden');

    userProfile.classList.remove('hidden');
    userProfile.classList.add('flex');
    userName.textContent = user.nome;
    if (user.avatar) {
      userAvatar.src = user.avatar;
    }

    carregarPets(1);
  } else {
    overlay.classList.remove('hidden');
    mainApp.classList.add('hidden');
    userProfile.classList.add('hidden');
    userProfile.classList.remove('flex');
  }
}

const gridPets = document.getElementById('grid-pets');
const paginacao = document.getElementById('paginacao');
const filtroBusca = document.getElementById('filtro-busca');
const filtroEspecie = document.getElementById('filtro-especie');

const modalPet = document.getElementById('modal-pet');
const modalTitulo = document.getElementById('modal-titulo');
const formPet = document.getElementById('form-pet');
const btnNovoPet = document.getElementById('btn-novo-pet');
const modalFechar = document.getElementById('modal-fechar');
const btnCancelar = document.getElementById('btn-cancelar');

const modalVacinas = document.getElementById('modal-vacinas');
const modalVacinasFechar = document.getElementById('modal-vacinas-fechar');
const formVacina = document.getElementById('form-vacina');
const listaVacinas = document.getElementById('lista-vacinas');
const vacinasPetNome = document.getElementById('vacinas-pet-nome');
const vacinaPetId = document.getElementById('vacina-pet-id');

function showToast(text, isError = false) {
  Toastify({
    text,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: isError ? "#f43f5e" : "#10b981",
      borderRadius: "0.75rem",
      fontWeight: "600",
      fontSize: "0.875rem"
    }
  }).showToast();
}

async function carregarPets(page = 1) {
  currentPage = page;
  const search = filtroBusca.value.trim();
  const especie = filtroEspecie.value;

  const url = new URL(API_URL);
  url.searchParams.set('page', currentPage);
  url.searchParams.set('limit', limit);
  if (search) url.searchParams.set('search', search);
  if (especie) url.searchParams.set('especie', especie);

  try {
    const res = await apiFetch(url);
    const result = await res.json();
    renderizarGrid(result.data);
    renderizarPaginacao(result.pagination);
  } catch (error) {
    gridPets.innerHTML = `<div class="col-span-full text-center text-rose-400 py-8">Erro ao conectar com a API. Verifique se o servidor está ativo.</div>`;
  }
}

function getIconByEspecie(especie) {
  switch (especie) {
    case 'Cachorro': return '<i class="fa-solid fa-dog"></i>';
    case 'Gato': return '<i class="fa-solid fa-cat"></i>';
    case 'Ave': return '<i class="fa-solid fa-dove"></i>';
    default: return '<i class="fa-solid fa-paw"></i>';
  }
}

function calcularIdadeAmigavel(dataNascimento, idadeAnos) {
  if (dataNascimento) {
    const hoje = new Date();
    // Parse the date components specifically to avoid timezone issues with 'YYYY-MM-DD'
    const partes = dataNascimento.split('-');
    const nasc = new Date(partes[0], partes[1] - 1, partes[2]);

    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();

    if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) {
      anos--;
      meses += 12;
    }

    // adjust if days are negative
    if (hoje.getDate() < nasc.getDate()) {
      meses--;
      if (meses < 0) {
        meses = 11;
        anos--;
      }
    }

    if (anos > 0 && meses > 0) return `${anos} ano(s) e ${meses} mês(es)`;
    if (anos > 0 && meses === 0) return `${anos} ano(s)`;
    if (anos === 0 && meses > 0) return `${meses} mês(es)`;
    return 'Menos de 1 mês (Recém-nascido)';
  }
  return idadeAnos !== null && idadeAnos !== undefined ? `${idadeAnos} anos` : 'Não informada';
}

function renderizarGrid(pets) {
  if (!pets || pets.length === 0) {
    gridPets.innerHTML = `<div class="col-span-full text-center text-slate-500 py-16">Nenhum pet encontrado.</div>`;
    return;
  }

  gridPets.innerHTML = pets.map(pet => {
    const idadeAmigavel = calcularIdadeAmigavel(pet.data_nascimento, pet.idade);
    const dataNascFormatada = pet.data_nascimento ? pet.data_nascimento.split('-').reverse().join('/') : '';

    return `
    <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-slate-800 text-emerald-400 text-base">
              ${getIconByEspecie(pet.especie)}
            </span>
            <h3 class="text-lg font-bold text-white">${escapeHtml(pet.nome)}</h3>
          </div>
          <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ${escapeHtml(pet.especie)}
          </span>
        </div>
        
        <div class="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
          <p><span class="text-slate-500 font-medium">Raça:</span> ${escapeHtml(pet.raca || 'SRD')}</p>
          <p><span class="text-slate-500 font-medium">Idade:</span> ${idadeAmigavel} ${dataNascFormatada ? ` <span class="text-slate-600">(${dataNascFormatada})</span>` : ''}</p>
          <p><span class="text-slate-500 font-medium">Peso:</span> ${pet.peso !== null ? `${pet.peso} kg` : 'Não informado'}</p>
          <div class="pt-2 border-t border-slate-800/60 mt-2">
            <p><span class="text-slate-500 font-medium">Tutor:</span> ${escapeHtml(pet.tutor_nome)}</p>
            <p><span class="text-slate-500 font-medium">Contato:</span> ${escapeHtml(pet.tutor_contato)}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <button onclick="abrirModalVacinas(${pet.id}, '${escapeHtml(pet.nome)}')" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <i class="fa-solid fa-syringe"></i> Vacinas
        </button>
        <div class="flex gap-1.5">
          <button onclick="editarPet(${pet.id})" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="deletarPet(${pet.id})" class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function renderizarPaginacao({ page, totalPages }) {
  if (totalPages <= 1) {
    paginacao.innerHTML = '';
    return;
  }

  paginacao.innerHTML = `
    <button ${page === 1 ? 'disabled class="opacity-30 cursor-not-allowed"' : 'onclick="carregarPets(' + (page - 1) + ')"'} class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium hover:bg-slate-800 transition-colors">
      Anterior
    </button>
    <span class="text-xs text-slate-500 font-medium px-2">Página ${page} de ${totalPages}</span>
    <button ${page === totalPages ? 'disabled class="opacity-30 cursor-not-allowed"' : 'onclick="carregarPets(' + (page + 1) + ')"'} class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium hover:bg-slate-800 transition-colors">
      Próxima
    </button>
  `;
}

formPet.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('pet-id').value;
  const payload = {
    nome: document.getElementById('pet-nome').value.trim(),
    especie: document.getElementById('pet-especie').value,
    raca: document.getElementById('pet-raca').value.trim() || undefined,
    data_nascimento: document.getElementById('pet-data-nascimento').value || undefined,
    peso: document.getElementById('pet-peso').value ? Number(document.getElementById('pet-peso').value) : undefined,
    tutor_nome: document.getElementById('pet-tutor-nome').value.trim(),
    tutor_contato: document.getElementById('pet-tutor-contato').value.trim()
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.details?.[0]?.mensagem || err.error || 'Falha ao salvar', true);
      return;
    }

    modalPet.classList.add('hidden');
    showToast(isEdit ? 'Pet atualizado!' : 'Pet cadastrado com sucesso!');
    carregarPets(currentPage);
  } catch (error) {
    showToast('Erro de conexão com o servidor', true);
  }
});

window.editarPet = async function (id) {
  try {
    const res = await apiFetch(`${API_URL}/${id}`);
    const pet = await res.json();

    document.getElementById('pet-id').value = pet.id;
    document.getElementById('pet-nome').value = pet.nome;
    document.getElementById('pet-especie').value = pet.especie;
    document.getElementById('pet-raca').value = pet.raca || '';
    document.getElementById('pet-data-nascimento').value = pet.data_nascimento || '';
    document.getElementById('pet-peso').value = pet.peso !== null ? pet.peso : '';
    document.getElementById('pet-tutor-nome').value = pet.tutor_nome;
    document.getElementById('pet-tutor-contato').value = pet.tutor_contato;

    atualizarPreviewIdade();

    modalTitulo.innerHTML = '<i class="fa-solid fa-pen text-emerald-400"></i> Editar Pet';
    modalPet.classList.remove('hidden');
  } catch (error) {
    showToast('Erro ao carregar dados do pet', true);
  }
};

window.deletarPet = async function (id) {
  const result = await Swal.fire({
    title: 'Remover Pet?',
    text: 'Esta ação removerá o pet e todo seu histórico vacinal!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
    background: '#0f172a',
    color: '#f8fafc'
  });

  if (result.isConfirmed) {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Pet removido com sucesso!');
        carregarPets(currentPage);
      }
    } catch (error) {
      showToast('Erro ao excluir registro', true);
    }
  }
};

window.abrirModalVacinas = async function (id, nome) {
  vacinaPetId.value = id;
  vacinasPetNome.innerHTML = `<i class="fa-solid fa-syringe text-emerald-400"></i> Cartão de Vacinas - ${nome}`;
  modalVacinas.classList.remove('hidden');
  await carregarVacinas(id);
};

async function carregarVacinas(petId) {
  try {
    const res = await apiFetch(`${API_URL}/${petId}/vacinas`);
    const vacinas = await res.json();

    if (!vacinas || vacinas.length === 0) {
      listaVacinas.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Nenhuma vacina registrada para este pet.</p>`;
      return;
    }

    listaVacinas.innerHTML = vacinas.map(v => `
      <div class="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div>
          <p class="font-bold text-white">${escapeHtml(v.nome)}</p>
          <p class="text-[11px] text-slate-400">Aplicada em: ${v.data_aplicacao} ${v.proxima_dose ? `• Próx dose: <span class="text-emerald-400">${v.proxima_dose}</span>` : ''}</p>
        </div>
        <button onclick="deletarVacina(${v.id}, ${petId})" class="text-slate-500 hover:text-rose-400 p-1 transition-colors">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  } catch (error) {
    showToast('Erro ao carregar histórico vacinal', true);
  }
}

formVacina.addEventListener('submit', async (e) => {
  e.preventDefault();
  const petId = vacinaPetId.value;
  const payload = {
    nome: document.getElementById('vacina-nome').value.trim(),
    data_aplicacao: document.getElementById('vacina-data-aplicacao').value,
    proxima_dose: document.getElementById('vacina-proxima-dose').value || null
  };

  try {
    const res = await apiFetch(`${API_URL}/${petId}/vacinas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      showToast('Preencha os campos da vacina corretamente', true);
      return;
    }

    formVacina.reset();
    showToast('Vacina registrada!');
    await carregarVacinas(petId);
  } catch (error) {
    showToast('Erro ao salvar vacina', true);
  }
});

window.deletarVacina = async function (id, petId) {
  try {
    await apiFetch(`${API_URL}/vacinas/${id}`, { method: 'DELETE' });
    showToast('Vacina removida!');
    await carregarVacinas(petId);
  } catch (error) {
    showToast('Erro ao excluir vacina', true);
  }
};

function abrirModalNovo() {
  formPet.reset();
  document.getElementById('pet-id').value = '';
  document.getElementById('pet-idade-preview').textContent = '';
  modalTitulo.innerHTML = '<i class="fa-solid fa-paw text-emerald-400"></i> Cadastrar Pet';
  modalPet.classList.remove('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}

btnNovoPet.addEventListener('click', abrirModalNovo);
modalFechar.addEventListener('click', () => modalPet.classList.add('hidden'));
btnCancelar.addEventListener('click', () => modalPet.classList.add('hidden'));
modalVacinasFechar.addEventListener('click', () => modalVacinas.classList.add('hidden'));

let debounceTimer;
filtroBusca.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => carregarPets(1), 300);
});

filtroEspecie.addEventListener('change', () => carregarPets(1));

function atualizarPreviewIdade() {
  const dataNascimento = document.getElementById('pet-data-nascimento').value;
  const preview = document.getElementById('pet-idade-preview');
  if (dataNascimento) {
    preview.textContent = calcularIdadeAmigavel(dataNascimento, null);
  } else {
    preview.textContent = '';
  }
}
document.getElementById('pet-data-nascimento')?.addEventListener('input', atualizarPreviewIdade);

// Função para gerar PDF da carteirinha
window.gerarCarteirinhaPDF = async function () {
  const petId = vacinaPetId.value;
  if (!petId) return;

  try {
    // Busca dados atualizados do pet
    const petRes = await apiFetch(`${API_URL}/${petId}`);
    const pet = await petRes.json();

    // Busca vacinas
    const vacinasRes = await apiFetch(`${API_URL}/${petId}/vacinas`);
    const vacinas = await vacinasRes.json();

    // Preenche dados do Pet e Tutor
    const idadeAmigavel = calcularIdadeAmigavel(pet.data_nascimento, pet.idade);
    const dataNascFormatada = pet.data_nascimento ? pet.data_nascimento.split('-').reverse().join('/') : '-';

    document.getElementById('print-data-emissao').textContent = new Date().toLocaleDateString('pt-BR');
    document.getElementById('print-pet-nome').textContent = pet.nome;
    document.getElementById('print-pet-especie').textContent = pet.especie;
    document.getElementById('print-pet-raca').textContent = pet.raca || 'SRD';
    document.getElementById('print-data-nascimento').textContent = dataNascFormatada;
    document.getElementById('print-pet-idade').textContent = idadeAmigavel;
    document.getElementById('print-pet-peso').textContent = pet.peso !== null ? `${pet.peso} kg` : 'N/I';
    document.getElementById('print-tutor-nome').textContent = pet.tutor_nome;
    document.getElementById('print-tutor-contato').textContent = pet.tutor_contato;

    // Preenche Tabela de Vacinas
    const tbody = document.getElementById('print-lista-vacinas');
    if (!vacinas || vacinas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-500 italic">Nenhum registro vacinal encontrado.</td></tr>`;
    } else {
      tbody.innerHTML = vacinas.map((v, index) => {
        const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';

        let status = 'Em dia';
        if (v.proxima_dose) {
          const hoje = new Date();
          const partesProx = v.proxima_dose.split('-'); // Considerando formato YYYY-MM-DD
          if (partesProx.length === 3) {
            const dataProx = new Date(partesProx[0], partesProx[1] - 1, partesProx[2]);
            if (dataProx < hoje) status = 'Atrasada';
          }
        } else {
          status = 'Dose Única';
        }

        return `
          <tr class="${bgClass} border-b border-slate-200">
            <td class="py-2 px-3 font-medium">${escapeHtml(v.nome)}</td>
            <td class="py-2 px-3 text-center">${v.data_aplicacao}</td>
            <td class="py-2 px-3 text-center">${v.proxima_dose || '-'}</td>
            <td class="py-2 px-3 text-center font-semibold ${status === 'Atrasada' ? 'text-rose-600' : 'text-emerald-600'}">${status}</td>
          </tr>
        `;
      }).join('');
    }

    // Aciona a impressão
    window.print();
  } catch (error) {
    showToast('Erro ao preparar documento para impressão', true);
  }
};

const btnImprimirVacinas = document.getElementById('btn-imprimir-vacinas');
if (btnImprimirVacinas) {
  btnImprimirVacinas.addEventListener('click', window.gerarCarteirinhaPDF);
}

checkAuth();
