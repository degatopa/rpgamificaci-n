// Pantalla NUEVA ACTIVIDAD / EDITAR ACTIVIDAD.
// Mientras se rellena, los datos viven en el "borrador" (ver app.js).
// Nada se guarda en la partida hasta pulsar CREAR o GUARDAR.

const NOMBRES_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados', 'domingos'];

function borradorNuevo(estado) {
  const hoy = estado.ultimoDia;
  return {
    modo: 'nueva', id: null, tipo: 'habito',
    nombre: '', stat: 'cuerpo', nota: '',
    // hábito
    dificultad: 'facil', frecTipo: 'diaria', dias: [Motor.diaSemana(hoy)], vecesSemana: 3, vecesMes: 4, minimo: false,
    // misión
    fecha: Motor.sumarDias(hoy, 7),
    // jefe
    tamano: 'grande', modoJefe: 'subtareas', subtareas: [{ texto: '' }, { texto: '' }, { texto: '' }],
    habitoId: '', meta: 4, conFecha: false, fechaLimite: Motor.sumarDias(hoy, 90), recompensa: '',
    error: '',
  };
}

function borradorDesde(estado, act) {
  const b = borradorNuevo(estado);
  const f = Motor.versionFutura(act); // se editan los valores "de mañana" si hay cambios pendientes
  Object.assign(b, { modo: 'editar', id: act.id, tipo: act.tipo, nombre: act.nombre, stat: act.stat, nota: act.nota || '' });
  if (act.tipo === 'habito') {
    b.dificultad = f.dificultad;
    b.frecTipo = f.frecuencia.tipo;
    if (f.frecuencia.tipo === 'dias') b.dias = [...f.frecuencia.dias];
    if (f.frecuencia.tipo === 'semanal') b.vecesSemana = f.frecuencia.veces;
    if (f.frecuencia.tipo === 'mensual') b.vecesMes = f.frecuencia.veces;
    b.minimo = f.minimo;
  } else if (act.tipo === 'mision') {
    b.dificultad = f.dificultad;
    b.fecha = act.fecha;
  } else {
    b.tamano = act.tamano;
    b.modoJefe = act.modo;
    b.subtareas = act.subtareas.map(s => ({ ...s }));
    b.habitoId = act.habitoId || '';
    b.meta = act.meta || 4;
    b.conFecha = !!act.fechaLimite;
    if (act.fechaLimite) b.fechaLimite = act.fechaLimite;
    b.recompensa = act.recompensa || '';
  }
  return b;
}

function frecuenciaDelBorrador(b) {
  if (b.frecTipo === 'dias') return { tipo: 'dias', dias: b.dias };
  if (b.frecTipo === 'semanal') return { tipo: 'semanal', veces: Number(b.vecesSemana) };
  if (b.frecTipo === 'mensual') return { tipo: 'mensual', veces: Number(b.vecesMes) };
  return { tipo: 'diaria' };
}

// Convierte el borrador en los datos que entiende el motor
function datosDelBorrador(b) {
  const base = { tipo: b.tipo, nombre: b.nombre, stat: b.stat, nota: b.nota };
  if (b.tipo === 'habito') return { ...base, dificultad: b.dificultad, frecuencia: frecuenciaDelBorrador(b), minimo: b.minimo };
  if (b.tipo === 'mision') return { ...base, dificultad: b.dificultad, fecha: b.fecha };
  return {
    ...base, tamano: b.tamano, modo: b.modoJefe, subtareas: b.subtareas, habitoId: b.habitoId,
    meta: Number(b.meta), fechaLimite: b.conFecha ? b.fechaLimite : null, recompensa: b.recompensa,
  };
}

function textoAparece(b) {
  if (b.frecTipo === 'diaria') return 'Aparece <b>todos los días</b>';
  if (b.frecTipo === 'dias') {
    const nombres = [...b.dias].sort((x, y) => x - y).map(d => NOMBRES_DIAS[d - 1]);
    if (!nombres.length) return 'Elige al menos un día';
    const lista = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0];
    return `Aparece los <b>${lista}</b>`;
  }
  if (b.frecTipo === 'semanal') return `Lo marcas <b>${b.vecesSemana} ${Number(b.vecesSemana) === 1 ? 'vez' : 'veces'} por semana</b>, los días que lo hagas`;
  return `Lo marcas <b>${b.vecesMes} ${Number(b.vecesMes) === 1 ? 'vez' : 'veces'} por mes</b>, los días que lo hagas`;
}

function unidadRacha(estado, habitoId) {
  const h = Motor.buscar(estado, habitoId);
  if (!h) return 'veces';
  if (h.frecuencia.tipo === 'semanal') return 'semanas seguidas cumpliendo la meta';
  if (h.frecuencia.tipo === 'mensual') return 'meses seguidos cumpliendo la meta';
  return 'días seguidos';
}

// ---------- Vista previa (columna derecha) ----------
function vistaPreviaFormulario(b) {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  const nombre = b.nombre.trim() || 'Nombre de la actividad';
  const stat = R.estadisticas[b.stat];

  if (b.tipo === 'jefe') {
    const t = R.jefes[b.tamano];
    const conTexto = b.subtareas.filter(s => s.texto.trim());
    const subtareas = conTexto.length;
    const vidaMax = b.modoJefe === 'subtareas' ? subtareas : Number(b.meta) || 0;
    // Al editar, el jefe puede tener ya daño
    const original = b.modo === 'editar' ? Motor.buscar(estado, b.id) : null;
    const vidaActual = b.modoJefe === 'subtareas'
      ? conTexto.filter(s => !s.hechaEl).length
      : Math.max(0, vidaMax - (original ? original.progreso : 0));
    const h = Motor.buscar(estado, b.habitoId);
    return `
      <section class="caja dorada carta-jefe">
        <h2 class="titulo">VISTA PREVIA</h2>
        <div class="foso"><span data-px="jefe" data-s="8"></span></div>
        <div class="nombre-jefe">${UI.esc(nombre.toUpperCase())}</div>
        <div style="display:flex;justify-content:center;gap:6px;margin:8px 0 12px">${UI.chipStat(b.stat)}<span class="chip c-espiritu">Jefe ${t.nombre.toLowerCase()}</span></div>
        <div class="linea" style="display:flex;font-size:21px"><span>Vida del jefe</span><b style="margin-left:auto">${vidaActual} / ${vidaMax}</b></div>
        ${UI.barra(vidaActual, vidaMax, 'jefe')}
      </section>
      <section class="caja">
        <h2 class="titulo">RESUMEN</h2>
        <div class="resumen-lista">
          <div><span data-px="xp" data-s="2"></span><span>Al derrotarlo: <b class="oro">+${t.xp} XP</b> y <b class="oro">+${t.oro} oro</b></span></div>
          ${b.modoJefe === 'subtareas'
            ? `<div><span data-px="espada" data-s="2"></span><span>${subtareas} subtareas: <b class="oro">+${R.subtarea.xp} XP</b> y <b class="oro">+${R.subtarea.oro} oro</b> cada una</span></div>`
            : `<div><span data-px="llama" data-s="2"></span><span>Recibe daño cada vez que cumples <b>${UI.esc(h ? h.nombre : '(elige un hábito)')}</b>. Si rompes la racha, se cura.</span></div>`}
          <div><span data-px="cofre" data-s="2"></span><span>${b.recompensa.trim() ? `Recompensa especial: <b>${UI.esc(b.recompensa.trim())}</b>` : 'Añade tu <b>recompensa especial</b>'}</span></div>
          <div><span data-px="calendario" data-s="2"></span><span>${b.conFecha && b.fechaLimite ? `Límite: <b>${UI.fechaConAno(b.fechaLimite)}</b> · si vence, <b class="rojo">−${R.danoJefeVencido} HP</b>` : 'Sin fecha límite: no quita vida'}</span></div>
        </div>
      </section>
      <div class="nota">${b.modoJefe === 'subtareas'
        ? '<b>Por racha de un hábito:</b> el jefe se liga a un hábito (por ejemplo, iglesia 3 por semana) y recibe daño cada vez que cumples la meta. Si rompes la racha, se cura por completo.'
        : '<b>Por subtareas:</b> divides el reto en partes. Cada parte que terminas le quita vida al jefe.'}</div>`;
  }

  const d = R.dificultades[b.dificultad];
  const esMision = b.tipo === 'mision';
  let chips = UI.chipStat(b.stat) + `<span class="chip">${esMision ? d.mision : d.enemigo}</span>`;
  if (esMision && b.fecha) chips += `<span class="chip">${UI.cuandoVence(b.fecha, hoy)}</span>`;
  if (!esMision && b.frecTipo === 'dias') chips += `<span class="chip">${b.dias.slice().sort((x, y) => x - y).map(x => UI.LETRAS_DIAS[x - 1]).join(' · ') || '—'}</span>`;
  if (!esMision && (b.frecTipo === 'semanal' || b.frecTipo === 'mensual')) chips += `<span class="chip">${b.frecTipo === 'semanal' ? b.vecesSemana : b.vecesMes} por ${b.frecTipo === 'semanal' ? 'semana' : 'mes'}</span>`;
  if (!esMision && b.minimo) chips += `<span class="chip minimo">−${d.dano} HP si no</span>`;

  let resumen;
  if (esMision) {
    const dias = b.fecha ? Motor.diasEntre(hoy, b.fecha) : null;
    resumen = `
      <div><span data-px="xp" data-s="2"></span><span>Al completarla: <b class="oro">+${d.xp} XP</b> para ${stat} y <b class="oro">+${d.oro} de oro</b></span></div>
      <div><span data-px="calendario" data-s="2"></span><span>${b.fecha ? `Tienes hasta el <b>${UI.fechaLarga(b.fecha)}</b> (${dias === 0 ? 'es hoy' : dias === 1 ? 'queda 1 día' : `quedan ${dias} días`})` : 'Elige la fecha de entrega'}</span></div>
      <div><span data-px="corazon" data-s="2"></span><span>Si vence sin hacerla: <b class="rojo">−${d.dano} HP</b></span></div>
      <div><span data-px="calavera" data-s="2"></span><span>Y queda <b>fallida</b>: ya no dará XP ni oro</span></div>
      <div><span data-px="descanso" data-s="2"></span><span>La poción de descanso <b>${b.dificultad === 'dificil' ? 'no' : 'sí'}</b> te protege de esta misión (es ${d.mision.toLowerCase()})</span></div>`;
  } else {
    resumen = `
      <div><span data-px="xp" data-s="2"></span><span>Al cumplirlo: <b class="oro">+${d.xp} XP</b> para ${stat} y para tu nivel</span></div>
      <div><span data-px="moneda" data-s="2"></span><span>Y además <b class="oro">+${d.oro} de oro</b></span></div>
      <div><span data-px="corazon" data-s="2"></span><span>${b.minimo ? `Si no lo cumples: <b class="rojo">−${d.dano} HP</b> (es un mínimo)` : 'Si no lo cumples: <b>no pierdes vida</b> (no es mínimo)'}</span></div>
      <div><span data-px="calendario" data-s="2"></span><span>${textoAparece(b)}</span></div>
      <div><span data-px="espada" data-s="2"></span><span>${b.modo === 'nueva' ? (b.minimo ? 'Aparece desde hoy; como mínimo cuenta <b>desde mañana</b>' : 'Empieza <b>hoy mismo</b>') : 'La dificultad, la frecuencia y el mínimo cambian <b>mañana</b>'}</span></div>`;
  }

  return `
    <section class="caja dorada">
      <h2 class="titulo">VISTA PREVIA</h2>
      <div class="suave" style="margin-bottom:12px">Así aparecerá en tu pantalla <b>Hoy</b>:</div>
      ${filaEnemigo({ icono: UI.iconoEnemigo(b.dificultad), nombre, chips, premio: `+${d.xp} XP<br>+${d.oro} oro`, accion: null, clases: 'compacto' })}
    </section>
    <section class="caja">
      <h2 class="titulo">RESUMEN</h2>
      <div class="resumen-lista">${resumen}</div>
    </section>
    <div class="nota oro">${esMision
      ? 'Si la quitas, se guarda en <b>Quitadas</b>. Quitar una misión no quita vida.'
      : 'Después podrás editarlo o quitarlo desde <b>Actividades</b>. Si lo quitas, se guarda en <b>Quitadas</b> con su historial.'}</div>`;
}

// ---------- Formulario (columna izquierda) ----------
function pasoEstadistica(b, numero, compacto = false) {
  const R = Motor.REGLAS;
  const detalles = { cuerpo: 'Salud física', espiritu: 'Fe y calma', mente: 'Estudio', creatividad: 'Crear cosas' };
  if (compacto) {
    return `<div class="etiqueta">${numero} · ESTADÍSTICA</div>
      <div class="opciones dos" style="gap:8px">${Object.keys(R.estadisticas).map(s => `
        <button class="opcion ${b.stat === s ? 'elegida' : ''}" style="padding:8px 10px" data-accion="elegir" data-campo="stat" data-valor="${s}">
          <div class="cab"><span data-px="${s}" data-s="2"></span><span class="c-${s}">${R.estadisticas[s]}</span></div></button>`).join('')}</div>`;
  }
  return `
    <div class="paso">
      <div class="etiqueta">${numero} · ¿QUÉ ESTADÍSTICA ENTRENA?</div>
      <div class="opciones cuatro">${Object.keys(R.estadisticas).map(s => `
        <button class="opcion stat ${b.stat === s ? 'elegida' : ''}" data-accion="elegir" data-campo="stat" data-valor="${s}">
          <div class="cab"><span data-px="${s}" data-s="3"></span><span class="c-${s}">${R.estadisticas[s]}</span></div><div class="det">${detalles[s]}</div></button>`).join('')}
      </div>
    </div>`;
}

function pasoDificultad(b, numero, esMision) {
  const R = Motor.REGLAS;
  return `
    <div class="paso">
      <div class="etiqueta">${numero} · ${esMision ? 'TAMAÑO <span class="opc">(cuánto da y cuánto quita si vence)</span>' : 'DIFICULTAD <span class="opc">(qué tipo de enemigo será)</span>'}</div>
      <div class="opciones tres">${Object.entries(R.dificultades).map(([id, d]) => `
        <button class="opcion ${b.dificultad === id ? 'elegida' : ''}" data-accion="elegir" data-campo="dificultad" data-valor="${id}">
          <div class="cab"><span data-px="${UI.iconoEnemigo(id)}" data-s="3"></span>${esMision ? d.mision : d.nombre} · ${d.enemigo}</div>
          <div class="det">+${d.xp} XP · +${d.oro} oro<br>${esMision ? 'Si vence' : 'Si es mínimo'}: −${d.dano} HP</div></button>`).join('')}
      </div>
      ${esMision ? '<div class="ayuda">¿Es enorme, con muchas partes? Mejor créala como <b>Jefe final</b>.</div>' : ''}
    </div>`;
}

function camposHabito(b) {
  const periodico = b.frecTipo === 'semanal' || b.frecTipo === 'mensual';
  const frec = (id, texto) => `<button class="${b.frecTipo === id ? 'activa' : ''}" data-accion="elegir" data-campo="frecTipo" data-valor="${id}">${texto}</button>`;
  let detalleFrecuencia = '';
  if (b.frecTipo === 'dias') {
    detalleFrecuencia = `
      <div style="display:flex;align-items:center;gap:18px;margin-top:14px">
        <div class="dias">${UI.LETRAS_DIAS.map((l, i) => `<button class="${b.dias.includes(i + 1) ? 'si' : ''}" data-accion="dia" data-valor="${i + 1}" title="${NOMBRES_DIAS[i]}">${l}</button>`).join('')}</div>
        <div class="ayuda" style="margin:0">${textoAparece(b)}.</div>
      </div>`;
  } else if (periodico) {
    const campo = b.frecTipo === 'semanal' ? 'vecesSemana' : 'vecesMes';
    detalleFrecuencia = `
      <div class="num-caja"><input class="campo" type="number" min="1" max="${b.frecTipo === 'semanal' ? 7 : 31}" data-campo="${campo}" value="${b[campo]}">
        <span class="suave">veces por ${b.frecTipo === 'semanal' ? 'semana' : 'mes'}. Aparece en Hoy hasta que cumplas la meta.</span></div>`;
  }
  return `
    ${pasoDificultad(b, 4, false)}
    <div class="paso">
      <div class="etiqueta">5 · ¿CADA CUÁNTO?</div>
      <div class="pestanas">${frec('diaria', 'CADA DÍA')}${frec('dias', 'DÍAS CONCRETOS')}${frec('semanal', 'X POR SEMANA')}${frec('mensual', 'X POR MES')}</div>
      ${detalleFrecuencia}
    </div>
    <div class="paso">
      <div class="etiqueta">6 · ¿ES UN MÍNIMO?</div>
      <div style="display:flex;gap:16px;align-items:flex-start">
        <button class="interruptor ${b.minimo ? 'on' : ''}" data-accion="alternar" data-campo="minimo" ${periodico ? 'disabled' : ''} aria-label="Es un mínimo"></button>
        <div class="ayuda" style="margin:0">${periodico
          ? 'Los hábitos semanales o mensuales no pueden ser mínimos.'
          : `<b>${b.minimo ? 'Sí' : 'No'}.</b> ${b.minimo ? 'Perderás' : 'Si lo activas, perderás'} <b class="rojo">${Motor.REGLAS.dificultades[b.dificultad].dano} HP</b> cada día que le toque y no lo cumplas. Los cambios en los mínimos cuentan desde mañana (3:00 a.m.), para que no se puedan usar como trampa.`}</div>
      </div>
    </div>
    <div class="paso">
      <div class="etiqueta">7 · NOTA <span class="opc">(opcional)</span></div>
      <textarea class="campo" data-campo="nota" maxlength="200" placeholder="Ej.: escalas y una canción nueva">${UI.esc(b.nota)}</textarea>
    </div>`;
}

function camposMision(b) {
  return `
    ${pasoDificultad(b, 4, true)}
    <div class="paso">
      <div class="etiqueta">5 · FECHA DE ENTREGA</div>
      <input class="campo" type="date" data-campo="fecha" value="${b.fecha}" min="${estado.ultimoDia}">
      <div class="ayuda">Vence cuando termina ese día (a las 3:00 a.m. del día siguiente). No se puede elegir una fecha pasada.</div>
    </div>
    <div class="paso">
      <div class="etiqueta">6 · NOTA <span class="opc">(opcional)</span></div>
      <textarea class="campo" data-campo="nota" maxlength="200" placeholder="Ej.: formato APA, entregar por el aula virtual">${UI.esc(b.nota)}</textarea>
    </div>`;
}

function camposJefe(b) {
  const R = Motor.REGLAS;
  const editando = b.modo === 'editar';
  const modo = (id, texto) => `<button class="${b.modoJefe === id ? 'activa' : ''}" data-accion="elegir" data-campo="modoJefe" data-valor="${id}" ${editando ? 'disabled' : ''}>${texto}</button>`;
  let dano;
  if (b.modoJefe === 'subtareas') {
    dano = `
      <div class="subtareas" style="margin-top:14px">
        ${b.subtareas.map((s, i) => s.hechaEl
          ? `<div class="fila-sub hecha"><div class="campo" style="flex:1"><span class="num">${i + 1}</span>${UI.esc(s.texto)} ✓</div></div>`
          : `<div class="fila-sub"><span class="num">${i + 1}</span><input class="campo" data-subtarea="${i}" maxlength="60" value="${UI.esc(s.texto)}" placeholder="Subtarea ${i + 1}">
              <button class="btn chico" data-accion="quitarSubtarea" data-i="${i}" title="Quitar subtarea">✕</button></div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:14px;margin-top:10px">
        <button class="btn chico" data-accion="agregarSubtarea">+ AÑADIR SUBTAREA</button>
        <span class="ayuda" style="margin:0">Cada subtarea: +${R.subtarea.xp} XP · +${R.subtarea.oro} oro y le quita vida al jefe.</span>
      </div>`;
  } else {
    const habitos = estado.actividades.filter(a => a.tipo === 'habito' && !a.archivado);
    dano = `
      <div style="margin-top:14px">
        <div class="ayuda" style="margin:0 0 8px">Hábito al que se liga el jefe:</div>
        <select class="campo" data-campo="habitoId" ${editando ? 'disabled' : ''}>
          <option value="">— Elige un hábito —</option>
          ${habitos.map(h => `<option value="${h.id}" ${b.habitoId === h.id ? 'selected' : ''}>${UI.esc(h.nombre)} (${UI.textoFrecuencia(h.frecuencia).toLowerCase()})</option>`).join('')}
        </select>
        <div class="num-caja"><span class="suave">Hay que lograr</span><input class="campo" type="number" min="1" max="52" data-campo="meta" value="${b.meta}" ${editando ? 'disabled' : ''}><span class="suave">${unidadRacha(estado, b.habitoId)}.</span></div>
      </div>`;
  }
  return `
    <div class="paso" style="display:grid;grid-template-columns:1fr 1.35fr;gap:18px">
      <div>${pasoEstadistica(b, 3, true)}</div>
      <div>
        <div class="etiqueta">4 · TAMAÑO</div>
        <div class="opciones tres" style="gap:8px">${Object.entries(R.jefes).map(([id, t]) => `
          <button class="opcion ${b.tamano === id ? 'elegida' : ''}" style="padding:8px 10px" data-accion="elegir" data-campo="tamano" data-valor="${id}">
            <div class="cab">${t.nombre}</div><div class="det">${t.xp} XP<br>${t.oro} oro</div></button>`).join('')}
        </div>
      </div>
    </div>
    <div class="paso">
      <div class="etiqueta">5 · ¿CÓMO SE LE HACE DAÑO?</div>
      <div class="pestanas">${modo('subtareas', 'POR SUBTAREAS')}${modo('racha', 'POR RACHA DE UN HÁBITO')}</div>
      ${dano}
    </div>
    <div class="paso">
      <div class="etiqueta">6 · FECHA LÍMITE <span class="opc">(opcional)</span></div>
      <div style="display:flex;gap:14px;align-items:center">
        <button class="interruptor ${b.conFecha ? 'on' : ''}" data-accion="alternar" data-campo="conFecha" aria-label="Tiene fecha límite"></button>
        ${b.conFecha ? `<input class="campo" style="flex:1" type="date" data-campo="fechaLimite" value="${b.fechaLimite}" min="${estado.ultimoDia}">` : '<span class="suave">Sin fecha límite.</span>'}
      </div>
      ${b.conFecha ? `<div class="nota peligro" style="margin-top:12px">Si llega la fecha y no lo has derrotado: <b style="color:#fff">−${R.danoJefeVencido} HP</b> (la mitad de tu vida). La poción de descanso <b style="color:#fff">no</b> protege de esto.</div>` : ''}
    </div>
    <div class="paso">
      <div class="etiqueta">7 · RECOMPENSA ESPECIAL <span class="opc">(de la vida real, la eliges tú)</span></div>
      <input class="campo" data-campo="recompensa" maxlength="80" value="${UI.esc(b.recompensa)}" placeholder="Ej.: una cena especial para celebrar">
    </div>`;
}

function pantallaFormulario(param) {
  const ruta = rutaActual();
  if (!borrador || borrador.modo !== ruta.pantalla || (borrador.id || null) !== (param || null)) {
    if (ruta.pantalla === 'editar') {
      const act = Motor.buscar(estado, param);
      if (!act) return '<div class="caja">Esa actividad no existe. <a href="#actividades">Volver a Actividades</a></div>';
      if (act.sagrado) return `<div class="caja dorada"><div class="titulo"><span data-px="candado" data-s="2"></span>HÁBITO SAGRADO</div><p>«${UI.esc(act.nombre)}» es sagrado: no se puede modificar.</p><a class="btn" href="#actividades">VOLVER</a></div>`;
      borrador = borradorDesde(estado, act);
    } else {
      borrador = borradorNuevo(estado);
    }
  }
  const b = borrador;
  const editando = b.modo === 'editar';
  const tipo = (id, icono, texto) => `<button class="${b.tipo === id ? 'activa' : ''}" data-accion="elegir" data-campo="tipo" data-valor="${id}" ${editando && b.tipo !== id ? 'disabled' : ''}><span data-px="${icono}" data-s="1"></span>${texto}</button>`;
  const ayudas = {
    habito: '<b>Hábito:</b> algo que repites. Todos los días, algunos días de la semana, o varias veces por semana o por mes.',
    mision: '<b>Misión:</b> algo que haces una sola vez y tiene fecha de entrega. Por ejemplo, las tareas de la universidad.',
    jefe: '<b>Jefe final:</b> un reto grande con su propia barra de vida. Se derrota por partes.',
  };
  const textoBoton = editando ? 'GUARDAR CAMBIOS' : { habito: 'CREAR HÁBITO', mision: 'CREAR MISIÓN', jefe: 'CREAR JEFE' }[b.tipo];

  return `
  <div class="migas"><a href="#actividades">Actividades</a> › <b>${editando ? 'Editar actividad' : 'Nueva actividad'}</b></div>
  <h1 class="pagina" style="margin-bottom:18px">${editando ? 'EDITAR ACTIVIDAD' : 'NUEVA ACTIVIDAD'}</h1>
  <div class="form-rejilla">
    <section class="caja">
      ${editando && b.tipo !== 'jefe' ? '<div class="nota oro" style="margin-bottom:20px">El nombre, la estadística y la nota cambian al momento. La dificultad, la frecuencia y el mínimo cambian <b>mañana</b> (3:00 a.m.).</div>' : ''}
      <div class="paso">
        <div class="etiqueta">1 · ¿QUÉ TIPO DE ACTIVIDAD ES?</div>
        <div class="pestanas">${tipo('habito', 'espada', 'HÁBITO')}${tipo('mision', 'calendario', 'MISIÓN')}${tipo('jefe', 'corona', 'JEFE FINAL')}</div>
        <div class="ayuda">${ayudas[b.tipo]}</div>
      </div>
      <div class="paso">
        <div class="etiqueta">2 · NOMBRE</div>
        <div class="campo-caja"><input class="campo" data-campo="nombre" maxlength="${Motor.REGLAS.largoNombre}" value="${UI.esc(b.nombre)}" placeholder="${{ habito: 'Ej.: Practicar guitarra 20 min', mision: 'Ej.: Ensayo de 5 páginas', jefe: 'Ej.: Terminar la tesis' }[b.tipo]}" ${editando ? '' : 'autofocus'}>
          <span class="contador" id="contador">${b.nombre.length}/${Motor.REGLAS.largoNombre}</span></div>
      </div>
      ${b.tipo === 'jefe' ? '' : pasoEstadistica(b, 3)}
      ${b.tipo === 'habito' ? camposHabito(b) : b.tipo === 'mision' ? camposMision(b) : camposJefe(b)}
      <div class="error-form">${UI.esc(b.error)}</div>
      <div class="fila-botones">
        <button class="btn grande" data-accion="cancelarFormulario">CANCELAR</button>
        <button class="btn grande dorado" data-accion="guardarFormulario">${textoBoton}</button>
      </div>
    </section>
    <div id="vista-previa" style="display:flex;flex-direction:column;gap:26px">${vistaPreviaFormulario(b)}</div>
  </div>`;
}
