/**
 * Dashboard.js - Funcionalidades do Dashboard
 * Gerencia interações e atualizações da página dashboard
 */

let currentAnimals = [];

/**
 * Inicializa o dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

/**
 * Função de inicialização do dashboard
 */
function initDashboard() {
    setupEventListeners();
    attachFilterListeners();
    attachSearchListener();
    attachFormListener();
    attachTaskFormListener();
}

/**
 * Configura event listeners gerais
 */
function setupEventListeners() {
    // Event listeners já são configurados pelo main.js
    console.log('Dashboard inicializado');
}

/**
 * Anexa listeners aos botões de filtro
 */
function attachFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Aplicar filtro
            const filterType = this.getAttribute('data-filter');
            applyFilter(filterType);
        });
    });
}

/**
 * Aplica filtro à lista de animais
 * @param {string} filterType - Tipo de filtro
 */
function applyFilter(filterType) {
    const animalCards = document.querySelectorAll('.animal-card');

    animalCards.forEach(card => {
        if (filterType === 'all') {
            card.style.display = '';
        } else {
            const especie = card.getAttribute('data-especie');
            if (filterType === 'dog' && especie === 'cachorro') {
                card.style.display = '';
            } else if (filterType === 'cat' && especie === 'gato') {
                card.style.display = '';
            } else if (filterType === 'available') {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

/**
 * Anexa listener ao campo de busca
 */
function attachSearchListener() {
    const searchInput = document.getElementById('searchAnimals');

    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const animalCards = document.querySelectorAll('.animal-card');

        animalCards.forEach(card => {
            const name = card.querySelector('.animal-name').textContent.toLowerCase();
            const breed = card.querySelector('.animal-details').textContent.toLowerCase();

            if (name.includes(searchTerm) || breed.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Mostrar mensagem se nenhum resultado
        const visibleCards = Array.from(animalCards).filter(card => card.style.display !== 'none');
        if (visibleCards.length === 0) {
            const listContainer = document.getElementById('animalList');
            if (listContainer.querySelector('.empty-state')) {
                // Já tem empty state
            } else {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-text">Nenhum animal encontrado</div>
                        <div class="empty-subtext">"${searchTerm}" não corresponde a nenhum animal</div>
                    </div>
                `;
            }
        }
    });
}

/**
 * Anexa listener ao formulário de adicionar animal
 */
function attachFormListener() {
    const form = document.getElementById('addAnimalForm');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar formulário
        if (!validateForm(form)) {
            showError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Converter FormData em objeto
        const formData = new FormData(form);
        const data = formDataToObject(formData);

        try {
            // Enviar dados para o servidor
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true);

            const response = await apiPost('/api/animals/add', data);

            // Sucesso
            showSuccess('Animal adicionado com sucesso!');
            resetFormAndCloseModal(form, 'addAnimalModal');

            // Recarregar página após 1.5 segundos
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Erro ao adicionar animal:', error);
            setButtonLoading(form.querySelector('button[type="submit"]'), false);
        }
    });
}

/**
 * Anexa listener ao formulário de adicionar tarefa
 */
function attachTaskFormListener() {
    const form = document.getElementById('addTaskForm');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar formulário
        if (!validateForm(form)) {
            showError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Converter FormData em objeto
        const formData = new FormData(form);
        const data = formDataToObject(formData);

        try {
            // Enviar dados para o servidor
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true);

            const response = await apiPost('/api/tasks/add', data);

            // Sucesso
            showSuccess('Tarefa adicionada com sucesso!');
            resetFormAndCloseModal(form, 'addTaskModal');

            // Recarregar página após 1.5 segundos
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            setButtonLoading(form.querySelector('button[type="submit"]'), false);
        }
    });

    // Carrega animais quando o modal de tarefas é aberto
    const addTaskBtn = document.querySelector('button[onclick="openModal(\'addTaskModal\')"]');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            setTimeout(carregarAnimaisNoDropdown, 100);
        });
    }
}

/**
 * Atualiza contadores de estatísticas
 */
async function updateStats() {
    try {
        // Em produção, fazer requisição à API
        // const stats = await apiGet('/api/stats');
        // document.getElementById('totalAnimals').textContent = stats.total;
        // document.getElementById('pendingTasks').textContent = stats.tasks;
        // document.getElementById('inTreatment').textContent = stats.treatment;
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

/**
 * Exporta dados para CSV (placeholder)
 */
function exportToCSV() {
    showNotification('Exportação em desenvolvimento', 'info');
}

/**
 * Imprime relatório (placeholder)
 */
function printReport() {
    showNotification('Impressão em desenvolvimento', 'info');
}
