import sqlite3
conn = sqlite3.connect("amigo.db")

def criar_tabela():
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS animais(id integer primary key, nome text,idade integer,raca text,especie text,saude text,comportamento text,data text)")

def adicionar_animal():
    try:
        pet_name = str(input("Nome do Animal: "))
        pet_age = int(input("Idade do Animal: "))
        pet_race = str(input("Raça do Animal: "))
        pet_especie = str(input("Especie do Animal: "))
        pet_saude = str(input("Estado de saúde do animal: "))
        pet_comp = str(input("Comportamento do Animal: "))
        pet_date = str(input("Qual a data de chegada do Animal: "))

        conn.execute("INSERT INTO animais(nome,idade,raca,especie,saude,comportamento,data) VALUES (?,?,?,?,?,?,?)",(pet_name,pet_age,pet_race,pet_especie,pet_saude,pet_comp,pet_date))
        conn.commit()
        print("Animal adicionado com sucesso")
        return True
    except ValueError:
        print("ERRO: Idade deve ser um número!")
        return False
    
def leranimais():
    cur = conn.cursor()
    cur.execute("SELECT id,nome,idade,raca,especie,saude,comportamento,data FROM animais")
    animais = cur.fetchall()
    if not animais:
        print("Nenhum animal foi cadastrado ainda!")
        return
    print("\n=== ANIMAIS REGISTRADOS ===")
    for animal in animais:
        print(f"| ID: {animal[0]} | Nome: {animal[1]} | Idade: {animal[2]} | Raça: {animal[3]} | Especie: {animal[4]} | Saúde: {animal[5]} | Comportamento: {animal[6]} | Data: {animal[7]} |")
def removeranimal():
    leranimais()
    cur=conn.cursor()
    nome_busca= input("\nDigite o nome do animal que deseja remover: ")

    cur.execute("SELECT * FROM animais WHERE nome = ?", (nome_busca,))
    if not cur.fetchone():
        print("Animal não encontrado!")
        return
    print(f"\nDeseja remover {nome_busca}? dos registros?")
    print(f"[S]im ou [N]ão")
    opcao = input(">").upper()
    if opcao == "S":
        cur.execute("DELETE FROM animais WHERE nome = ?", (nome_busca,))
        conn.commit()
        print("Animal removido!")
    elif opcao == "N":
        print("Operação Cancelada!")
        return
    else:
        print("Opção inválida!")

def editar_animal():
    cur = conn.cursor()

    print("\n-----O que deseja editar?-----")
    print("1 - Nome")
    print("2 - Idade")
    print("3 - Raça")
    print("4 - Especie")
    print("5 - Estado de Saúde")
    print("6 - Comportamento")
    print("7 - Data de chegada")
    esc = input("Escolha uma opção:")
    nome_velho = ("Escreva o nome do animal editado:")

    try:
        if esc == "1":
            novo_nome = input("Novo nome: ")
            conn.execute("UPDATE animais SET nome = ? WHERE nome = ?", (novo_nome,nome_velho))

        elif esc == "2":
            nova_idade = int(input("Nova idade: "))
            conn.execute("UPDATE pessoas SET idade = ? WHERE nome = ?", (nova_idade, nome_velho))

        elif esc == "3":
            nova_raca = input("Nova profissão: ")
            conn.execute("UPDATE pessoas SET raca = ? WHERE nome = ?", (nova_raca, nome_velho))
        
        elif esc == "4":
            nova_especie = input("Nova profissão: ")
            conn.execute("UPDATE pessoas SET especie = ? WHERE nome = ?", (nova_especie, nome_velho))
        
        elif esc == "5":
            nova_saude = input("Nova profissão: ")
            conn.execute("UPDATE pessoas SET saude = ? WHERE nome = ?", (nova_saude, nome_velho))

        elif esc == "6":
            novo_comportamento = input("Nova profissão: ")
            conn.execute("UPDATE pessoas SET comportamento = ? WHERE nome = ?", (novo_comportamento, nome_velho))
        
        elif esc == "7":
            nova_data = input("Nova profissão: ")
            conn.execute("UPDATE pessoas SET data = ? WHERE nome = ?", (nova_data, nome_velho))
        
        else:
            print("Esta opção não é valida!")
            return False
        
        conn.commit()
        print("Animal atualizado com sucesso!")
        return True
    except ValueError:
        print("ERRO: Idade deve ser um número!")
        return False