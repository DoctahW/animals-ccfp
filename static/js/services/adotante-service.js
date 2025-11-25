/**
 * AdotanteService.js
 * Centraliza todas as chamadas de API para adotantes e matching
 * OBJETIVO: Remover duplicação de requisições HTTP do frontend
 */

class AdotanteService {
    // ==================== CRUD BÁSICO ====================

    /**
     * Obtém todos os adotantes
     * @returns {Promise} Lista de adotantes
     */
    static async getAllAdotantes() {
        try {
            const response = await fetch('/api/adotantes');
            if (!response.ok) throw new Error('Erro ao obter adotantes');
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.getAllAdotantes:', error);
            throw error;
        }
    }

    /**
     * Obtém um adotante específico por ID
     * @param {number} id - ID do adotante
     * @returns {Promise} Dados do adotante formatados
     */
    static async getAdotante(id) {
        try {
            const response = await fetch(`/api/adotantes/${id}`);
            if (!response.ok) throw new Error('Adotante não encontrado');
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.getAdotante:', error);
            throw error;
        }
    }

    /**
     * Adiciona novo adotante
     * @param {Object} dados - Dados do adotante (8 seções)
     * @returns {Promise} Resposta do servidor com ID do novo adotante
     */
    static async createAdotante(dados) {
        try {
            const response = await fetch('/api/adotantes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar adotante');
            }
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.createAdotante:', error);
            throw error;
        }
    }

    /**
     * Edita um adotante existente
     * @param {number} id - ID do adotante
     * @param {Object} dados - Dados atualizados
     * @returns {Promise} Resposta do servidor
     */
    static async updateAdotante(id, dados) {
        try {
            const response = await fetch(`/api/adotantes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao editar adotante');
            }
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.updateAdotante:', error);
            throw error;
        }
    }

    /**
     * Remove um adotante
     * @param {number} id - ID do adotante
     * @returns {Promise} Resposta do servidor
     */
    static async deleteAdotante(id) {
        try {
            const response = await fetch(`/api/adotantes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao remover adotante');
            }
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.deleteAdotante:', error);
            throw error;
        }
    }

    // ==================== VALIDAÇÃO ====================

    /**
     * Valida dados de um adotante
     * @param {Object} dados - Dados do adotante
     * @returns {Promise} {valid, errors, warnings}
     */
    static async validateAdotante(dados) {
        try {
            const response = await fetch('/api/adotantes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.validateAdotante:', error);
            throw error;
        }
    }

    // ==================== MATCHING ====================

    /**
     * Obtém score de compatibilidade entre animal e adotante
     * @param {number} animal_id - ID do animal
     * @param {number} adotante_id - ID do adotante
     * @returns {Promise} Detalhes de compatibilidade com score
     */
    static async getCompatibilityScore(animal_id, adotante_id) {
        try {
            const response = await fetch(
                `/api/matching/score?animal_id=${animal_id}&adotante_id=${adotante_id}`
            );
            if (!response.ok) throw new Error('Erro ao calcular compatibilidade');
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.getCompatibilityScore:', error);
            throw error;
        }
    }

    /**
     * Obtém todos os animais compatíveis para um adotante (score >= 70%)
     * @param {number} adotante_id - ID do adotante
     * @returns {Promise} Lista de animais com scores de compatibilidade
     */
    static async getMatchesForAdotante(adotante_id) {
        try {
            const response = await fetch(`/api/adotantes/${adotante_id}/matches`);
            if (!response.ok) throw new Error('Erro ao buscar matches');
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.getMatchesForAdotante:', error);
            throw error;
        }
    }

    /**
     * Obtém todos os adotantes compatíveis para um animal (score >= 70%)
     * @param {number} animal_id - ID do animal
     * @returns {Promise} Lista de adotantes com scores de compatibilidade
     */
    static async getMatchesForAnimal(animal_id) {
        try {
            const response = await fetch(`/api/matching/animal/${animal_id}`);
            if (!response.ok) throw new Error('Erro ao buscar adotantes compatíveis');
            return await response.json();
        } catch (error) {
            console.error('AdotanteService.getMatchesForAnimal:', error);
            throw error;
        }
    }
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdotanteService;
}
