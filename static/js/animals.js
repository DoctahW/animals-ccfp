/**
 * Animals.js - Funcionalidades da página de Animais
 * Gerencia CRUD de animais e interações relacionadas
 */

/**
 * Inicializa a página de animais
 */
document.addEventListener('DOMContentLoaded', function() {
    initAnimalsPage();
});

/**
 * Função de inicialização da página de animais
 */
function initAnimalsPage() {
    attachFilterListeners();
    attachSearchListener();
    attachFormListener();
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
            // Buscar todos os animais via API
            AnimalService.getAllAnimals()
                .then(animals => renderAnimalList(animals, 'all'))
                .catch(error => {
                    console.error('Erro ao buscar todos os animais:', error);
                    showError('Erro ao carregar animais');
                    renderAnimalList([], 'all');
                });
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

        // Extrair personalidade dos sliders
        const personalidade = extrairPersonalidade(formData);

        // Converter FormData em objeto
        const data = formDataToObject(formData);

        // Substituir comportamento pelos dados de personalidade como JSON
        data.comportamento = JSON.stringify(personalidade);

        try {
            // Enviar dados para o servidor
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true);

            console.log('Dados sendo enviados:', data);

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

            // Mostrar mensagem de erro mais detalhada
            const errorMessage = error.message || 'Erro ao adicionar animal';
            showError(errorMessage);

            setButtonLoading(form.querySelector('button[type="submit"]'), false);
        }
    });
}

/**
 * Exporta lista de animais em CSV
 */
function exportAnimalsCSV() {
    showNotification('Exportação em desenvolvimento', 'info');
}

/**
 * Imprime relatório de animais
 */
function printAnimalsReport() {
    showNotification('Impressão em desenvolvimento', 'info');
}
