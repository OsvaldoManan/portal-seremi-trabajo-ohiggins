// ============== CHATBOT SEREMI O'HIGGINS ==============
// Bot client-side (sin backend, sin APIs). Conoce los datos del portal y
// las líneas de acción de la SEREMI.
(function() {

  // ====== UTILS ======
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
  const fmt = (n, dec) => {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: dec || 0,
      maximumFractionDigits: dec || (n < 100 ? 2 : 0)
    }).format(n);
  };

  // ====== DATA LOADING ======
  let DATA = { comunas: [], hist: null, inv26: null, dir: null, ready: false };

  async function loadData() {
    try {
      const base = location.pathname.includes('/') ? '' : '';
      const [c, h, i, d] = await Promise.all([
        fetch('data/comunas.json').then(r => r.json()).catch(() => []),
        fetch('data/inversion_historica.json').then(r => r.json()).catch(() => null),
        fetch('data/inversion_2026.json').then(r => r.json()).catch(() => null),
        fetch('data/directorio.json').then(r => r.json()).catch(() => null)
      ]);
      DATA = { comunas: c, hist: h, inv26: i, dir: d, ready: true };
    } catch (e) {
      console.error('chatbot data error', e);
    }
  }

  // ====== INTENT MATCHERS ======
  const COMUNAS = ['Chépica','Chimbarongo','Codegua','Coinco','Coltauco','Doñihue','Graneros',
    'La Estrella','Las Cabras','Litueche','Lolol','Machalí','Malloa','Marchigüe','Mostazal',
    'Nancagua','Navidad','Olivar','Palmilla','Paredones','Peralillo','Peumo','Pichidegua',
    'Pichilemu','Placilla','Pumanque','Quinta de Tilcoco','Rancagua','Rengo','Requínoa',
    'San Fernando','San Vicente','Santa Cruz'];

  function findComuna(query) {
    const q = norm(query);
    for (const c of COMUNAS) {
      if (q.includes(norm(c))) return c;
    }
    return null;
  }

  function findIndicator(query) {
    const q = norm(query);
    const map = {
      'poblacion|habitantes|gente|personas censadas': 'Población censada',
      'hombres|varones': 'Cantidad de Hombres',
      'mujeres|femenino|mujer': 'Cantidad de Mujeres',
      'tasa.*ocupacion|tasa.*empleo': 'Tasa de ocupación',
      'tasa.*desocupacion|tasa.*desempleo': 'Tasa de desocupación',
      'ocupados|empleados|trabajadores activos': 'Cantidad de ocupados',
      'desocupados|desempleados|cesantes': 'Cantidad de desocupados',
      'pet|poblacion en edad': 'Población en Edad de Trabajar',
      'fuerza de trabajo|fuerza laboral': 'Fuerza de Trabajo',
      'ingreso|sueldo|salario|remuneracion': 'Promedio de Ingresos Asalariados Formales',
      'minimo|salario minimo': '% Asalariados formales que ganan el mínimo',
      'mediana': 'Mediana de Ingresos Asalariados Dependientes',
      'formales': '% Ocupados Formales',
      'empresas': 'Total de empresas',
      'dependientes': 'Total de trabajadores dependientes',
      'honorarios': 'Total de trabajadores a honorarios',
      'avisos': 'Cantidad de avisos',
      'vacantes': 'Cantidad de vacantes',
      'proyectos.*inversion': 'Cantidad de proyectos de inversión 2025-2029',
      'gasto|inversion|mmusd|musd': 'Gasto involucrado 2025-2029 en millones de dólares',
      'empleos.*no calificados|nc': 'Creación cantidad de empleos no calificados',
      'empleos.*tecnicos': 'Creación cantidad de empleos técnicos',
      'empleos.*profesionales': 'Creación de cantidad de empleos profesionales',
      'empleos.*operacion': 'Cantidad de empleos en la fase de operación',
      'peak|empleo total': 'Empleo Peak Total (N° Personas)'
    };
    for (const [pattern, key] of Object.entries(map)) {
      if (new RegExp(pattern, 'i').test(q)) return key;
    }
    return null;
  }

  // ====== INTENT HANDLERS ======
  const INTENTS = [
    // Saludo
    {
      match: q => /\b(hola|buenas|hey|hi|holi)\b/i.test(q),
      respond: () => ({
        text: `¡Hola! Soy el asistente del Portal SEREMI Trabajo O'Higgins. Puedo ayudarte con:`,
        suggestions: ['Población de Rancagua', 'Vacantes en San Fernando', '¿Qué es la Ley Karin?', 'Oficinas SENCE', 'Salario mínimo 2026', 'Inversión por sector']
      })
    },
    // Ayuda
    {
      match: q => /\b(ayuda|help|que.*puedes|que.*haces|como.*funciona)/i.test(norm(q)),
      respond: () => ({
        text: `Conozco los datos del Observatorio Laboral O'Higgins. Algunos ejemplos de lo que puedes preguntarme:

• <b>Indicadores:</b> "Población de Pichilemu", "Empresas en Rancagua", "Vacantes en San Fernando"
• <b>Inversión:</b> "Inversión histórica en transporte", "Cartera 2026 por sector", "Empleo proyectado"
• <b>Líneas de acción:</b> "¿Qué es la Ley Karin?", "Sala Cuna Universal", "40 horas"
• <b>Servicios:</b> "Oficinas SENCE", "DT San Fernando", "Teléfono ChileAtiende"
• <b>Análisis:</b> "Objetivos institucionales", "Brechas regionales"

También puedes escribir <b>"Comparar Rancagua vs San Fernando"</b> o <b>"Top 5 comunas por empleo"</b>.`,
        suggestions: ['Comparar Rancagua vs Pichilemu', 'Top 5 vacantes', 'Mesas de trabajo regional']
      })
    },
    // Comuna específica con indicador
    {
      match: q => findComuna(q) && findIndicator(q),
      respond: q => {
        const comuna = findComuna(q);
        const indKey = findIndicator(q);
        const c = DATA.comunas.find(x => x.comuna === comuna);
        if (!c) return { text: `No tengo ficha para <b>${comuna}</b>.` };
        const ind = c.indicadores[indKey];
        if (!ind || !ind.valor || ind.valor === 'NA') return { text: `<b>${comuna}</b>: no hay dato registrado para <i>${indKey}</i>.` };

        // Comparar con promedio regional
        const allNums = DATA.comunas.map(x => x.indicadores[indKey]?.numero || 0).filter(v => v > 0);
        const avg = allNums.length ? allNums.reduce((s,n)=>s+n,0)/allNums.length : 0;
        const max = Math.max(...allNums);
        const sorted = [...allNums].sort((a,b)=>b-a);
        const rank = sorted.indexOf(ind.numero || 0) + 1;
        const pctAvg = avg > 0 && ind.numero ? (((ind.numero/avg) - 1) * 100).toFixed(1) : null;

        return {
          text: `<b>${comuna}</b> · ${indKey}
<div style="font-size:1.5rem; font-weight:800; color:#FFD200; margin:.4rem 0;">${ind.valor}</div>
<small>Fuente: ${ind.fuente || '—'}</small>
${pctAvg !== null ? `<br><small>${pctAvg >= 0 ? '+' : ''}${pctAvg}% vs. promedio regional · Posición ${rank} de ${allNums.length}</small>` : ''}

<a href="comunas.html#tab-detalle" style="color:#FFD200;">→ Ver ficha completa de ${comuna}</a>`,
          suggestions: [`Empresas en ${comuna}`, `Vacantes en ${comuna}`, `Comparar ${comuna} vs Rancagua`]
        };
      }
    },
    // Solo comuna (sin indicador específico)
    {
      match: q => findComuna(q) && !findIndicator(q),
      respond: q => {
        const comuna = findComuna(q);
        const c = DATA.comunas.find(x => x.comuna === comuna);
        if (!c) return { text: `No tengo ficha para <b>${comuna}</b>.` };
        const ind = c.indicadores;
        const pob = ind['Población censada']?.valor || '—';
        const emp = ind['Total de empresas']?.valor || '—';
        const vac = ind['Cantidad de vacantes']?.valor || '—';
        const ocp = ind['Cantidad de ocupados']?.valor || '—';
        return {
          text: `<b>📍 ${comuna}</b>
<table style="margin-top:.5rem; font-size:.88rem;">
<tr><td>Población:</td><td><b>${pob}</b></td></tr>
<tr><td>Ocupados:</td><td><b>${ocp}</b></td></tr>
<tr><td>Empresas activas:</td><td><b>${emp}</b></td></tr>
<tr><td>Vacantes BNE:</td><td><b>${vac}</b></td></tr>
</table>
<a href="comunas.html#tab-detalle" style="color:#FFD200;">→ Ver ficha completa con 32 indicadores</a>`,
          suggestions: [`Empleo en ${comuna}`, `Ingresos en ${comuna}`, `Inversión en ${comuna}`]
        };
      }
    },
    // Top N por indicador
    {
      match: q => /\b(top|ranking|mayores|principales|mas)\b/i.test(q) && (findIndicator(q) || /poblacion|empresas|empleo|vacantes/i.test(q)),
      respond: q => {
        const indKey = findIndicator(q) || 'Población censada';
        const num = (c) => c.indicadores[indKey]?.numero || 0;
        const top = [...DATA.comunas].sort((a,b) => num(b) - num(a)).slice(0, 5);
        const rows = top.map((c, i) => `${i+1}. <b>${c.comuna}</b> — ${c.indicadores[indKey]?.valor || '—'}`).join('<br>');
        return {
          text: `<b>Top 5 comunas por ${indKey}:</b><br>${rows}<br><br><a href="comunas.html#tab-ranking" style="color:#FFD200;">→ Ranking completo</a>`,
          suggestions: ['Top 5 empresas', 'Top 5 vacantes', 'Top 5 inversión']
        };
      }
    },
    // Comparación entre 2-3 comunas
    {
      match: q => /\bvs\b|\bversus\b|\bcomparar\b|\bcompara\b|\bcompara\b/i.test(q),
      respond: q => {
        const found = [];
        for (const c of COMUNAS) {
          if (norm(q).includes(norm(c))) found.push(c);
          if (found.length >= 3) break;
        }
        if (found.length < 2) return { text: `Para comparar necesito al menos 2 nombres de comunas. Ejemplo: <i>"Comparar Rancagua vs San Fernando"</i>` };

        const indKey = findIndicator(q) || 'Población censada';
        const rows = found.map(name => {
          const c = DATA.comunas.find(x => x.comuna === name);
          const v = c?.indicadores[indKey];
          return `<b>${name}</b>: ${v?.valor || '—'}`;
        }).join('<br>');
        return {
          text: `<b>Comparativa — ${indKey}</b><br>${rows}<br><br><a href="comunas.html#tab-lado-a-lado" style="color:#FFD200;">→ Vista lado a lado completa (20+ indicadores)</a>`,
          suggestions: ['Comparar Rancagua vs Pichilemu', 'Mapa geográfico', 'Ranking regional']
        };
      }
    },
    // Inversión histórica
    {
      match: q => /(inversion|proyectos).*(historica|1994|bip|publica)|sector.*(transporte|salud|educacion|recursos|mineria|hidricos)/i.test(norm(q)),
      respond: q => {
        if (!DATA.hist) return { text: `Datos de inversión histórica no disponibles.` };
        const r = DATA.hist.resumen;
        const topSec = DATA.hist.por_sector.slice(0, 5);
        return {
          text: `<b>📊 Inversión histórica regional (${r.anio_min}-${r.anio_max})</b>

• <b>${fmt(r.total_registros)}</b> iniciativas registradas en el BIP
• Inversión acumulada: <b>M$${fmt(r.inversion_total_M)}</b>
• <b>${r.sectores_count}</b> sectores · <b>${r.instituciones_count}</b> instituciones formuladoras

<b>Top 5 sectores:</b><br>
${topSec.map((s,i) => `${i+1}. ${s.sector} — ${fmt(s.cantidad)} proyectos`).join('<br>')}

<a href="inversion.html" style="color:#FFD200;">→ Ver dashboard completo</a>`,
          suggestions: ['Cartera 2026', 'Inversión en transporte', 'Proyectos en perfil']
        };
      }
    },
    // Cartera 2026
    {
      match: q => /(cartera|inversion).*(2026|privada|cbc)|mineria.*2026|empleo.*proyectado/i.test(norm(q)),
      respond: q => {
        if (!DATA.inv26) return { text: `Datos 2026 no disponibles.` };
        const r = DATA.inv26.resumen;
        const sec = [...DATA.inv26.por_sector].sort((a,b) => b.inversion - a.inversion).slice(0, 5);
        return {
          text: `<b>🏗️ Cartera 2026 (CBC)</b>

• Inversión total: <b>US$${fmt(r.inversion_total_MUSD)}M</b>
• Empleo construcción: <b>${fmt(r.empleo_construccion_total)}</b>
• Empleo operación: <b>${fmt(r.empleo_operacion_total)}</b>
• Profesionales/Técnicos/NC: ${fmt(r.profesionales_total)} / ${fmt(r.tecnicos_total)} / ${fmt(r.nc_total)}

<b>Sectores:</b><br>
${sec.map(s => `• ${s.sector_economico}: US$${fmt(s.inversion)}M`).join('<br>')}

<a href="inversion.html#tab-cartera" style="color:#FFD200;">→ Ver detalle de 36 proyectos</a>`,
          suggestions: ['Empleo proyectado', 'Cartera 2026 por comuna']
        };
      }
    },
    // Ley Karin
    {
      match: q => /\b(karin|21\.?643|21643|acoso|violencia.*trabajo)\b/i.test(q),
      respond: () => ({
        text: `<b>⚖️ Ley Karin (Ley 21.643)</b>

Primera norma chilena en ratificar el <b>Convenio 190 de la OIT</b>. Busca erradicar acoso laboral, sexual y violencia en el trabajo.

<b>Implementación regional O'Higgins:</b>
• Encuentros informativos con 300+ representantes en Universidad de O'Higgins
• Capacitación a empleadores y dirigencias sindicales
• Dictamen DT con procedimientos de prevención, investigación y sanción
• Canal único de denuncia con ISL y mutualidades
• Línea de orientación: 600 450 4000 (DT) · 101 (ChileAtiende)

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 3: Líneas de Acción Ley Karin</a>`,
        suggestions: ['Denunciar acoso laboral', 'Oficinas DT', '40 horas']
      })
    },
    // 40 horas
    {
      match: q => /(40.horas|reduccion.*jornada|21\.?561|21561|jornada laboral)/i.test(norm(q)),
      respond: () => ({
        text: `<b>⏱️ Ley 21.561 — 40 horas</b>

Reducción gradual de la jornada laboral:
• <b>44 horas</b> desde 2024 ✓
• <b>42 horas</b> desde 2026 ✓
• <b>40 horas</b> desde 2028

<b>Adaptabilidad sectorial regional:</b>
• Mesa con agroindustria (ciclos de cosecha, packing)
• Mesa con minería (jornadas excepcionales, bisemanales)
• Coordinación con DT Regional para autorizaciones

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 5: 40 horas y condiciones laborales</a>`,
        suggestions: ['Salario mínimo 2026', 'Reforma previsional', 'Jornadas excepcionales']
      })
    },
    // Salario mínimo
    {
      match: q => /(salario.minimo|sueldo.minimo|ingreso.minimo|imm|21\.?751|21751)/i.test(norm(q)),
      respond: () => ({
        text: `<b>💰 Salario Mínimo 2026</b>

• Ingreso Mínimo Mensual: <b>$546.546</b> desde mayo 2026
• Variación IPC enero-marzo: 1,4%
• Ley 21.751 publicada en Diario Oficial
• Mecanismo automático de reajuste anual desde enero 2027

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 5: Líneas de Acción</a>`,
        suggestions: ['40 horas', 'Reforma previsional', 'Seguro de cesantía']
      })
    },
    // Sala Cuna
    {
      match: q => /\bsala.cuna|cuidado.infantil|guarderia|jardin.infantil\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>🍼 Sala Cuna Universal</b>

Proyecto de ley en tramitación que <b>elimina el requisito de 20 trabajadoras</b> para que las empresas paguen sala cuna. Esta condición durante décadas limitó la contratación femenina.

<b>Nuevo enfoque:</b>
• Aplica a trabajadores Y trabajadoras (corresponsabilidad)
• Cuidado infantil como responsabilidad social compartida
• Costo distribuido entre todos los empleadores

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 4: Mujer y equidad</a>`,
        suggestions: ['Mujer Digital', 'Bono al Trabajo Mujer', 'Empleo femenino']
      })
    },
    // SENCE
    {
      match: q => /\bsence|capacitacion|cursos|despega.mipe|talento.digital|reinventate|becas.laborales|aprendices\b/i.test(norm(q)),
      respond: q => {
        const sence = DATA.dir?.servicios?.find(s => s.tipo === 'SENCE');
        return {
          text: `<b>🎓 SENCE — Capacitación y Empleo</b>

<b>SENCE O'Higgins:</b> ${sence?.direccion || 'Campos 241, Piso 6, Rancagua'}<br>
<b>Tel:</b> ${sence?.telefono || '+56 22 383 0400 anexo 4602'} · *8088 desde móvil

<b>Programas activos:</b>
• <b>Despega MIPE 2026</b> — Cursos para micro y pequeñas empresas (online)
• <b>Talento Digital - Reinvéntate</b> — Front-End Trainee (438 hrs, Rancagua)
• <b>Mujer Digital</b> — 65 cursos online gratuitos
• <b>Becas Laborales</b> — Para personas vulnerables
• <b>Aprendices</b> — Jóvenes hasta 25 años
• <b>Consejo Regional de Capacitación</b> — 696 cupos asignados

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 1: Líneas de Acción · Empleabilidad</a>`,
          suggestions: ['Becas Laborales', 'Mujer Digital', 'Cursos online']
        };
      }
    },
    // Directorio - oficinas
    {
      match: q => /\b(oficina|direccion|telefono|donde|horario)\b.*\b(seremi|dt|direccion.del.trabajo|sence|ips|chileatiende)\b/i.test(norm(q)) ||
                  /\b(seremi|dt|sence|ips|omil)\b.*\b(donde|telefono|direccion|horario)\b/i.test(norm(q)),
      respond: q => {
        const qn = norm(q);
        let tipo = null;
        if (/seremi/.test(qn)) tipo = 'SEREMI';
        else if (/sence/.test(qn)) tipo = 'SENCE';
        else if (/dt|direccion.del.trabajo/.test(qn)) tipo = 'DT';
        else if (/ips|chileatiende/.test(qn)) tipo = 'IPS';

        if (!tipo || !DATA.dir) return { text: 'Mira el <a href="directorio.html" style="color:#FFD200;">Directorio completo</a> con oficinas, teléfonos y horarios.' };
        const servs = DATA.dir.servicios.filter(s => s.tipo === tipo);
        const rows = servs.map(s => `<b>${s.nombre}</b><br>📍 ${s.direccion}, ${s.comuna}<br>☎ <a href="tel:${s.telefono.replace(/[^+0-9]/g,'')}" style="color:#FFD200;">${s.telefono}</a><br>🕐 ${s.horario}`).join('<br><br>');
        return {
          text: `<b>${tipo} en O'Higgins:</b><br><br>${rows}<br><br><a href="directorio.html" style="color:#FFD200;">→ Directorio completo</a>`,
          suggestions: ['Oficinas DT', 'Oficinas SENCE', 'Teléfono ChileAtiende']
        };
      }
    },
    // OMIL en comuna
    {
      match: q => /\bomil\b/i.test(q),
      respond: q => {
        const c = findComuna(q);
        if (c) {
          const omil = DATA.dir?.omil?.find(o => o.comuna === c);
          if (omil) return {
            text: `<b>OMIL ${omil.comuna}</b><br>${omil.municipalidad}<br><br>Las OMIL brindan: intermediación laboral, postulación a programas SENCE, asesoría a empleadores y derivación a servicios.<br><br><a href="directorio.html" style="color:#FFD200;">→ Ver red completa</a>`,
            suggestions: ['Oficinas SENCE', 'Bolsa Nacional de Empleo']
          };
        }
        return {
          text: `<b>Red OMIL en O'Higgins:</b> 33 Oficinas Municipales de Información Laboral, una por comuna. Brindan intermediación laboral, postulación a programas SENCE y asesoría.<br><br><a href="directorio.html" style="color:#FFD200;">→ Lista completa de OMIL</a>`,
          suggestions: ['OMIL Rancagua', 'OMIL San Fernando', 'Bolsa Nacional de Empleo']
        };
      }
    },
    // Teléfonos útiles
    {
      match: q => /\b(chileatiende|101|telefonos.utiles|emergencia)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>📞 Teléfonos útiles 24/7</b>

• <b>ChileAtiende:</b> <a href="tel:101" style="color:#FFD200;">101</a> — IPS, bonos y trámites
• <b>BNE:</b> <a href="tel:6007120028" style="color:#FFD200;">600 712 0028</a> — Vacantes
• <b>SENCE:</b> *8088 — Cursos y subsidios
• <b>Dirección del Trabajo:</b> <a href="tel:6004504000" style="color:#FFD200;">600 450 4000</a>
• <b>Fonosalud Mutual:</b> <a href="tel:6002000506" style="color:#FFD200;">600 200 0506</a>

<a href="directorio.html" style="color:#FFD200;">→ Directorio completo</a>`,
        suggestions: ['Oficinas DT', 'Denunciar acoso', 'Postular a empleo']
      })
    },
    // Objetivos institucionales
    {
      match: q => /\bobjetivos|oe\d|plan estrategico|metas 2028|brechas\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>🎯 7 Objetivos institucionales 2026-2028</b>

<b>OE1</b> — Trabajo decente y formalización<br>
<b>OE2</b> — Capacitación pertinente<br>
<b>OE3</b> — Equidad de género en el trabajo<br>
<b>OE4</b> — Cohesión territorial (SEREMI itinerante)<br>
<b>OE5</b> — Diálogo social tripartito<br>
<b>OE6</b> — Información para decidir (Observatorio 2.0)<br>
<b>OE7</b> — Anticipación a la transformación productiva

<a href="analisis.html" style="color:#FFD200;">→ Ver análisis estratégico completo con metas</a>`,
        suggestions: ['Brechas regionales', 'Programa de Gobierno', 'Mesas tripartitas']
      })
    },
    // Programa de gobierno
    {
      match: q => /\b(programa.*gobierno|bases.*programaticas|kast|fuerza.*cambio|9.ejes)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>📋 Programa de Gobierno aplicado</b>

Adaptación de las Bases Programáticas a la SEREMI O'Higgins con 9 ejes regionales:

1. Revolución Laboral Regional
2. Más y Mejor Trabajo
3. Cero Burocracia para el Empleo
4. SENCE 2.0 — Formación Pertinente
5. Vinculación TP-Empresa
6. Mujer Trabaja O'Higgins
7. Modernización Institucional
8. Reforma Previsional aplicada
9. Formaliza O'Higgins

<a href="programa.html" style="color:#FFD200;">→ Ver matriz de medidas + 100 primeros días</a>`,
        suggestions: ['Líneas de Acción', 'Objetivos institucionales', 'Reforma previsional']
      })
    },
    // Mesas tripartitas
    {
      match: q => /\bmesa|tripartita|consejo regional|dialogo social\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>🤝 6 Mesas regionales en operación</b>

• <b>Consejo Regional de Capacitación</b> — Tripartito, 696 cupos
• <b>Mesa Minera</b> — Con Codelco El Teniente (trimestral)
• <b>Mesa Agroindustrial</b> — Estacional, con gremios y sindicatos
• <b>Mesa Ley Karin</b> — Con UOH, ISL y MinMujerEG
• <b>Diálogo Social Tripartito</b> — Semestral
• <b>Coordinación Servicios Sector Trabajo</b> — Mensual

<a href="lineas-accion.html" style="color:#FFD200;">→ Detalle de mesas y participantes</a>`,
        suggestions: ['Consejo Regional Capacitación', 'Codelco El Teniente']
      })
    },
    // Codelco El Teniente
    {
      match: q => /\b(codelco|teniente|sewell|caletones|coya|mineria)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>⛏️ Codelco División El Teniente</b>

• 76% de trabajadores residen en O'Higgins
• 90% del personal es regional
• Faenas en Caletones, Coya, Sewell, Colón y Machalí
• <b>14 de mayo 2026:</b> reunión con SEREMIs (Minería, Trabajo, Economía, Mujer) para hoja de ruta de inclusión femenina y empleabilidad

Vacantes activas en División y contratistas. Portal oficial: <b>codelco.com</b>

<a href="lineas-accion.html" style="color:#FFD200;">→ Líneas de Acción · Mesa Minera</a>`,
        suggestions: ['Trabajo en minería', 'Inclusión femenina', 'Fiscalización minera']
      })
    },
    // Fiscalización agrícola
    {
      match: q => /\b(temporero|temporera|agricola|cosecha|packing|fiscalizacion.*agro|temporada)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>🌾 Programa Nacional Fiscalización Agrícola 2025-2026</b>

O'Higgins integra el plan nacional con <b>500 inspecciones en 12 regiones hasta marzo 2026</b>.

<b>3 sub-programas:</b>
• Higiene y seguridad
• Contratos y maternidad
• Trabajo adolescente y transporte

<b>Sanciones:</b>
• Multas entre 3 y 60 UTM según tamaño
• <b>Suspensión inmediata</b> por falta de agua potable, baños o trabajo infantil

<b>Plan estacional:</b> Alerta por altas temperaturas en faenas agrícolas con protocolo de agua, sombra y horarios escalonados.

<a href="lineas-accion.html" style="color:#FFD200;">→ Eje 2: Fiscalización</a>`,
        suggestions: ['Denunciar empleador agro', 'Contratos temporeros', 'Oficinas DT']
      })
    },
    // Cómo denuncio
    {
      match: q => /\b(denuncia|denunciar|reclamo|infraccion|fiscalia laboral)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>📣 Cómo denunciar infracciones laborales</b>

<b>Canales:</b>
• <b>En línea:</b> <a href="https://www.dt.gob.cl" target="_blank" style="color:#FFD200;">dt.gob.cl</a>
• <b>Presencial:</b>
  - DT Cachapoal — Plaza de Los Héroes 389, Rancagua
  - DT Colchagua — Argomedo 634, San Fernando
  - DT Santa Cruz — 21 de Mayo 085
• <b>Telefónico:</b> 600 450 4000

<b>Para casos Ley Karin (acoso):</b> denuncia directa al empleador + DT en paralelo. Confidencialidad y debido proceso garantizados.

<a href="directorio.html" style="color:#FFD200;">→ Directorio completo</a>`,
        suggestions: ['Ley Karin', 'Oficinas DT', 'ChileAtiende 101']
      })
    },
    // Changelog / cambios
    {
      match: q => /\b(cambios|actualizaciones|changelog|que.*nuevo|novedades|version)\b/i.test(norm(q)),
      respond: () => ({
        text: `<b>🆕 Últimas actualizaciones del portal</b>

<b>v6 (16-may-2026):</b> Líneas de Acción Institucional con 6 ejes y datos verificados desde fuentes oficiales<br>
<b>v5 (15-may-2026):</b> Mapa geográfico real, comparador lado a lado, directorio, buscador global (Ctrl+K)<br>
<b>v4 (15-may-2026):</b> Programa de Gobierno aplicado con 9 ejes regionales<br>
<b>v3 (15-may-2026):</b> Mapa heatmap, modo oscuro, descarga CSV<br>
<b>v2 (15-may-2026):</b> Análisis estratégico con brechas y objetivos<br>
<b>v1 (15-may-2026):</b> Lanzamiento inicial del portal

<a href="changelog.html" style="color:#FFD200;">→ Historial completo de cambios</a>`,
        suggestions: ['Mapa geográfico', 'Modo oscuro', 'Buscador global']
      })
    }
  ];

  // ====== FALLBACK ======
  function fallback(q) {
    return {
      text: `No estoy seguro de cómo responder eso. Algunos temas que conozco:

• Indicadores de las 31 comunas (población, empleo, empresas, vacantes, etc.)
• Inversión histórica 1994-2025 y cartera 2026
• Ley Karin, 40 horas, salario mínimo, Sala Cuna Universal
• Programas SENCE (Despega MIPE, Talento Digital, Mujer Digital)
• Oficinas DT, SENCE, IPS y red OMIL
• Análisis estratégico y objetivos institucionales
• Programa de Gobierno aplicado

Prueba con <b>"ayuda"</b> para ver ejemplos.`,
      suggestions: ['Ayuda', 'Población de Rancagua', 'Ley Karin', 'Oficinas SENCE']
    };
  }

  // ====== ENGINE ======
  function respond(query) {
    if (!DATA.ready) return { text: 'Cargando datos del portal…' };
    for (const intent of INTENTS) {
      if (intent.match(query)) {
        return intent.respond(query);
      }
    }
    return fallback(query);
  }

  // ====== UI ======
  function injectUI() {
    if (document.getElementById('chatbot-toggle')) return;

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'chatbot-toggle';
    btn.setAttribute('aria-label', 'Abrir asistente del portal');
    btn.innerHTML = '<span>💬</span>';
    btn.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9998;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #0F3F8C, #1E5BB8);
      color: white; font-size: 1.8rem; border: 0;
      box-shadow: 0 8px 24px rgba(15,63,140,.4);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .2s ease, box-shadow .2s ease;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.08)'; btn.style.boxShadow = '0 12px 32px rgba(15,63,140,.6)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 8px 24px rgba(15,63,140,.4)'; });

    // Panel
    const panel = document.createElement('div');
    panel.id = 'chatbot-panel';
    panel.style.cssText = `
      position: fixed; bottom: 94px; right: 24px; z-index: 9999;
      width: 380px; max-width: calc(100vw - 32px); height: 580px; max-height: calc(100vh - 120px);
      background: white; border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0,0,0,.3);
      display: none; flex-direction: column; overflow: hidden;
      font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    `;
    panel.innerHTML = `
      <div style="background:linear-gradient(135deg,#0F3F8C,#1E5BB8); color:white; padding:1rem 1.25rem; display:flex; align-items:center; gap:.75rem;">
        <div style="width:40px; height:40px; background:rgba(255,255,255,.18); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">🤖</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; font-size:1rem;">Asistente del Portal</div>
          <div style="font-size:.78rem; opacity:.85;">SEREMI Trabajo · O'Higgins</div>
        </div>
        <button id="chatbot-close" aria-label="Cerrar" style="background:rgba(255,255,255,.18); border:0; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem;">×</button>
      </div>
      <div id="chatbot-messages" style="flex:1; padding:1rem; overflow-y:auto; background:#F9FAFB; font-size:.92rem; line-height:1.5;"></div>
      <div id="chatbot-suggestions" style="padding:.5rem 1rem 0; background:#F9FAFB; border-top:1px solid #E5E7EB; display:flex; flex-wrap:wrap; gap:.4rem;"></div>
      <form id="chatbot-form" style="padding:.85rem 1rem 1rem; background:white; border-top:1px solid #E5E7EB; display:flex; gap:.5rem;">
        <input id="chatbot-input" type="text" autocomplete="off" placeholder="Pregunta sobre datos, leyes o servicios..." style="flex:1; padding:.65rem .85rem; border:1px solid #E5E7EB; border-radius:8px; font-size:.95rem; outline:none;">
        <button type="submit" style="background:#0F3F8C; color:white; border:0; padding:0 1rem; border-radius:8px; cursor:pointer; font-weight:600;">↑</button>
      </form>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const messages = panel.querySelector('#chatbot-messages');
    const suggestions = panel.querySelector('#chatbot-suggestions');
    const form = panel.querySelector('#chatbot-form');
    const input = panel.querySelector('#chatbot-input');

    function addMessage(text, who, sugg) {
      const wrap = document.createElement('div');
      const isUser = who === 'user';
      wrap.style.cssText = `margin-bottom:.85rem; display:flex; ${isUser ? 'justify-content:flex-end;' : ''}`;
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        max-width: 85%; padding: .7rem .9rem; border-radius: 14px;
        ${isUser
          ? 'background:#0F3F8C; color:white; border-bottom-right-radius:4px;'
          : 'background:white; color:#1A2332; border:1px solid #E5E7EB; border-bottom-left-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.04);'}
      `;
      bubble.innerHTML = text;
      wrap.appendChild(bubble);
      messages.appendChild(wrap);

      // Update suggestions
      if (!isUser && sugg && sugg.length) {
        suggestions.innerHTML = sugg.map(s =>
          `<button class="cb-sugg" style="background:white; border:1px solid #E5E7EB; padding:.35rem .7rem; border-radius:14px; font-size:.78rem; cursor:pointer; color:#0F3F8C;">${s}</button>`
        ).join('');
        suggestions.querySelectorAll('.cb-sugg').forEach(b => {
          b.addEventListener('click', () => { input.value = b.textContent; form.dispatchEvent(new Event('submit')); });
        });
      }
      messages.scrollTop = messages.scrollHeight;
    }

    function ask(query) {
      addMessage(query, 'user');
      input.value = '';
      setTimeout(() => {
        const r = respond(query);
        addMessage(r.text, 'bot', r.suggestions);
      }, 200);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) ask(q);
    });

    btn.addEventListener('click', () => {
      const isOpen = panel.style.display === 'flex';
      panel.style.display = isOpen ? 'none' : 'flex';
      btn.innerHTML = isOpen ? '<span>💬</span>' : '<span>×</span>';
      if (!isOpen && messages.children.length === 0) {
        // First open: welcome
        setTimeout(() => {
          const r = respond('hola');
          addMessage(r.text, 'bot', r.suggestions);
        }, 100);
        setTimeout(() => input.focus(), 200);
      }
    });
    panel.querySelector('#chatbot-close').addEventListener('click', () => {
      panel.style.display = 'none';
      btn.innerHTML = '<span>💬</span>';
    });

    // Dark mode adaptation
    document.addEventListener('themechange', () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      panel.style.background = dark ? '#1A2332' : 'white';
      messages.style.background = dark ? '#131922' : '#F9FAFB';
      messages.style.color = dark ? '#F3F4F6' : '#1A2332';
      suggestions.style.background = dark ? '#131922' : '#F9FAFB';
      form.style.background = dark ? '#1A2332' : 'white';
      input.style.background = dark ? '#2C3E50' : 'white';
      input.style.color = dark ? '#F3F4F6' : '#1A2332';
      input.style.borderColor = dark ? '#495467' : '#E5E7EB';
    });
  }

  // Init
  loadData();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
