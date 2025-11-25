/**
 * AnimalMatchCard.js
 * Componente para renderizar card de animal com score de compatibilidade
 */

/**
 * Cria um card HTML para um animal com informações de compatibilidade
 * @param {Object} match - Objeto contendo {animal, compatibility}
 * @returns {HTMLElement} Card do animal
 */
function createAnimalMatchCard(match) {
    const { animal, compatibility } = match;
    const compatibilityLevel = getCompatibilityLevel(compatibility.score);
    const compatibilityColor = getCompatibilityColor(compatibility.score);

    // Container principal
    const card = document.createElement('div');
    card.className = `match-card ${compatibilityLevel}`;
    card.dataset.compatibilityScore = compatibility.score;
    card.dataset.animalId = animal.id;

    // HTML do card
    card.innerHTML = `
        <div class="match-card-header">
            <div class="animal-photo" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <span class="animal-emoji">
                    ${animal.especie.toLowerCase() === 'cachorro' || animal.especie.toLowerCase() === 'cão' ? '🐕' : '🐱'}
                </span>
            </div>
            <div class="animal-basic-info">
                <h4 class="animal-name">${animal.nome}</h4>
                <p class="animal-breed">${animal.raca} • ${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'}</p>
                <p class="animal-species">${animal.especie}</p>
            </div>
            <div class="compatibility-score ${compatibilityColor}">
                <div class="score-value">${compatibility.score}%</div>
                <div class="score-label">${compatibilityLevel}</div>
            </div>
        </div>

        <div class="match-card-details">
            <div class="score-breakdown">
                <div class="score-item">
                    <span class="score-label">Traços</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${compatibility.trait_scores.average}%"></div>
                    </div>
                    <span class="score-value">${compatibility.trait_scores.average}%</span>
                </div>
                <div class="score-item">
                    <span class="score-label">Moradia</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${compatibility.moradia_score}%"></div>
                    </div>
                    <span class="score-value">${compatibility.moradia_score}%</span>
                </div>
                <div class="score-item">
                    <span class="score-label">Rotina</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${compatibility.rotina_score}%"></div>
                    </div>
                    <span class="score-value">${compatibility.rotina_score}%</span>
                </div>
                <div class="score-item">
                    <span class="score-label">Preferências</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${compatibility.preferencias_score}%"></div>
                    </div>
                    <span class="score-value">${compatibility.preferencias_score}%</span>
                </div>
            </div>

            <div class="match-actions">
                <button class="btn btn-secondary btn-small" onclick="openAnimalDetailsModal(${animal.id})">
                    Ver Detalhes
                </button>
                <button class="btn btn-primary btn-small" onclick="adoptAnimal(${animal.id})">
                    Expressar Interesse
                </button>
            </div>
        </div>
    `;

    // Event listener para click no card (abre modal)
    card.querySelector('.animal-photo').addEventListener('click', function(e) {
        e.stopPropagation();
        openAnimalDetailsModal(animal.id);
    });

    return card;
}

/**
 * Obtém o nível de compatibilidade baseado no score
 * @param {number} score - Score de compatibilidade (0-100)
 * @returns {string} Nível em português
 */
function getCompatibilityLevel(score) {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 65) return 'BOM';
    if (score >= 50) return 'MODERADO';
    return 'BAIXO';
}

/**
 * Obtém a cor para o score de compatibilidade
 * @param {number} score - Score de compatibilidade (0-100)
 * @returns {string} Classe de cor
 */
function getCompatibilityColor(score) {
    if (score >= 80) return 'color-excellent';
    if (score >= 65) return 'color-good';
    if (score >= 50) return 'color-moderate';
    return 'color-low';
}

/**
 * Abre modal com detalhes do animal
 * @param {number} animalId - ID do animal
 */
async function openAnimalDetailsModal(animalId) {
    try {
        // Buscar dados do animal
        const response = await fetch(`/api/animals/${animalId}`);
        if (!response.ok) throw new Error('Animal não encontrado');
        const animal = await response.json();

        // Renderizar detalhes
        const content = document.getElementById('animalDetailContent');
        content.innerHTML = `
            <div class="animal-detail-view">
                <div class="detail-photo" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <span class="emoji-large">
                        ${animal.especie.toLowerCase() === 'cachorro' || animal.especie.toLowerCase() === 'cão' ? '🐕' : '🐱'}
                    </span>
                </div>
                <div class="detail-info">
                    <h3>${animal.nome}</h3>
                    <p class="detail-meta">${animal.raca} • ${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'} • ${animal.especie}</p>
                    <p class="detail-status ${animal.status === 'Disponível' ? 'available' : 'unavailable'}">
                        ● ${animal.status}
                    </p>
                    <p class="detail-health">Saúde: ${animal.saude || 'Não informado'}</p>

                    <div class="detail-traits">
                        <h4>Traços de Personalidade:</h4>
                        <div class="traits-grid">
                            ${renderPersonalityTraits(animal.personalidade)}
                        </div>
                    </div>

                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="adoptAnimal(${animal.id})">
                            Expressar Interesse
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal('animalDetailModal')">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Abrir modal
        openModal('animalDetailModal');
    } catch (error) {
        console.error('Erro ao carregar detalhes do animal:', error);
        alert('Erro ao carregar detalhes do animal');
    }
}

/**
 * Renderiza traços de personalidade
 * @param {Object} personalidade - Objeto com traços
 * @returns {string} HTML dos traços
 */
function renderPersonalityTraits(personalidade) {
    if (!personalidade) return '<p>Sem dados de personalidade</p>';

    const traits = {
        'brincalhao': 'Brincalhão',
        'afetuoso': 'Afetuoso',
        'energetico': 'Energético',
        'corajoso': 'Corajoso',
        'obediente': 'Obediente',
        'sociavel': 'Sociável'
    };

    return Object.entries(traits).map(([key, label]) => {
        const value = personalidade[key] || 0;
        return `
            <div class="trait-item">
                <span class="trait-label">${label}</span>
                <div class="trait-bar">
                    <div class="trait-fill" style="width: ${value}%"></div>
                </div>
                <span class="trait-value">${value}</span>
            </div>
        `;
    }).join('');
}

/**
 * Expressa interesse em adotar um animal
 * @param {number} animalId - ID do animal
 */
function adoptAnimal(animalId) {
    alert(`✓ Interesse registrado para o animal #${animalId}\n\nEm breve você será contatado para próximas etapas!`);
    // Aqui seria feita uma chamada API para registrar o interesse
    closeModal('animalDetailModal');
}
