from flask import Flask, render_template, request, jsonify
from datetime import datetime
from animal_crud import (
    criar_tabela as criar_tabela_animais,
    ler_animais,
    adicionar_animal,
    remover_animal,
    editar_animal,
    ler_animal_id,
    preparar_animal_para_api
)
from TAREFAS_CRUD import (
    criar_tabela as criar_tabela_tarefas,
    ler_tarefas,
    ler_tarefas_por_animal,
    adicionar_tarefas,
    remover_tarefa,
    editar_tarefa,
    ler_tarefa_id,
    remover_tarefas_por_animal,
    contar_tarefas_animal
)

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['JSON_AS_ASCII'] = False

try:
    criar_tabela_animais()
    criar_tabela_tarefas()
except Exception as e:
    print(f"Erro ao inicializar tabelas: {e}")


# ==================== FUNÇÕES AUXILIARES ====================

def calcular_dias_ate_tarefa(data_tarefa_str):
    try:
        data_tarefa = None
        if isinstance(data_tarefa_str, str):
            try:
                data_tarefa = datetime.strptime(data_tarefa_str, '%Y-%m-%d').date()
            except ValueError:
                try:
                    data_tarefa = datetime.strptime(data_tarefa_str, '%d/%m/%Y').date()
                except ValueError:
                    return {'dias': '?', 'status': 'erro', 'mensagem': 'Data inválida', 'urgente': False}

        hoje = datetime.now().date()
        dias_faltando = (data_tarefa - hoje).days

        if dias_faltando < 0:
            return {
                'dias': abs(dias_faltando),
                'status': 'atrasado',
                'mensagem': f'⚠️ Atrasado por {abs(dias_faltando)} dias',
                'urgente': True
            }
        elif dias_faltando == 0:
            return {
                'dias': 0,
                'status': 'hoje',
                'mensagem': '🔴 Vence HOJE',
                'urgente': True
            }
        elif dias_faltando <= 7:
            return {
                'dias': dias_faltando,
                'status': 'urgente',
                'mensagem': f'🟡 {dias_faltando} dia{"s" if dias_faltando != 1 else ""}',
                'urgente': True
            }
        elif dias_faltando <= 30:
            return {
                'dias': dias_faltando,
                'status': 'proximo',
                'mensagem': f'🟢 {dias_faltando} dias',
                'urgente': False
            }
        else:
            return {
                'dias': dias_faltando,
                'status': 'ok',
                'mensagem': f'✓ {dias_faltando} dias',
                'urgente': False
            }
    except Exception as e:
        return {'dias': '?', 'status': 'erro', 'mensagem': 'Erro ao calcular', 'urgente': False}


def obter_proximas_tarefas(animal_id=None):
    try:
        # Definir quais tarefas buscar
        if animal_id:
            tarefas = ler_tarefas_por_animal(animal_id)
        else:
            tarefas = ler_tarefas()

        # Adicionar contagem regressiva em cada tarefa
        tarefas_com_contagem = []

        for tarefa in tarefas:
            contagem = calcular_dias_ate_tarefa(tarefa.get('data', ''))

            # Copiar tarefa e adicionar contagem
            tarefa_completa = tarefa.copy()
            tarefa_completa['contagem'] = contagem

            tarefas_com_contagem.append(tarefa_completa)

        # Ordenar tarefas por urgência
        tarefas_com_contagem = ordenar_tarefas_por_urgencia(tarefas_com_contagem)

        return tarefas_com_contagem

    except Exception as e:
        mensagem_erro = f"Erro ao obter próximas tarefas: {e}"
        print(mensagem_erro)
        return []


def ordenar_tarefas_por_urgencia(tarefas):
    tarefas_ordenadas = []

    tarefas_copia = tarefas.copy()

    for tarefa in tarefas_copia:
        dias = tarefa['contagem']['dias']

        if isinstance(dias, int):
            numero_dias = dias
        else:
            numero_dias = 999

        tarefa['dias_numericos'] = numero_dias

    def obter_dias_numericos(tarefa):
        return tarefa['dias_numericos']

    tarefas_ordenadas = sorted(tarefas_copia, key=obter_dias_numericos)

    return tarefas_ordenadas


def get_dashboard_stats():
    try:
        animals = ler_animais()
        tarefas = obter_proximas_tarefas()

        total_animals = len(animals)
        pending_tasks = len(tarefas)

        urgent_tasks = len([t for t in tarefas if t['contagem']['urgente']])

        in_treatment = len([a for a in animals if "tratamento" in a.get('saude', '').lower()])

        return {
            'total_animals': total_animals,
            'pending_tasks': pending_tasks,
            'urgent_tasks': urgent_tasks,
            'in_treatment': in_treatment
        }
    except Exception as e:
        print(f"Erro ao calcular estatísticas: {e}")
        return {
            'total_animals': 0,
            'pending_tasks': 0,
            'urgent_tasks': 0,
            'in_treatment': 0
        }


# ==================== ROTAS DA APLICAÇÃO ====================

@app.route('/')
def dashboard():
    animals = ler_animais()
    stats = get_dashboard_stats()
    proximas_tarefas = obter_proximas_tarefas()

    return render_template(
        'dashboard.html',
        page='dashboard',
        animals=animals,
        proximas_tarefas=proximas_tarefas,
        total_animals=stats['total_animals'],
        pending_tasks=stats['pending_tasks'],
        urgent_tasks=stats['urgent_tasks'],
        in_treatment=stats['in_treatment']
    )


@app.route('/animals')
def animals_page():
    animals = ler_animais()
    stats = get_dashboard_stats()

    return render_template(
        'animals.html',
        page='animals',
        animals=animals,
        total_animals=stats['total_animals'],
        pending_tasks=stats['pending_tasks'],
        in_treatment=stats['in_treatment']
    )


@app.route('/tasks')
def tasks_page():
    tasks = ler_tarefas()
    stats = get_dashboard_stats()

    return render_template(
        'tasks.html',
        page='tasks',
        tasks=tasks,
        total_animals=stats['total_animals'],
        pending_tasks=stats['pending_tasks'],
        in_treatment=stats['in_treatment']
    )



# ==================== ROTAS DA API ====================

@app.route('/api/animals', methods=['GET'])
def api_get_animals():
    try:
        animals = ler_animais()
        # Aplicar formatação centralizada para cada animal
        animals_formatados = [preparar_animal_para_api(animal) for animal in animals]
        return jsonify(animals_formatados), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/animals/<int:animal_id>', methods=['GET'])
def api_get_animal(animal_id):
    try:
        animal = ler_animal_id(animal_id)

        if animal:
            # Aplicar formatação centralizada
            animal_formatado = preparar_animal_para_api(animal)
            return jsonify(animal_formatado), 200
        else:
            return jsonify({'error': 'Animal não encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/animals/add', methods=['POST'])
def api_add_animal():
    try:
        data = request.get_json()

        campos_obrigatorios = ['nome', 'idade', 'raca', 'especie', 'data']

        verificacoes = []
        for i in campos_obrigatorios:
            campo_existe = i in data
            verificacoes.append(campo_existe)

        todos_campos_presentes = all(verificacoes)
        if not todos_campos_presentes:
            return jsonify({'error': 'Campos obrigatórios faltando'}), 400

        try:
            idade = int(data.get('idade'))
        except ValueError:
            return jsonify({'error': 'Idade deve ser um número'}), 400

        adicionar_animal(
            data.get('nome'),
            idade,
            data.get('raca'),
            data.get('especie'),
            data.get('saude', ''),
            data.get('comportamento', ''),
            data.get('data'),
            data.get('status', 'Disponível')
        )

        return jsonify({'success': 'Animal adicionado com sucesso'}), 201

    except ValueError as e:
        return jsonify({'error': f'Erro de validação: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/animals/<int:animal_id>', methods=['DELETE'])
def api_delete_animal(animal_id):
    try:
        animal = ler_animal_id(animal_id)

        if not animal:
            return jsonify({'error': 'Animal não encontrado'}), 404

        remover_tarefas_por_animal(animal_id)

        remover_animal(animal_id)

        mensagem_sucesso = f'Animal {animal["nome"]} e suas tarefas foram removidos com sucesso'
        return jsonify({'success': mensagem_sucesso}), 200

    except Exception as e:
        mensagem_erro = f'Erro ao deletar animal: {str(e)}'
        return jsonify({'error': mensagem_erro}), 500


@app.route('/api/animals/<int:animal_id>', methods=['PUT'])
def api_edit_animal(animal_id):
    try:
        animal = ler_animal_id(animal_id)
        if not animal:
            return jsonify({'error': 'Animal não encontrado'}), 404

        data = request.get_json()

        nome = data.get('nome', animal['nome'])
        idade = data.get('idade', animal['idade'])
        raca = data.get('raca', animal['raca'])
        especie = data.get('especie', animal['especie'])
        saude = data.get('saude', animal['saude'])
        comportamento = data.get('comportamento', animal['comportamento'])
        data_chegada = data.get('data', animal['data'])
        status = data.get('status', animal.get('status', 'Disponível'))

        editar_animal(animal_id, nome, idade, raca, especie, saude, comportamento, data_chegada, status)

        return jsonify({'success': 'Animal atualizado com sucesso'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks', methods=['GET'])
def api_get_tasks():
    try:
        tasks = ler_tarefas()
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def api_get_task(task_id):
    try:
        task = ler_tarefa_id(task_id)

        if task:
            return jsonify(task), 200
        else:
            return jsonify({'error': 'Tarefa não encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/add', methods=['POST'])
def api_add_task():
    try:
        json_data = request.get_json()

        campos_obrigatorios = ['animal_id', 'tarefa', 'data', 'responsavel']
        campos_faltando = []

        for campo in campos_obrigatorios:
            if campo not in json_data:
                campos_faltando.append(campo)

        if campos_faltando:
            mensagem_erro = f'Campos obrigatórios faltando: {", ".join(campos_faltando)}'
            return jsonify({'error': mensagem_erro}), 400

        tipos_validos = ["Banho", "Tosa", "Vacinação", "Check-Up", "Treinamento", "Castração"]
        tipo_tarefa = json_data.get('tarefa')

        tipo_eh_valido = tipo_tarefa in tipos_validos

        if not tipo_eh_valido:
            tipos_formatados = ", ".join(tipos_validos)
            mensagem_erro = f'Tipo de tarefa inválido. Válidos: {tipos_formatados}'
            return jsonify({'error': mensagem_erro}), 400

        animal_id = json_data.get('animal_id')
        animal = ler_animal_id(animal_id)

        if not animal:
            mensagem_erro = f'Animal com ID {animal_id} não encontrado'
            return jsonify({'error': mensagem_erro}), 404

        nome_animal = animal.get('nome')

        adicionar_tarefas(
            animal_id=animal_id,
            tarefa=tipo_tarefa,
            data=json_data.get('data'),
            responsavel=json_data.get('responsavel'),
            nome=nome_animal
        )

        mensagem_sucesso = f'Tarefa adicionada com sucesso para {nome_animal}'
        return jsonify({'success': mensagem_sucesso}), 201

    except Exception as e:
        mensagem_erro = f'Erro ao adicionar tarefa: {str(e)}'
        return jsonify({'error': mensagem_erro}), 500


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def api_delete_task(task_id):
    try:
        task = ler_tarefa_id(task_id)
        if not task:
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        remover_tarefa(task_id)

        return jsonify({'success': 'Tarefa removida com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def api_edit_task(task_id):
    try:
        tarefa_atual = ler_tarefa_id(task_id)

        if not tarefa_atual:
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        json_data = request.get_json()

        animal_id = json_data.get('animal_id', tarefa_atual.get('animal_id'))
        tipo_tarefa = json_data.get('tarefa', tarefa_atual.get('tarefa'))
        data_tarefa = json_data.get('data', tarefa_atual.get('data'))
        responsavel = json_data.get('responsavel', tarefa_atual.get('responsavel'))
        nome_animal = json_data.get('nome', tarefa_atual.get('nome'))

        tipos_validos = ["Banho", "Tosa", "Vacinação", "Check-Up", "Treinamento", "Castração"]

        if tipo_tarefa not in tipos_validos:
            tipos_formatados = ", ".join(tipos_validos)
            mensagem_erro = f'Tipo de tarefa inválido. Válidos: {tipos_formatados}'
            return jsonify({'error': mensagem_erro}), 400

        if animal_id != tarefa_atual.get('animal_id'):
            animal = ler_animal_id(animal_id)

            if not animal:
                mensagem_erro = f'Animal com ID {animal_id} não encontrado'
                return jsonify({'error': mensagem_erro}), 404

            nome_animal = animal.get('nome')

        editar_tarefa(
            task_id,
            animal_id,
            tipo_tarefa,
            data_tarefa,
            responsavel,
            nome_animal
        )

        return jsonify({'success': 'Tarefa atualizada com sucesso'}), 200

    except Exception as e:
        mensagem_erro = f'Erro ao editar tarefa: {str(e)}'
        return jsonify({'error': mensagem_erro}), 500


@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    try:
        stats = get_dashboard_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/proximas-tarefas', methods=['GET'])
def api_proximas_tarefas():
    try:
        animal_id = request.args.get('animal_id', type=int)
        tarefas = obter_proximas_tarefas(animal_id)
        return jsonify(tarefas), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/animals/<int:animal_id>/tarefas-count', methods=['GET'])
def api_contar_tarefas_animal(animal_id):
    try:
        animal = ler_animal_id(animal_id)

        if not animal:
            return jsonify({'error': 'Animal não encontrado'}), 404

        quantidade_tarefas = contar_tarefas_animal(animal_id)

        return jsonify({
            'count': quantidade_tarefas,
            'animal_id': animal_id,
            'nome': animal['nome']
        }), 200

    except Exception as e:
        mensagem_erro = f'Erro ao contar tarefas: {str(e)}'
        return jsonify({'error': mensagem_erro}), 500

@app.route('/api/animals/search', methods=['GET'])
def api_search_animals():
    """Busca animais por nome, raça ou espécie"""
    try:
        query = request.args.get('q', '').lower().strip()

        if not query:
            return jsonify([]), 200

        animals = ler_animais()

        # Busca em múltiplos campos
        filtered = [a for a in animals if
            query in a['nome'].lower() or
            query in a['raca'].lower() or
            query in a['especie'].lower()]

        # Aplicar formatação centralizada
        filtered_formatados = [preparar_animal_para_api(animal) for animal in filtered]
        return jsonify(filtered_formatados), 200

    except Exception as e:
        return jsonify({'error': f'Erro ao buscar animais: {str(e)}'}), 500


@app.route('/api/animals/filter', methods=['GET'])
def api_filter_animals():
    """Filtra animais por espécie, status ou saúde"""
    try:
        especie = request.args.get('especie', '').strip()
        status = request.args.get('status', '').strip()
        saude = request.args.get('saude', '').strip()

        animals = ler_animais()

        # Aplicar filtros sequencialmente
        if especie:
            animals = [a for a in animals if a['especie'].lower() == especie.lower()]

        if status:
            animals = [a for a in animals if a['status'] == status]

        if saude:
            animals = [a for a in animals if saude.lower() in a['saude'].lower()]

        # Aplicar formatação centralizada
        animals_formatados = [preparar_animal_para_api(animal) for animal in animals]
        return jsonify(animals_formatados), 200

    except Exception as e:
        return jsonify({'error': f'Erro ao filtrar animais: {str(e)}'}), 500


@app.route('/api/personality/generate-tags', methods=['POST'])
def api_generate_personality_tags():
    """Gera tags de personalidade baseado em valores de traços (0-100)"""
    try:
        from animal_crud import gerar_tags_personalidade
        import json

        data = request.get_json()
        personalidade = data.get('personalidade', {})

        # Converter para JSON string como esperado pela função
        comportamento_json = json.dumps(personalidade)
        tags = gerar_tags_personalidade(comportamento_json)

        return jsonify({
            'tags': tags,
            'total': len(tags)
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erro ao gerar tags: {str(e)}'}), 500


@app.route('/api/metadata/task-types', methods=['GET'])
def api_get_task_types_metadata():
    """Retorna metadados de tipos de tarefas"""
    try:
        task_metadata = {
            'Banho': {'emoji': '🛁', 'icone': 'bath', 'cores': '#87CEEB'},
            'Tosa': {'emoji': '✂️', 'icone': 'scissors', 'cores': '#FFD700'},
            'Vacinação': {'emoji': '💉', 'icone': 'vaccine', 'cores': '#FF6B6B'},
            'Check-Up': {'emoji': '🏥', 'icone': 'hospital', 'cores': '#4ECDC4'},
            'Treinamento': {'emoji': '🎓', 'icone': 'book', 'cores': '#A78BFA'},
            'Castração': {'emoji': '🔪', 'icone': 'knife', 'cores': '#F472B6'}
        }

        return jsonify({
            'tipos': task_metadata,
            'total': len(task_metadata)
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erro ao obter metadados: {str(e)}'}), 500


@app.route('/api/validate/animal', methods=['POST'])
def api_validate_animal():
    """Validação centralizada de dados de animal"""
    try:
        data = request.get_json()
        errors = {}
        warnings = []

        campos_obrigatorios = {
            'nome': 'Nome é obrigatório',
            'especie': 'Espécie é obrigatória',
            'raca': 'Raça é obrigatória',
            'idade': 'Idade é obrigatória',
            'data': 'Data é obrigatória'
        }

        for campo, mensagem in campos_obrigatorios.items():
            if not data.get(campo):
                errors[campo] = mensagem

        if data.get('idade'):
            try:
                idade = int(data.get('idade'))
                if idade < 0:
                    errors['idade'] = 'Idade não pode ser negativa'
                elif idade > 150:
                    warnings.append('Idade parece incomum (> 150 anos)')
            except ValueError:
                errors['idade'] = 'Idade deve ser um número válido'

        especies_validas = ['Cachorro', 'Gato', 'Coelho', 'Pássaro', 'Outro']
        if data.get('especie') and data.get('especie') not in especies_validas:
            errors['especie'] = f'Espécie deve ser uma de: {", ".join(especies_validas)}'

        if data.get('data'):
            try:
                datetime.strptime(data.get('data'), '%Y-%m-%d')
            except ValueError:
                errors['data'] = 'Data deve estar no formato YYYY-MM-DD'

        status_validos = ['Disponível', 'Em Processo', 'Em Tratamento']
        if data.get('status') and data.get('status') not in status_validos:
            warnings.append(f'Status desconhecido. Válidos: {", ".join(status_validos)}')

        if data.get('nome'):
            nome = data.get('nome').strip()
            if len(nome) < 2:
                errors['nome'] = 'Nome deve ter ao menos 2 caracteres'
            elif len(nome) > 100:
                errors['nome'] = 'Nome não pode exceder 100 caracteres'

        response = {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }

        status_code = 200 if response['valid'] else 400
        return jsonify(response), status_code

    except Exception as e:
        return jsonify({'error': f'Erro na validação: {str(e)}'}), 500


@app.route('/api/validate/task', methods=['POST'])
def api_validate_task():
    """Validação centralizada de dados de tarefa"""
    try:
        data = request.get_json()
        errors = {}
        warnings = []

        campos_obrigatorios = {
            'animal_id': 'ID do animal é obrigatório',
            'tarefa': 'Tipo de tarefa é obrigatório',
            'data': 'Data da tarefa é obrigatória',
            'responsavel': 'Responsável é obrigatório'
        }

        for campo, mensagem in campos_obrigatorios.items():
            if not data.get(campo):
                errors[campo] = mensagem

        tipos_validos = ["Banho", "Tosa", "Vacinação", "Check-Up", "Treinamento", "Castração"]
        if data.get('tarefa') and data.get('tarefa') not in tipos_validos:
            errors['tarefa'] = f'Tipo inválido. Válidos: {", ".join(tipos_validos)}'

        if data.get('data'):
            try:
                data_tarefa = datetime.strptime(data.get('data'), '%Y-%m-%d')
                if data_tarefa < datetime.now():
                    warnings.append('Data da tarefa está no passado')
            except ValueError:
                errors['data'] = 'Data deve estar no formato YYYY-MM-DD'

        if data.get('animal_id'):
            try:
                animal_id = int(data.get('animal_id'))
                animal = ler_animal_id(animal_id)
                if not animal:
                    errors['animal_id'] = f'Animal com ID {animal_id} não encontrado'
            except ValueError:
                errors['animal_id'] = 'ID do animal deve ser um número'

        if data.get('responsavel'):
            responsavel = data.get('responsavel').strip()
            if len(responsavel) < 2:
                errors['responsavel'] = 'Nome do responsável muito curto'
            elif len(responsavel) > 100:
                errors['responsavel'] = 'Nome do responsável muito longo'

        response = {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }

        status_code = 200 if response['valid'] else 400
        return jsonify(response), status_code

    except Exception as e:
        return jsonify({'error': f'Erro na validação: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    """Página 404"""
    return jsonify({'error': 'Página não encontrada'}), 404

@app.errorhandler(500)
def server_error(error):
    """Página 500"""
    return jsonify({'error': 'Erro interno do servidor'}), 500


# Inicia o App

if __name__ == '__main__':
    app.run(
        debug=True,
        host='127.0.0.1',
        port=5000
    )
