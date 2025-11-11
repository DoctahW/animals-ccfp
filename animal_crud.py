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

        conn.execute("INSERT INTO animais(id,nome,idade,raca,especie,saude,comportamento,data) VALUES (?,?,?,?)",(id,pet_name,pet_age,pet_race,pet_especie,pet_saude,pet_comp,pet_date))
        conn.commit()
        print("Animal adicionado com sucesso")
        return True
    except ValueError:
        print("ERRO: Idade deve ser um número!")
        return False
    