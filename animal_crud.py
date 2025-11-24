import sqlite3

BANCO = "amigo.db"


def criar_tabela():
    #Criar tabela de animais se não existir e adicionar coluna status se necessário
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
            status TEXT DEFAULT 'Disponível')
                """)
    conn.commit()

    # Verificar se a coluna status existe, senão adicionar
    cur.execute("PRAGMA table_info(animais)")
    colunas = [coluna[1] for coluna in cur.fetchall()]

    if 'status' not in colunas:
        try:
            cur.execute("ALTER TABLE animais ADD COLUMN status TEXT DEFAULT 'Disponível'")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    conn.close()


def adicionar_animal(nome, idade, raca, especie, saude, comportamento, data, status='Disponível'):
    #Adicionar novo animal ao banco
    conn = sqlite3.connect(BANCO)
    conn.execute(
        "INSERT INTO animais(nome, idade, raca, especie, saude, comportamento, data, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (nome, idade, raca, especie, saude, comportamento, data, status)
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
    conn = sqlite3.connect(BANCO)
    conn.execute(
        "UPDATE animais SET nome=?, idade=?, raca=?, especie=?, saude=?, comportamento=?, data=?, status=? WHERE id=?",
        (nome, idade, raca, especie, saude, comportamento, data, status, animal_id)
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
    return dict(animal) if animal else None