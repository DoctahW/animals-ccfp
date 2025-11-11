import os
os.system('cls')

tarefas = ["Banho","Tosa","Vacinação","Check-Up","Treinamento","Castração"]

file = open("tarefas.txt","w",encoding="utf-8")

def tarefas():
    pet_nome = input("Insira o nome do animal:  ")
    while True:
        tarefa = int(input(f"Por favor, selecione as tarefas para {pet_nome}:\n[1] - Banho\n[2] - Tosa\n[3] - Vacinação\n[4] - Check-Up\n[5] - Treino\n[6] - Castração\n[0] - Sair"))