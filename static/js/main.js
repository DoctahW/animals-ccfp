/**
 * Main.js - Funcionalidades globais da aplicação
 * Contém funções utilitárias e handlers globais
 */

/**
 * Navega para uma página específica
 * @param {string} path - Caminho da página
 */
function navigateTo(path) {
    window.location.href = path;
}

/**
 * Formata data no padrão DD/MM/YYYY
 * @param {string} dateString - Data em formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

/**
 * Formata para exibir idade de forma legível
 * @param {number} age - Idade em anos
 * @returns {string} Idade formatada
 */
function formatAge(age) {
    if (age === 1) return '1 ano';
    return `${age} anos`;
}

/**
 * Limpa e renderiza lista de animais com filtro
 * @param {Array} animals - Array de animais
 * @param {string} filterType - Tipo de filtro: 'all', 'dog', 'cat', 'available'
 */
function renderAnimalList(animals, filterType = 'all') {
    const listContainer = document.getElementById('animalList');
    if (!listContainer) return;

    let filteredAnimals = animals;

    // Aplicar filtro
    if (filterType !== 'all') {
        filteredAnimals = animals.filter(animal => {
            if (filterType === 'dog') return animal.especie.toLowerCase() === 'cachorro';
            if (filterType === 'cat') return animal.especie.toLowerCase() === 'gato';
            if (filterType === 'available') return animal.status === 'disponível';
            return true;
        });
    }

    // Renderizar lista
    if (filteredAnimals.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🐾</div>
                <div class="empty-text">Nenhum animal encontrado</div>
                <div class="empty-subtext">Tente ajustar os filtros ou adicione um novo animal</div>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filteredAnimals.map(animal => {
        // Determinar classe de status
        let badgeClass = 'badge-available';
        let statusText = 'Disponível';

        if (animal.status === 'Em Processo') {
            badgeClass = 'badge-process';
            statusText = 'Em Processo';
        } else if (animal.status === 'Em Tratamento') {
            badgeClass = 'badge-treatment';
            statusText = 'Em Tratamento';
        }

        return `
        <div class="animal-card" data-animal-id="${animal.id}" data-especie="${animal.especie.toLowerCase()}" onclick="carregarDetalhesAnimal(${animal.id})">
            <div class="animal-card-header">
                <div class="animal-photo" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
                <div class="animal-info">
                    <div class="animal-name">${animal.nome}</div>
                    <div class="animal-details">${animal.raca} • ${formatAge(animal.idade)}</div>
                    <div class="animal-details">${animal.especie}</div>
                </div>
            </div>
            <span class="badge ${badgeClass}">● ${statusText}</span>
        </div>
    `;
    }).join('');
}

/**
 * Busca animais por texto
 * @param {string} searchTerm - Termo de busca
 * @param {Array} animals - Array de animais
 * @returns {Array} Animais filtrados
 */
function searchAnimals(searchTerm, animals) {
    if (!searchTerm.trim()) return animals;

    const term = searchTerm.toLowerCase();
    return animals.filter(animal =>
        animal.nome.toLowerCase().includes(term) ||
        animal.raca.toLowerCase().includes(term) ||
        animal.especie.toLowerCase().includes(term)
    );
}

/**
 * Atribui event listeners aos cards de animais
 */
function attachAnimalCardListeners() {
    document.querySelectorAll('.animal-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            const animalId = this.getAttribute('data-animal-id');
            if (animalId) {
                carregarDetalhesAnimal(animalId);
            }
        });
    });
}


/**
 * Carrega detalhes do animal no painel lateral
 * @param {number} animalId - ID do animal
 */
async function carregarDetalhesAnimal(animalId) {
    try {
        // Buscar dados do animal
        const response = await fetch(`/api/animals/${animalId}`);
        if (!response.ok) throw new Error('Animal não encontrado');

        const animal = await response.json();
        const detailPanel = document.getElementById('detailPanel');

        // Renderizar detalhes
        detailPanel.innerHTML = `
            <div class="detail-header">
                <div class="detail-title">
                    <h2>${animal.nome}</h2>
                    <div class="detail-subtitle">ID: #${animal.id} • Cadastrada em ${animal.data}</div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editarAnimal(${animal.id})">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deletarAnimal(${animal.id})">🗑️ Remover</button>
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
                            <div class="info-label">Idade</div>
                            <div class="info-value">${animal.idade} ${animal.idade == 1 ? 'ano' : 'anos'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <span class="badge" id="statusBadge" style="margin-top: 0;">● ${animal.status || 'Disponível'}</span>
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

                <!-- COMPORTAMENTO -->
                <div class="detail-section">
                    <div class="section-title">🎭 Comportamento</div>
                    <div class="info-item">
                        <div class="info-label">Descrição</div>
                        <div class="info-value" style="line-height: 1.6;">
                            ${animal.comportamento || 'Sem informações'}
                        </div>
                    </div>
                </div>

                <!-- PRÓXIMAS TAREFAS E VACINAÇÕES -->
                <div class="detail-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="section-title" style="margin: 0;">📋 Próximas Tarefas e Vacinações</div>
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
            </div>
        `;

        // Aplicar classe de estilo ao status
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.classList.remove('badge-available', 'badge-process', 'badge-treatment');
            if (animal.status === 'Em Processo') {
                statusBadge.classList.add('badge-process');
            } else if (animal.status === 'Em Tratamento') {
                statusBadge.classList.add('badge-treatment');
            } else {
                statusBadge.classList.add('badge-available');
            }
        }

        // Carregar próximas tarefas do animal
        carregarProximasTarefasDetail(animalId);

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        document.getElementById('detailPanel').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <div class="empty-text">Erro ao carregar detalhes</div>
                <div class="empty-subtext">${error.message}</div>
            </div>
        `;
    }
}

/**
 * Carrega próximas tarefas do animal no detail panel
 * Usa constante TAREFA_ICON_MAP compartilhada
 * @param {number} animalId - ID do animal
 */
function carregarProximasTarefasDetail(animalId) {
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
                    // Usar constante compartilhada ao invés de duplicar iconMap
                    const icon = obterIconeTarefa(tarefa.tarefa);
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
 * Abre modal para editar animal
 * @param {number} animalId - ID do animal
 */
async function editarAnimal(animalId) {
    try {
        // Buscar dados atuais do animal
        const response = await fetch(`/api/animals/${animalId}`);
        if (!response.ok) throw new Error('Animal não encontrado');

        const animal = await response.json();

        // Remover listener anterior se existir
        const form = document.getElementById('editAnimalForm');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Preencher o formulário com os dados atuais APÓS clonar
        document.getElementById('editAnimalId').value = animalId;
        document.getElementById('editNome').value = animal.nome;
        document.getElementById('editEspecie').value = animal.especie;
        document.getElementById('editRaca').value = animal.raca;
        document.getElementById('editIdade').value = animal.idade;
        document.getElementById('editSaude').value = animal.saude || '';
        document.getElementById('editComportamento').value = animal.comportamento || '';
        document.getElementById('editData').value = animal.data;
        document.getElementById('editStatus').value = animal.status || 'Disponível';

        // Abrir o modal
        openModal('editAnimalModal');

        // Adicionar novo listener
        document.getElementById('editAnimalForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const submitButton = this.querySelector('button[type="submit"]');
                setButtonLoading(submitButton, true);

                const editData = {
                    nome: document.getElementById('editNome').value,
                    especie: document.getElementById('editEspecie').value,
                    raca: document.getElementById('editRaca').value,
                    idade: parseInt(document.getElementById('editIdade').value),
                    saude: document.getElementById('editSaude').value,
                    comportamento: document.getElementById('editComportamento').value,
                    data: document.getElementById('editData').value,
                    status: document.getElementById('editStatus').value
                };

                const response = await fetch(`/api/animals/${animalId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editData)
                });

                if (response.ok) {
                    showSuccess('Animal atualizado com sucesso!');
                    closeModal('editAnimalModal');

                    // Recarregar a página após 1.5 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showError('Erro ao atualizar animal');
                    setButtonLoading(submitButton, false);
                }
            } catch (error) {
                console.error('Erro ao atualizar animal:', error);
                showError('Erro ao processar requisição');
                setButtonLoading(this.querySelector('button[type="submit"]'), false);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dados do animal:', error);
        showError('Erro ao abrir formulário de edição');
    }
}

/**
 * Deleta um animal
 * @param {number} animalId - ID do animal
 */
function deletarAnimal(animalId) {
    // Primeiro, contar quantas tarefas o animal tem
    fetch(`/api/animals/${animalId}/tarefas-count`)
        .then(response => response.json())
        .then(data => {
            let mensagem = 'Tem certeza que deseja remover este animal? Esta ação não pode ser desfeita.';

            if (data.count && data.count > 0) {
                mensagem += `\n\n⚠️ Atenção: Este animal tem ${data.count} tarefa${data.count > 1 ? 's' : ''} associada${data.count > 1 ? 's' : ''}.\n`;
                mensagem += `Todas as tarefas serão deletadas junto com o animal.`;
            }

            showConfirmation(
                'Confirmar Exclusão',
                mensagem,
                async function() {
                    try {
                        const response = await fetch(`/api/animals/${animalId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            showSuccess('Animal e suas tarefas removidos com sucesso!');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        } else {
                            showError('Erro ao remover animal');
                        }
                    } catch (error) {
                        showError('Erro ao processar requisição');
                    }
                }
            );
        })
        .catch(error => {
            console.error('Erro ao contar tarefas:', error);
            // Se houver erro ao contar, prosseguir sem aviso
            showConfirmation(
                'Confirmar Exclusão',
                'Tem certeza que deseja remover este animal? Esta ação não pode ser desfeita.',
                async function() {
                    try {
                        const response = await fetch(`/api/animals/${animalId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            showSuccess('Animal removido com sucesso!');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        } else {
                            showError('Erro ao remover animal');
                        }
                    } catch (error) {
                        showError('Erro ao processar requisição');
                    }
                }
            );
        });
}

/**
 * Carrega detalhes de um animal (placeholder - substituído por carregarDetalhesAnimal)
 * @param {number} animalId - ID do animal
 */
function loadAnimalDetails(animalId) {
    console.log('Carregando detalhes do animal:', animalId);
    // Esta função foi substituída por carregarDetalhesAnimal() em main.js
}

/**
 * Mostra notificação de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Mostra notificação de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * Mostra notificação genérica
 * @param {string} message - Mensagem
 * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;

    // Adicionar ao corpo da página
    document.body.appendChild(notification);

    // Posicionar no topo
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';

    // Remover após 4 segundos
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

/**
 * Converte FormData em objeto
 * @param {FormData} formData - FormData do formulário
 * @returns {Object} Objeto com dados do formulário
 */
function formDataToObject(formData) {
    const obj = {};
    for (let [key, value] of formData.entries()) {
        obj[key] = value;
    }
    return obj;
}

/**
 * Faz requisição POST à API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a enviar
 * @returns {Promise} Promessa com resposta
 */
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro ao processar requisição');
        throw error;
    }
}

/**
 * Faz requisição GET à API
 * @param {string} endpoint - Endpoint da API
 * @returns {Promise} Promessa com resposta
 */
async function apiGet(endpoint) {
    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro ao processar requisição');
        throw error;
    }
}

/**
 * Faz requisição DELETE à API
 * @param {string} endpoint - Endpoint da API
 * @returns {Promise} Promessa com resposta
 */
async function apiDelete(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro ao processar requisição');
        throw error;
    }
}

/**
 * Carrega lista de animais no dropdown
 */
function carregarAnimaisNoDropdown() {
    const select = document.getElementById('animalSelect');
    if (!select) return;

    fetch('/api/animals')
        .then(response => response.json())
        .then(animais => {
            if (animais.length === 0) {
                select.innerHTML = '<option value="">Nenhum animal cadastrado</option>';
                select.disabled = true;
            } else {
                select.innerHTML = '<option value="">Selecione um animal...</option>';
                animais.forEach(animal => {
                    const option = document.createElement('option');
                    option.value = animal.nome;
                    option.textContent = `${animal.nome} (${animal.especie} - ${animal.raca})`;
                    select.appendChild(option);
                });
                select.disabled = false;
            }
        })
        .catch(error => {
            console.error('Erro ao carregar animais:', error);
            select.innerHTML = '<option value="">Erro ao carregar animais</option>';
            select.disabled = true;
        });
}

/**
 * Abre o modal de adicionar tarefa com o animal pré-selecionado
 * @param {number} animalId - ID do animal
 * @param {string} animalNome - Nome do animal
 */
function abrirModalTarefaComAnimal(animalId, animalNome) {
    // Abrir o modal
    openModal('addTaskModal');

    // Pré-selecionar o animal no dropdown
    setTimeout(function() {
        const select = document.getElementById('animalSelect');
        if (select) {
            // Se o select ainda não foi populado, aguardar
            if (select.options.length === 1 && select.options[0].value === '') {
                // Carregar animais primeiro
                carregarAnimaisNoDropdown();
                // Aguardar carregamento
                setTimeout(function() {
                    select.value = animalId;
                }, 100);
            } else {
                // Já está carregado, apenas selecionar
                select.value = animalId;
            }
        }
    }, 50);
}

/**
 * Inicializa a aplicação
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação iniciada');
});
