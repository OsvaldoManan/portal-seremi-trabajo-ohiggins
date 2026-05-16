// ============== GLOSARIO + FAQ ==============
(function() {

  const GLOSARIO = [
    { sigla: 'AFC', nombre: 'Administradora de Fondos de Cesantía', desc: 'Entidad privada con concesión estatal que administra el Seguro de Cesantía obligatorio para trabajadores con contrato.', tag: 'previsión' },
    { sigla: 'AFP', nombre: 'Administradora de Fondos de Pensiones', desc: 'Entidad privada que gestiona las cotizaciones obligatorias para pensiones bajo el sistema chileno.', tag: 'previsión' },
    { sigla: 'BIP', nombre: 'Banco Integrado de Proyectos', desc: 'Sistema oficial del Estado de Chile donde se registran y evalúan todas las iniciativas de inversión pública (proyectos, programas, estudios básicos).', tag: 'inversión' },
    { sigla: 'BNE', nombre: 'Bolsa Nacional de Empleo', desc: 'Plataforma estatal pública para vincular oferta y demanda laboral. Empresas publican vacantes y trabajadores postulan. URL: bne.cl', tag: 'empleo' },
    { sigla: 'CBC', nombre: 'Corporación de Bienes de Capital', desc: 'Organismo privado que cataloga y monitorea la cartera de proyectos de inversión privada en Chile. Fuente clave de proyección de empleo.', tag: 'inversión' },
    { sigla: 'DT', nombre: 'Dirección del Trabajo', desc: 'Servicio público dependiente del Ministerio del Trabajo. Fiscaliza el cumplimiento de la legislación laboral, registra organizaciones sindicales y media en conflictos colectivos.', tag: 'institucional' },
    { sigla: 'ENE', nombre: 'Encuesta Nacional de Empleo', desc: 'Encuesta del INE que mide la situación laboral del país: tasas de ocupación, desocupación, fuerza de trabajo y población en edad de trabajar.', tag: 'estadística' },
    { sigla: 'F.N.D.R.', nombre: 'Fondo Nacional de Desarrollo Regional', desc: 'Fondo de inversión pública que distribuye recursos a los gobiernos regionales para proyectos prioritarios. Principal fuente de financiamiento BIP en O\'Higgins (51,5% de las iniciativas).', tag: 'inversión' },
    { sigla: 'IDLC', nombre: 'Índice de Desarrollo Laboral Comunal', desc: 'Indicador sintético (0-100) propio del Observatorio que combina seis variables: densidad empresarial, formalización, equilibrio honorarios, dinamismo BNE, inversión per cápita y empleo proyectado.', tag: 'observatorio' },
    { sigla: 'IMM', nombre: 'Ingreso Mínimo Mensual', desc: 'Sueldo mínimo legal establecido por ley. En 2026: $546.546 (Ley 21.751). Reajuste automático anual desde 2027.', tag: 'remuneraciones' },
    { sigla: 'INE', nombre: 'Instituto Nacional de Estadísticas', desc: 'Organismo oficial que produce las estadísticas demográficas, sociales y económicas de Chile (Censo, ENE, IPC, etc.).', tag: 'estadística' },
    { sigla: 'IPS', nombre: 'Instituto de Previsión Social', desc: 'Servicio público que administra pensiones del antiguo sistema, asignaciones familiares, bonos y subsidios. Atención presencial a través de ChileAtiende.', tag: 'previsión' },
    { sigla: 'ISL', nombre: 'Instituto de Seguridad Laboral', desc: 'Organismo administrador del seguro de accidentes del trabajo y enfermedades profesionales (Ley 16.744) para empresas adheridas al ISL.', tag: 'seguridad' },
    { sigla: 'Ley Karin', nombre: 'Ley 21.643 sobre acoso laboral, sexual y violencia en el trabajo', desc: 'Primera norma chilena que ratifica el Convenio 190 de la OIT. Establece protocolos obligatorios de prevención, investigación y sanción en todas las empresas.', tag: 'derechos' },
    { sigla: 'MIDESO', nombre: 'Ministerio de Desarrollo Social y Familia', desc: 'Ministerio responsable de la política social. Sus instrumentos miden ingresos, pobreza y vulnerabilidad (CASEN, Registro Social de Hogares).', tag: 'institucional' },
    { sigla: 'M$', nombre: 'Miles de pesos chilenos', desc: 'Unidad de medida monetaria usada en presupuestos públicos. M$1.000 = $1.000.000 (un millón de pesos).', tag: 'monetario' },
    { sigla: 'MUSD', nombre: 'Millones de dólares estadounidenses', desc: 'Unidad usada en la cartera CBC y mediciones de inversión privada. 1 MUSD = US$1.000.000.', tag: 'monetario' },
    { sigla: 'OIT', nombre: 'Organización Internacional del Trabajo', desc: 'Agencia tripartita de la ONU que establece estándares laborales internacionales. El Convenio 190 (acoso y violencia) es el marco de la Ley Karin.', tag: 'institucional' },
    { sigla: 'OMIL', nombre: 'Oficina Municipal de Información Laboral', desc: 'Oficina municipal que brinda intermediación laboral, postulación a programas SENCE y asesoría a trabajadores y empleadores. Las 33 comunas de O\'Higgins tienen una.', tag: 'empleo' },
    { sigla: 'PET', nombre: 'Población en Edad de Trabajar', desc: 'Personas de 15 años o más, sin tope superior. Es el universo desde el cual se calcula la fuerza de trabajo (ocupados + desocupados).', tag: 'estadística' },
    { sigla: 'PGU', nombre: 'Pensión Garantizada Universal', desc: 'Beneficio del Estado para personas mayores de 65 años con condiciones específicas. Administrada por IPS.', tag: 'previsión' },
    { sigla: 'RATE', nombre: 'Recomendación Técnico Económica (calificación BIP)', desc: 'Calificación que el Sistema Nacional de Inversiones otorga a una iniciativa BIP. RS = Recomendado, OT = Objetado Técnicamente, FI = Falta Información.', tag: 'inversión' },
    { sigla: 'SENCE', nombre: 'Servicio Nacional de Capacitación y Empleo', desc: 'Servicio público encargado de la política nacional de capacitación. Administra Becas Laborales, franquicia tributaria, subsidios al empleo joven y mujer.', tag: 'capacitación' },
    { sigla: 'SEREMI', nombre: 'Secretaría Regional Ministerial', desc: 'Órgano desconcentrado de un Ministerio en cada región. La SEREMI del Trabajo coordina las políticas laborales del Estado en la Región de O\'Higgins.', tag: 'institucional' },
    { sigla: 'SII', nombre: 'Servicio de Impuestos Internos', desc: 'Organismo fiscalizador tributario. Sus registros contienen el universo de empresas activas y trabajadores formales por comuna.', tag: 'institucional' },
    { sigla: 'SUSESO', nombre: 'Superintendencia de Seguridad Social', desc: 'Organismo fiscalizador del cumplimiento de la legislación previsional, accidentes del trabajo y subsidios sociales.', tag: 'previsión' },
    { sigla: 'UTM', nombre: 'Unidad Tributaria Mensual', desc: 'Unidad de valor reajustable mensualmente según IPC, usada para calcular multas, impuestos y montos legales. Aproximadamente $65.000 en 2026.', tag: 'monetario' },
  ];

  const FAQ = [
    {
      q: '¿Cómo postulo a un curso SENCE gratuito?',
      a: `Ingresa a <a href="https://sence.gob.cl/personas/cursos" target="_blank" rel="noopener"><b>sence.gob.cl/personas/cursos</b></a>, regístrate con tu RUT y revisa el catálogo. Los programas vigentes incluyen <b>Becas Laborales</b>, <b>Despega MIPE</b>, <b>Talento Digital</b> y <b>Mujer Digital</b>. También puedes acercarte a la OMIL de tu comuna o llamar al <b>*8088</b> desde tu celular.`,
      cat: 'Capacitación'
    },
    {
      q: '¿Qué hago si soy víctima de acoso laboral o sexual?',
      a: `Bajo la <b>Ley Karin (21.643)</b>, tienes derecho a denunciar a tu empleador y en paralelo a la Dirección del Trabajo:<br>1. Comunica a tu empleador (por escrito si es posible).<br>2. Si no hay respuesta, denuncia en <a href="https://www.dt.gob.cl" target="_blank" rel="noopener">dt.gob.cl</a> o llama al <b>600 450 4000</b>.<br>3. La empresa debe iniciar investigación interna en máximo 3 días.<br>4. Confidencialidad y debido proceso están garantizados.`,
      cat: 'Derechos'
    },
    {
      q: '¿Cuánto es el salario mínimo en Chile en 2026?',
      a: `Desde mayo de 2026, el <b>Ingreso Mínimo Mensual es $546.546</b> (Ley 21.751). El reajuste se actualizó automáticamente por la variación del IPC enero-marzo (+1,4%). Desde 2027 habrá mecanismo de reajuste automático anual.`,
      cat: 'Remuneraciones'
    },
    {
      q: '¿Cómo cotizo si trabajo a honorarios?',
      a: `La <b>Operación Renta anual</b> incluye retención obligatoria para cotizaciones previsionales (pensión, salud, seguro de invalidez y accidentes). El porcentaje se incrementa progresivamente hasta cubrir las mismas prestaciones que un trabajador dependiente. Consulta en <a href="https://www.sii.cl" target="_blank" rel="noopener">sii.cl</a> o IPS al <b>101</b>.`,
      cat: 'Previsional'
    },
    {
      q: '¿Qué es la OMIL y dónde la encuentro?',
      a: `Las <b>Oficinas Municipales de Información Laboral</b> son la puerta de entrada al sistema público de intermediación. <b>Cada una de las 33 comunas de O'Higgins tiene una OMIL en su municipalidad</b>. Ofrecen postulación a empleos, programas SENCE y asesoría a empleadores. Ver <a href="directorio.html">Directorio completo</a>.`,
      cat: 'Empleo'
    },
    {
      q: '¿Cuándo entrará en vigor la jornada de 40 horas?',
      a: `La <b>Ley 21.561</b> establece reducción gradual:<br>• <b>44 horas</b> desde 2024 ✓<br>• <b>42 horas</b> desde 2026 ✓<br>• <b>40 horas</b> desde <b>2028</b><br>Existen jornadas excepcionales (mineras, agroindustriales) que requieren autorización de la Dirección del Trabajo.`,
      cat: 'Jornada'
    },
    {
      q: '¿Cómo postulo a empleos en Codelco El Teniente?',
      a: `El portal oficial de Codelco es la ruta más directa: <a href="https://www.codelco.com" target="_blank" rel="noopener">codelco.com</a> sección Empleos. También puedes monitorear vacantes en empresas contratistas y de servicios que operan en Rancagua, Machalí y la mina. El 76% de los trabajadores de El Teniente residen en O'Higgins.`,
      cat: 'Empleo'
    },
    {
      q: 'Soy empleador, ¿qué debo cumplir respecto a la Ley Karin?',
      a: `Toda empresa debe tener:<br>1. <b>Protocolo escrito</b> de prevención del acoso laboral, sexual y violencia.<br>2. <b>Canal de denuncia</b> definido y conocido por los trabajadores.<br>3. <b>Procedimiento de investigación</b> en máximo 30 días con sanciones progresivas.<br>4. <b>Capacitación obligatoria</b> a colaboradores. La SEREMI organiza encuentros informativos regionales.`,
      cat: 'Cumplimiento'
    },
    {
      q: '¿Qué es el Seguro de Cesantía y cómo lo cobro?',
      a: `Es un seguro obligatorio que ahorra parte de tu sueldo mientras trabajas. Si quedas cesante, puedes retirar fondos de tu cuenta individual y, si te corresponde, acceder al Fondo Solidario. La administración la hace AFC Chile. Consulta tu saldo y postula en <a href="https://www.afc.cl" target="_blank" rel="noopener">afc.cl</a>.`,
      cat: 'Previsional'
    },
    {
      q: 'Soy temporera agrícola, ¿qué derechos tengo?',
      a: `Tienes derecho a:<br>• <b>Contrato escrito</b> (no verbal)<br>• <b>Cotizaciones previsionales</b>, salud y seguro de accidentes<br>• <b>Sala cuna</b> si la empresa tiene más de 20 trabajadoras (esto cambiará con Sala Cuna Universal)<br>• <b>Protección a la maternidad</b><br>• <b>Agua potable, baños, sombra y horarios escalonados</b> en faena<br>• <b>Transporte seguro</b><br><br>Denuncia en <a href="https://www.dt.gob.cl" target="_blank" rel="noopener">dt.gob.cl</a> o llama al 600 450 4000. La temporada 2025-2026 contempla 500 inspecciones a nivel nacional.`,
      cat: 'Derechos'
    },
    {
      q: '¿Cómo postulo al Bono al Trabajo de la Mujer?',
      a: `Es un subsidio para trabajadoras dependientes e independientes entre <b>25 y 59 años</b>, focalizado en sectores de baja remuneración. Se postula en <a href="https://www.sence.gob.cl" target="_blank" rel="noopener">sence.gob.cl</a> con tu RUT. El pago es trimestral y se entrega vía CuentaRUT, transferencia bancaria o caja vecina.`,
      cat: 'Subsidios'
    },
    {
      q: '¿Cómo se calcula el IDLC del portal?',
      a: `El <b>Índice de Desarrollo Laboral Comunal</b> es un indicador sintético 0-100 propio de este Observatorio. Combina seis componentes ponderados: densidad empresarial (20%), formalización laboral (20%), equilibrio honorarios (15%), dinamismo BNE (15%), inversión per cápita (15%) y empleo proyectado (15%). Cada componente se normaliza con min-max sobre las 31 comunas. Ver detalle en <a href="comunas.html#tab-idlc">Indicadores → Índice IDLC</a>.`,
      cat: 'Observatorio'
    },
    {
      q: 'Soy alcalde/funcionario municipal, ¿cómo puedo usar este portal?',
      a: `Puedes:<br>1. Comparar tu comuna con vecinas en <a href="comunas.html#tab-lado-a-lado">Lado a lado</a><br>2. Identificar tu ranking IDLC y componentes débiles<br>3. Conocer la cartera de inversión 2026 que llegará a tu territorio<br>4. Descargar CSV de todas las tablas para tus análisis<br>5. Solicitar asistencia técnica BIP a la SEREMI para destrabar tus iniciativas`,
      cat: 'Autoridades'
    },
    {
      q: '¿Cuándo se actualizan los datos del portal?',
      a: `El portal tiene un workflow automático que reprocesa los datos <b>cada lunes a las 06:00 UTC</b> (~02:00 hora Chile) desde las fuentes originales. Si cambian, los gráficos y rankings se actualizan automáticamente. Ver <a href="changelog.html">Registro de actualizaciones</a>.`,
      cat: 'Observatorio'
    },
    {
      q: '¿Dónde está la oficina más cercana de Dirección del Trabajo en O\'Higgins?',
      a: `Hay 3 oficinas DT en la región:<br>• <b>Cachapoal:</b> Plaza de Los Héroes 389, Rancagua · 72 222 3951<br>• <b>Colchagua:</b> Argomedo 634, San Fernando · 72 271 0492<br>• <b>Santa Cruz:</b> 21 de Mayo 085 · 72 282 4888<br><br>Ver <a href="directorio.html">Directorio completo</a> con SENCE, IPS y OMIL.`,
      cat: 'Servicios'
    }
  ];

  const TAG_COLORS = {
    'previsión': '#0F3F8C',
    'inversión': '#2E7D32',
    'empleo': '#F57C00',
    'capacitación': '#7B1FA2',
    'estadística': '#0288D1',
    'institucional': '#1E5BB8',
    'derechos': '#C0192B',
    'seguridad': '#E91E63',
    'remuneraciones': '#FFC107',
    'monetario': '#5D4037',
    'observatorio': '#0F3F8C'
  };

  function renderGlosario(filter = '') {
    const f = filter.toLowerCase();
    const filtered = GLOSARIO.filter(g =>
      !f || g.sigla.toLowerCase().includes(f) || g.nombre.toLowerCase().includes(f) || g.desc.toLowerCase().includes(f) || g.tag.toLowerCase().includes(f)
    );
    if (!filtered.length) {
      document.getElementById('glosario-grid').innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div style="font-size:3rem;">🔍</div>Sin resultados</div>';
      return;
    }
    document.getElementById('glosario-grid').innerHTML = filtered.map(g => `
      <article class="info-card">
        <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.75rem;">
          <div style="background:${TAG_COLORS[g.tag] || '#6B7280'}; color:white; padding:.4rem .75rem; border-radius:6px; font-weight:700; font-family:monospace; min-width:60px; text-align:center;">${g.sigla}</div>
          <span class="pill" style="font-size:.7rem; background:${TAG_COLORS[g.tag] || '#6B7280'}22; color:${TAG_COLORS[g.tag] || '#6B7280'};">${g.tag}</span>
        </div>
        <h3 style="font-size:1rem; margin-bottom:.5rem;">${g.nombre}</h3>
        <p style="margin:0; font-size:.92rem; line-height:1.6; color:var(--gray-700);">${g.desc}</p>
      </article>
    `).join('');
  }

  function renderFAQ(filter = '') {
    const f = filter.toLowerCase();
    const filtered = FAQ.filter(q =>
      !f || q.q.toLowerCase().includes(f) || q.a.toLowerCase().includes(f) || q.cat.toLowerCase().includes(f)
    );
    if (!filtered.length) {
      document.getElementById('faq-list').innerHTML = '<div class="empty-state"><div style="font-size:3rem;">🔍</div>Sin resultados</div>';
      return;
    }
    document.getElementById('faq-list').innerHTML = filtered.map((q, i) => `
      <details style="background:var(--bg-card, white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:1.25rem 1.5rem; margin-bottom:.75rem; box-shadow:var(--shadow-sm);">
        <summary style="cursor:pointer; font-weight:600; color:var(--blue-dark); font-size:1.02rem; list-style:none; display:flex; gap:.75rem; align-items:flex-start;">
          <span style="background:var(--blue); color:white; min-width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:.85rem; flex-shrink:0;">${i+1}</span>
          <span style="flex:1;">${q.q}</span>
          <span class="pill" style="font-size:.7rem;">${q.cat}</span>
        </summary>
        <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gray-200); line-height:1.7; color:var(--gray-700);">${q.a}</div>
      </details>
    `).join('');
  }

  // Initial render
  renderGlosario();
  renderFAQ();

  // Search
  const input = document.getElementById('rec-search');
  const tipoSel = document.getElementById('rec-tipo');

  function rerender() {
    renderGlosario(input.value);
    renderFAQ(input.value);
    // Filter tabs by type
    const tipo = tipoSel.value;
    document.querySelector('.tab[data-tab="glosario"]').style.display = (tipo === 'faq') ? 'none' : '';
    document.querySelector('.tab[data-tab="faq"]').style.display = (tipo === 'glosario') ? 'none' : '';
  }

  input.addEventListener('input', rerender);
  tipoSel.addEventListener('change', rerender);

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

})();
