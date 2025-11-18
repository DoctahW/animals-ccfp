import os
os.system('cls')

import sqlite3
conn = sqlite3.connect("amigo.db")

def criar_tabela():
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS tarefas(id integer primary key, nome text, tarefa text, data text, responsavel text)")


tarefas_dic = {1:"Banho",2:"Tosa",3:"Vacinação",4:"Check-Up",5:"Treinamento",6:"Castração"}

def adicionar_tarefas():
    pet_nome = input("Insira o nome do animal:  ")
    while True:
        try:
            tarefa = int(input(f"Por favor, selecione as tarefas para {pet_nome}:\n[1] - Banho\n[2] - Tosa\n[3] - Vacinação\n[4] - Check-Up\n[5] - Treino\n[6] - Castração\n[0] - Sair\n[] = "))
            if tarefa == 0:
                break
            elif tarefa >= 1 and tarefa <= 6:
                data_prevista = str(input("Insira a data prevista para a tarefa: "))
                responsavel = str(input("Nome do responsável pela tarefa: "))
                conn.execute("INSERT INTO tarefas(nome,tarefa,data,responsavel) VALUES (?,?,?,?)",(pet_nome,tarefas_dic[tarefa],data_prevista,responsavel))
                conn.commit()
                
                print("Tarefa registrada com sucesso")
            else:
                print("Entrada fora do intervalo")
            return True
        except ValueError:
            print("ERRO")
            return False
            
def ler_tarefas():
    cur = conn.cursor()
    cur.execute("SELECT id,nome,tarefa,data,responsavel FROM tarefas")
    tarefas = cur.fetchall()
    if not tarefas:
        print("Não há tarefas agendadas!")
        return
    print("\n=== TAREFAS AGENDADAS ===")
    for tarefa in tarefas:
        print(f"| ID: {tarefa[0]} | Nome: {tarefa[1]} | Tarefa: {tarefa[2]} | Data marcada: {tarefa[3]} | Responsável {tarefa[4]}") 

criar_tabela()
adicionar_tarefas()
        
