import sqlite3

BANCO = "amigo.db"

def criar_tabela():
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, tarefa TEXT NOT NULL, data TEXT, responsavel TEXT)""")
    conn.commit()
    conn.close()

def adicionar_tarefas(nome, tarefa, data, responsavel):
    conn = sqlite3.connect(BANCO)
    conn.execute("INSERT INTO tarefas(nome, tarefa, data, responsavel) VALUES (?, ?, ?, ?)", (nome, tarefa, data, responsavel))
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

def remover_tarefa(tarefa_id):
    conn = sqlite3.connect(BANCO)
    conn.execute("DELETE FROM tarefas WHERE id = ?", (tarefa_id,))
    conn.commit()
    conn.close()


def editar_tarefa(tarefa_id, nome, tarefa, data, responsavel):
    conn = sqlite3.connect(BANCO)
    conn.execute("UPDATE tarefas SET nome=?, tarefa=?, data=?, responsavel=? WHERE id=?", (nome, tarefa, data, responsavel, tarefa_id))
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

def remover_tarefas_por_animal(nome_animal):
    try:
        conn = sqlite3.connect(BANCO)
        cur = conn.cursor()
        cur.execute("DELETE FROM tarefas WHERE nome = ?", (nome_animal,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ERRO] remover_tarefas_por_animal: {e}")

def contar_tarefas_animal(nome_animal):
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM tarefas WHERE nome = ?", (nome_animal,))
    count = cur.fetchone()[0]
    conn.close()
    return count