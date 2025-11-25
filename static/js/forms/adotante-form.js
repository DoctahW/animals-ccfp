/**
 * AdotanteForm.js
 * Gerencia o formulário multi-step de cadastro de adotantes
 * Features:
 * - 8 seções (4 obrigatórias, 4 opcionais)
 * - Barra de progresso
 * - Validação por seção
 * - localStorage para salvamento automático
 */

const STORAGE_KEY = 'adotante_form_draft';
const TOTAL_STEPS = 8;
let currentStep = 1;

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadFormState();
    setupEventListeners();
    updateProgressBar();
    loadAdotantesList();
});

/**
 * Inicializa o formulário
 */
function initializeForm() {
    // Mostrar primeira seção
    showSection(1);

    // Atualizar botões
    updateNavigationButtons();
}

/**
 * Configura listeners para campos condicionais e auto-save
 */
function setupEventListeners() {
    const form = document.getElementById('adotanteForm');

    // Auto-save ao mudar qualquer campo
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('change', function() {
            saveFormState();
            handleConditionalFields();
        });
        field.addEventListener('input', function() {
            saveFormState();
        });
    });

    // Listeners para campos condicionais
    const temQuintal = form.querySelector('select[name="tem_quintal"]');
    const viagensFrequentes = form.querySelector('select[name="viagens_frequentes"]');
    const temOutrosAnimais = form.querySelector('select[name="tem_outros_animais"]');
    const temPreferenciaTracos = form.querySelector('select[name="tem_preferencia_tracos"]');

    if (temQuintal) {
        temQuintal.addEventListener('change', handleConditionalFields);
    }
    if (viagensFrequentes) {
        viagensFrequentes.addEventListener('change', handleConditionalFields);
    }
    if (temOutrosAnimais) {
        temOutrosAnimais.addEventListener('change', handleConditionalFields);
    }
    if (temPreferenciaTracos) {
        temPreferenciaTracos.addEventListener('change', handleConditionalFields);
    }

    // Form submit
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Mostra/oculta campos condicionais
 */
function handleConditionalFields() {
    const form = document.getElementById('adotanteForm');

    // Mostrar tamanho de quintal se tem quintal
    const temQuintal = form.querySelector('select[name="tem_quintal"]').value;
    const tamanhoQuintalGroup = document.getElementById('tamanhoQuintalGroup');
    if (tamanhoQuintalGroup) {
        tamanhoQuintalGroup.style.display = temQuintal === '1' ? 'block' : 'none';
    }

    // Mostrar dias de viagem se viaja frequentemente
    const viagensFrequentes = form.querySelector('select[name="viagens_frequentes"]').value;
    const diasViagemGroup = document.getElementById('diasViagemGroup');
    if (diasViagemGroup) {
        diasViagemGroup.style.display = viagensFrequentes === '1' ? 'block' : 'none';
    }

    // Mostrar quantidade e tipo de outros animais se tem
    const temOutrosAnimais = form.querySelector('select[name="tem_outros_animais"]').value;
    const quantidadeAnimaisGroup = document.getElementById('quantidadeAnimaisGroup');
    const tipoAnimaisGroup = document.getElementById('tipoAnimaisGroup');
    if (quantidadeAnimaisGroup) {
        quantidadeAnimaisGroup.style.display = temOutrosAnimais === '1' ? 'block' : 'none';
    }
    if (tipoAnimaisGroup) {
        tipoAnimaisGroup.style.display = temOutrosAnimais === '1' ? 'block' : 'none';
    }

    // Mostrar container de tags se tem preferência
    const temPreferenciaTracos = form.querySelector('select[name="tem_preferencia_tracos"]').value;
    const tagsPreferenciaContainer = document.getElementById('tagsPreferenciaContainer');
    if (tagsPreferenciaContainer) {
        tagsPreferenciaContainer.style.display = temPreferenciaTracos === '1' ? 'block' : 'none';
    }
}

// ==================== NAVEGAÇÃO ====================

/**
 * Avança para próxima seção
 */
function nextStep() {
    // Validar seção atual
    if (!validateSection(currentStep)) {
        showMessage('Por favor, preencha os campos obrigatórios da seção atual.', 'error');
        return;
    }

    // Avançar
    if (currentStep < TOTAL_STEPS) {
        currentStep++;
        showSection(currentStep);
        updateProgressBar();
        updateNavigationButtons();
        saveFormState();
    }
}

/**
 * Volta para seção anterior
 */
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showSection(currentStep);
        updateProgressBar();
        updateNavigationButtons();
    }
}

/**
 * Mostra uma seção específica
 */
function showSection(step) {
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.querySelector(`[data-section="${step}"]`);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Scroll para o topo do formulário
    const container = document.querySelector('.adotante-form-container');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Atualiza barra de progresso
 */
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const currentStepElement = document.getElementById('currentStep');

    if (progressFill) {
        const percentage = (currentStep / TOTAL_STEPS) * 100;
        progressFill.style.width = percentage + '%';
    }

    if (currentStepElement) {
        currentStepElement.textContent = currentStep;
    }
}

/**
 * Atualiza visibilidade dos botões de navegação
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (currentStep === 1) {
        if (prevBtn) prevBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'inline-block';
    }

    if (currentStep === TOTAL_STEPS) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-block';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

// ==================== VALIDAÇÃO ====================

/**
 * Valida uma seção antes de avançar
 */
function validateSection(step) {
    const section = document.querySelector(`[data-section="${step}"]`);
    if (!section) return false;

    // Pegar campos obrigatórios da seção
    const requiredFields = section.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        // Pular validação de campos ocultos
        const closestGroup = field.closest('.form-group');
        if (closestGroup && closestGroup.style.display === 'none') {
            return;
        }

        if (field.type === 'email') {
            if (!validateEmail(field.value)) {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        } else {
            if (!field.value || field.value.trim() === '') {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        }
    });

    return isValid;
}

/**
 * Valida email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== LOCALSTORAGE ====================

/**
 * Salva estado do formulário em localStorage
 */
function saveFormState() {
    const form = document.getElementById('adotanteForm');
    const formData = new FormData(form);
    const state = {
        currentStep: currentStep,
        data: Object.fromEntries(formData)
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('Formulário salvo automaticamente');
    } catch (error) {
        console.error('Erro ao salvar formulário:', error);
    }
}

/**
 * Restaura estado do formulário do localStorage
 */
function loadFormState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const state = JSON.parse(saved);
        const form = document.getElementById('adotanteForm');

        // Restaurar dados
        Object.keys(state.data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = state.data[key];
            }
        });

        // Restaurar posição
        currentStep = state.currentStep || 1;
        showSection(currentStep);
        updateProgressBar();
        updateNavigationButtons();

        // Atualizar campos condicionais
        handleConditionalFields();

        showMessage('Rascunho anterior restaurado', 'info');
    } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
    }
}

/**
 * Limpa o rascunho do localStorage
 */
function clearFormState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Rascunho limpo');
    } catch (error) {
        console.error('Erro ao limpar rascunho:', error);
    }
}

// ==================== SUBMIT ====================

/**
 * Trata submit do formulário
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validar última seção
    if (!validateSection(currentStep)) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Coletar dados do formulário
    const form = document.getElementById('adotanteForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Coletar manualmente as tags_ideais dos checkboxes
    const tagsCheckboxes = form.querySelectorAll('input[name="tags_ideais"]:checked');
    data.tags_ideais = Array.from(tagsCheckboxes).map(cb => cb.value);

    // Remover o campo do objeto se não houver tags, para não enviar um array vazio desnecessariamente
    if (data.tags_ideais.length === 0) {
        delete data.tags_ideais;
    }

    // Converter booleanos
    data.tem_quintal = data.tem_quintal === '1';
    data.viagens_frequentes = data.viagens_frequentes === '1';
    data.tem_outros_animais = data.tem_outros_animais === '1';
    data.tem_preferencia_tracos = data.tem_preferencia_tracos === '1';


    try {
        showMessage('Enviando cadastro...', 'info');

        // Chamar API
        const response = await AdotanteService.createAdotante(data);

        // Sucesso
        showMessage('Adotante cadastrado com sucesso!', 'success');
        clearFormState();
        form.reset();
        currentStep = 1;
        showSection(1);
        updateProgressBar();
        updateNavigationButtons();
        handleConditionalFields(); // Resetar campos condicionais

        // Limpar inputs
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.classList.remove('invalid');
        });

        // Recarregar a lista de adotantes
        loadAdotantesList();

    } catch (error) {
        console.error('Erro ao enviar cadastro:', error);
        showMessage('Erro ao cadastrar adotante: ' + error.message, 'error');
    }
}

// ==================== LISTA DE ADOTANTES ====================

/**
 * Carrega e exibe a lista de adotantes já cadastrados
 */
async function loadAdotantesList() {
    try {
        const listContainer = document.getElementById('adotanteList');
        if (!listContainer) return;

        const response = await fetch('/api/adotantes');
        if (!response.ok) throw new Error('Erro ao carregar adotantes');

        const adotantes = await response.json();

        if (adotantes.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <div class="empty-text">Nenhum adotante cadastrado</div>
                    <div class="empty-subtext">Preencha o formulário para registrar um novo adotante</div>
                </div>
            `;
            return;
        }

        // Renderizar cards de adotantes
        let html = '';
        adotantes.forEach(adotante => {
            const detailsArray = [];
            if (adotante.idade) detailsArray.push(`${adotante.idade} anos`);
            if (adotante.localizacao) detailsArray.push(adotante.localizacao);
            const detailsText = detailsArray.join(' • ');

            html += `
                <div class="adotante-card" onclick="visualizarAdotante(${adotante.id})">
                    <div class="card-header">
                        <div class="card-avatar">👤</div>
                        <div class="card-info">
                            <div class="card-name">${adotante.nome}</div>
                            <div class="card-email">${adotante.email}</div>
                            ${detailsText ? `<div class="card-details">${detailsText}</div>` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <a href="/adotantes/${adotante.id}/matches" class="btn-link">
                            Ver Compatibilidades
                        </a>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar lista de adotantes:', error);
        const listContainer = document.getElementById('adotanteList');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <div class="empty-text">Erro ao carregar adotantes</div>
                    <div class="empty-subtext">${error.message}</div>
                </div>
            `;
        }
    }
}

/**
 * Visualiza detalhes de um adotante
 */
function visualizarAdotante(adotanteId) {
    // Redirecionar para página de matches
    window.location.href = `/adotantes/${adotanteId}/matches`;
}

// ==================== MENSAGENS ====================

/**
 * Mostra mensagem ao usuário
 */
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('formMessage');
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = 'form-message ' + type;
    messageDiv.style.display = 'block';

    // Auto-hide depois de 5 segundos se for info
    if (type === 'info' || type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
