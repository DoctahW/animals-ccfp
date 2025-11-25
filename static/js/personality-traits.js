/**
 * personality-traits.js - Define as dimensões de personalidade dos animais
 * Sistema de seleção entre traços opostos (0-100)
 */

const PERSONALITY_TRAITS = {
    brincalhao: {
        esquerda: 'Brincalhão',
        direita: 'Sério',
        emoji: '🎮'
    },
    afetuoso: {
        esquerda: 'Afetuoso',
        direita: 'Independente',
        emoji: '💕'
    },
    energetico: {
        esquerda: 'Energético',
        direita: 'Preguiçoso',
        emoji: '⚡'
    },
    corajoso: {
        esquerda: 'Corajoso',
        direita: 'Medroso',
        emoji: '🦁'
    },
    obediente: {
        esquerda: 'Obediente',
        direita: 'Teimoso',
        emoji: '👂'
    },
    sociavel: {
        esquerda: 'Sociável',
        direita: 'Solitário',
        emoji: '👥'
    }
};

/**
 * Cria um slider de personalidade
 * @param {string} traitKey - Chave do traço (ex: 'brincalhao')
 * @param {number} value - Valor atual (0-100)
 * @returns {string} HTML do slider
 */
function criarSliderPersonalidade(traitKey, value = 50) {
    const trait = PERSONALITY_TRAITS[traitKey];
    if (!trait) return '';

    return `
        <div class="personality-slider-container">
            <div class="slider-wrapper">
                <span class="slider-label-left">${trait.esquerda}</span>
                <input
                    type="range"
                    class="personality-slider"
                    name="${traitKey}"
                    min="0"
                    max="100"
                    step="25"
                    value="${value}"
                    data-trait="${traitKey}"
                >
                <span class="slider-label-right">${trait.direita}</span>
            </div>
        </div>
    `;
}

/**
 * Renderiza todos os sliders de personalidade
 * @param {Object} personalityData - Dados de personalidade atuais
 * @returns {string} HTML com todos os sliders
 */
function renderizarTodosSliders(personalityData = {}) {
    let html = '<div class="personality-container">';

    Object.keys(PERSONALITY_TRAITS).forEach(key => {
        const value = personalityData[key] !== undefined ? personalityData[key] : 50;
        html += criarSliderPersonalidade(key, value);
    });

    html += '</div>';
    return html;
}

/**
 * Converte FormData de personalidade em objeto JSON
 * @param {FormData} formData - FormData do formulário
 * @returns {Object} Objeto com dados de personalidade
 */
function extrairPersonalidade(formData) {
    const personalidade = {};

    Object.keys(PERSONALITY_TRAITS).forEach(key => {
        const value = formData.get(key);
        if (value !== null) {
            personalidade[key] = parseInt(value, 10);
        }
    });

    return personalidade;
}

/**
 * Converte string JSON em objeto (com fallback seguro)
 * @param {string} jsonStr - String JSON ou comportamento antigo
 * @returns {Object} Objeto com dados de personalidade (valores padrão 50 se vazio)
 */
function parsePersonalidade(jsonStr) {
    if (!jsonStr) {
        return obterPersonalidadePadrao();
    }

    try {
        const parsed = JSON.parse(jsonStr);
        // Se for objeto com chaves de traço, retornar
        if (Object.keys(PERSONALITY_TRAITS).some(key => key in parsed)) {
            return parsed;
        }
    } catch (e) {
        // Não é JSON válido, retornar padrão
    }

    return obterPersonalidadePadrao();
}

/**
 * Retorna personalidade com todos os valores padrão (50 = neutro)
 * @returns {Object} Objeto com traços neutros
 */
function obterPersonalidadePadrao() {
    const padrao = {};
    Object.keys(PERSONALITY_TRAITS).forEach(key => {
        padrao[key] = 50;
    });
    return padrao;
}

/**
 * Inicializa event listeners para sliders
 * Atualiza o valor exibido em tempo real
 */
function inicializarSlidersListener() {
    document.querySelectorAll('.personality-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const valueDisplay = this.parentElement.parentElement.querySelector('.value-display');
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
            }
        });
    });
}

// Auto-inicializar quando página carrega
document.addEventListener('DOMContentLoaded', function() {
    inicializarSlidersListener();
});
