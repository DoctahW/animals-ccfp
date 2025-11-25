import sqlite3
import json
from datetime import datetime

BANCO = "amigo.db"

# Definição das combinações de personalidade (usando side names, não trait keys)
PERSONALITY_COMBINATIONS = [
    { 'traits': ['brincalhao', 'energetico'], 'tag': 'Hiperativo', 'emoji': '⚡' },
    { 'traits': ['brincalhao', 'sociavel'], 'tag': 'Animador', 'emoji': '🎉' },
    { 'traits': ['brincalhao', 'corajoso'], 'tag': 'Aventureiro', 'emoji': '🧗' },
    { 'traits': ['afetuoso', 'sociavel'], 'tag': 'Companheiro', 'emoji': '🤝' },
    { 'traits': ['afetuoso', 'obediente'], 'tag': 'Devoto', 'emoji': '💕' },
    { 'traits': ['afetuoso', 'medroso'], 'tag': 'Carente', 'emoji': '🥺' },
    { 'traits': ['energetico', 'corajoso'], 'tag': 'Atlético', 'emoji': '🏃' },
    { 'traits': ['energetico', 'teimoso'], 'tag': 'Rebelde', 'emoji': '🔥' },
    { 'traits': ['corajoso', 'obediente'], 'tag': 'Guardião', 'emoji': '🛡️' },
    { 'traits': ['corajoso', 'independente'], 'tag': 'Caçador', 'emoji': '🎯' },
    { 'traits': ['sério', 'independente'], 'tag': 'Reservado', 'emoji': '🧐' },
    { 'traits': ['sério', 'obediente'], 'tag': 'Disciplinado', 'emoji': '📚' },
    { 'traits': ['preguiçoso', 'afetuoso'], 'tag': 'Soneca', 'emoji': '😴' },
    { 'traits': ['preguiçoso', 'sociavel'], 'tag': 'Relaxado', 'emoji': '😎' },
    { 'traits': ['medroso', 'sociavel'], 'tag': 'Tímido', 'emoji': '🙈' },
    { 'traits': ['medroso', 'solitario'], 'tag': 'Arredio', 'emoji': '🦁' },
    { 'traits': ['teimoso', 'independente'], 'tag': 'Indomável', 'emoji': '👑' },
    { 'traits': ['teimoso', 'energetico'], 'tag': 'Travesso', 'emoji': '😈' },
    { 'traits': ['solitario', 'sério'], 'tag': 'Misterioso', 'emoji': '🌙' },
    { 'traits': ['independente', 'corajoso'], 'tag': 'Alfa', 'emoji': '🐺' }
]

SIDE_TO_TRAIT = {
    'brincalhao': 'brincalhao',
    'sério': 'brincalhao',
    'afetuoso': 'afetuoso',
    'independente': 'afetuoso',
    'energetico': 'energetico',
    'preguiçoso': 'energetico',
    'corajoso': 'corajoso',
    'medroso': 'corajoso',
    'obediente': 'obediente',
    'teimoso': 'obediente',
    'sociavel': 'sociavel',
    'solitario': 'sociavel'
}

TRAIT_SIDES = {
    'brincalhao': {'left': 'brincalhao', 'right': 'sério'},
    'afetuoso': {'left': 'afetuoso', 'right': 'independente'},
    'energetico': {'left': 'energetico', 'right': 'preguiçoso'},
    'corajoso': {'left': 'corajoso', 'right': 'medroso'},
    'obediente': {'left': 'obediente', 'right': 'teimoso'},
    'sociavel': {'left': 'sociavel', 'right': 'solitario'}
}

# Helper functions para parsear comportamento/personalidade
def parsear_comportamento(comportamento_str):
    """Converte string JSON em dicionário de personalidade"""
    if not comportamento_str:
        return {}

    try:
        return json.loads(comportamento_str)
    except (json.JSONDecodeError, TypeError):
        return {}

def determina_lado_traco(valor, trait_key):
    """Determina qual lado de um traço o animal se alinha (0-100)"""
    if valor > 50:
        return TRAIT_SIDES[trait_key]['left']
    elif valor < 50:
        return TRAIT_SIDES[trait_key]['right']
    return None  # Valor neutro (50)

def gerar_tags_personalidade(comportamento_str):
    """Gera tags baseado nos traços de personalidade"""
    personalidade = parsear_comportamento(comportamento_str)

    if not personalidade:
        return []

    # Mapear cada traço para seu lado
    lados_ativos = {}
    for trait_key, valor in personalidade.items():
        if trait_key in TRAIT_SIDES:
            lado = determina_lado_traco(valor, trait_key)
            if lado:
                lados_ativos[trait_key] = lado

    # Encontrar combinações que batem
    tags = []
    for combo in PERSONALITY_COMBINATIONS:
        side1, side2 = combo['traits']

        # Converter nome do lado para chave do traço
        trait_key1 = SIDE_TO_TRAIT.get(side1)
        trait_key2 = SIDE_TO_TRAIT.get(side2)

        # Verificar se ambos os traços têm um lado definido
        if trait_key1 and trait_key2 and trait_key1 in lados_ativos and trait_key2 in lados_ativos:
            lado1 = lados_ativos[trait_key1].lower()
            lado2 = lados_ativos[trait_key2].lower()
            norm_side1 = side1.lower()
            norm_side2 = side2.lower()

            # Verificar se os lados batem (qualquer ordem)
            if (norm_side1 == lado1 and norm_side2 == lado2) or \
               (norm_side1 == lado2 and norm_side2 == lado1):
                tags.append({
                    'name': combo['tag'],
                    'emoji': combo['emoji']
                })

    return tags

def preparar_animal_dict(animal_dict):
    """Prepara dicionário de animal parseando comportamento e tags como JSON"""
    if isinstance(animal_dict, dict):
        if 'comportamento' in animal_dict and animal_dict['comportamento']:
            animal_dict['personalidade'] = parsear_comportamento(animal_dict['comportamento'])
        else:
            animal_dict['personalidade'] = {}

        # Parse tags se existirem (mas só se ainda forem string JSON)
        if 'tags' in animal_dict and animal_dict['tags']:
            try:
                # Se já é um list, não fazer parse novamente
                if isinstance(animal_dict['tags'], list):
                    pass  # Já está parseado
                else:
                    # Se é string, fazer parse
                    animal_dict['tags'] = json.loads(animal_dict['tags'])
            except (json.JSONDecodeError, TypeError):
                animal_dict['tags'] = []
        else:
            animal_dict['tags'] = []

    return animal_dict


def preparar_animal_para_api(animal_dict):
    """Prepara animal com campos formatados para API"""
    if not isinstance(animal_dict, dict):
        return animal_dict

    # Preparar dados básicos
    animal_dict = preparar_animal_dict(animal_dict)

    # Adicionar campos formatados
    # Formatação de idade
    idade = animal_dict.get('idade', 0)
    animal_dict['idade_formatada'] = f"{idade} ano{'s' if idade != 1 else ''}"

    # Formatação de data (assumindo formato YYYY-MM-DD no banco)
    try:
        data_str = animal_dict.get('data', '')
        if data_str:
            data_obj = datetime.strptime(data_str, '%Y-%m-%d')
            animal_dict['data_formatada'] = data_obj.strftime('%d/%m/%Y')
            animal_dict['data_legivel'] = data_obj.strftime('%d de %B de %Y')
    except (ValueError, AttributeError):
        animal_dict['data_formatada'] = animal_dict.get('data', '')
        animal_dict['data_legivel'] = animal_dict.get('data', '')

    # Descrição da personalidade (sumarizado)
    personalidade = animal_dict.get('personalidade', {})
    if personalidade:
        lados_ativos = []
        for trait_key, valor in personalidade.items():
            if trait_key in TRAIT_SIDES:
                lado = determina_lado_traco(valor, trait_key)
                if lado:
                    lados_ativos.append(lado)
        animal_dict['personalidade_descritiva'] = ', '.join(lados_ativos) if lados_ativos else 'Não definida'
    else:
        animal_dict['personalidade_descritiva'] = 'Não definida'

    return animal_dict


def criar_tabela():
    #Criar tabela de animais se não existir e adicionar coluna status e tags se necessário
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS animais
            (id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            idade INTEGER,
            raca TEXT,
            especie TEXT,
            saude TEXT,
            comportamento TEXT,
            data TEXT,
            status TEXT DEFAULT 'Disponível',
            tags TEXT)
                """)
    conn.commit()

    # Verificar quais colunas existem e adicionar as faltantes
    cur.execute("PRAGMA table_info(animais)")
    colunas = [coluna[1] for coluna in cur.fetchall()]

    if 'status' not in colunas:
        try:
            cur.execute("ALTER TABLE animais ADD COLUMN status TEXT DEFAULT 'Disponível'")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    if 'tags' not in colunas:
        try:
            cur.execute("ALTER TABLE animais ADD COLUMN tags TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    conn.close()


def adicionar_animal(nome, idade, raca, especie, saude, comportamento, data, status='Disponível'):
    #Adicionar novo animal ao banco
    # Gerar tags baseado no comportamento
    tags = gerar_tags_personalidade(comportamento)
    tags_json = json.dumps(tags)

    conn = sqlite3.connect(BANCO)
    conn.execute(
        "INSERT INTO animais(nome, idade, raca, especie, saude, comportamento, data, status, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (nome, idade, raca, especie, saude, comportamento, data, status, tags_json)
    )
    conn.commit()
    conn.close()


def ler_animais():
    #Retorna lista com todos os animais
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM animais")
    linhas = cur.fetchall()
    animais = []
    for row in linhas:
        animal_dict = dict(row)
        animal_dict = preparar_animal_dict(animal_dict)
        animais.append(animal_dict)
    conn.close()
    return animais


def remover_animal(animal_id):
    #Remove animal por ID
    conn = sqlite3.connect(BANCO)
    conn.execute("DELETE FROM animais WHERE id = ?", (animal_id,))
    conn.commit()
    conn.close()


def editar_animal(animal_id, nome, idade, raca, especie, saude, comportamento, data, status='Disponível'):
    #Edita dados de um animal
    # Gerar tags baseado no comportamento
    tags = gerar_tags_personalidade(comportamento)
    tags_json = json.dumps(tags)

    conn = sqlite3.connect(BANCO)
    conn.execute(
        "UPDATE animais SET nome=?, idade=?, raca=?, especie=?, saude=?, comportamento=?, data=?, status=?, tags=? WHERE id=?",
        (nome, idade, raca, especie, saude, comportamento, data, status, tags_json, animal_id)
    )
    conn.commit()
    conn.close()


def ler_animal_id(animal_id):
    #Retorna um animal específico por ID
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM animais WHERE id = ?", (animal_id,))
    animal = cur.fetchone()
    conn.close()
    if animal:
        animal_dict = dict(animal)
        animal_dict = preparar_animal_dict(animal_dict)
        return animal_dict
    return None