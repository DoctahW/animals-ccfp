import sqlite3

BANCO = "amigo.db"

def criar_tabela():
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY,
            animal_id INTEGER NOT NULL,
            nome TEXT,
            tarefa TEXT NOT NULL,
            data TEXT,
            responsavel TEXT,
            FOREIGN KEY (animal_id) REFERENCES animais(id)
        )
    """)
    conn.commit()

    cur.execute("PRAGMA table_info(tarefas)")
    colunas = [coluna[1] for coluna in cur.fetchall()]

    if 'animal_id' not in colunas:
        try:
            cur.execute("ALTER TABLE tarefas ADD COLUMN animal_id INTEGER")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    conn.close()


def adicionar_tarefas(animal_id, tarefa, data, responsavel, nome=None):
    conn = sqlite3.connect(BANCO)
    conn.execute(
        "INSERT INTO tarefas(animal_id, nome, tarefa, data, responsavel) VALUES (?, ?, ?, ?, ?)",
        (animal_id, nome, tarefa, data, responsavel)
    )
    conn.commit()
    conn.close()


def ler_tarefas():
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM tarefas")
    tarefas = []
    linhas = cur.fetchall()
    
    for row in linhas:
        tarefa_dict = dict(row)
        tarefas.append(tarefa_dict)
        
    conn.close()
    return tarefas


def ler_tarefas_por_animal(animal_id):
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    query = "SELECT * FROM tarefas WHERE animal_id = ?"
    cur.execute(query, (animal_id,))
    linhas = cur.fetchall()
    tarefas = []

    for row in linhas:
        tarefa_dict = dict(row)
        tarefas.append(tarefa_dict)

    conn.close()
    return tarefas

def remover_tarefa(tarefa_id):
    conn = sqlite3.connect(BANCO)
    conn.execute("DELETE FROM tarefas WHERE id = ?", (tarefa_id,))
    conn.commit()
    conn.close()

def editar_tarefa(tarefa_id, animal_id, tarefa, data, responsavel, nome=None):
    conn = sqlite3.connect(BANCO)
    conn.execute(
        "UPDATE tarefas SET animal_id=?, nome=?, tarefa=?, data=?, responsavel=? WHERE id=?",
        (animal_id, nome, tarefa, data, responsavel, tarefa_id)
    )
    conn.commit()
    conn.close()

def ler_tarefa_id(tarefa_id):
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM tarefas WHERE id = ?", (tarefa_id,))
    tarefa = cur.fetchone()
    conn.close()
    return dict(tarefa) if tarefa else None

def remover_tarefas_por_animal(animal_id):
    try:
        conn = sqlite3.connect(BANCO)
        cur = conn.cursor()
        query = "DELETE FROM tarefas WHERE animal_id = ?"
        cur.execute(query, (animal_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        mensagem_erro = f"Erro ao remover tarefas do animal {animal_id}: {e}"
        raise Exception(mensagem_erro)

def contar_tarefas_animal(animal_id):
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    query = "SELECT COUNT(*) FROM tarefas WHERE animal_id = ?"
    cur.execute(query, (animal_id,))
    count = cur.fetchone()[0]
    conn.close()
    return count
