/**
 * AnimalDetailPanel.js
 * Componente reutilizável para renderizar detalhes completos de um animal
 * Renderiza o painel lateral com todas as informações do animal
 * OBJETIVO: Centralizar a renderização de detalhes em um único componente
 */

// Mapa de ícones para tipos de tarefas
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

class AnimalDetailPanel {
    /**
     * Renderiza painel de detalhes completo de um animal
     * @param {Object} animal - Dados do animal com all fields
     * @param {string} containerId - ID do container para renderizar
     * @param {Object} options - Opções {showEdit: true, showFullPage: false}
     */
    static render(animal, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const showEdit = options.showEdit !== false;
        const showFullPage = options.showFullPage === true;

        // Renderizar HTML
        container.innerHTML = this.getTemplate(animal, showEdit, showFullPage);

        // Renderizar personalidade e tags
        this.renderPersonalidade(animal, containerId);

        // Carregar tarefas
        this.renderTarefas(animal.id, containerId, showFullPage);

        // Carregar adotantes compatíveis
        this.renderAdotantes(animal.id, containerId);
    }

    /**
     * Template HTML base do painel de detalhes
     */
    static getTemplate(animal, showEdit = true, showFullPage = false) {
        const statusClass = this.getStatusClass(animal.status);

        return `
            <div class="detail-header">
                <div class="detail-title">
                    <h2>${animal.nome}</h2>
                    <div class="detail-subtitle">ID: #${animal.id} • Cadastrada em ${animal.data_formatada || animal.data}</div>
                </div>
                <div class="action-buttons">
                    ${showEdit ? `
                        <button class="btn btn-secondary" onclick="editarAnimal(${animal.id})">✏️ Editar</button>
                        <button class="btn btn-danger" onclick="deletarAnimal(${animal.id})">🗑️ Remover</button>
                    ` : ''}
                </div>
            </div>

            <div class="detail-content">
                <!-- INFORMAÇÕES BÁSICAS -->
                <div class="detail-section">
                    <div class="section-title">📝 Informações Básicas</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Espécie</div>
                            <div class="info-value">${animal.especie}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Raça</div>
                            <div class="info-value">${animal.raca}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Porte</div>
                            <div class="info-value">${animal.porte}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <span class="badge ${statusClass}" id="statusBadge" style="margin-top: 0;">● ${animal.status || 'Disponível'}</span>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Idade</div>
                            <div class="info-value">${animal.idade_formatada || (animal.idade + ' ' + (animal.idade == 1 ? 'ano' : 'anos'))}</div>
                        </div>
                    </div>
                </div>

                <!-- SAÚDE -->
                <div class="detail-section">
                    <div class="section-title">💉 Saúde</div>
                    <div class="info-item">
                        <div class="info-label">Estado de Saúde</div>
                        <div class="info-value">${animal.saude || 'Sem informações'}</div>
                    </div>
                </div>

                <!-- PERSONALIDADE -->
                <div class="detail-section">
                    <div class="section-title">🎭 Traços de Personalidade</div>
                    <div id="personalidadeDetailPanel" style="margin-bottom: 15px;"></div>
                </div>

                <!-- PRÓXIMAS TAREFAS -->
                <div class="detail-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="section-title" style="margin: 0;">📋 Próximas Tarefas</div>
                        <button class="btn-add-task-icon" onclick="abrirModalTarefaComAnimal(${animal.id}, '${animal.nome}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 5.6 25 12.5 25C19.4 25 25 19.4 25 12.5C25 5.6 19.4 0 12.5 0ZM17.5 13.75H13.75V17.5C13.75 18.1875 13.1875 18.75 12.5 18.75C11.8125 18.75 11.25 18.1875 11.25 17.5V13.75H7.5C6.8125 13.75 6.25 13.1875 6.25 12.5C6.25 11.8125 6.8125 11.25 7.5 11.25H11.25V7.5C11.25 6.8125 11.8125 6.25 12.5 6.25C13.1875 6.25 13.75 6.8125 13.75 7.5V11.25H17.5C18.1875 11.25 18.75 11.8125 18.75 12.5C18.75 13.1875 18.1875 13.75 17.5 13.75Z" fill="#707FDD"/>
                            </svg>
                        </button>
                    </div>
                    <div id="proximasTarefasDetailPanel" style="min-height: 150px;">
                        <div style="text-align: center; padding: 30px 20px; color: #999;">
                            <div style="font-size: 20px; margin-bottom: 8px;">⏳</div>
                            <div style="font-size: 13px;">Carregando tarefas...</div>
                        </div>
                    </div>
                </div>

                <!-- POTENCIAIS ADOTANTES -->
                <div class="detail-section">
                    <div class="section-title">👥 Potenciais Adotantes</div>
                    <div id="potenciaisAdotantesDetailPanel" style="min-height: 100px;">
                        <div style="text-align: center; padding: 30px 20px; color: #999;">
                            <div style="font-size: 20px; margin-bottom: 8px;">⏳</div>
                            <div style="font-size: 13px;">Carregando adotantes compatíveis...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza tags de personalidade
     */
    static renderPersonalidade(animal, containerId) {
        const container = document.getElementById('personalidadeDetailPanel');
        if (!container) return;

        // Renderizar tags (do servidor)
        let tagsHTML = '<div style="color: #999; font-size: 13px;">Nenhuma tag definida</div>';
        if (animal.tags && animal.tags.length > 0) {
            tagsHTML = animal.tags
                .map(tag => `<span style="display: inline-block; background: rgba(112, 127, 221, 0.7); color: white; padding: 8px 16px; border-radius: 20px; margin: 4px 8px; font-size: 14px; font-weight: 600;">${tag.emoji} ${tag.name}</span>`)
                .join('');
        }

        container.innerHTML = tagsHTML;
    }

    /**
     * Renderiza próximas tarefas
     */
    static renderTarefas(animalId, containerId, showFullPage = false) {
        const container = document.getElementById('proximasTarefasDetailPanel');
        if (!container) return;

        fetch(`/api/proximas-tarefas?animal_id=${animalId}`)
            .then(response => response.json())
            .then(tarefas => {
                if (tarefas.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: #999;">
                            <div style="font-size: 20px; margin-bottom: 8px;">✓</div>
                            <div style="font-size: 13px;">Nenhuma tarefa cadastrada</div>
                        </div>
                    `;
                } else {
                    let html = '';
                    tarefas.forEach(tarefa => {
                        const icon = TAREFA_ICON_MAP[tarefa.tarefa] || '📌';
                        const urgentClass = tarefa.contagem.urgente ? 'style="background: #fff3cd; border-left-color: #ffc107;"' : '';

                        let badgeStyle = 'background: #d1ecf1; color: #0c5460;';
                        if (tarefa.contagem.status === 'urgente' || tarefa.contagem.status === 'atrasado' || tarefa.contagem.status === 'hoje') {
                            badgeStyle = 'background: #f8d7da; color: #721c24;';
                        } else if (tarefa.contagem.status === 'proximo') {
                            badgeStyle = 'background: #d4edda; color: #155724;';
                        }

                        html += `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #27ae60; margin-bottom: 8px;" ${urgentClass}>
                                <div style="font-size: 24px; min-width: 30px; text-align: center;">${icon}</div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; color: #2c3e50; font-size: 14px;">${tarefa.tarefa}</div>
                                    <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Responsável: ${tarefa.responsavel}</div>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 120px;">
                                    <span style="display: inline-block; padding: 3px 6px; border-radius: 10px; font-size: 11px; font-weight: 600; white-space: nowrap; ${badgeStyle}">${tarefa.contagem.mensagem}</span>
                                    <span style="font-size: 11px; color: #7f8c8d;">${tarefa.data}</span>
                                </div>
                            </div>
                        `;
                    });
                    container.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar tarefas:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #999;">
                        <div style="font-size: 20px; margin-bottom: 8px;">⚠️</div>
                        <div style="font-size: 13px;">Erro ao carregar tarefas</div>
                    </div>
                `;
            });
    }

    /**
     * Renderiza potenciais adotantes compatíveis
     */
    static renderAdotantes(animalId, containerId) {
        const container = document.getElementById('potenciaisAdotantesDetailPanel');
        if (!container) return;

        fetch(`/api/matching/animal/${animalId}`)
            .then(response => response.json())
            .then(matches => {
                // Filtrar apenas top 3 com score >= 70%
                const topMatches = matches
                    .filter(m => m.compatibility.score >= 70)
                    .sort((a, b) => b.compatibility.score - a.compatibility.score)
                    .slice(0, 3);

                if (topMatches.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: #999;">
                            <div style="font-size: 20px; margin-bottom: 8px;">🔍</div>
                            <div style="font-size: 13px;">Nenhum adotante compatível encontrado</div>
                        </div>
                    `;
                } else {
                    let html = '';
                    topMatches.forEach((match, index) => {
                        const adotante = match.adotante;
                        const compatibility = match.compatibility;
                        const compatLevel = this.getCompatibilityLevelLabel(compatibility.score);
                        const compatColor = this.getCompatibilityColor(compatibility.score);

                        html += `
                            <div style="padding: 12px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid ${compatColor};">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 600; color: #2c3e50; font-size: 14px;">${adotante.nome}</div>
                                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">
                                            ${adotante.idade || '?'} anos • ${adotante.localizacao || 'Não informado'}
                                        </div>
                                    </div>
                                    <div style="text-align: right; flex-shrink: 0;">
                                        <div style="font-size: 18px; font-weight: 700; color: ${compatColor};">${compatibility.score}%</div>
                                        <div style="font-size: 10px; color: #999; font-weight: 600; text-transform: uppercase;">${compatLevel}</div>
                                    </div>
                                </div>
                                <div style="margin-top: 8px; display: flex; gap: 8px;">
                                    <a href="/adotantes/${adotante.id}/matches" style="flex: 1; display: inline-block; padding: 6px 8px; background: white; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; color: #4a90e2; text-decoration: none; text-align: center; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#4a90e2'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#4a90e2';">
                                        Ver Perfil
                                    </a>
                                </div>
                            </div>
                        `;
                    });
                    container.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar adotantes compatíveis:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #999;">
                        <div style="font-size: 20px; margin-bottom: 8px;">⚠️</div>
                        <div style="font-size: 13px;">Erro ao carregar adotantes</div>
                    </div>
                `;
            });
    }

    /**
     * Obtém label de compatibilidade
     */
    static getCompatibilityLevelLabel(score) {
        if (score >= 80) return 'Excelente';
        if (score >= 65) return 'Bom';
        if (score >= 50) return 'Moderado';
        return 'Baixo';
    }

    /**
     * Obtém cor de compatibilidade
     */
    static getCompatibilityColor(score) {
        if (score >= 80) return '#27ae60';
        if (score >= 65) return '#3498db';
        if (score >= 50) return '#f39c12';
        return '#e74c3c';
    }

    /**
     * Determina classe CSS do status
     */
    static getStatusClass(status) {
        if (status === 'Em Processo') return 'badge-process';
        if (status === 'Em Tratamento') return 'badge-treatment';
        return 'badge-available';
    }

    /**
     * Parse personalidade JSON
     */
    static parsePersonalidade(comportamentoStr) {
        if (!comportamentoStr) return {};

        try {
            if (typeof comportamentoStr === 'string') {
                return JSON.parse(comportamentoStr);
            }
            return comportamentoStr;
        } catch (e) {
            console.error('Erro ao fazer parse da personalidade:', e);
            return {};
        }
    }

}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalDetailPanel;
}
