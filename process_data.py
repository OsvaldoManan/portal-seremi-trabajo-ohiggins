# -*- coding: utf-8 -*-
"""Procesa todos los datos para el portal SEREMI Trabajo O'Higgins."""
import pandas as pd
import json
import pdfplumber
import glob
import os
import re

# Tabla de reemplazos: cualquier patron con caracter problematico -> texto correcto
# Cubre los patrones encontrados al extraer texto con pdfplumber/pandas-xlrd
PATCHES = [
    # CENSO / labor indicators
    ('Poblaci�n', 'Poblacion'),
    ('poblaci�n', 'poblacion'),
    ('ocupaci�n', 'ocupacion'),
    ('desocupaci�n', 'desocupacion'),
    ('a�os', 'anos'),
    ('m�s', 'mas'),
    ('m�nimo', 'minimo'),
    ('inversi�n', 'inversion'),
    ('Inversi�n', 'Inversion'),
    ('d�lares', 'dolares'),
    ('t�cnicos', 'tecnicos'),
    ('agr�colas', 'agricolas'),
    ('N�', 'N'),
    ('�rea', 'area'),
    ('comercializaci�n', 'comercializacion'),
    ('Creaci�n', 'Creacion'),
    # XLS columns
    ('C�DIGO', 'CODIGO'),
    ('DESCRIPCI�N', 'DESCRIPCION'),
    ('A�O', 'ANO'),
    ('TIPOLOG�A', 'TIPOLOGIA'),
    ('INSTITUCI�N', 'INSTITUCION'),
    ('IM�GENES', 'IMAGENES'),
    ('DISE�O', 'DISENO'),
    ('EDUCACI�N', 'EDUCACION'),
    ('POSTULACI�N', 'POSTULACION'),
    ('HIDR�ULICOS', 'HIDRAULICOS'),
    # 2026 xlsx
    ('Miner�a', 'Mineria'),
    ('Energ�a', 'Energia'),
    ('P�blicas', 'Publicas'),
    ('P�blica', 'Publica'),
    ('Construcci�n', 'Construccion'),
    ('Machal�', 'Machali'),
    ('Requ�noa', 'Requinoa'),
    ('subterr�neo', 'subterraneo'),
    ('L�neas', 'Lineas'),
    ('transmisi�n', 'transmision'),
    ('el�ctricas', 'electricas'),
    ('termoel�ctrica', 'termoelectrica'),
    ('petr�leo', 'petroleo'),
    ('cart�n', 'carton'),
    ('distribuci�n', 'distribucion'),
    ('qu�micas', 'quimicas'),
    ('E�lico', 'Eolico'),
    ('Conservaci�n', 'Conservacion'),
    ('Edificaci�n', 'Edificacion'),
    ('a oonorarios', 'a honorarios'),
]

def patch(s):
    if not isinstance(s, str):
        return s
    out = s
    for bad, good in PATCHES:
        out = out.replace(bad, good)
    out = out.replace('�', '')
    return out

# Add proper Spanish accents
SPANISH_FIX = {
    # PDF indicators
    'Poblacion censada': 'Población censada',
    'Cantidad de Hombres': 'Cantidad de Hombres',
    'Cantidad de Mujeres': 'Cantidad de Mujeres',
    '% personas de 65 anos o mas': '% personas de 65 años o más',
    'Tasa de ocupacion': 'Tasa de ocupación',
    'Tasa de desocupacion': 'Tasa de desocupación',
    'Cantidad de ocupados': 'Cantidad de ocupados',
    'Cantidad de desocupados': 'Cantidad de desocupados',
    'Poblacion en Edad de Trabajar': 'Población en Edad de Trabajar',
    'Fuerza de Trabajo': 'Fuerza de Trabajo',
    'Promedio de Ingresos Asalariados Formales': 'Promedio de Ingresos Asalariados Formales',
    '% Asalariados formales que ganan el minimo': '% Asalariados formales que ganan el mínimo',
    'Mediana de Ingresos Asalariados Dependientes': 'Mediana de Ingresos Asalariados Dependientes',
    '% Ocupados Formales': '% Ocupados Formales',
    'Total de empresas': 'Total de empresas',
    'Total de trabajadores dependientes': 'Total de trabajadores dependientes',
    'Total de trabajadores a honorarios': 'Total de trabajadores a honorarios',
    'Cantidad de avisos': 'Cantidad de avisos',
    'Cantidad de vacantes': 'Cantidad de vacantes',
    'Primera ocupacion con mas vacantes': 'Primera ocupación con más vacantes',
    'Cantidad de vacantes de primera ocupacion': 'Cantidad de vacantes de primera ocupación',
    'Segunda ocupacion con mas vacantes': 'Segunda ocupación con más vacantes',
    'Cantidad de vacantes de segunda ocupacion': 'Cantidad de vacantes de segunda ocupación',
    'Tercera ocupacion con mas vacantes': 'Tercera ocupación con más vacantes',
    'Cantidad de vacantes de tercera ocupacion': 'Cantidad de vacantes de tercera ocupación',
    'Cantidad de proyectos de inversion 2025-2029': 'Cantidad de proyectos de inversión 2025-2029',
    'Gasto involucrado 2025-2029 en millones de dolares': 'Gasto involucrado 2025-2029 en millones de dólares',
    'Creacion cantidad de empleos no calificados': 'Creación cantidad de empleos no calificados',
    'Creacion cantidad de empleos tecnicos': 'Creación cantidad de empleos técnicos',
    'Creacion de cantidad de empleos profesionales': 'Creación de cantidad de empleos profesionales',
    'Cantidad de empleos en la fase de operacion': 'Cantidad de empleos en la fase de operación',
    'Empleo Peak Total (N Personas)': 'Empleo Peak Total (N° Personas)',
    # Sectors
    'TRANSPORTE': 'Transporte',
    'RECURSOS HIDRICOS': 'Recursos Hídricos',
    'RECURSOS HIDRAULICOS': 'Recursos Hídricos',
    'EDUCACION, CULTURA Y PATRIMONIO': 'Educación, Cultura y Patrimonio',
    'EDUCACION': 'Educación',
    'MULTISECTORIAL': 'Multisectorial',
    'SALUD': 'Salud',
    'DEPORTES': 'Deportes',
    'VIVIENDA Y DESARROLLO URBANO': 'Vivienda y Desarrollo Urbano',
    'RECURSOS NATURALES Y MEDIO AMBIENTE': 'Recursos Naturales y Medio Ambiente',
    'ENERGIA': 'Energía',
    'SEGURIDAD PUBLICA': 'Seguridad Pública',
    'JUSTICIA': 'Justicia',
    'TURISMO Y COMERCIO': 'Turismo y Comercio',
    'PESCA': 'Pesca',
    'MINERIA': 'Minería',
    'COMUNICACIONES': 'Comunicaciones',
    'ARTE, CULTURA Y PATRIMONIO': 'Arte, Cultura y Patrimonio',
    # Tipos/Etapas
    'PROYECTO': 'Proyecto',
    'PROGRAMA': 'Programa',
    'ESTUDIO BASICO': 'Estudio Básico',
    'PERFIL': 'Perfil',
    'EJECUCION': 'Ejecución',
    'DISENO': 'Diseño',
    'PREFACTIBILIDAD': 'Prefactibilidad',
    'TERMINADO': 'Terminado',
    'OPERACION': 'Operación',
    'FACTIBILIDAD': 'Factibilidad',
    # Fuentes
    'F.N.D.R.': 'F.N.D.R.',
    'SECTORIAL': 'Sectorial',
    'MUNICIPAL': 'Municipal',
    'EMPRESA': 'Empresa',
    'DONACION': 'Donación',
    'MIXTO': 'Mixto',
    'OTROS': 'Otros',
    # 2026
    'Mineria': 'Minería',
    'Energia': 'Energía',
    'Obras Publicas': 'Obras Públicas',
    'Construccion': 'Construcción',
    'Inmobiliario': 'Inmobiliario',
    'Industrial': 'Industrial',
    'Terminado': 'Terminado',
    'Ing. de Detalle': 'Ing. de Detalle',
}

def beautify(s):
    if not isinstance(s, str):
        return s
    if s in SPANISH_FIX:
        return SPANISH_FIX[s]
    return s

NAME_FIXES = {
    'Che─upica': 'Chépica',
    'Don─aihue': 'Doñihue',
    'Machali─u': 'Machalí',
    'Requi─unoa': 'Requínoa',
}

def normalize_pdf_name(base):
    # Some Windows-encoded names have weird chars
    for bad, good in NAME_FIXES.items():
        if bad in base:
            return good
    if 'upica' in base.lower() and 'pica' in base.lower():
        return 'Chépica'
    if 'aihue' in base.lower():
        return 'Doñihue'
    if base.lower().startswith('machali'):
        return 'Machalí'
    if base.lower().startswith('requi'):
        return 'Requínoa'
    if 'Marchihue' == base:
        return 'Marchigüe'
    return base.replace('-', ' ')

def to_number(s):
    if not s or s == 'NA' or s == 'N/A':
        return None
    s = str(s).strip()
    s_clean = s.replace('.', '').replace(',', '.')
    try:
        return float(s_clean)
    except:
        return None

def parse_pdf(path):
    rows = []
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            for t in p.extract_tables():
                for row in t:
                    cells = [patch(str(c).strip()) for c in row if c and str(c).strip()]
                    if cells and len(cells) >= 2:
                        rows.append(cells)
    return rows

# ============== PROCESS PDFs ==============
print('=== PROCESANDO PDFs ===')
pdfs = sorted(glob.glob('Ohiggins/*.pdf'))
comunas_data = []
for pdf_path in pdfs:
    base = os.path.basename(pdf_path).split('-Ficha-Comunal')[0]
    comuna = normalize_pdf_name(base)
    rows = parse_pdf(pdf_path)
    indicators = {}
    for r in rows[1:]:
        if len(r) >= 3:
            key, val, src = r[0], r[1], r[2]
        elif len(r) == 2:
            key, val, src = r[0], r[1], ''
        else:
            continue
        key_clean = beautify(key)
        indicators[key_clean] = {'valor': val, 'fuente': src, 'numero': to_number(val)}
    comunas_data.append({
        'comuna': comuna,
        'archivo': os.path.basename(pdf_path),
        'indicadores': indicators
    })

os.makedirs('site/data', exist_ok=True)

# ====== ÍNDICE DE DESARROLLO LABORAL COMUNAL (IDLC) ======
# Componentes (todos normalizados 0-100):
#   1. Densidad empresarial: empresas / población * 1000 (capacidad productiva local)
#   2. Penetración laboral formal: dependientes / población (formalización)
#   3. Equilibrio honorarios-dependientes: 1 - (honorarios / dependientes) [menos precariedad = mejor]
#   4. Oferta de empleo: vacantes BNE / población * 1000 (dinamismo del mercado)
#   5. Inversión per cápita: gasto 25-29 (MUSD) / población * 1M (oportunidades futuras)
#   6. Empleo proyectado: empleo peak / población * 1000 (densidad de proyectos)
def get_num(c, k):
    v = c['indicadores'].get(k, {}).get('numero')
    return v if v else 0

# Calcular componentes brutos
for c in comunas_data:
    pob = get_num(c, 'Población censada') or 1
    empresas = get_num(c, 'Total de empresas')
    dependientes = get_num(c, 'Total de trabajadores dependientes')
    honorarios = get_num(c, 'Total de trabajadores a honorarios')
    vacantes = get_num(c, 'Cantidad de vacantes')
    gasto = get_num(c, 'Gasto involucrado 2025-2029 en millones de dólares')
    empleo_peak = get_num(c, 'Empleo Peak Total (N° Personas)')

    c['_idlc_raw'] = {
        'densidad_empresarial': (empresas / pob * 1000) if pob > 0 else 0,
        'penetracion_formal': (dependientes / pob) if pob > 0 else 0,
        'equilibrio_honor': max(0, 1 - (honorarios / dependientes)) if dependientes > 0 else 0,
        'oferta_empleo': (vacantes / pob * 1000) if pob > 0 else 0,
        'inversion_pc': (gasto / pob * 1_000_000) if pob > 0 else 0,
        'empleo_proy': (empleo_peak / pob * 1000) if pob > 0 else 0,
    }

# Normalizar cada componente a 0-100 usando min-max
COMP_KEYS = ['densidad_empresarial', 'penetracion_formal', 'equilibrio_honor',
             'oferta_empleo', 'inversion_pc', 'empleo_proy']
COMP_NAMES = {
    'densidad_empresarial': 'Densidad empresarial',
    'penetracion_formal': 'Formalización laboral',
    'equilibrio_honor': 'Equilibrio honorarios',
    'oferta_empleo': 'Dinamismo BNE',
    'inversion_pc': 'Inversión per cápita',
    'empleo_proy': 'Empleo proyectado'
}
COMP_WEIGHTS = {
    'densidad_empresarial': 0.20,
    'penetracion_formal': 0.20,
    'equilibrio_honor': 0.15,
    'oferta_empleo': 0.15,
    'inversion_pc': 0.15,
    'empleo_proy': 0.15
}

for key in COMP_KEYS:
    values = [c['_idlc_raw'][key] for c in comunas_data]
    valid = [v for v in values if v > 0]
    if not valid:
        continue
    mn, mx = min(valid), max(valid)
    rng = mx - mn if mx > mn else 1
    for c in comunas_data:
        v = c['_idlc_raw'][key]
        c['_idlc_raw'][key + '_norm'] = round(((v - mn) / rng) * 100, 1) if v > 0 else 0

# Calcular IDLC final
for c in comunas_data:
    score = 0
    components = {}
    for key in COMP_KEYS:
        norm_v = c['_idlc_raw'].get(key + '_norm', 0)
        components[COMP_NAMES[key]] = norm_v
        score += norm_v * COMP_WEIGHTS[key]
    c['idlc'] = {
        'score': round(score, 1),
        'componentes': components,
        'raw': {COMP_NAMES[k]: round(c['_idlc_raw'][k], 2) for k in COMP_KEYS}
    }
    del c['_idlc_raw']  # cleanup

# Ranking
sorted_comunas = sorted(comunas_data, key=lambda x: -x['idlc']['score'])
for rank, c in enumerate(sorted_comunas, 1):
    c['idlc']['rank'] = rank
    c['idlc']['total'] = len(comunas_data)

with open('site/data/comunas.json', 'w', encoding='utf-8') as f:
    json.dump(comunas_data, f, ensure_ascii=False, indent=2)
print(f'OK comunas.json: {len(comunas_data)} comunas con IDLC calculado')
print(f'   Top 3 IDLC: {[(c["comuna"], c["idlc"]["score"]) for c in sorted_comunas[:3]]}')
print(f'   Bottom 3 IDLC: {[(c["comuna"], c["idlc"]["score"]) for c in sorted_comunas[-3:]]}')

# ============== XLS HISTORICO ==============
print('\n=== PROCESANDO XLS HISTORICO ===')
df = pd.read_excel('Resultado_Consulta (1).xls', sheet_name='resultado')
df.columns = ['codigo_bip','descripcion','anio_postulacion','tipologia','sector',
              'sub_sector','fuente_financiera','rate','solicitado_anio','etapa_actual',
              'institucion_financiera','institucion_formuladora','costo_total_M',
              'comentarios','imagenes']

for col in ['descripcion','tipologia','sector','sub_sector','fuente_financiera',
            'rate','etapa_actual','institucion_financiera','institucion_formuladora']:
    df[col] = df[col].apply(patch).apply(beautify)

COMUNAS = ['CHEPICA','CHIMBARONGO','CODEGUA','COINCO','COLTAUCO','DONIHUE','GRANEROS',
           'LA ESTRELLA','LAS CABRAS','LOLOL','MACHALI','MALLOA','MARCHIHUE','MOSTAZAL',
           'NANCAGUA','NAVIDAD','OLIVAR','PALMILLA','PAREDONES','PERALILLO','PICHIDEGUA',
           'PICHILEMU','PLACILLA','PUMANQUE','QUINTA DE TILCOCO','RANCAGUA','RENGO',
           'REQUINOA','SAN FERNANDO','SAN VICENTE','SANTA CRUZ']
PROPER = {'CHEPICA':'Chépica','DONIHUE':'Doñihue','MACHALI':'Machalí',
          'REQUINOA':'Requínoa','LA ESTRELLA':'La Estrella','LAS CABRAS':'Las Cabras',
          'SAN FERNANDO':'San Fernando','SAN VICENTE':'San Vicente','SANTA CRUZ':'Santa Cruz',
          'QUINTA DE TILCOCO':'Quinta de Tilcoco','MARCHIHUE':'Marchigüe'}

def detect_comuna(desc):
    if not isinstance(desc, str): return None
    up = desc.upper()
    for c in COMUNAS:
        if c in up:
            return PROPER.get(c, c.title())
    return None

df['comuna'] = df['descripcion'].apply(detect_comuna)

output = {}
sec = df.groupby('sector').agg(cantidad=('codigo_bip','count'), costo_total=('costo_total_M','sum')).reset_index()
output['por_sector'] = sec.sort_values('cantidad', ascending=False).to_dict('records')

df_year = df[df['anio_postulacion'].between(1994, 2025)]
yr = df_year.groupby('anio_postulacion').agg(cantidad=('codigo_bip','count'), costo_total=('costo_total_M','sum')).reset_index()
yr['anio_postulacion'] = yr['anio_postulacion'].astype(int)
output['por_anio'] = yr.to_dict('records')

output['por_etapa'] = df.groupby('etapa_actual').agg(cantidad=('codigo_bip','count')).reset_index().sort_values('cantidad', ascending=False).to_dict('records')
output['por_tipologia'] = df.groupby('tipologia').agg(cantidad=('codigo_bip','count'), costo_total=('costo_total_M','sum')).reset_index().to_dict('records')

rate_map = {'RS':'Recomendado Satisfactoriamente','OT':'Objetado Técnicamente',
            'FI':'Falta Información','AD':'Admisión','RA':'Revisión',
            'FA':'Falta Antecedentes','VN':'Sin Evaluación','IN':'Inadmisible',
            'SP':'Sin Pronunciamiento','CF':'Conforme','*':'Sin Calificar'}
rate = df.groupby('rate').agg(cantidad=('codigo_bip','count')).reset_index().sort_values('cantidad', ascending=False)
rate['descripcion'] = rate['rate'].map(rate_map).fillna(rate['rate'])
output['por_rate'] = rate.to_dict('records')

inst = df['institucion_formuladora'].value_counts().head(15).reset_index()
inst.columns = ['institucion', 'cantidad']
output['top_formuladoras'] = inst.to_dict('records')

def simp_fuente(f):
    if not isinstance(f, str): return 'Otros'
    if f == 'F.N.D.R.': return 'F.N.D.R.'
    if f == 'Sectorial' or f == 'SECTORIAL': return 'Sectorial'
    if f == 'Municipal' or f == 'MUNICIPAL': return 'Municipal'
    if f == 'Empresa' or f == 'EMPRESA': return 'Empresa'
    if 'F.N.D.R.' in f.upper(): return 'Mixto'
    return 'Otros'
df['fuente_simple'] = df['fuente_financiera'].apply(simp_fuente)
fs = df.groupby('fuente_simple').agg(cantidad=('codigo_bip','count'), costo_total=('costo_total_M','sum')).reset_index()
output['por_fuente'] = fs.sort_values('cantidad', ascending=False).to_dict('records')

com = df[df['comuna'].notna()].groupby('comuna').agg(cantidad=('codigo_bip','count'), costo_total=('costo_total_M','sum')).reset_index().sort_values('cantidad', ascending=False)
output['por_comuna'] = com.to_dict('records')

ss = df.groupby('sub_sector').agg(cantidad=('codigo_bip','count')).reset_index().sort_values('cantidad', ascending=False).head(20)
output['top_subsectores'] = ss.to_dict('records')

output['resumen'] = {
    'total_registros': int(len(df)),
    'total_proyectos': int(len(df[df['tipologia']=='Proyecto'])),
    'total_programas': int(len(df[df['tipologia']=='Programa'])),
    'total_estudios': int(len(df[df['tipologia']=='Estudio Básico'])),
    'inversion_total_M': float(df['costo_total_M'].sum()),
    'anio_min': int(df['anio_postulacion'].min()),
    'anio_max': int(df['anio_postulacion'].max()),
    'sectores_count': int(df['sector'].nunique()),
    'instituciones_count': int(df['institucion_formuladora'].nunique())
}

with open('site/data/inversion_historica.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2, default=str)
print(f'OK inversion_historica.json: {output["resumen"]["total_registros"]} registros')

# ============== XLSX 2026 ==============
print('\n=== PROCESANDO INVERSION 2026 ===')
df2 = pd.read_excel('proyectos_inversión-2026-05-15.xlsx', sheet_name='Sheet 1')
for c in ['comuna','sector_economico','tipologia','etapa']:
    df2[c] = df2[c].apply(patch).apply(beautify)

# fix marchigue
df2['comuna'] = df2['comuna'].replace({'Marchigue': 'Marchigüe'})

out26 = {
    'registros': df2.to_dict('records'),
    'por_sector': df2.groupby('sector_economico').agg(
        cantidad=('cantidad','sum'), inversion=('inversion','sum'),
        profesionales=('profesionales','sum'), tecnicos=('tecnicos','sum'),
        nc=('nc','sum'), empleo_op=('empleo_operacion','sum')
    ).reset_index().to_dict('records'),
    'por_comuna': df2.groupby('comuna').agg(
        cantidad=('cantidad','sum'), inversion=('inversion','sum'),
        empleo_total=('empleo_operacion','sum')
    ).reset_index().sort_values('inversion', ascending=False).to_dict('records'),
    'por_etapa': df2.groupby('etapa').agg(
        cantidad=('cantidad','sum'), inversion=('inversion','sum')
    ).reset_index().to_dict('records'),
    'resumen': {
        'total_filas': int(len(df2)),
        'cantidad_total': int(df2['cantidad'].sum()),
        'inversion_total_MUSD': float(df2['inversion'].sum()),
        'profesionales_total': float(df2['profesionales'].sum()),
        'tecnicos_total': float(df2['tecnicos'].sum()),
        'nc_total': float(df2['nc'].sum()),
        'empleo_operacion_total': int(df2['empleo_operacion'].sum()),
        'empleo_construccion_total': float(df2['profesionales'].sum() + df2['tecnicos'].sum() + df2['nc'].sum()),
    }
}

with open('site/data/inversion_2026.json', 'w', encoding='utf-8') as f:
    json.dump(out26, f, ensure_ascii=False, indent=2, default=str)
print(f'OK inversion_2026.json: {out26["resumen"]["total_filas"]} proyectos')

print('\n=== TODO LISTO ===')
