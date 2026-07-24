/* IASOFTLAB — contenido del sitio.
   Todo el texto vive acá para que el resto del código sea sólo comportamiento. */
window.ISL = window.ISL || {};

ISL.industries = [
  {
    id: 'salud',
    code: 'SLD',
    name: 'Salud',
    full: 'Salud y centros médicos',
    claim: 'La historia clínica deja de ser un archivo muerto.',
    pain: 'El 60% del tiempo del profesional se va en registrar, buscar y transcribir. La información existe, pero nadie la puede usar a tiempo.',
    body: 'Construimos una capa de lectura sobre historias clínicas, estudios y protocolos internos: el sistema resume el caso antes de la consulta, transcribe lo que se habla y deja el registro escrito sin que nadie tipee.',
    modules: [
      ['Escriba clínico', 'Transcribe la consulta y devuelve la nota estructurada para validar.'],
      ['Triage asistido', 'Prioriza turnos según síntomas y antecedentes reales del paciente.'],
      ['Búsqueda sobre protocolos', 'Respuestas citadas contra tus propios documentos, no contra internet.'],
      ['Alerta de no-show', 'Predice ausencias y libera la agenda con anticipación.']
    ],
    metrics: [['-42', '%', 'tiempo de registro por consulta'], ['+18', '%', 'ocupación de agenda'], ['3', 'sem', 'a prototipo con datos reales']],
    stack: ['ASR médico', 'RAG citado', 'HL7 / FHIR', 'On-premise'],
    recommends: ['voice', 'rag', 'forecast', 'nlp']
  },
  {
    id: 'retail',
    code: 'RTL',
    name: 'Retail',
    full: 'Retail y e-commerce',
    claim: 'Vender lo que hay, a quien lo va a comprar.',
    pain: 'Quiebre de stock en lo que rota y capital dormido en lo que no. Y una atención que colapsa cada vez que hay campaña.',
    body: 'Un motor que mira ventas, clima, calendario y promociones para decidir reposición por local, más un agente que resuelve el 70% de las consultas de posventa sin intervención humana.',
    modules: [
      ['Forecast por SKU y local', 'Reposición sugerida con nivel de confianza y motivo.'],
      ['Agente de posventa', 'Estado de pedido, cambios y devoluciones en WhatsApp.'],
      ['Recomendador propio', 'Sobre tu catálogo y tu margen, no sobre popularidad.'],
      ['Fichas automáticas', 'Descripciones y atributos generados desde la foto del producto.']
    ],
    metrics: [['-31', '%', 'quiebre de stock'], ['+11', '%', 'ticket promedio'], ['70', '%', 'consultas resueltas sin humano']],
    stack: ['Series temporales', 'Visión', 'WhatsApp API', 'Integración ERP'],
    recommends: ['forecast', 'nlp', 'reco', 'vision']
  },
  {
    id: 'logistica',
    code: 'LOG',
    name: 'Logística',
    full: 'Logística y transporte',
    claim: 'La ruta óptima existe. El problema es calcularla a las 5 AM.',
    pain: 'Planificación manual sobre planilla, entregas fallidas que nadie contabiliza y clientes preguntando dónde está el camión.',
    body: 'Ruteo que rearma el reparto ante cada imprevisto, lectura automática de remitos y guías, y seguimiento proactivo que avisa antes de que el cliente pregunte.',
    modules: [
      ['Ruteo dinámico', 'Rearma el reparto ante demoras, cancelaciones y ventanas horarias.'],
      ['Lectura de documentos', 'Remitos, guías y facturas digitalizados sin data entry.'],
      ['Predicción de demora', 'Avisa al cliente antes de que el retraso ocurra.'],
      ['Control de carga', 'Cámara en playa detecta faltantes y daños al cargar.']
    ],
    metrics: [['-23', '%', 'km recorridos por reparto'], ['-58', '%', 'llamados de "dónde está mi pedido"'], ['x4', '', 'velocidad de digitalización de remitos']],
    stack: ['Optimización', 'OCR + visión', 'Geocercas', 'Telemetría'],
    recommends: ['vision', 'forecast', 'rpa', 'anomaly']
  },
  {
    id: 'finanzas',
    code: 'FIN',
    name: 'Finanzas',
    full: 'Finanzas y seguros',
    claim: 'Riesgo evaluado en segundos, con la razón escrita al lado.',
    pain: 'Análisis crediticio que tarda días, fraude que se detecta cuando ya pasó y auditoría que exige explicar cada decisión.',
    body: 'Scoring explicable, detección de anomalías en tiempo real y automatización del alta de clientes con verificación documental. Cada decisión del modelo queda justificada y auditable.',
    modules: [
      ['Scoring explicable', 'Cada aprobación o rechazo viene con sus factores ponderados.'],
      ['Anomalías en tiempo real', 'Patrones raros marcados antes de la liquidación.'],
      ['Onboarding documental', 'Validación de identidad y documentos en minutos.'],
      ['Siniestros asistidos', 'Estimación de daño desde fotos del asegurado.']
    ],
    metrics: [['-76', '%', 'tiempo de análisis crediticio'], ['+34', '%', 'fraude detectado antes de liquidar'], ['100', '%', 'decisiones auditables']],
    stack: ['Modelos explicables', 'Streaming', 'KYC / AML', 'Trazabilidad'],
    recommends: ['anomaly', 'vision', 'rpa', 'rag']
  },
  {
    id: 'legal',
    code: 'LEG',
    name: 'Legal',
    full: 'Legal y compliance',
    claim: 'Leer 400 páginas para encontrar tres cláusulas.',
    pain: 'Revisión contractual que se cobra por hora pero no escala, y jurisprudencia dispersa que sólo conoce el socio que se va a jubilar.',
    body: 'Un sistema que compara cada contrato contra tu criterio interno, marca desvíos por severidad y responde consultas citando el párrafo exacto del expediente.',
    modules: [
      ['Revisión contra playbook', 'Desvíos marcados por severidad con redacción alternativa.'],
      ['Búsqueda en expedientes', 'Respuesta con cita textual y enlace al documento fuente.'],
      ['Vencimientos y renovaciones', 'Calendario armado desde el propio contrato.'],
      ['Resumen de causa', 'Cronología y puntos controvertidos en una página.']
    ],
    metrics: [['-68', '%', 'horas por revisión contractual'], ['x9', '', 'documentos procesados por semana'], ['0', '', 'respuestas sin cita verificable']],
    stack: ['RAG citado', 'Clasificación', 'Control de versiones', 'Confidencialidad'],
    recommends: ['rag', 'nlp', 'rpa']
  },
  {
    id: 'educacion',
    code: 'EDU',
    name: 'Educación',
    full: 'Educación y formación',
    claim: 'Un docente no puede corregir 200 trabajos con criterio parejo.',
    pain: 'Corrección desbordada, deserción que se detecta tarde y contenido que se rehace cada semestre desde cero.',
    body: 'Corrección asistida con rúbrica propia, señales tempranas de abandono y generación de material a partir de tus propios apuntes y clases grabadas.',
    modules: [
      ['Corrección con rúbrica', 'Devolución fundamentada que el docente valida y ajusta.'],
      ['Alerta de deserción', 'Señales tempranas por asistencia, entregas y desempeño.'],
      ['Tutor por materia', 'Responde sobre el material del curso, no sobre internet.'],
      ['Material desde clases', 'Resúmenes y ejercicios generados de las grabaciones.']
    ],
    metrics: [['-55', '%', 'horas de corrección'], ['-21', '%', 'deserción en primer año'], ['24/7', '', 'disponibilidad del tutor']],
    stack: ['Rúbricas', 'ASR', 'LMS / Moodle', 'Analítica'],
    recommends: ['nlp', 'rag', 'voice', 'forecast']
  },
  {
    id: 'agro',
    code: 'AGR',
    name: 'Agro',
    full: 'Agro y agroindustria',
    claim: 'El potrero ya te está diciendo algo. Falta quien lo lea.',
    pain: 'Decisiones de siembra y sanidad tomadas por experiencia sobre datos que nadie consolida, y recorridas a campo que no escalan.',
    body: 'Análisis de imagen satelital y de dron para detectar estrés, plagas y variabilidad dentro del lote, cruzado con clima y con el historial productivo del establecimiento.',
    modules: [
      ['Estrés por zona', 'Índices por lote con alerta antes de que sea visible a ojo.'],
      ['Detección de plagas', 'Clasificación desde imagen de dron o del celular del capataz.'],
      ['Predicción de rinde', 'Escenarios por lote cruzando clima y manejo.'],
      ['Cuaderno automático', 'Registro de aplicaciones desde la telemetría del equipo.']
    ],
    metrics: [['-19', '%', 'costo de insumos por hectárea'], ['+7', '%', 'rinde en lotes intervenidos'], ['48', 'hs', 'de anticipación en alertas sanitarias']],
    stack: ['Satelital / NDVI', 'Visión', 'Clima', 'Offline en campo'],
    recommends: ['vision', 'forecast', 'anomaly']
  },
  {
    id: 'manufactura',
    code: 'MFT',
    name: 'Manufactura',
    full: 'Industria y manufactura',
    claim: 'La máquina avisa antes de romperse. Siempre avisa.',
    pain: 'Parada no planificada que cuesta un turno entero, control de calidad por muestreo y conocimiento técnico concentrado en dos personas.',
    body: 'Mantenimiento predictivo sobre las señales que tus equipos ya emiten, inspección visual en línea al 100% de las piezas y un asistente que responde con los manuales de planta.',
    modules: [
      ['Mantenimiento predictivo', 'Ventana de falla estimada sobre vibración, consumo y temperatura.'],
      ['Inspección en línea', 'Control visual del 100% de piezas, no por muestreo.'],
      ['Asistente de planta', 'Responde con los manuales y el historial de intervenciones.'],
      ['Optimización de setup', 'Parámetros sugeridos por corrida y material.']
    ],
    metrics: [['-37', '%', 'paradas no planificadas'], ['+26', '%', 'defectos detectados en línea'], ['-14', '%', 'scrap por corrida']],
    stack: ['IoT / OPC-UA', 'Visión industrial', 'Edge computing', 'SCADA'],
    recommends: ['anomaly', 'vision', 'forecast', 'rag']
  },
  {
    id: 'inmobiliaria',
    code: 'INM',
    name: 'Inmobiliaria',
    full: 'Inmobiliaria y construcción',
    claim: 'Tasar bien no debería depender de la corazonada del martes.',
    pain: 'Valuaciones dispares entre asesores, leads que se enfrían el fin de semana y fichas de propiedad que tardan días en publicarse.',
    body: 'Valuación automática con comparables reales del mercado local, calificación de leads en el momento y publicación de fichas generadas desde las fotos del inmueble.',
    modules: [
      ['Valuación con comparables', 'Rango de precio con los testigos que lo justifican.'],
      ['Calificación de leads', 'Prioriza por intención real y capacidad de compra.'],
      ['Ficha desde fotos', 'Ambientes, estado y texto de publicación automáticos.'],
      ['Agente de agenda', 'Coordina visitas fuera de horario sin intervención.']
    ],
    metrics: [['-64', '%', 'tiempo de publicación de una ficha'], ['+29', '%', 'visitas concretadas'], ['±4', '%', 'desvío promedio de valuación']],
    stack: ['Modelos hedónicos', 'Visión', 'CRM', 'Portales'],
    recommends: ['vision', 'forecast', 'nlp', 'reco']
  },
  {
    id: 'gastronomia',
    code: 'GST',
    name: 'Gastronomía',
    full: 'Gastronomía y hotelería',
    claim: 'Compraste para 200 y vinieron 130.',
    pain: 'Merma por sobrecompra, reservas gestionadas a mano y personal dimensionado por intuición para cada servicio.',
    body: 'Predicción de demanda por servicio y día cruzando reservas, clima y eventos de la zona, con sugerencia de compra y de dotación, más reservas atendidas por un agente propio.',
    modules: [
      ['Demanda por servicio', 'Cubiertos estimados por franja, día y clima.'],
      ['Compra sugerida', 'Pedido a proveedor con merma proyectada.'],
      ['Reservas automáticas', 'Confirma, reprograma y recuerda por WhatsApp.'],
      ['Ingeniería de menú', 'Qué plato deja margen y cuál sólo hace ruido.']
    ],
    metrics: [['-28', '%', 'merma de insumos'], ['-12', '%', 'costo de personal por servicio'], ['+16', '%', 'reservas confirmadas']],
    stack: ['Series temporales', 'Clima y eventos', 'WhatsApp API', 'POS'],
    recommends: ['forecast', 'nlp', 'reco']
  }
];

/* Capacidades del compilador. weeks/impact/load son estimaciones de referencia. */
ISL.capabilities = [
  { id: 'vision',   name: 'Visión por computadora', short: 'Visión',      weeks: 5, impact: 12, load: 3,
    desc: 'Detección, clasificación y lectura sobre imagen o video.',
    inputs: ['Cámaras', 'Fotos', 'Documentos escaneados'], outputs: ['Alertas', 'Etiquetado'] },
  { id: 'nlp',      name: 'Agentes conversacionales', short: 'Agentes',   weeks: 4, impact: 14, load: 2,
    desc: 'Atención por chat, WhatsApp o voz con derivación a humano.',
    inputs: ['WhatsApp', 'Web', 'Email'], outputs: ['Respuestas', 'Tickets'] },
  { id: 'rag',      name: 'RAG documental', short: 'RAG',                 weeks: 3, impact: 11, load: 2,
    desc: 'Respuestas citadas contra tus propios documentos internos.',
    inputs: ['Manuales', 'Contratos', 'Expedientes'], outputs: ['Respuestas citadas'] },
  { id: 'forecast', name: 'Predicción y forecasting', short: 'Forecast',  weeks: 4, impact: 15, load: 3,
    desc: 'Demanda, rinde, ocupación o riesgo proyectado con confianza.',
    inputs: ['Histórico', 'Clima', 'Calendario'], outputs: ['Proyecciones', 'Sugerencias'] },
  { id: 'rpa',      name: 'Automatización de procesos', short: 'Automatización', weeks: 3, impact: 13, load: 2,
    desc: 'Tareas repetitivas ejecutadas sobre tus sistemas actuales.',
    inputs: ['ERP', 'Planillas', 'Correo'], outputs: ['Registros', 'Acciones'] },
  { id: 'anomaly',  name: 'Detección de anomalías', short: 'Anomalías',   weeks: 4, impact: 12, load: 3,
    desc: 'Lo que se sale del patrón, marcado en el momento.',
    inputs: ['Sensores', 'Transacciones', 'Logs'], outputs: ['Alertas', 'Casos'] },
  { id: 'voice',    name: 'Voz y transcripción', short: 'Voz',            weeks: 3, impact: 9,  load: 2,
    desc: 'Habla convertida en registro estructurado y accionable.',
    inputs: ['Llamadas', 'Consultas', 'Reuniones'], outputs: ['Transcripción', 'Resúmenes'] },
  { id: 'reco',     name: 'Motor de recomendación', short: 'Recomendador', weeks: 4, impact: 10, load: 3,
    desc: 'Qué ofrecer, a quién y en qué momento, según tu margen.',
    inputs: ['Catálogo', 'Comportamiento', 'Margen'], outputs: ['Sugerencias', 'Rankings'] }
];

/* Respuestas del agente demo. Se resuelven por intención y se personalizan por rubro. */
ISL.agentIntents = [
  { id: 'precio',  match: ['precio', 'cuesta', 'costo', 'presupuesto', 'inversion', 'inversión', 'vale', 'cotiz'],
    answer: (ind) => `El precio depende del alcance, y en ${ind.full.toLowerCase()} el alcance recién se conoce después del diagnóstico. Por eso no publicamos tarifas: te tiraría un número inventado. El diagnóstico inicial no se cobra y de ahí sale una propuesta con alcance cerrado. Lo que sí podés ver ahora es el cronograma: armá tu configuración en el laboratorio.` },
  { id: 'tiempo',  match: ['tiempo', 'cuanto', 'cuánto', 'demora', 'plazo', 'semanas', 'rapido', 'rápido'],
    answer: (ind) => `Tres semanas del kickoff a un prototipo que tu equipo puede tocar. Para ${ind.name.toLowerCase()} eso suele significar un piloto con datos reales sobre un solo proceso, no una demo maqueteada. La integración completa depende de tus sistemas: entre 6 y 14 semanas más.` },
  { id: 'datos',   match: ['dato', 'datos', 'privacidad', 'seguridad', 'confidencial', 'nube', 'servidor'],
    answer: (ind) => `Tus datos no entrenan modelos de terceros. En ${ind.full.toLowerCase()} trabajamos con dos opciones: infraestructura tuya (on-premise o tu nube) o entorno aislado nuestro con borrado programado. Vos elegís, y queda escrito en el contrato antes de que veamos un solo registro.` },
  { id: 'empezar', match: ['empezar', 'empiezo', 'primero', 'comenzar', 'arranc', 'inicio'],
    answer: (ind) => `Empezamos por el cuello de botella más caro, no por el más vistoso. En ${ind.name.toLowerCase()}, casi siempre es ${ind.modules[0][0].toLowerCase()}: ${ind.modules[0][1].toLowerCase()} Medimos el estado actual dos semanas y recién ahí decidimos si vale la pena automatizarlo.` },
  { id: 'quesirve', match: ['sirve', 'puede', 'hacen', 'hacer', 'solucion', 'solución', 'ayuda', 'necesito'],
    answer: (ind) => `En ${ind.full.toLowerCase()} lo primero que atacamos es esto: ${ind.pain.toLowerCase()} La respuesta concreta son ${ind.modules.length} módulos, empezando por ${ind.modules[0][0].toLowerCase()} y ${ind.modules[1][0].toLowerCase()}.` },
  { id: 'equipo',  match: ['equipo', 'quien', 'quién', 'quienes', 'ustedes', 'gente', 'soporte'],
    answer: () => `Somos un equipo chico y técnico: ingeniería de datos, machine learning y producto. No tercerizamos el desarrollo. Cada proyecto tiene una persona responsable con nombre y un traspaso documentado al final — la idea es que puedas seguir sin nosotros.` },
  { id: 'integra', match: ['integr', 'erp', 'crm', 'sistema', 'whatsapp', 'api', 'conecta'],
    answer: (ind) => `Nos integramos sobre lo que ya usás. En ${ind.name.toLowerCase()} lo más común es ${ind.stack.slice(0, 3).join(', ')}. Si tu sistema no tiene API, leemos y escribimos por los canales que existan: archivos, base de datos o interfaz. Nadie cambia de herramienta por nuestra culpa.` }
];

ISL.agentFallback = (ind) =>
  `Buena pregunta, pero soy una demo con respuestas acotadas y prefiero no inventarte una. Sobre ${ind.full.toLowerCase()} puedo hablarte de plazos, inversión, manejo de datos, integraciones o por dónde conviene empezar. Lo demás lo charlamos en el diagnóstico.`;

ISL.agentSuggestions = ['¿Cuánto tarda?', '¿Qué pasa con mis datos?', '¿Por dónde empiezo?', '¿Se integra con mi ERP?'];

ISL.tickerItems = [
  'visión por computadora', 'agentes conversacionales', 'RAG documental', 'forecasting',
  'mantenimiento predictivo', 'detección de anomalías', 'transcripción clínica', 'ruteo dinámico',
  'scoring explicable', 'inspección en línea', 'valuación automática', 'corrección con rúbrica'
];
