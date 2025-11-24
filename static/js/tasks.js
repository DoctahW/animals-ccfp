/**
 * Tasks.js - Funcionalidades da página de Tarefas
 * Gerencia CRUD de tarefas
 */

let currentTasks = [];

/**
 * Inicializa a página de tarefas
 */
document.addEventListener('DOMContentLoaded', function() {
    initTasksPage();
});

/**
 * Função de inicialização da página de tarefas
 */
function initTasksPage() {
    setupEventListeners();
    attachFilterListeners();
    attachFormListener();
    loadTasks();
}

/**
 * Carrega lista de tarefas
 */
async function loadTasks() {
    try {
        // Em produção, fazer requisição à API
        // const response = await apiGet('/api/tasks');
        // currentTasks = response;
        console.log('Tarefas carregadas');
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showError('Erro ao carregar lista de tarefas');
    }
}

/**
 * Configura event listeners gerais
 */
function setupEventListeners() {
    console.log('Página de tarefas inicializada');
}

/**
 * Anexa listeners aos botões de filtro
 */
function attachFilterListeners() {
    const filterButtons = document.querySelectorAll('[data-filter]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('filter-btn')) {
                e.preventDefault();

                // Remover classe active de todos os botões de filtro
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

                // Adicionar classe active ao botão clicado
                this.classList.add('active');

                // Aplicar filtro
                const filterType = this.getAttribute('data-filter');
                applyTaskFilter(filterType);
            }
        });
    });
}

/**
 * Aplica filtro à lista de tarefas
 * @param {string} filterType - Tipo de filtro
 */
function applyTaskFilter(filterType) {
    const taskCards = document.querySelectorAll('[data-tipo]');

    taskCards.forEach(card => {
        if (filterType === 'all') {
            card.style.display = '';
        } else {
            const tipo = card.getAttribute('data-tipo');
            if (tipo === filterType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

/**
 * Anexa listener ao formulário de adicionar tarefa
 */
function attachFormListener() {
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
}

/**
 * Edita uma tarefa
 * @param {number} taskId - ID da tarefa
 */
async function editTask(taskId) {
    try {
        // Implementar edição
        showNotification('Funcionalidade em desenvolvimento', 'info');
    } catch (error) {
        console.error('Erro ao editar tarefa:', error);
    }
}

/**
 * Deleta uma tarefa
 * @param {number} taskId - ID da tarefa
 */
async function deleteTask(taskId) {
    showConfirmation(
        'Confirmar Exclusão',
        'Tem certeza que deseja remover esta tarefa? Esta ação não pode ser desfeita.',
        async function() {
            try {
                await apiDelete(`/api/tasks/${taskId}`);
                showSuccess('Tarefa removida com sucesso!');

                // Recarregar página após 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error('Erro ao remover tarefa:', error);
            }
        }
    );
}

/**
 * Marca uma tarefa como concluída
 * @param {number} taskId - ID da tarefa
 */
async function completeTask(taskId) {
    try {
        // Em produção, fazer requisição PATCH à API
        // await apiPatch(`/api/tasks/${taskId}`, { status: 'concluída' });
        showSuccess('Tarefa marcada como concluída!');

        // Atualizar UI
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (error) {
        console.error('Erro ao marcar tarefa como concluída:', error);
        showError('Erro ao processar tarefa');
    }
}

/**
 * Exporta lista de tarefas em CSV
 */
function exportTasksCSV() {
    showNotification('Exportação em desenvolvimento', 'info');
}

/**
 * Imprime relatório de tarefas
 */
function printTasksReport() {
    showNotification('Impressão em desenvolvimento', 'info');
}

/**
 * Filtra tarefas por data
 * @param {string} startDate - Data de início (YYYY-MM-DD)
 * @param {string} endDate - Data de fim (YYYY-MM-DD)
 */
function filterTasksByDate(startDate, endDate) {
    // Implementar filtro por data
    console.log(`Filtrando tarefas de ${startDate} a ${endDate}`);
}

/**
 * Ordena tarefas por coluna
 * @param {string} column - Coluna para ordenar
 */
function sortTasks(column) {
    // Implementar ordenação
    console.log(`Ordenando tarefas por ${column}`);
}
