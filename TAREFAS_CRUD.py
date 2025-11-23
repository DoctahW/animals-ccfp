import os
os.system('cls')

import sqlite3
conn = sqlite3.connect("amigo.db")

def criar_tabela():
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS tarefas(id integer primary key, nome text, tarefa text, data text, responsavel text)")


tarefas_dic = {1:"Banho",2:"Tosa",3:"Vacinação",4:"Check-Up",5:"Treinamento",6:"Castração"}

def adicionar_tarefas():
    pet_nome = input("Insira o nome do animal: ")
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

def remover_tarefas():
    ler_tarefas()
    cur = conn.cursor()
    nome_busca = input("\nDigite o nome do animal cuja tarefa deseja remover: ")

    cur.execute("SELECT * FROM tarefas WHERE nome = ?", (nome_busca,))
    if not cur.fetchone():
        print("Registro não encontrado!")
        return
    print(f"\nDeseja remover todas as tarefas do(a) {nome_busca} dos registros?")
    print(f"[S]im ou [N]ão")
    opcao = input(">").upper()
    if opcao == "S":
        cur.execute("DELETE FROM tarefas WHERE nome = ?", (nome_busca,))
        conn.commit()
        print("Registro(s) removido(s)!")
    elif opcao == "N":
        print("Operação Cancelada!")
        return
    else:
        print("Opção inválida!")

def editar_tarefas():
    cur = conn.cursor()

    print("\n-----O que deseja editar?-----")
    print("[1] - Nome\n[2] - Tarefa\n[3] - Data\n[4] - Responsável")
    esc = input("Escolha uma opção: ")
    nome_velho = input("Escreva o nome do animal que será editado: ")

    try:
        if esc == "1":
            novo_nome = input("Novo nome: ")
            conn.execute("UPDATE tarefas SET nome = ? WHERE nome = ?", (novo_nome, nome_velho))

        elif esc == "2":
            print("Tarefas disponíveis:")
            nova_tarefa = int(input(f"Por favor, selecione a tarefa que quer alterar:\n[1] - Banho\n[2] - Tosa\n[3] - Vacinação\n[4] - Check-Up\n[5] - Treino\n[6] - Castração\n[] = "))
            conn.execute("UPDATE tarefas SET tarefa = ? WHERE nome = ?", (tarefas_dic[nova_tarefa], nome_velho))

        elif esc == "3":
            nova_data = input("Nova data: ")
            conn.execute("UPDATE tarefas SET data = ? WHERE nome = ?", (nova_data, nome_velho))

        elif esc == "4":
            novo_responsavel = input("Novo responsável: ")
            conn.execute("UPDATE tarefas SET responsavel = ? WHERE nome = ?", (novo_responsavel, nome_velho))

        else:
            print("Esta opção não é valida!")
            return False
        
        conn.commit()
        print("Tarefas atualizadas com sucesso!")
        return True
    except ValueError:
        print("ERRO: Data deve ser um número!")
        return False