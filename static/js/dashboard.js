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
 * Anexa listeners aos botões de filtro - REFATORADO PARA USAR API
 */
function attachFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Aplicar filtro via API
            const filterType = this.getAttribute('data-filter');
            applyFilterViaAPI(filterType);
        });
    });
}

/**
 * Aplica filtro via API e renderiza resultados
 * @param {string} filterType - Tipo de filtro
 */
async function applyFilterViaAPI(filterType) {
    try {
        let filtros = {};

        // Mapear tipos de filtro para parâmetros de API
        if (filterType === 'dog') {
            filtros.especie = 'Cachorro';
        } else if (filterType === 'cat') {
            filtros.especie = 'Gato';
        } else if (filterType === 'available') {
            filtros.status = 'Disponível';
        }

        // Buscar dados via API centralizada
        const animals = filterType === 'all'
            ? await AnimalService.getAllAnimals()
            : await AnimalService.filterAnimals(filtros);

        // Atualizar DOM com resultados
        renderAnimalList(animals, filterType);
    } catch (error) {
        console.error('Erro ao aplicar filtro:', error);
        showError('Erro ao aplicar filtro');
    }
}

/**
 * Anexa listener ao campo de busca - REFATORADO PARA USAR API
 */
function attachSearchListener() {
    const searchInput = document.getElementById('searchAnimals');

    if (!searchInput) return;

    // Debounce para evitar muitas requisições
    let debounceTimer;

    searchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);

        const searchTerm = e.target.value.trim();

        // Se vazio, mostrar todos os animais
        if (!searchTerm) {
            renderAnimalList([], 'all');
            return;
        }

        // Fazer busca via API com delay
        debounceTimer = setTimeout(async () => {
            try {
                const results = await AnimalService.searchAnimals(searchTerm);
                renderAnimalList(results, 'all');
            } catch (error) {
                console.error('Erro ao buscar:', error);
                showError('Erro ao buscar animais');
            }
        }, 300);
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
