/**
 * AnimalService.js
 * Centraliza todas as chamadas de API para animais
 * OBJETIVO: Remover duplicação de requisições HTTP do frontend
 */

class AnimalService {
    // ==================== BÚSQUEDA E FILTROS ====================

    /**
     * Busca animais por nome, raça ou espécie
     * @param {string} query - Termo de busca
     * @returns {Promise} Lista de animais filtrados
     */
    static async searchAnimals(query) {
        try {
            const response = await fetch(`/api/animals/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Erro na busca');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.searchAnimals:', error);
            throw error;
        }
    }

    /**
     * Filtra animais por múltiplos critérios
     * @param {Object} filtros - {especie, status, saude}
     * @returns {Promise} Lista de animais filtrados
     */
    static async filterAnimals(filtros = {}) {
        try {
            const params = new URLSearchParams();
            if (filtros.especie) params.append('especie', filtros.especie);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.saude) params.append('saude', filtros.saude);

            const response = await fetch(`/api/animals/filter?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao filtrar');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.filterAnimals:', error);
            throw error;
        }
    }

    // ==================== CRUD BÁSICO ====================

    /**
     * Obtém todos os animais
     * @returns {Promise} Lista de animais
     */
    static async getAllAnimals() {
        try {
            const response = await fetch('/api/animals');
            if (!response.ok) throw new Error('Erro ao obter animais');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.getAllAnimals:', error);
            throw error;
        }
    }

    /**
     * Obtém um animal específico por ID
     * @param {number} id - ID do animal
     * @returns {Promise} Dados do animal formatados
     */
    static async getAnimal(id) {
        try {
            const response = await fetch(`/api/animals/${id}`);
            if (!response.ok) throw new Error('Animal não encontrado');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.getAnimal:', error);
            throw error;
        }
    }

    /**
     * Adiciona novo animal
     * @param {Object} dados - Dados do animal {nome, idade, raca, especie, saude, comportamento, data, status}
     * @returns {Promise} Resposta do servidor
     */
    static async createAnimal(dados) {
        try {
            const response = await fetch('/api/animals/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar animal');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.createAnimal:', error);
            throw error;
        }
    }

    /**
     * Edita um animal existente
     * @param {number} id - ID do animal
     * @param {Object} dados - Dados atualizados
     * @returns {Promise} Resposta do servidor
     */
    static async updateAnimal(id, dados) {
        try {
            const response = await fetch(`/api/animals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao editar animal');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.updateAnimal:', error);
            throw error;
        }
    }

    /**
     * Remove um animal
     * @param {number} id - ID do animal
     * @returns {Promise} Resposta do servidor
     */
    static async deleteAnimal(id) {
        try {
            const response = await fetch(`/api/animals/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao remover animal');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.deleteAnimal:', error);
            throw error;
        }
    }

    // ==================== PERSONALIDADE E TAGS ====================

    /**
     * Gera tags de personalidade baseado em traços
     * @param {Object} personalidade - Objeto com traços {brincalhao: 75, ...}
     * @returns {Promise} Tags geradas
     */
    static async generatePersonalityTags(personalidade) {
        try {
            const response = await fetch('/api/personality/generate-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personalidade })
            });
            if (!response.ok) throw new Error('Erro ao gerar tags');
            const data = await response.json();
            return data.tags;
        } catch (error) {
            console.error('AnimalService.generatePersonalityTags:', error);
            throw error;
        }
    }

    // ==================== VALIDAÇÃO ====================

    /**
     * Valida dados de um animal
     * @param {Object} dados - Dados do animal
     * @returns {Promise} {valid, errors, warnings}
     */
    static async validateAnimal(dados) {
        try {
            const response = await fetch('/api/validate/animal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            return await response.json();
        } catch (error) {
            console.error('AnimalService.validateAnimal:', error);
            throw error;
        }
    }

    /**
     * Valida dados de uma tarefa
     * @param {Object} dados - Dados da tarefa
     * @returns {Promise} {valid, errors, warnings}
     */
    static async validateTask(dados) {
        try {
            const response = await fetch('/api/validate/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            return await response.json();
        } catch (error) {
            console.error('AnimalService.validateTask:', error);
            throw error;
        }
    }

    // ==================== METADADOS ====================

    /**
     * Obtém tipos de tarefas com metadados
     * @returns {Promise} Objeto com tipos de tarefas {Banho, Tosa, ...}
     */
    static async getTaskTypeMetadata() {
        try {
            const response = await fetch('/api/metadata/task-types');
            if (!response.ok) throw new Error('Erro ao obter metadados');
            const data = await response.json();
            return data.tipos;
        } catch (error) {
            console.error('AnimalService.getTaskTypeMetadata:', error);
            throw error;
        }
    }

    // ==================== TAREFAS ====================

    /**
     * Obtém tarefas próximas (com contagem regressiva)
     * @param {number} animal_id - ID do animal (opcional)
     * @returns {Promise} Lista de tarefas
     */
    static async getUpcomingTasks(animal_id = null) {
        try {
            const url = animal_id ? `/api/proximas-tarefas?animal_id=${animal_id}` : '/api/proximas-tarefas';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao obter tarefas');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.getUpcomingTasks:', error);
            throw error;
        }
    }

    /**
     * Obtém todas as tarefas
     * @returns {Promise} Lista de tarefas
     */
    static async getAllTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Erro ao obter tarefas');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.getAllTasks:', error);
            throw error;
        }
    }

    /**
     * Cria nova tarefa
     * @param {Object} dados - {animal_id, tarefa, data, responsavel}
     * @returns {Promise} Resposta do servidor
     */
    static async createTask(dados) {
        try {
            const response = await fetch('/api/tasks/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar tarefa');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.createTask:', error);
            throw error;
        }
    }

    /**
     * Remove uma tarefa
     * @param {number} id - ID da tarefa
     * @returns {Promise} Resposta do servidor
     */
    static async deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao remover tarefa');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.deleteTask:', error);
            throw error;
        }
    }

    /**
     * Edita uma tarefa
     * @param {number} id - ID da tarefa
     * @param {Object} dados - Dados atualizados
     * @returns {Promise} Resposta do servidor
     */
    static async updateTask(id, dados) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao editar tarefa');
            }
            return await response.json();
        } catch (error) {
            console.error('AnimalService.updateTask:', error);
            throw error;
        }
    }

    // ==================== ESTATÍSTICAS ====================

    /**
     * Obtém estatísticas do dashboard
     * @returns {Promise} Estatísticas {total_animals, pending_tasks, ...}
     */
    static async getDashboardStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Erro ao obter estatísticas');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.getDashboardStats:', error);
            throw error;
        }
    }

    /**
     * Conta tarefas de um animal
     * @param {number} id - ID do animal
     * @returns {Promise} Contagem de tarefas
     */
    static async countTasksForAnimal(id) {
        try {
            const response = await fetch(`/api/animals/${id}/tarefas-count`);
            if (!response.ok) throw new Error('Erro ao contar tarefas');
            return await response.json();
        } catch (error) {
            console.error('AnimalService.countTasksForAnimal:', error);
            throw error;
        }
    }
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalService;
}
