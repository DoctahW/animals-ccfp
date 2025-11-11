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