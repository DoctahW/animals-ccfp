/**
 * Modal.js - Gerenciamento de modais
 * Controla abertura, fechamento e interações de modais
 */

/**
 * Abre um modal pelo ID
 * @param {string} modalId - ID do modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (!modal || !overlay) return;

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Previne scroll do body
}

/**
 * Fecha um modal pelo ID
 * @param {string} modalId - ID do modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (!modal) return;

    modal.classList.add('hidden');

    // Verificar se existem outros modais abertos
    const anyModalOpen = document.querySelector('.modal:not(.hidden)');
    if (!anyModalOpen && overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Fecha todos os modais
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });

    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }

    document.body.style.overflow = 'auto';
}

/**
 * Fecha modal ao pressionar ESC
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

/**
 * Confirma ação com modal de confirmação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem de confirmação
 * @param {Function} onConfirm - Callback ao confirmar
 * @param {Function} onCancel - Callback ao cancelar
 */
function showConfirmation(title, message, onConfirm, onCancel = null) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close">✕</button>
        </div>
        <div class="modal-body">
            <p>${message}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelBtn">
                Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="confirmBtn">
                Confirmar
            </button>
        </div>
    `;

    document.body.appendChild(confirmModal);

    // Adicionar event listeners
    const closeBtn = confirmModal.querySelector('.modal-close');
    const cancelBtn = confirmModal.querySelector('#cancelBtn');
    const confirmBtn = confirmModal.querySelector('#confirmBtn');

    const closeConfirmModal = () => {
        confirmModal.remove();
        const anyModalOpen = document.querySelector('.modal:not(.hidden)');
        const overlay = document.getElementById('modalOverlay');
        if (!anyModalOpen && overlay) {
            overlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };

    closeBtn.addEventListener('click', closeConfirmModal);

    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        closeConfirmModal();
    });

    confirmBtn.addEventListener('click', async () => {
        if (onConfirm) await onConfirm();
        closeConfirmModal();
    });

    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('hidden');
}

/**
 * Valida um formulário dentro do modal
 * @param {HTMLFormElement} form - Elemento do formulário
 * @returns {boolean} true se válido
 */
function validateForm(form) {
    if (!form) return false;

    // Validação HTML5 nativa
    return form.checkValidity();
}

/**
 * Reseta formulário e fecha modal
 * @param {HTMLFormElement} form - Elemento do formulário
 * @param {string} modalId - ID do modal
 */
function resetFormAndCloseModal(form, modalId) {
    if (form) form.reset();
    closeModal(modalId);
}

/**
 * Mostra estado de carregamento no botão
 * @param {HTMLButtonElement} button - Botão
 * @param {boolean} isLoading - true para mostrar loading
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;

    const originalText = button.getAttribute('data-original-text') || button.textContent;

    if (isLoading) {
        button.setAttribute('data-original-text', originalText);
        button.disabled = true;
        button.textContent = '⏳ Processando...';
    } else {
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Adiciona máscara de entrada em campo
 * @param {HTMLInputElement} input - Campo de entrada
 * @param {string} mask - Máscara (ex: '(##) #####-####')
 */
function applyInputMask(input, mask) {
    if (!input) return;

    input.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        let maskedValue = '';
        let maskIndex = 0;

        for (let i = 0; i < mask.length && maskIndex < value.length; i++) {
            if (mask[i] === '#') {
                maskedValue += value[maskIndex];
                maskIndex++;
            } else {
                maskedValue += mask[i];
            }
        }

        this.value = maskedValue;
    });
}

/**
 * Inicializa todos os modais da página
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fechar modal ao clicar no overlay
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    }

    // Fechar modal ao clicar no botão de fechar
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                const modalId = modal.id;
                closeModal(modalId);
            }
        });
    });

    console.log('Modais inicializados');
});
