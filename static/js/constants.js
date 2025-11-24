/**
 * constants.js - Constantes compartilhadas da aplicação
 */

/**
 * Mapa de ícones para tipos de tarefas
 */
const TAREFA_ICON_MAP = {
    'Vacinação': '💉',
    'Vacinacao': '💉',
    'Banho': '🛁',
    'Tosa': '✂️',
    'Check-Up': '🩺',
    'Treinamento': '📚',
    'Castração': '🔧',
    'Castracao': '🔧'
};

/**
 * Obtém ícone para um tipo de tarefa
 * @param {string} tipoTarefa - Tipo da tarefa
 * @returns {string} Ícone correspondente
 */
function obterIconeTarefa(tipoTarefa) {
    return TAREFA_ICON_MAP[tipoTarefa] || '📌';
}
