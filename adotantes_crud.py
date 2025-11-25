import sqlite3
import json
from datetime import datetime

BANCO = "amigo.db"

def criar_tabela():
    conn = sqlite3.connect(BANCO)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS adotantes (
            id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefone TEXT,
            data_cadastro TEXT DEFAULT CURRENT_DATE,

            -- SEÇÃO 1: INFORMAÇÕES BÁSICAS (Obrigatória)
            idade INTEGER,
            profissao TEXT,
            filhos INTEGER DEFAULT 0,
            filhos_faixa_etaria TEXT,

            -- SEÇÃO 2: MORADIA (Obrigatória)
            tipo_moradia TEXT,
            tamanho_moradia TEXT,
            tem_quintal BOOLEAN DEFAULT 0,
            tamanho_quintal TEXT,
            localizacao TEXT,
            aluga_ou_possui TEXT,

            -- SEÇÃO 3: ROTINA E DISPONIBILIDADE (Obrigatória)
            horas_trabalho_dia INTEGER,
            horas_sozinho_dia INTEGER,
            viagens_frequentes BOOLEAN DEFAULT 0,
            dias_viagem_ano INTEGER,

            -- SEÇÃO 4: ESTILO DE VIDA (Obrigatória)
            nivel_atividade TEXT,
            hobbies TEXT,

            -- SEÇÃO 5: EXPERIÊNCIA COM ANIMAIS (Opcional)
            experiencia_previa TEXT,
            animais_tidos TEXT,
            problemas_passados TEXT,

            -- SEÇÃO 6: PREFERÊNCIAS DO ANIMAL (Opcional)
            tamanho_preferido TEXT,
            idade_preferida TEXT,
            genero_preferido TEXT,

            -- SEÇÃO 7: OUTROS ANIMAIS EM CASA (Opcional)
            tem_outros_animais BOOLEAN DEFAULT 0,
            quantidade_outros_animais INTEGER,
            tipo_outros_animais TEXT,

            -- SEÇÃO 8: RECURSOS E COMPROMETIMENTO (Opcional)
            orcamento_mensal_min REAL,
            orcamento_mensal_max REAL,
            disponibilidade_tempo_diario TEXT,
            comprometimento_texto TEXT,

            -- PREFERÊNCIAS PARA MATCHING
            tracos_preferidos TEXT,
            tags_ideais TEXT,
            tem_preferencia_tracos BOOLEAN DEFAULT 0
        )
    """)
    
    # Adicionar/remover colunas para compatibilidade com versões antigas do schema
    cur.execute("PRAGMA table_info(adotantes)")
    colunas = [coluna[1] for coluna in cur.fetchall()]

    if 'tem_preferencia_tracos' not in colunas:
        try:
            cur.execute("ALTER TABLE adotantes ADD COLUMN tem_preferencia_tracos BOOLEAN DEFAULT 0")
        except sqlite3.OperationalError:
            pass


    conn.commit()
    conn.close()


def adicionar_adotante(nome, email, telefone=None, idade=None, profissao=None, filhos=0,
                       tipo_moradia=None, tamanho_moradia=None, tem_quintal=False,
                       tamanho_quintal=None, localizacao=None, aluga_ou_possui=None,
                       horas_trabalho_dia=None, horas_sozinho_dia=None, viagens_frequentes=False,
                       dias_viagem_ano=None, nivel_atividade=None, hobbies=None,
                       experiencia_previa=None, animais_tidos=None, problemas_passados=None,
                       tamanho_preferido=None, idade_preferida=None, genero_preferido=None,
                       tem_outros_animais=False, quantidade_outros_animais=None,
                       tipo_outros_animais=None, orcamento_mensal_min=None,
                       orcamento_mensal_max=None, disponibilidade_tempo_diario=None,
                       comprometimento_texto=None, tracos_preferidos=None, tags_ideais=None,
                       tem_preferencia_tracos=False):


    # Converter booleanos para inteiros
    tem_quintal = 1 if tem_quintal else 0
    viagens_frequentes = 1 if viagens_frequentes else 0
    tem_outros_animais = 1 if tem_outros_animais else 0
    tem_preferencia_tracos = 1 if tem_preferencia_tracos else 0


    hobbies_json = json.dumps(hobbies) if hobbies and isinstance(hobbies, list) else hobbies
    animais_tidos_json = json.dumps(animais_tidos) if animais_tidos and isinstance(animais_tidos, list) else animais_tidos
    tipo_outros_json = json.dumps(tipo_outros_animais) if tipo_outros_animais and isinstance(tipo_outros_animais, list) else tipo_outros_animais
    tags_json = json.dumps(tags_ideais) if tags_ideais and isinstance(tags_ideais, list) else tags_ideais

    conn = sqlite3.connect(BANCO)
    try:
        conn.execute("""
            INSERT INTO adotantes (
                nome, email, telefone, idade, profissao, filhos, filhos_faixa_etaria,
                tipo_moradia, tamanho_moradia, tem_quintal, tamanho_quintal, localizacao, aluga_ou_possui,
                horas_trabalho_dia, horas_sozinho_dia, viagens_frequentes, dias_viagem_ano,
                nivel_atividade, hobbies, experiencia_previa, animais_tidos, problemas_passados,
                tamanho_preferido, idade_preferida, genero_preferido,
                tem_outros_animais, quantidade_outros_animais, tipo_outros_animais,
                orcamento_mensal_min, orcamento_mensal_max, disponibilidade_tempo_diario, comprometimento_texto,
                tracos_preferidos, tags_ideais, tem_preferencia_tracos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            nome, email, telefone, idade, profissao, filhos, None,
            tipo_moradia, tamanho_moradia, tem_quintal, tamanho_quintal, localizacao, aluga_ou_possui,
            horas_trabalho_dia, horas_sozinho_dia, viagens_frequentes, dias_viagem_ano,
            nivel_atividade, hobbies_json, experiencia_previa, animais_tidos_json, problemas_passados,
            tamanho_preferido, idade_preferida, genero_preferido,
            tem_outros_animais, quantidade_outros_animais, tipo_outros_json,
            orcamento_mensal_min, orcamento_mensal_max, disponibilidade_tempo_diario, comprometimento_texto,
            tracos_preferidos, tags_json, tem_preferencia_tracos
        ))
        conn.commit()
    finally:
        conn.close()


def ler_adotantes():
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM adotantes ORDER BY data_cadastro DESC")
    linhas = cur.fetchall()
    adotantes = []
    for row in linhas:
        adotante_dict = dict(row)
        adotante_dict = preparar_adotante_dict(adotante_dict)
        adotantes.append(adotante_dict)
    conn.close()
    return adotantes


def ler_adotante_id(adotante_id):
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM adotantes WHERE id = ?", (adotante_id,))
    adotante = cur.fetchone()
    conn.close()
    if adotante:
        adotante_dict = dict(adotante)
        adotante_dict = preparar_adotante_dict(adotante_dict)
        return adotante_dict
    return None


def atualizar_adotante(adotante_id, **kwargs):
    kwargs.pop('flexibilidade_matching', None)

    set_clause = []
    values = []

    for key, value in kwargs.items():
        if isinstance(value, bool):
            value = 1 if value else 0
        elif isinstance(value, list):
            value = json.dumps(value)

        set_clause.append(f"{key} = ?")
        values.append(value)

    if not set_clause:
        return

    values.append(adotante_id)

    conn = sqlite3.connect(BANCO)
    try:
        sql = f"UPDATE adotantes SET {', '.join(set_clause)} WHERE id = ?"
        conn.execute(sql, values)
        conn.commit()
    finally:
        conn.close()


def deletar_adotante(adotante_id):
    conn = sqlite3.connect(BANCO)
    conn.execute("DELETE FROM adotantes WHERE id = ?", (adotante_id,))
    conn.commit()
    conn.close()


def preparar_adotante_dict(adotante_dict):
    # Prepara dicionário de adotante parseando JSON
    if isinstance(adotante_dict, dict):
        json_fields = {
            'hobbies': list,
            'animais_tidos': list,
            'tipo_outros_animais': list,
            'tags_ideais': list,
            'tracos_preferidos': dict
        }

        for field, default_type in json_fields.items():
            if field in adotante_dict and adotante_dict[field]:
                try:
                    if not isinstance(adotante_dict[field], (dict, list)):
                        adotante_dict[field] = json.loads(adotante_dict[field])
                except (json.JSONDecodeError, TypeError):
                    adotante_dict[field] = default_type()
            else:
                adotante_dict[field] = default_type()

        for field in ['tem_quintal', 'viagens_frequentes', 'tem_outros_animais', 'tem_preferencia_tracos']:
            if field in adotante_dict:
                adotante_dict[field] = bool(adotante_dict[field])

    return adotante_dict


def preparar_adotante_para_api(adotante_dict):
    if not isinstance(adotante_dict, dict):
        return adotante_dict

    adotante_dict = preparar_adotante_dict(adotante_dict)

    try:
        data_str = adotante_dict.get('data_cadastro', '')
        if data_str:
            data_obj = datetime.strptime(data_str, '%Y-%m-%d')
            adotante_dict['data_cadastro_formatada'] = data_obj.strftime('%d/%m/%Y')
    except (ValueError, AttributeError):
        adotante_dict['data_cadastro_formatada'] = adotante_dict.get('data_cadastro', '')

    return adotante_dict


def buscar_adotante_por_email(email):
    conn = sqlite3.connect(BANCO)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM adotantes WHERE email = ?", (email,))
    adotante = cur.fetchone()
    conn.close()
    if adotante:
        adotante_dict = dict(adotante)
        adotante_dict = preparar_adotante_dict(adotante_dict)
        return adotante_dict
    return None
