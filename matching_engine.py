"""
matching_engine.py - Algoritmo de compatibilidade entre adotantes e animais
"""

import json
from adotantes_crud import ler_adotante_id, preparar_adotante_para_api
from animal_crud import ler_animal_id, preparar_animal_para_api

def calcular_compatibilidade(animal_id, adotante_id):

    # Validação de entrada
    if not animal_id or not adotante_id:
        return None

    try:
        animal = ler_animal_id(animal_id)
        adotante = ler_adotante_id(adotante_id)
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return None

    if not animal or not adotante:
        return None

    # Validar dados essenciais do animal
    if not isinstance(animal.get('personalidade'), dict):
        animal['personalidade'] = {
            'brincalhao': 50, 'afetuoso': 50, 'energetico': 50,
            'corajoso': 50, 'obediente': 50, 'sociavel': 50
        }

    # Validar tags do animal
    if not isinstance(animal.get('tags'), list):
        animal['tags'] = []


    trait_score_avg, trait_scores_individual = calcular_score_tracos(animal, adotante)
    moradia_score = calcular_score_moradia(animal, adotante)
    rotina_score = calcular_score_rotina(animal, adotante)
    preferencias_score = calcular_score_preferencias(animal, adotante)

    if adotante.get('tem_preferencia_tracos'):
        W_TRACOS = 0.10
        W_MORADIA = 0.30
        W_ROTINA = 0.20
        W_PREFERENCIAS = 0.40
    else:
        W_TRACOS = 0.0
        W_MORADIA = 0.50
        W_ROTINA = 0.30
        W_PREFERENCIAS = 0.20
        trait_score_avg = 0
        trait_scores_individual = {t: 0 for t in trait_scores_individual}

    # 3. SCORE FINAL com pesos dinâmicos
    base_score = (
        (trait_score_avg * W_TRACOS) +
        (moradia_score * W_MORADIA) +
        (rotina_score * W_ROTINA) +
        (preferencias_score * W_PREFERENCIAS)
    )
    final_score = min(base_score, 100)

    level = classificar_compatibilidade(final_score)

    return {
        'score': round(final_score, 1),
        'level': level,
        'trait_scores': {
            'brincalhao': round(trait_scores_individual.get('brincalhao', 0), 1),
            'afetuoso': round(trait_scores_individual.get('afetuoso', 0), 1),
            'energetico': round(trait_scores_individual.get('energetico', 0), 1),
            'corajoso': round(trait_scores_individual.get('corajoso', 0), 1),
            'obediente': round(trait_scores_individual.get('obediente', 0), 1),
            'sociavel': round(trait_scores_individual.get('sociavel', 0), 1)
        },
        'moradia_score': round(moradia_score, 1),
        'rotina_score': round(rotina_score, 1),
        'preferencias_score': round(preferencias_score, 1),
        'animal': animal,
        'adotante': adotante
    }


def calcular_score_tracos(animal, adotante):
    personalidade_animal = animal.get('personalidade', {})
    tracos_preferidos_str = adotante.get('tracos_preferidos')

    # Se adotante não definiu preferências, usar neutra (50 em tudo)
    if tracos_preferidos_str:
        try:
            if isinstance(tracos_preferidos_str, str):
                tracos_preferidos = json.loads(tracos_preferidos_str)
            else:
                tracos_preferidos = tracos_preferidos_str
        except (json.JSONDecodeError, TypeError):
            tracos_preferidos = {t: 50 for t in ['brincalhao', 'afetuoso', 'energetico', 'corajoso', 'obediente', 'sociavel']}
    else:
        tracos_preferidos = {t: 50 for t in ['brincalhao', 'afetuoso', 'energetico', 'corajoso', 'obediente', 'sociavel']}

    trait_list = ['brincalhao', 'afetuoso', 'energetico', 'corajoso', 'obediente', 'sociavel']
    total_score = 0
    individual_scores = {}

    for trait in trait_list:
        animal_value = personalidade_animal.get(trait, 50)
        adotante_value = tracos_preferidos.get(trait, 50)

        diferenca = abs(animal_value - adotante_value)
        trait_score = 100 - diferenca
        total_score += trait_score
        individual_scores[trait] = trait_score

    # Média dos 6 traços
    avg_score = total_score / len(trait_list)
    return avg_score, individual_scores


def calcular_score_moradia(animal, adotante):


    score = 50

    # Validações
    tamanho_moradia = str(adotante.get('tamanho_moradia', '')).lower()
    tem_quintal = bool(adotante.get('tem_quintal', False))
    nivel_atividade = str(adotante.get('nivel_atividade', '')).lower()

    # Se adotante tem espaço pequeno e animal é muito ativo = menos compatível
    personalidade_animal = animal.get('personalidade', {})
    if not isinstance(personalidade_animal, dict):
        personalidade_animal = {}

    energetico = int(personalidade_animal.get('energetico', 50))
    energetico = max(0, min(energetico, 100))

    if energetico >= 75:
        if tamanho_moradia == 'grande':
            score += 25  # Perfeito
        elif tamanho_moradia == 'médio':
            score += 10  # Okay
        elif tamanho_moradia == 'pequeno':
            score -= 20  # Problemático

    # Animais preguiçosos se adaptam bem a qualquer espaço
    if energetico <= 25:
        score += 15

    # Quintal ajuda muito para animais ativos
    if tem_quintal and energetico >= 60:
        score += 10

    return max(0, min(score, 100))


def calcular_score_rotina(animal, adotante):
    score = 50

    try:
        horas_sozinho = int(adotante.get('horas_sozinho_dia', 0))
        horas_sozinho = max(0, min(horas_sozinho, 24))
    except (ValueError, TypeError):
        horas_sozinho = 0

    viagens_frequentes = bool(adotante.get('viagens_frequentes', False))

    personalidade_animal = animal.get('personalidade', {})
    if not isinstance(personalidade_animal, dict):
        personalidade_animal = {}

    afetuoso = int(personalidade_animal.get('afetuoso', 50))
    sociavel = int(personalidade_animal.get('sociavel', 50))
    afetuoso = max(0, min(afetuoso, 100))
    sociavel = max(0, min(sociavel, 100))

    independencia = (100 - afetuoso + 100 - sociavel) / 2

    # Independência para calcula tolerância a ficar sozinho
    # Animais independentes (independencia >= 60) toleram melhor solidão
    if independencia >= 70:
        if horas_sozinho >= 6:
            score += 25
        else:
            score += 10
    elif independencia >= 50:
        # Moderadamente independente
        if horas_sozinho <= 6:
            score += 15
        elif horas_sozinho >= 8:
            score -= 10
    else:
        if horas_sozinho <= 2:
            score += 25
        elif horas_sozinho <= 4:
            score += 10
        elif horas_sozinho >= 8:
            score -= 30

    # Viagens frequentes ajusta baseado em independencia
    if viagens_frequentes:
        if independencia >= 60:
            score += 10
        else:
            score -= 20

    # Pra não dar Overflow
    return max(0, min(score, 100))


def calcular_score_preferencias(animal, adotante):
    # Score não tem como perder so ganha
    score = 0
    max_possivel = 0

    tamanho_preferido = str(adotante.get('tamanho_preferido') or '').lower()
    idade_preferida = str(adotante.get('idade_preferida') or '').lower()
    genero_preferido = str(adotante.get('genero_preferido') or '').lower()


    animal_porte = animal.get('porte', '').lower()
    if tamanho_preferido and animal_porte:
        max_possivel += 25
        if tamanho_preferido == animal_porte:
            score += 25 
        elif tamanho_preferido in ['pequeno', 'pequeno'] and animal_porte == 'médio':
            score += 12 
        elif tamanho_preferido == 'grande' and animal_porte == 'médio':
            score += 12 



    animal_idade = animal.get('idade', 0)
    if idade_preferida:
        max_possivel += 15
        if idade_preferida == 'filhote' and animal_idade <= 1:
            score += 15
        elif idade_preferida == 'jovem' and 1 < animal_idade <= 3:
            score += 15
        elif idade_preferida == 'adulto' and 3 < animal_idade <= 7:
            score += 15
        elif idade_preferida == 'idoso' and animal_idade > 7:
            score += 15
        else:
            score += 5

    # 3. GÊNERO (peso: 10 pontos máx)
    if genero_preferido and genero_preferido != 'sem_preferência':
        max_possivel += 10
        score += 5

    tags_ideais = adotante.get('tags_ideais', [])
    tags_animal = animal.get('tags', [])

    if tags_ideais and tags_animal:
        max_possivel += 30
        tags_animal_names = [t.get('name') for t in tags_animal]

        matching_tags = len(set(tags_ideais) & set(tags_animal_names))
        total_tags_ideais = len(tags_ideais)

        if total_tags_ideais > 0:
            match_ratio = matching_tags / total_tags_ideais
            score += match_ratio * 30


    experiencia = adotante.get('experiencia_previa')
    tags_dificeis = {'Arredio', 'Rebelde', 'Medroso', 'Indomável'}
    tags_animal_set = set(t.get('name') for t in tags_animal)

    tem_caracteristicas_dificeis = bool(tags_dificeis.intersection(tags_animal_set))

    if experiencia:
        max_possivel += 20
        if tem_caracteristicas_dificeis:
            if experiencia == 'muita':
                score += 20
            elif experiencia == 'média':
                score += 10
            elif experiencia == 'pouca':
                score += 0
            else:  # 'nenhuma'
                score += 0
        else:
            score += 15

    if max_possivel > 0:
        final_score = (score / max_possivel) * 100
    else:
        final_score = 50

    return max(0, min(final_score, 100))


def classificar_compatibilidade(score):
    if score >= 80:
        return "Excelente Compatibilidade ✅"
    elif score >= 65:
        return "Boa Compatibilidade ✔️"
    elif score >= 50:
        return "Compatibilidade Moderada ⚠️"
    else:
        return "Baixa Compatibilidade ❌"


def obter_matches_adotante(adotante_id, min_score=50):
    from animal_crud import ler_animais

    adotante = ler_adotante_id(adotante_id)
    if not adotante:
        return []

    animais = ler_animais()
    matches = []

    for animal in animais:
        # Apenas animais disponíveis
        if animal.get('status') != 'Disponível':
            continue

        compat = calcular_compatibilidade(animal['id'], adotante_id)
        if compat and compat['score'] >= min_score:
            matches.append({
                'animal': animal,
                'compatibility': compat
            })

    # Ordenar por score descendente
    matches.sort(key=lambda x: x['compatibility']['score'], reverse=True)
    return matches


def obter_matches_animal(animal_id, min_score=50):
    from adotantes_crud import ler_adotantes

    animal = ler_animal_id(animal_id)
    if not animal:
        return []

    adotantes = ler_adotantes()
    matches = []

    for adotante in adotantes:
        compat = calcular_compatibilidade(animal_id, adotante['id'])
        if compat and compat['score'] >= min_score:
            matches.append({
                'adotante': adotante,
                'compatibility': compat
            })

    # Ordenar por score descendente
    matches.sort(key=lambda x: x['compatibility']['score'], reverse=True)
    return matches
