/**
 * AdotanteMatches.js
 * Gerencia a página de compatibilidades do adotante
 */

let currentAdotanteId = null;
let allMatches = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    // Extrair ID do adotante da URL (/adotantes/<id>/matches)
    const pathSegments = window.location.pathname.split('/').filter(s => s);
    // pathSegments será: ['adotantes', '<id>', 'matches']
    const idIndex = pathSegments.indexOf('adotantes') + 1;
    currentAdotanteId = parseInt(pathSegments[idIndex]);

    console.log('URL:', window.location.pathname);
    console.log('Path segments:', pathSegments);
    console.log('Adotante ID extraído:', currentAdotanteId);

    if (!currentAdotanteId || isNaN(currentAdotanteId)) {
        showError('ID do adotante inválido na URL');
        return;
    }

    // Carregar dados
    loadAdotanteInfo();
    loadMatches();
});

/**
 * Carrega informações do adotante
 */
async function loadAdotanteInfo() {
    try {
        const url = `/api/adotantes/${currentAdotanteId}`;
        console.log('Fetching:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const adotante = await response.json();
        console.log('Adotante carregado:', adotante);

        // Preencher painel do adotante
        const nomeEl = document.getElementById('adotanteNome');
        const emailEl = document.getElementById('adotanteEmail');
        const detailsEl = document.getElementById('adotanteDetails');

        if (!nomeEl || !emailEl || !detailsEl) {
            console.error('Elementos não encontrados no DOM');
            return;
        }

        nomeEl.textContent = adotante.nome || 'Sem nome';
        emailEl.textContent = adotante.email || 'Sem email';

        // Montar detalhes
        const detailsText = [];
        if (adotante.idade) detailsText.push(`${adotante.idade} anos`);
        if (adotante.profissao) detailsText.push(adotante.profissao);
        if (adotante.localizacao) detailsText.push(adotante.localizacao);

        detailsEl.textContent = detailsText.length > 0 ? detailsText.join(' • ') : 'Sem informações';

        // Preencher dados do perfil
        preencherDadosPerfil(adotante);
    } catch (error) {
        console.error('Erro ao carregar adotante:', error);
        showError('Erro ao carregar informações do adotante: ' + error.message);
    }
}

/**
 * Preenche os dados do perfil do adotante
 * @param {Object} adotante - Dados do adotante
 */
function preencherDadosPerfil(adotante) {
    // MORADIA
    document.getElementById('tipoMoradia').textContent = adotante.tipo_moradia || 'Não informado';
    document.getElementById('tamanhoMoradia').textContent = formatarTamanho(adotante.tamanho_moradia);
    document.getElementById('temQuintal').textContent = adotante.tem_quintal ? 'Sim' : 'Não';

    // ROTINA
    document.getElementById('horasSozinho').textContent = adotante.horas_sozinho_dia ? `${adotante.horas_sozinho_dia}h` : 'Não informado';
    document.getElementById('nivelAtividade').textContent = formatarNivelAtividade(adotante.nivel_atividade);
    document.getElementById('viagensFrequentes').textContent = adotante.viagens_frequentes ? 'Sim' : 'Não';

    // PREFERÊNCIAS
    document.getElementById('tamanhoPreferido').textContent = formatarTamanho(adotante.tamanho_preferido) || 'Sem preferência';
    document.getElementById('idadePreferida').textContent = formatarIdadePreferida(adotante.idade_preferida);
    document.getElementById('experienciaPrevia').textContent = formatarExperiencia(adotante.experiencia_previa);

    // TAGS IDEAIS
    const tagsContainer = document.getElementById('tagsIdeais');
    if (adotante.tags_ideais && adotante.tags_ideais.length > 0) {
        tagsContainer.innerHTML = adotante.tags_ideais
            .map(tag => `<span class="tag-badge">${tag}</span>`)
            .join('');
    } else {
        tagsContainer.innerHTML = '<span style="color: #999; font-size: 13px;">Sem preferência de tags</span>';
    }
}

/**
 * Formata tamanho (moradia ou animal)
 */
function formatarTamanho(tamanho) {
    if (!tamanho) return 'Não informado';
    const mapa = {
        'pequeno': 'Pequeno',
        'médio': 'Médio',
        'medio': 'Médio',
        'grande': 'Grande'
    };
    return mapa[tamanho.toLowerCase()] || tamanho;
}

/**
 * Formata nível de atividade
 */
function formatarNivelAtividade(nivel) {
    if (!nivel) return 'Não informado';
    const mapa = {
        'sedentario': 'Sedentário',
        'sedentário': 'Sedentário',
        'moderado': 'Moderado',
        'ativo': 'Ativo',
        'muito_ativo': 'Muito Ativo',
        'muito ativo': 'Muito Ativo'
    };
    return mapa[nivel.toLowerCase()] || nivel;
}

/**
 * Formata idade preferida
 */
function formatarIdadePreferida(idade) {
    if (!idade) return 'Sem preferência';
    const mapa = {
        'filhote': 'Filhote',
        'jovem': 'Jovem',
        'adulto': 'Adulto',
        'idoso': 'Idoso'
    };
    return mapa[idade.toLowerCase()] || idade;
}

/**
 * Formata experiência prévia
 */
function formatarExperiencia(exp) {
    if (!exp) return 'Não informado';
    const mapa = {
        'nenhuma': 'Nenhuma',
        'pouca': 'Pouca',
        'média': 'Média',
        'media': 'Média',
        'muita': 'Muita'
    };
    return mapa[exp.toLowerCase()] || exp;
}

/**
 * Carrega animais compatíveis com o adotante
 */
async function loadMatches() {
    try {
        const url = `/api/adotantes/${currentAdotanteId}/matches`;
        console.log('Fetching matches:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        allMatches = await response.json();
        console.log('Matches raw:', allMatches);

        // Filtrar apenas matches com score >= 50%
        allMatches = allMatches.filter(match => {
            return match && match.compatibility && match.compatibility.score >= 50;
        });

        console.log('Matches filtered (>= 50%):', allMatches);

        if (allMatches.length === 0) {
            showEmptyState();
            return;
        }

        // Ordenar por score descending
        allMatches.sort((a, b) => b.compatibility.score - a.compatibility.score);

        console.log('Matches sorted:', allMatches);

        // Renderizar matches
        renderMatches(allMatches);
    } catch (error) {
        console.error('Erro ao carregar matches:', error);
        showError('Erro ao carregar animais compatíveis: ' + error.message);
    }
}

/**
 * Renderiza os cards de animais compatíveis
 * @param {Array} matches - Lista de matches a renderizar
 */
function renderMatches(matches) {
    const list = document.getElementById('matchesList');
    const emptyState = document.getElementById('emptyState');

    if (matches.length === 0) {
        list.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    list.innerHTML = '';
    emptyState.style.display = 'none';

    matches.forEach(match => {
        const card = createAnimalMatchCard(match);
        list.appendChild(card);
    });
}

/**
 * Filtra matches por compatibilidade
 * @param {string} level - Nível de compatibilidade (all, excellent, good)
 */
function filterMatches(level) {
    currentFilter = level;

    // Atualizar botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filtrar
    let filtered = allMatches;

    switch(level) {
        case 'excellent':
            filtered = allMatches.filter(m => m.compatibility.score >= 80);
            break;
        case 'good':
            filtered = allMatches.filter(m => m.compatibility.score >= 65 && m.compatibility.score < 80);
            break;
        case 'all':
        default:
            filtered = allMatches;
    }

    // Renderizar
    renderMatches(filtered);

    // Mensagem se vazio
    if (filtered.length === 0) {
        const list = document.getElementById('matchesList');
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-text">Nenhum match nesta categoria</div>
                <div class="empty-subtext">Tente selecionar outra categoria de compatibilidade</div>
            </div>
        `;
    }
}

/**
 * Mostra estado vazio
 */
function showEmptyState() {
    document.getElementById('matchesList').innerHTML = '';
    document.getElementById('emptyState').style.display = 'flex';
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    const list = document.getElementById('matchesList');
    list.innerHTML = `
        <div class="empty-state error">
            <div class="empty-icon">⚠️</div>
            <div class="empty-text">Erro</div>
            <div class="empty-subtext">${message}</div>
        </div>
    `;
}

/**
 * Abre um modal (function auxiliar)
 * @param {string} modalId - ID do modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (modal) {
        modal.classList.remove('hidden');
    }
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * Fecha um modal
 * @param {string} modalId - ID do modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (modal) {
        modal.classList.add('hidden');
    }
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Fecha todos os modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.getElementById('modalOverlay').classList.add('hidden');
}
