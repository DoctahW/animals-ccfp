# 🐾 Amigo+ - Centro de Adoção de Animais

Sistema completo de gestão para centros de adoção de animais, desenvolvido como projeto acadêmico da disciplina de Fundamentos de Programação.

![Status](https://img.shields.io/badge/status-ativo-success)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Flask](https://img.shields.io/badge/flask-3.1.2-green)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Manual do Usuário](#manual-do-usuário)
- [Observações Importantes](#observações-importantes)
- [Autores](#autores)

---

## 📖 Sobre o Projeto

O **Amigo+** é um sistema web desenvolvido para auxiliar centros de adoção de animais a gerenciar:
- Cadastro e acompanhamento de animais (cães, gatos e outros pets)
- Tarefas e cuidados diários (vacinas, banhos, consultas veterinárias)
- Contagem regressiva para tarefas importantes
- Dashboard com estatísticas em tempo real

---

## ✨ Funcionalidades

### CRUD Completo de Animais
- ✅ Adicionar novos animais ao sistema
- ✅ Visualizar lista de todos os animais
- ✅ Editar informações de animais existentes
- ✅ Remover animais do sistema
- ✅ Campos: nome, espécie, raça, idade, estado de saúde, comportamento, data de chegada e status

### Gestão de Tarefas e Cuidados
- ✅ Cadastrar tarefas para cada animal (vacinas, banhos, consultas, treino, etc.)
- ✅ Definir data prevista e responsável
- ✅ Visualizar todas as tarefas pendentes
- ✅ Editar e remover tarefas
- ✅ Tipos de tarefa: Banho, Tosa, Vacinação, Check-Up, Treinamento, Castração

### Sistema de Alertas e Contagem Regressiva
- 🔴 **Tarefas atrasadas**: Alertas vermelhos para tarefas vencidas
- 🟡 **Tarefas urgentes**: Avisos para tarefas com menos de 7 dias
- 🟢 **Tarefas futuras**: Indicadores para tarefas programadas
- ⏰ **Contagem regressiva**: Exibe quantos dias faltam para cada tarefa

### Dashboard Interativo
- 📊 Estatísticas em tempo real
- 📈 Total de animais cadastrados
- ⚠️ Tarefas pendentes e urgentes
- 🏥 Animais em tratamento
- 🔍 Sistema de busca e filtros

### Interface Moderna
- 📱 Navegação por sidebar
- 🎯 Modais para ações rápidas
- ✨ Feedback visual para todas as ações

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.8+**
- **Flask 3.1.2** - Framework web (autorizado pelos professores)
- **SQLite3** - Banco de dados (autorizado pelos professores)

### Frontend
- **HTML5**
- **CSS3** (variáveis CSS, grid, flexbox)
- **JavaScript ES6+**
- **Jinja2** - Template engine

### Bibliotecas Python
```
Flask==3.1.2
Jinja2==3.1.6
Werkzeug==3.1.3
datetime (biblioteca padrão)
sqlite3 (biblioteca padrão)
```

---

## 📦 Requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Web Browser (Chrome, Firefox, Edge, Safari)

---

## 🚀 Instalação

### Passo 1: Clone o repositório
```bash
git clone https://github.com/DoctahW/animals-ccfp.git
cd animals-ccfp
```

### Passo 2: Crie um ambiente virtual (recomendado)
```bash
# No Windows
python -m venv .venv
.venv\Scripts\activate

# No Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### Passo 3: Instale as dependências
```bash
pip install -r requirements.txt
```

### Passo 4: Execute a aplicação
```bash
python main.py
```

### Passo 5: Acesse o sistema
Abra seu navegador e acesse:
```
http://127.0.0.1:5000
```

---

## 📚 Como Usar

### Acessando o Sistema

1. Execute `python main.py`
2. Abra o navegador em `http://127.0.0.1:5000`
3. Você será direcionado ao Dashboard principal

### Navegação

O sistema possui um menu lateral (sidebar) com as seguintes opções:

- **Dashboard** 🏠 - Visão geral do sistema
- **Animais** 🐾 - Gerenciamento de animais
- **Tarefas** 📋 - Gerenciamento de tarefas
- **Agenda** 📅 - (Em desenvolvimento)

---

## 👤 Manual do Usuário

### 🐕 Gerenciando Animais

#### Adicionar um Novo Animal

1. Clique no botão flutuante **"Adicionar Animal +"** (canto superior direito)
2. Preencha o formulário:
   - **Nome**: Nome do animal (obrigatório)
   - **Espécie**: Cachorro, Gato, Coelho, Pássaro ou Outro (obrigatório)
   - **Raça**: Raça do animal (obrigatório)
   - **Idade**: Idade em anos (obrigatório)
   - **Estado de Saúde**: Descrição do estado de saúde (opcional)
   - **Comportamento**: Descrição do temperamento (opcional)
   - **Data de Chegada**: Data que o animal chegou ao centro (obrigatório)
   - **Status**: Disponível, Em Processo ou Em Tratamento (obrigatório)
3. Clique em **"Adicionar Animal"**

#### Visualizar Detalhes de um Animal

1. Na página **Animais** ou **Dashboard**, clique em um card de animal
2. O painel lateral mostrará todas as informações
3. Você verá também as próximas tarefas agendadas para aquele animal

#### Editar um Animal

1. Visualize os detalhes do animal
2. Clique no botão **"✏️ Editar"**
3. Modifique os campos desejados
4. Clique em **"Salvar Alterações"**

#### Remover um Animal

1. Visualize os detalhes do animal
2. Clique no botão **"🗑️ Remover"**
3. **ATENÇÃO**: Se o animal tiver tarefas associadas, todas serão removidas também
4. Confirme a exclusão

#### Buscar Animais

Use a caixa de busca no topo da lista para pesquisar por:
- Nome do animal
- Raça
- Espécie

#### Filtrar Animais

Use os botões de filtro:
- **Todos**: Mostra todos os animais
- **🐕 Cães**: Apenas cães
- **🐱 Gatos**: Apenas gatos
- **✓ Disponíveis**: Apenas animais disponíveis para adoção

---

### 📋 Gerenciando Tarefas

#### Adicionar uma Nova Tarefa

1. Clique no botão **"Adicionar Tarefa +"**
2. Preencha o formulário:
   - **Animal**: Selecione o animal (obrigatório)
   - **Tipo de Tarefa**: Banho, Tosa, Vacinação, Check-Up, Treinamento ou Castração (obrigatório)
   - **Data Prevista**: Data que a tarefa deve ser realizada (obrigatório)
   - **Responsável**: Nome da pessoa responsável (obrigatório)
3. Clique em **"Adicionar Tarefa"**

**Atalho**: Ao visualizar os detalhes de um animal, clique no botão **"+"** ao lado de "Próximas Tarefas" para adicionar uma tarefa já com o animal pré-selecionado.

#### Visualizar Tarefas

- Na página **Tarefas**, você verá todas as tarefas cadastradas
- Na página **Dashboard**, você verá as próximas tarefas em ordem de urgência
- Ao visualizar um animal, você verá apenas as tarefas daquele animal

#### Interpretar os Alertas de Tarefas

O sistema usa códigos de cor para indicar urgência:

- 🔴 **Vermelho** - Tarefa atrasada ou vence hoje
- 🟡 **Amarelo** - Tarefa urgente (menos de 7 dias)
- 🟢 **Verde** - Tarefa com mais de 7 dias

#### Filtrar Tarefas por Tipo

Na página **Tarefas**, use os botões de filtro para ver apenas:
- Todas as tarefas
- Banho
- Tosa
- Vacinação
- Check-Up
- Treinamento
- Castração

#### Editar uma Tarefa

1. Na lista de tarefas, clique no botão **"✏️"**
2. Modifique os campos desejados
3. Clique em **"Salvar"**

#### Remover uma Tarefa

1. Na lista de tarefas, clique no botão **"🗑️"**
2. Confirme a exclusão

---

### 📊 Usando o Dashboard

O Dashboard mostra:

#### Cards de Estatísticas
- **Total de Animais**: Quantidade total de animais cadastrados
- **Tarefas Pendentes**: Número de tarefas agendadas
- **Tarefas Urgentes**: Tarefas que vencem em menos de 7 dias

#### Lista de Animais
- Visualização rápida de todos os animais
- Busca e filtros
- Clique em um animal para ver detalhes

#### Próximas Tarefas (Painel Lateral)
- Lista de tarefas ordenadas por urgência
- Contagem regressiva para cada tarefa
- Informações do responsável


## ⚠️ Observações Importantes

### Sobre o Armazenamento de Dados

O projeto foi especificado para usar arquivos `.csv` ou `.txt` para armazenamento. No entanto:

- ✅ **Foi autorizado pelos professores** o uso de **Flask** e **SQLite**
- 📦 O banco de dados SQLite (`amigo.db`) é criado automaticamente na primeira execução
- 🔄 SQLite oferece melhor desempenho e integridade de dados
- 💾 Os dados são persistidos localmente no arquivo `amigo.db`

### Bibliotecas Utilizadas

Conforme especificado no projeto, foram utilizadas apenas:
- ✅ `datetime` (biblioteca padrão)
- ✅ `sqlite3` (biblioteca padrão)
- ✅ Flask e dependências (autorizadas pelos professores)

Nenhuma biblioteca adicional foi usada sem autorização.


## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---