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
