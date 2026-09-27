// =====================================================================
// MOTOR DEL JUEGO
// Aquí están TODAS las reglas: ganar XP, perder vida, cerrar el día,
// comprar en la tienda, morir... No dibuja nada en pantalla.
// Las pantallas llaman a estas funciones y luego muestran el resultado.
// Las reglas vienen del documento DISENO.md.
// =====================================================================

const REGLAS = {
  vidaMaxima: 100,
  horaReinicio: 3, // el día de juego empieza a las 3:00 a.m.

  // Dificultad de hábitos y misiones (= tipo de enemigo)
  dificultades: {
    facil: { nombre: 'Fácil', enemigo: 'Común', mision: 'Pequeña', xp: 10, oro: 5, dano: 5 },
    media: { nombre: 'Media', enemigo: 'Élite', mision: 'Mediana', xp: 20, oro: 10, dano: 10 },
    dificil: { nombre: 'Difícil', enemigo: 'Mini jefe', mision: 'Grande', xp: 50, oro: 20, dano: 25 },
  },

  // Jefes finales
  jefes: {
    pequeno: { nombre: 'Pequeño', xp: 200, oro: 50 },
    grande: { nombre: 'Grande', xp: 500, oro: 120 },
    epico: { nombre: 'Épico', xp: 1000, oro: 250 },
  },
  subtarea: { xp: 10, oro: 5 },
  danoJefeVencido: 50,

  // Tienda: todo se paga con XP y oro a la vez
  tienda: {
    vida: { nombre: 'Poción de vida', xp: 200, oro: 1000 },
    descanso: { nombre: 'Poción de descanso', xp: 100, oro: 300 },
    multiplicador: { nombre: 'Multiplicador ×2', xp: 200, oro: 1000 },
  },
  diasMultiplicador: 7,

  // Rachas: +10 % de XP por cada 7 días, hasta +50 %
  bonusRachaPorSemana: 10,
  bonusRachaMaximo: 50,

  estadisticas: { cuerpo: 'Cuerpo', espiritu: 'Espíritu', mente: 'Mente', creatividad: 'Creatividad' },

  rangos: [
    { id: 'soldado', nombre: 'Soldado raso', nivel: 1 },
    { id: 'escudero', nombre: 'Escudero', nivel: 5 },
    { id: 'caballero', nombre: 'Caballero', nivel: 10 },
    { id: 'capitan', nombre: 'Capitán', nivel: 15 },
    { id: 'comandante', nombre: 'Comandante', nivel: 20 },
    { id: 'senor', nombre: 'Señor feudal', nivel: 30 },
    { id: 'duque', nombre: 'Duque', nivel: 40 },
    { id: 'rey', nombre: 'Rey', nivel: 50 },
    { id: 'emperador', nombre: 'Emperador', nivel: 60 },
  ],

  modosMuerte: {
    hardcore: { nombre: 'Hardcore', texto: 'Pierdes todo: niveles, XP, oro, objetos y racha.' },
    duro: { nombre: 'Duro', texto: 'Vuelves al inicio de tu rango y pierdes el oro y los objetos.' },
    suave: { nombre: 'Suave', texto: 'Pierdes la mitad del oro y de los objetos, sin bajar de nivel.' },
  },

  largoNombre: 40,
};

// ---------------------------------------------------------------------
// FECHAS
// Un "día de juego" se guarda como texto 'AAAA-MM-DD'. Empieza a las 3:00 a.m.,
// así que lo que marco a la 1:00 a.m. cuenta para el día anterior.
// ---------------------------------------------------------------------
function dosCifras(n) { return String(n).padStart(2, '0'); }

function claveDia(ahora) {
  const d = new Date(ahora.getTime() - REGLAS.horaReinicio * 3600 * 1000);
  return `${d.getFullYear()}-${dosCifras(d.getMonth() + 1)}-${dosCifras(d.getDate())}`;
}
function fechaDeClave(clave) {
  const [a, m, d] = clave.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}
function claveDeFecha(f) {
  return `${f.getUTCFullYear()}-${dosCifras(f.getUTCMonth() + 1)}-${dosCifras(f.getUTCDate())}`;
}
function sumarDias(clave, n) {
  const f = fechaDeClave(clave);
  f.setUTCDate(f.getUTCDate() + n);
  return claveDeFecha(f);
}
function diasEntre(desde, hasta) {
  return Math.round((fechaDeClave(hasta) - fechaDeClave(desde)) / 86400000);
}
// 1 = lunes … 7 = domingo
function diaSemana(clave) {
  const d = fechaDeClave(clave).getUTCDay();
  return d === 0 ? 7 : d;
}
function inicioSemana(clave) { return sumarDias(clave, 1 - diaSemana(clave)); }
function claveMes(clave) { return clave.slice(0, 7); }
function esUltimoDiaDelMes(clave) { return claveMes(sumarDias(clave, 1)) !== claveMes(clave); }
function proximoReinicio(ahora) {
  const r = new Date(ahora);
  r.setHours(REGLAS.horaReinicio, 0, 0, 0);
  if (r <= ahora) r.setDate(r.getDate() + 1);
  return r;
}

// ---------------------------------------------------------------------
// NIVELES
// Nivel general: pasar del nivel N al N+1 cuesta 200 + 30 × N XP.
// Estadísticas: pasar del nivel N al N+1 cuesta 50 + 10 × N XP.
// ---------------------------------------------------------------------
function xpParaSubir(nivel) { return 200 + 30 * nivel; }
function xpAcumuladoNivel(nivel) { return 200 * (nivel - 1) + 15 * nivel * (nivel - 1); }
function nivelDesdeXP(xp) {
  let n = 1;
  while (xpAcumuladoNivel(n + 1) <= xp) n++;
  return n;
}
function progresoNivel(xp) {
  const nivel = nivelDesdeXP(xp);
  return { nivel, actual: xp - xpAcumuladoNivel(nivel), necesario: xpParaSubir(nivel) };
}

function xpParaSubirStat(nivel) { return 50 + 10 * nivel; }
function xpAcumuladoStat(nivel) { return 50 * (nivel - 1) + 5 * nivel * (nivel - 1); }
function progresoStat(xp) {
  let nivel = 1;
  while (xpAcumuladoStat(nivel + 1) <= xp) nivel++;
  return { nivel, actual: xp - xpAcumuladoStat(nivel), necesario: xpParaSubirStat(nivel) };
}

function rangoDeNivel(nivel) {
  let rango = REGLAS.rangos[0];
  for (const r of REGLAS.rangos) if (nivel >= r.nivel) rango = r;
  return rango;
}
function siguienteRango(nivel) { return REGLAS.rangos.find(r => r.nivel > nivel) || null; }

// ---------------------------------------------------------------------
// ESTADO INICIAL
// El "estado" es un objeto con toda la partida. Se guarda en el navegador.
// ---------------------------------------------------------------------
let contadorIds = 0;
function nuevoId(prefijo) {
  contadorIds++;
  return `${prefijo}-${Date.now().toString(36)}-${contadorIds.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nuevoHabito(id, nombre, stat, dificultad, frecuencia, hoy, extra = {}) {
  return {
    id, tipo: 'habito', nombre, stat, dificultad, frecuencia,
    minimo: false, sagrado: false, nota: '',
    hechos: {}, // { 'AAAA-MM-DD': { xp, oro } }
    archivado: false, quitadoEl: null, creadoEl: hoy, pendiente: null,
    ...extra,
  };
}

function crearEstadoInicial(ahora) {
  const hoy = claveDia(ahora);
  const diaria = () => ({ tipo: 'diaria' });
  const sagrado = { minimo: true, sagrado: true };
  return {
    version: 1,
    creadoEn: ahora.toISOString(),
    ultimoDia: hoy, // el día de juego que está "abierto" ahora
    vida: REGLAS.vidaMaxima,
    xp: 0,
    oro: 0,
    stats: { cuerpo: 0, espiritu: 0, mente: 0, creatividad: 0 },
    nivelRecord: 1,
    racha: 0,
    inventario: { vida: 0, descanso: 0, multiplicador: 0 },
    multiplicadorHasta: null, // último día (incluido) con XP ×2
    descansoDias: [], // días protegidos con poción de descanso
    hoy: { clave: hoy, xp: 0, oro: 0, derrotados: 0 },
    actividades: [
      nuevoHabito('sagrado-biblia', 'Leer la Biblia 10 min', 'espiritu', 'media', diaria(), hoy, sagrado),
      nuevoHabito('sagrado-orar', 'Orar 30 min', 'espiritu', 'media', diaria(), hoy, sagrado),
      nuevoHabito('sagrado-espalda', 'Ejercicios para enderezar la espalda', 'cuerpo', 'media', diaria(), hoy, sagrado),
      nuevoHabito('sagrado-escribir', 'Escribir al menos una página', 'creatividad', 'media', diaria(), hoy, sagrado),
      nuevoHabito(nuevoId('habito'), 'Crema del acné en la noche', 'cuerpo', 'facil', diaria(), hoy),
      nuevoHabito(nuevoId('habito'), 'Actividad física 20 min', 'cuerpo', 'facil', diaria(), hoy),
      nuevoHabito(nuevoId('habito'), 'Levantarme a la misma hora', 'cuerpo', 'facil', diaria(), hoy),
      nuevoHabito(nuevoId('habito'), 'Comer a horas decentes', 'cuerpo', 'facil', diaria(), hoy),
      nuevoHabito(nuevoId('habito'), 'Ir a la iglesia', 'espiritu', 'facil', { tipo: 'semanal', veces: 3 }, hoy),
      nuevoHabito(nuevoId('habito'), 'Aprender algo nuevo 30 min', 'creatividad', 'facil', diaria(), hoy),
    ],
    recompensas: {
      // Listas en el orden en que se reciben
      grandes: ['Cuerdas nuevas para la guitarra', 'Un curso de colorización', 'Un accesorio para la cámara'],
      pequenas: ['Ver una película', 'Comer algo que me guste', 'Una salida'],
      pendientes: [], // ganadas y sin reclamar: { tipo, nivel, texto, jefe }
      historial: [], // reclamadas
    },
    muertes: [],
    ajustes: { modoMuerte: 'hardcore' },
    registro: [], // diario de lo que pasa: { dia, texto }
  };
}

// ---------------------------------------------------------------------
// AYUDAS
// ---------------------------------------------------------------------
function hoyDe(estado) { return estado.ultimoDia; }
function buscar(estado, id) { return estado.actividades.find(a => a.id === id) || null; }
function ok(extra = {}) { return { ok: true, eventos: [], ...extra }; }
function fallo(error) { return { ok: false, error, eventos: [] }; }

function registrar(estado, texto, dia) {
  estado.registro.unshift({ dia: dia || estado.ultimoDia, texto });
  if (estado.registro.length > 300) estado.registro.length = 300;
}

// ¿Le toca ese día? (solo para hábitos diarios o de días concretos)
function programadoEl(act, clave) {
  const f = act.frecuencia;
  if (f.tipo === 'diaria') return true;
  if (f.tipo === 'dias') return f.dias.includes(diaSemana(clave));
  return false;
}
function esPeriodico(act) { return act.frecuencia.tipo === 'semanal' || act.frecuencia.tipo === 'mensual'; }

// Cuántas veces se cumplió en la semana o el mes del día indicado
function vecesEnPeriodo(act, clave) {
  const claves = Object.keys(act.hechos);
  if (act.frecuencia.tipo === 'semanal') {
    const inicio = inicioSemana(clave);
    const fin = sumarDias(inicio, 6);
    return claves.filter(c => c >= inicio && c <= fin).length;
  }
  if (act.frecuencia.tipo === 'mensual') {
    const mes = claveMes(clave);
    return claves.filter(c => claveMes(c) === mes).length;
  }
  return act.hechos[clave] ? 1 : 0;
}

// Devuelve un texto con el motivo si NO se puede marcar hoy, o null si se puede
function motivoNoMarcar(act, clave) {
  if (!act || act.tipo !== 'habito') return 'Esa actividad no existe.';
  if (act.archivado) return 'Esa actividad está quitada.';
  if (act.hechos[clave]) return 'Ya lo cumpliste hoy.';
  if (esPeriodico(act)) {
    if (vecesEnPeriodo(act, clave) >= act.frecuencia.veces) return 'Ya cumpliste la meta de este periodo.';
    return null;
  }
  if (!programadoEl(act, clave)) return 'Hoy no le toca.';
  return null;
}

function bonusRacha(estado) {
  return Math.min(REGLAS.bonusRachaMaximo, Math.floor(estado.racha / 7) * REGLAS.bonusRachaPorSemana);
}
function multiplicadorActivo(estado, clave) {
  return !!estado.multiplicadorHasta && estado.multiplicadorHasta >= clave;
}
// XP final = XP base × bonus de racha × multiplicador (si está activo)
function calcularXP(estado, base, clave) {
  let xp = base * (1 + bonusRacha(estado) / 100);
  if (multiplicadorActivo(estado, clave)) xp *= 2;
  return Math.round(xp);
}

// Suma XP y oro, y revisa si subí de nivel
function ganar(estado, stat, xp, oro, eventos, cuentaParaHoy = true) {
  estado.xp += xp;
  estado.oro += oro;
  if (stat) estado.stats[stat] += xp;
  if (cuentaParaHoy) {
    estado.hoy.xp += xp;
    estado.hoy.oro += oro;
    estado.hoy.derrotados += 1;
  }
  revisarNivel(estado, eventos);
}
// Quita XP y oro (al deshacer). Nunca baja de 0.
function perder(estado, stat, xp, oro) {
  estado.xp = Math.max(0, estado.xp - xp);
  estado.oro = Math.max(0, estado.oro - oro);
  if (stat) estado.stats[stat] = Math.max(0, estado.stats[stat] - xp);
  estado.hoy.xp = Math.max(0, estado.hoy.xp - xp);
  estado.hoy.oro = Math.max(0, estado.hoy.oro - oro);
  estado.hoy.derrotados = Math.max(0, estado.hoy.derrotados - 1);
}

// Si superé mi nivel récord: eventos de nivel, rango y recompensas reales
function revisarNivel(estado, eventos) {
  const nivel = nivelDesdeXP(estado.xp);
  while (estado.nivelRecord < nivel) {
    estado.nivelRecord++;
    const n = estado.nivelRecord;
    eventos.push({ tipo: 'nivel', nivel: n, texto: `¡Subiste al nivel ${n}!` });
    const rango = REGLAS.rangos.find(r => r.nivel === n);
    if (rango) {
      eventos.push({ tipo: 'rango', rango: rango.id, texto: `¡Nuevo rango: ${rango.nombre}!` });
      ganarRecompensa(estado, 'grande', n, eventos);
    }
    if (n % 5 === 0) ganarRecompensa(estado, 'pequena', n, eventos);
  }
}
function ganarRecompensa(estado, tipo, nivel, eventos) {
  const lista = tipo === 'grande' ? estado.recompensas.grandes : estado.recompensas.pequenas;
  const texto = lista.length ? lista.shift() : null;
  estado.recompensas.pendientes.push({ tipo, nivel, texto, jefe: null });
  eventos.push({
    tipo: 'recompensa',
    texto: texto
      ? `Recompensa ${tipo === 'grande' ? 'grande' : 'pequeña'}: ${texto}`
      : `Ganaste una recompensa ${tipo === 'grande' ? 'grande' : 'pequeña'}, pero tu lista está vacía. Añade una en Recompensas.`,
  });
}

// ---------------------------------------------------------------------
// HÁBITOS, MISIONES Y JEFES: cumplir y deshacer
// ---------------------------------------------------------------------
function marcarHabito(estado, id) {
  const clave = hoyDe(estado);
  const act = buscar(estado, id);
  const motivo = motivoNoMarcar(act, clave);
  if (motivo) return fallo(motivo);
  const d = REGLAS.dificultades[act.dificultad];
  const xp = calcularXP(estado, d.xp, clave);
  const eventos = [];
  act.hechos[clave] = { xp, oro: d.oro };
  ganar(estado, act.stat, xp, d.oro, eventos);
  registrar(estado, `Derrotaste «${act.nombre}»: +${xp} XP, +${d.oro} oro`);
  return { ok: true, xp, oro: d.oro, eventos };
}

function desmarcarHabito(estado, id) {
  const clave = hoyDe(estado);
  const act = buscar(estado, id);
  if (!act || !act.hechos[clave]) return fallo('No hay nada que deshacer hoy.');
  const g = act.hechos[clave];
  delete act.hechos[clave];
  perder(estado, act.stat, g.xp, g.oro);
  registrar(estado, `Deshiciste «${act.nombre}»: −${g.xp} XP, −${g.oro} oro`);
  return ok({ xp: g.xp, oro: g.oro });
}

function completarMision(estado, id) {
  const clave = hoyDe(estado);
  const m = buscar(estado, id);
  if (!m || m.tipo !== 'mision' || m.archivado) return fallo('Esa misión no existe.');
  if (m.estado !== 'activa') return fallo('Esa misión ya no está activa.');
  const d = REGLAS.dificultades[m.dificultad];
  const xp = calcularXP(estado, d.xp, clave);
  const eventos = [];
  m.estado = 'completada';
  m.completadaEl = clave;
  m.ganado = { xp, oro: d.oro };
  ganar(estado, m.stat, xp, d.oro, eventos);
  registrar(estado, `Misión completada «${m.nombre}»: +${xp} XP, +${d.oro} oro`);
  return { ok: true, xp, oro: d.oro, eventos };
}

function deshacerMision(estado, id) {
  const m = buscar(estado, id);
  if (!m || m.estado !== 'completada' || m.completadaEl !== hoyDe(estado)) return fallo('Solo se puede deshacer el mismo día.');
  perder(estado, m.stat, m.ganado.xp, m.ganado.oro);
  m.estado = 'activa';
  m.completadaEl = null;
  m.ganado = null;
  registrar(estado, `Deshiciste la misión «${m.nombre}»`);
  return ok();
}

function completarSubtarea(estado, jefeId, indice) {
  const clave = hoyDe(estado);
  const j = buscar(estado, jefeId);
  if (!j || j.tipo !== 'jefe' || j.archivado || j.estado !== 'activo' || j.modo !== 'subtareas') return fallo('Ese jefe no está activo.');
  const st = j.subtareas[indice];
  if (!st || st.hechaEl) return fallo('Esa subtarea ya está hecha.');
  const xp = calcularXP(estado, REGLAS.subtarea.xp, clave);
  const oro = REGLAS.subtarea.oro;
  const eventos = [];
  st.hechaEl = clave;
  st.ganado = { xp, oro };
  ganar(estado, j.stat, xp, oro, eventos);
  registrar(estado, `Golpe a «${j.nombre}»: ${st.texto} (+${xp} XP, +${oro} oro)`);
  if (j.subtareas.every(s => s.hechaEl)) derrotarJefe(estado, j, clave, eventos);
  return { ok: true, xp, oro, eventos };
}

function deshacerSubtarea(estado, jefeId, indice) {
  const j = buscar(estado, jefeId);
  const st = j && j.subtareas && j.subtareas[indice];
  if (!st || st.hechaEl !== hoyDe(estado) || j.estado !== 'activo') return fallo('Solo se puede deshacer el mismo día y con el jefe vivo.');
  perder(estado, j.stat, st.ganado.xp, st.ganado.oro);
  st.hechaEl = null;
  st.ganado = null;
  return ok();
}

function derrotarJefe(estado, j, clave, eventos, cuentaParaHoy = true) {
  const t = REGLAS.jefes[j.tamano];
  const xp = calcularXP(estado, t.xp, clave);
  j.estado = 'derrotado';
  j.derrotadoEl = clave;
  ganar(estado, j.stat, xp, t.oro, eventos, cuentaParaHoy);
  estado.recompensas.pendientes.push({ tipo: 'especial', nivel: null, texto: j.recompensa || 'Recompensa especial', jefe: j.nombre });
  eventos.push({ tipo: 'jefe', texto: `¡Derrotaste al jefe «${j.nombre}»! +${xp} XP, +${t.oro} oro y tu recompensa especial.` });
  registrar(estado, `Jefe derrotado «${j.nombre}»: +${xp} XP, +${t.oro} oro`, clave);
}

// Vida que le queda a un jefe
function vidaJefe(j) {
  if (j.modo === 'subtareas') {
    return { actual: j.subtareas.filter(s => !s.hechaEl).length, maxima: j.subtareas.length };
  }
  return { actual: Math.max(0, j.meta - j.progreso), maxima: j.meta };
}

// ---------------------------------------------------------------------
// CIERRE DEL DÍA (a las 3:00 a.m.)
// Revisa mínimos, racha, misiones y jefes vencidos, y aplica el daño.
// ---------------------------------------------------------------------
function cerrarDia(estado, d, eventos) {
  const protegido = estado.descansoDias.includes(d);
  const activas = estado.actividades.filter(a => !a.archivado);
  let dano = 0;
  const avisar = (tipo, texto, extra = {}) => eventos.push({ tipo, dia: d, texto, ...extra });

  // 1. Mínimos del día
  const minimos = activas.filter(a => a.tipo === 'habito' && a.minimo && a.creadoEl <= d && programadoEl(a, d));
  let todosCumplidos = true;
  for (const m of minimos) {
    if (m.hechos[d]) continue;
    todosCumplidos = false;
    const hp = REGLAS.dificultades[m.dificultad].dano;
    if (protegido && m.dificultad !== 'dificil') {
      avisar('protegido', `La poción de descanso te protegió de «${m.nombre}» (${hp} HP)`);
    } else {
      dano += hp;
      avisar('dano', `No cumpliste «${m.nombre}»: −${hp} HP`, { cantidad: hp });
    }
  }

  // 2. Racha
  if (protegido) {
    if (estado.racha > 0) avisar('racha', `Día protegido: tu racha de ${estado.racha} días se mantiene`);
  } else if (todosCumplidos) {
    estado.racha++;
    if (estado.racha % 7 === 0 && estado.racha <= 35) {
      avisar('racha', `¡Racha de ${estado.racha} días! Bonus de XP: +${bonusRacha(estado)} %`);
    }
  } else {
    if (estado.racha > 0) avisar('racha-rota', `Perdiste tu racha de ${estado.racha} días`);
    estado.racha = 0;
  }

  // 3. Misiones vencidas
  for (const m of activas.filter(a => a.tipo === 'mision' && a.estado === 'activa' && a.fecha <= d)) {
    m.estado = 'fallida';
    const hp = REGLAS.dificultades[m.dificultad].dano;
    if (protegido && m.dificultad !== 'dificil') {
      avisar('protegido', `Venció «${m.nombre}», pero la poción de descanso te protegió (${hp} HP)`);
    } else {
      dano += hp;
      avisar('dano', `Venció la misión «${m.nombre}»: −${hp} HP`, { cantidad: hp });
    }
  }

  // 4. Jefes por racha
  for (const j of activas.filter(a => a.tipo === 'jefe' && a.estado === 'activo' && a.modo === 'racha')) {
    evaluarJefeRacha(estado, j, d, protegido, eventos);
  }

  // 5. Jefes con fecha límite vencida (la poción de descanso no protege)
  for (const j of activas.filter(a => a.tipo === 'jefe' && a.estado === 'activo' && a.fechaLimite && a.fechaLimite <= d)) {
    j.estado = 'fallido';
    dano += REGLAS.danoJefeVencido;
    avisar('dano', `Venció el plazo del jefe «${j.nombre}»: −${REGLAS.danoJefeVencido} HP`, { cantidad: REGLAS.danoJefeVencido });
  }

  // 6. Aplicar el daño
  if (dano > 0) {
    estado.vida = Math.max(0, estado.vida - dano);
    registrar(estado, `Cierre del día: −${dano} HP (vida: ${estado.vida})`, d);
  }
  if (estado.vida <= 0) morir(estado, d, eventos);

  estado.descansoDias = estado.descansoDias.filter(x => x > d);
}

function evaluarJefeRacha(estado, j, d, protegido, eventos) {
  const h = buscar(estado, j.habitoId);
  if (!h || h.archivado) return;
  let resultado = null; // 'golpe' | 'fallo' | null (ese día no cuenta)
  if (esPeriodico(h)) {
    const finPeriodo = h.frecuencia.tipo === 'semanal' ? diaSemana(d) === 7 : esUltimoDiaDelMes(d);
    if (finPeriodo) resultado = vecesEnPeriodo(h, d) >= h.frecuencia.veces ? 'golpe' : 'fallo';
  } else if (programadoEl(h, d)) {
    resultado = h.hechos[d] ? 'golpe' : 'fallo';
  }
  if (resultado === 'golpe') {
    j.progreso++;
    if (j.progreso >= j.meta) derrotarJefe(estado, j, d, eventos, false);
  } else if (resultado === 'fallo' && !protegido && j.progreso > 0) {
    j.progreso = 0;
    eventos.push({ tipo: 'jefe-curado', dia: d, texto: `Rompiste la racha: el jefe «${j.nombre}» se curó por completo` });
  }
}

// ---------------------------------------------------------------------
// MUERTE
// ---------------------------------------------------------------------
function morir(estado, d, eventos) {
  const nivel = nivelDesdeXP(estado.xp);
  const modo = estado.ajustes.modoMuerte;
  estado.muertes.unshift({ dia: d, nivel, rango: rangoDeNivel(nivel).nombre, modo });
  const vaciarInventario = () => { for (const k of Object.keys(estado.inventario)) estado.inventario[k] = 0; };

  if (modo === 'duro') {
    estado.xp = Math.min(estado.xp, xpAcumuladoNivel(rangoDeNivel(nivel).nivel));
    estado.oro = 0;
    vaciarInventario();
    estado.multiplicadorHasta = null;
  } else if (modo === 'suave') {
    estado.oro = Math.floor(estado.oro / 2);
    for (const k of Object.keys(estado.inventario)) estado.inventario[k] = Math.floor(estado.inventario[k] / 2);
  } else {
    // Hardcore: se pierde todo. Las recompensas sin reclamar vuelven a su lista.
    const r = estado.recompensas;
    for (const p of r.pendientes.slice().reverse()) {
      if (p.texto && p.tipo === 'grande') r.grandes.unshift(p.texto);
      if (p.texto && p.tipo === 'pequena') r.pequenas.unshift(p.texto);
    }
    r.pendientes = [];
    estado.xp = 0;
    estado.oro = 0;
    for (const k of Object.keys(estado.stats)) estado.stats[k] = 0;
    estado.nivelRecord = 1;
    vaciarInventario();
    estado.multiplicadorHasta = null;
  }
  estado.racha = 0;
  estado.descansoDias = [];
  estado.vida = REGLAS.vidaMaxima;
  eventos.push({ tipo: 'muerte', dia: d, nivel, texto: `Tu vida llegó a 0 y moriste en el nivel ${nivel} (modo ${REGLAS.modosMuerte[modo].nombre}).` });
  registrar(estado, `Moriste en el nivel ${nivel} (modo ${REGLAS.modosMuerte[modo].nombre})`, d);
}

// ---------------------------------------------------------------------
// CAMBIOS PENDIENTES ("desde mañana")
// ---------------------------------------------------------------------
function aplicarPendientes(estado, dia) {
  for (const a of estado.actividades) {
    if (!a.pendiente || a.pendiente.desde > dia) continue;
    const cambios = { ...a.pendiente.cambios };
    a.pendiente = null;
    if (cambios.archivado) {
      a.archivado = true;
      a.quitadoEl = dia;
      delete cambios.archivado;
    }
    Object.assign(a, cambios);
  }
}

// ---------------------------------------------------------------------
// ACTUALIZAR: cierra todos los días que pasaron desde la última vez.
// Se llama al abrir el juego y cada poco rato mientras está abierto.
// ---------------------------------------------------------------------
function actualizar(estado, ahora) {
  const hoy = claveDia(ahora);
  const eventos = [];
  while (estado.ultimoDia < hoy) {
    const dia = estado.ultimoDia;
    cerrarDia(estado, dia, eventos);
    const siguiente = sumarDias(dia, 1);
    estado.ultimoDia = siguiente;
    aplicarPendientes(estado, siguiente);
    estado.hoy = { clave: siguiente, xp: 0, oro: 0, derrotados: 0 };
  }
  return eventos;
}

// ---------------------------------------------------------------------
// CREAR, EDITAR, QUITAR Y BORRAR ACTIVIDADES
// ---------------------------------------------------------------------
// Campos que afectan a la vida: si se cambian, se aplican desde mañana.
const CAMPOS_DIFERIDOS = { habito: ['dificultad', 'frecuencia', 'minimo'], mision: ['dificultad'], jefe: [] };

function iguales(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function validarActividad(estado, datos, idExistente) {
  const hoy = hoyDe(estado);
  const nombre = (datos.nombre || '').trim();
  if (!nombre) return 'Escribe un nombre.';
  if (nombre.length > REGLAS.largoNombre) return `El nombre puede tener como mucho ${REGLAS.largoNombre} letras.`;
  const repetido = estado.actividades.some(a => a.id !== idExistente && a.nombre.trim().toLowerCase() === nombre.toLowerCase());
  if (repetido) return 'Ya tienes una actividad con ese nombre.';
  if (!REGLAS.estadisticas[datos.stat]) return 'Elige una estadística.';

  if (datos.tipo === 'habito') {
    if (!REGLAS.dificultades[datos.dificultad]) return 'Elige una dificultad.';
    const f = datos.frecuencia || {};
    if (f.tipo === 'dias' && !(f.dias && f.dias.length)) return 'Elige al menos un día de la semana.';
    if (f.tipo === 'semanal' && !(f.veces >= 1 && f.veces <= 7)) return 'Las veces por semana deben estar entre 1 y 7.';
    if (f.tipo === 'mensual' && !(f.veces >= 1 && f.veces <= 31)) return 'Las veces por mes deben estar entre 1 y 31.';
    if (!['diaria', 'dias', 'semanal', 'mensual'].includes(f.tipo)) return 'Elige cada cuánto.';
    if (datos.minimo && (f.tipo === 'semanal' || f.tipo === 'mensual')) return 'Solo los hábitos diarios o de días concretos pueden ser mínimos.';
  } else if (datos.tipo === 'mision') {
    if (!REGLAS.dificultades[datos.dificultad]) return 'Elige un tamaño.';
    if (!datos.fecha) return 'Elige la fecha de entrega.';
    const anterior = idExistente && buscar(estado, idExistente);
    if (datos.fecha < hoy && !(anterior && anterior.fecha === datos.fecha && anterior.estado !== 'activa')) return 'La fecha de entrega no puede ser pasada.';
  } else if (datos.tipo === 'jefe') {
    if (!REGLAS.jefes[datos.tamano]) return 'Elige un tamaño.';
    if (datos.modo === 'subtareas') {
      const subtareas = (datos.subtareas || []).filter(s => s.texto.trim());
      if (subtareas.length < 2) return 'Un jefe por subtareas necesita al menos 2 subtareas.';
      if (!subtareas.some(s => !s.hechaEl)) return 'Deja al menos una subtarea sin hacer.';
    } else if (datos.modo === 'racha') {
      const h = buscar(estado, datos.habitoId);
      if (!h || h.tipo !== 'habito' || h.archivado) return 'Elige el hábito al que se liga el jefe.';
      if (!(datos.meta >= 1 && datos.meta <= 52)) return 'La racha que hay que lograr debe estar entre 1 y 52.';
    } else {
      return 'Elige cómo se le hace daño al jefe.';
    }
    const anterior = idExistente && buscar(estado, idExistente);
    if (datos.fechaLimite && datos.fechaLimite < hoy && !(anterior && anterior.fechaLimite === datos.fechaLimite)) return 'La fecha límite no puede ser pasada.';
  } else {
    return 'Elige el tipo de actividad.';
  }
  return null;
}

function crearActividad(estado, datos) {
  const error = validarActividad(estado, datos, null);
  if (error) return fallo(error);
  const hoy = hoyDe(estado);
  const base = {
    id: nuevoId(datos.tipo), tipo: datos.tipo, nombre: datos.nombre.trim(), stat: datos.stat,
    nota: (datos.nota || '').trim(), archivado: false, quitadoEl: null, creadoEl: hoy, pendiente: null,
  };
  let act;
  if (datos.tipo === 'habito') {
    act = { ...base, dificultad: datos.dificultad, frecuencia: limpiarFrecuencia(datos.frecuencia), minimo: false, sagrado: false, hechos: {} };
    // Un mínimo nuevo empieza a contar mañana
    if (datos.minimo) act.pendiente = { desde: sumarDias(hoy, 1), cambios: { minimo: true } };
  } else if (datos.tipo === 'mision') {
    act = { ...base, dificultad: datos.dificultad, fecha: datos.fecha, estado: 'activa', completadaEl: null, ganado: null };
  } else {
    act = {
      ...base, tamano: datos.tamano, modo: datos.modo,
      subtareas: datos.modo === 'subtareas'
        ? datos.subtareas.filter(s => s.texto.trim()).map(s => ({ texto: s.texto.trim(), hechaEl: null, ganado: null }))
        : [],
      habitoId: datos.modo === 'racha' ? datos.habitoId : null,
      meta: datos.modo === 'racha' ? Number(datos.meta) : 0,
      progreso: 0,
      fechaLimite: datos.fechaLimite || null,
      recompensa: (datos.recompensa || '').trim(),
      estado: 'activo', derrotadoEl: null,
    };
  }
  estado.actividades.push(act);
  registrar(estado, `Nueva actividad: «${act.nombre}»`);
  return ok({ actividad: act });
}

function limpiarFrecuencia(f) {
  if (f.tipo === 'dias') return { tipo: 'dias', dias: [...f.dias].map(Number).sort((a, b) => a - b) };
  if (f.tipo === 'semanal' || f.tipo === 'mensual') return { tipo: f.tipo, veces: Number(f.veces) };
  return { tipo: 'diaria' };
}

// Cómo quedará la actividad mañana (con los cambios pendientes aplicados)
function versionFutura(act) {
  if (!act.pendiente) return act;
  const cambios = { ...act.pendiente.cambios };
  delete cambios.archivado;
  return { ...act, ...cambios };
}

function editarActividad(estado, id, datos) {
  const act = buscar(estado, id);
  if (!act) return fallo('Esa actividad no existe.');
  if (act.sagrado) return fallo('Los hábitos sagrados no se pueden modificar.');
  const futura = versionFutura(act);
  const combinada = { ...futura, ...datos, tipo: act.tipo };
  if (act.tipo === 'habito') combinada.frecuencia = limpiarFrecuencia(combinada.frecuencia);
  const error = validarActividad(estado, combinada, id);
  if (error) return fallo(error);

  // Cambios inmediatos
  act.nombre = combinada.nombre.trim();
  act.stat = combinada.stat;
  act.nota = (combinada.nota || '').trim();
  if (act.tipo === 'mision' && combinada.fecha !== act.fecha) {
    registrar(estado, `Cambiaste la entrega de «${act.nombre}»: del ${act.fecha} al ${combinada.fecha}`);
    act.fecha = combinada.fecha;
  }
  if (act.tipo === 'jefe') {
    if ((combinada.fechaLimite || null) !== act.fechaLimite) {
      registrar(estado, `Cambiaste la fecha límite de «${act.nombre}» a ${combinada.fechaLimite || 'ninguna'}`);
      act.fechaLimite = combinada.fechaLimite || null;
    }
    act.recompensa = (combinada.recompensa || '').trim();
    act.tamano = combinada.tamano;
    if (act.modo === 'subtareas') {
      act.subtareas = combinada.subtareas
        .filter(s => s.texto.trim())
        .map(s => ({ texto: s.texto.trim(), hechaEl: s.hechaEl || null, ganado: s.ganado || null }));
    }
  }

  // Cambios diferidos: desde mañana
  const cambios = {};
  for (const campo of CAMPOS_DIFERIDOS[act.tipo]) {
    if (!iguales(combinada[campo], act[campo])) cambios[campo] = combinada[campo];
  }
  const quitarManana = act.pendiente && act.pendiente.cambios.archivado;
  if (quitarManana) cambios.archivado = true;
  act.pendiente = Object.keys(cambios).length ? { desde: sumarDias(hoyDe(estado), 1), cambios } : null;

  registrar(estado, `Editaste «${act.nombre}»`);
  return ok({ diferido: Object.keys(cambios).some(k => k !== 'archivado') });
}

function quitarActividad(estado, id) {
  const act = buscar(estado, id);
  if (!act) return fallo('Esa actividad no existe.');
  if (act.sagrado) return fallo('Los hábitos sagrados no se pueden quitar.');
  if (act.archivado) return fallo('Ya está quitada.');
  // Un mínimo sigue contando hoy: se quita mañana
  if (act.tipo === 'habito' && act.minimo) {
    const cambios = { ...(act.pendiente ? act.pendiente.cambios : {}), archivado: true };
    act.pendiente = { desde: sumarDias(hoyDe(estado), 1), cambios };
    registrar(estado, `«${act.nombre}» se quitará mañana (hoy aún es mínimo)`);
    return ok({ programado: true });
  }
  // Al quitarla ya no cuenta para nada: los cambios pendientes se aplican ya
  if (act.pendiente) {
    const cambios = { ...act.pendiente.cambios };
    delete cambios.archivado;
    Object.assign(act, cambios);
    act.pendiente = null;
  }
  act.archivado = true;
  act.quitadoEl = hoyDe(estado);
  registrar(estado, `Quitaste «${act.nombre}»`);
  return ok({ programado: false });
}

function cancelarQuitar(estado, id) {
  const act = buscar(estado, id);
  if (!act || !act.pendiente || !act.pendiente.cambios.archivado) return fallo('No hay nada que cancelar.');
  delete act.pendiente.cambios.archivado;
  if (!Object.keys(act.pendiente.cambios).length) act.pendiente = null;
  return ok();
}

function volverAPoner(estado, id) {
  const act = buscar(estado, id);
  if (!act || !act.archivado) return fallo('Esa actividad no está quitada.');
  const hoy = hoyDe(estado);
  if (act.tipo === 'mision' && act.estado === 'activa' && act.fecha < hoy) return { ok: false, necesitaFecha: true, error: 'La fecha de entrega ya pasó: elige una nueva.', eventos: [] };
  if (act.tipo === 'jefe' && act.estado === 'activo' && act.fechaLimite && act.fechaLimite < hoy) return { ok: false, necesitaFecha: true, error: 'La fecha límite ya pasó: elige una nueva.', eventos: [] };
  act.archivado = false;
  act.quitadoEl = null;
  // Un mínimo que vuelve cuenta desde mañana
  if (act.tipo === 'habito' && act.minimo) {
    act.minimo = false;
    act.pendiente = { desde: sumarDias(hoy, 1), cambios: { ...(act.pendiente ? act.pendiente.cambios : {}), minimo: true } };
  }
  registrar(estado, `Volviste a poner «${act.nombre}»`);
  return ok();
}

// Volver a poner una misión o jefe con una fecha nueva
function volverAPonerConFecha(estado, id, fecha) {
  const act = buscar(estado, id);
  if (!act || !act.archivado) return fallo('Esa actividad no está quitada.');
  if (!fecha || fecha < hoyDe(estado)) return fallo('Elige una fecha de hoy en adelante.');
  if (act.tipo === 'mision') act.fecha = fecha;
  else act.fechaLimite = fecha;
  return volverAPoner(estado, id);
}

function borrarActividad(estado, id) {
  const act = buscar(estado, id);
  if (!act) return fallo('Esa actividad no existe.');
  if (act.sagrado) return fallo('Los hábitos sagrados no se pueden borrar.');
  if (!act.archivado) return fallo('Primero quítala; solo se borra desde Quitadas.');
  const jefe = estado.actividades.find(a => a.tipo === 'jefe' && a.estado === 'activo' && a.habitoId === id);
  if (jefe) return fallo(`No se puede borrar: el jefe «${jefe.nombre}» depende de este hábito.`);
  estado.actividades = estado.actividades.filter(a => a.id !== id);
  registrar(estado, `Borraste para siempre «${act.nombre}»`);
  return ok();
}

// ---------------------------------------------------------------------
// TIENDA E INVENTARIO
// ---------------------------------------------------------------------
function simularCompra(estado, objeto) {
  const p = REGLAS.tienda[objeto];
  const faltaXP = Math.max(0, p.xp - estado.xp);
  const faltaOro = Math.max(0, p.oro - estado.oro);
  const xpDespues = estado.xp - p.xp;
  return {
    puede: faltaXP === 0 && faltaOro === 0,
    faltaXP, faltaOro,
    nivelAntes: nivelDesdeXP(estado.xp),
    despues: progresoNivel(Math.max(0, xpDespues)),
    oroDespues: estado.oro - p.oro,
  };
}

function comprar(estado, objeto) {
  const p = REGLAS.tienda[objeto];
  if (!p) return fallo('Ese objeto no existe.');
  const s = simularCompra(estado, objeto);
  if (s.faltaXP) return fallo(`Te faltan ${s.faltaXP} XP.`);
  if (s.faltaOro) return fallo(`Te faltan ${s.faltaOro} de oro.`);
  estado.xp -= p.xp;
  estado.oro -= p.oro;
  estado.inventario[objeto]++;
  registrar(estado, `Compraste ${p.nombre} (−${p.xp} XP, −${p.oro} oro)`);
  return ok({ bajaste: s.despues.nivel < s.nivelAntes, nivel: s.despues.nivel });
}

function usarObjeto(estado, objeto) {
  const hoy = hoyDe(estado);
  if (!estado.inventario[objeto]) return fallo('No tienes ese objeto.');
  if (objeto === 'vida') {
    if (estado.vida >= REGLAS.vidaMaxima) return fallo('Tu vida ya está llena.');
    estado.vida = REGLAS.vidaMaxima;
  } else if (objeto === 'descanso') {
    if (estado.descansoDias.includes(hoy)) return fallo('Hoy ya está protegido.');
    estado.descansoDias.push(hoy);
  } else if (objeto === 'multiplicador') {
    const desde = multiplicadorActivo(estado, hoy) ? estado.multiplicadorHasta : sumarDias(hoy, -1);
    estado.multiplicadorHasta = sumarDias(desde, REGLAS.diasMultiplicador);
  } else {
    return fallo('Ese objeto no existe.');
  }
  estado.inventario[objeto]--;
  registrar(estado, `Usaste ${REGLAS.tienda[objeto].nombre}`);
  return ok();
}

// ---------------------------------------------------------------------
// RECOMPENSAS REALES
// ---------------------------------------------------------------------
function listaRecompensas(estado, tipo) {
  return tipo === 'grande' ? estado.recompensas.grandes : estado.recompensas.pequenas;
}

function agregarRecompensa(estado, tipo, texto) {
  texto = (texto || '').trim();
  if (!texto) return fallo('Escribe la recompensa.');
  const hueco = estado.recompensas.pendientes.find(p => p.tipo === tipo && !p.texto);
  if (hueco) {
    hueco.texto = texto;
    return ok({ rellenoHueco: true });
  }
  listaRecompensas(estado, tipo).push(texto);
  return ok({ rellenoHueco: false });
}
function editarRecompensa(estado, tipo, indice, texto) {
  texto = (texto || '').trim();
  if (!texto) return fallo('Escribe la recompensa.');
  const lista = listaRecompensas(estado, tipo);
  if (indice < 0 || indice >= lista.length) return fallo('Esa recompensa no existe.');
  lista[indice] = texto;
  return ok();
}
function borrarRecompensa(estado, tipo, indice) {
  const lista = listaRecompensas(estado, tipo);
  if (indice < 0 || indice >= lista.length) return fallo('Esa recompensa no existe.');
  lista.splice(indice, 1);
  return ok();
}
function moverRecompensa(estado, tipo, indice, direccion) {
  const lista = listaRecompensas(estado, tipo);
  const destino = indice + direccion;
  if (destino < 0 || destino >= lista.length) return fallo('No se puede mover más.');
  [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
  return ok();
}
function reclamarRecompensa(estado, indice) {
  const p = estado.recompensas.pendientes[indice];
  if (!p) return fallo('Esa recompensa no existe.');
  if (!p.texto) return fallo('Primero añade una recompensa a tu lista.');
  estado.recompensas.pendientes.splice(indice, 1);
  estado.recompensas.historial.unshift({ ...p, dia: hoyDe(estado) });
  registrar(estado, `Reclamaste tu recompensa: ${p.texto}`);
  return ok();
}

// Próximos hitos con su recompensa (simula cómo se irán sacando de las listas)
function proximasRecompensas(estado, cuantas) {
  const grandes = [...estado.recompensas.grandes];
  const pequenas = [...estado.recompensas.pequenas];
  const hitos = [];
  for (let n = estado.nivelRecord + 1; hitos.length < cuantas && n <= estado.nivelRecord + 200; n++) {
    const rango = REGLAS.rangos.find(r => r.nivel === n);
    const hito = { nivel: n, rango: rango || null, grande: undefined, pequena: undefined };
    if (rango) hito.grande = grandes.length ? grandes.shift() : null;
    if (n % 5 === 0) hito.pequena = pequenas.length ? pequenas.shift() : null;
    if (rango || n % 5 === 0) hitos.push(hito);
  }
  return hitos;
}

// ---------------------------------------------------------------------
// RESÚMENES PARA LAS PANTALLAS
// ---------------------------------------------------------------------
function listaDeHoy(estado) {
  const hoy = hoyDe(estado);
  const activas = estado.actividades.filter(a => !a.archivado);
  const habitos = activas.filter(a => a.tipo === 'habito');
  const minimos = habitos.filter(a => a.minimo && programadoEl(a, hoy));
  const otros = habitos.filter(a => !a.minimo && (esPeriodico(a) || programadoEl(a, hoy)));
  const misiones = activas
    .filter(a => a.tipo === 'mision' && (a.estado === 'activa' || a.completadaEl === hoy))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const jefes = activas.filter(a => a.tipo === 'jefe' && (a.estado === 'activo' || a.derrotadoEl === hoy));
  return { minimos, otros, misiones, jefes };
}

// Daño que recibiría esta noche si no hago nada más
function danoPendienteHoy(estado) {
  const hoy = hoyDe(estado);
  const protegido = estado.descansoDias.includes(hoy);
  let dano = 0;
  for (const m of listaDeHoy(estado).minimos) {
    if (m.hechos[hoy] || m.creadoEl > hoy) continue;
    if (protegido && m.dificultad !== 'dificil') continue;
    dano += REGLAS.dificultades[m.dificultad].dano;
  }
  return dano;
}

// Daño máximo posible en un día por los mínimos (sin contar misiones)
function danoMaximoDiario(estado) {
  return estado.actividades
    .filter(a => a.tipo === 'habito' && !a.archivado && a.minimo)
    .reduce((total, a) => total + REGLAS.dificultades[a.dificultad].dano, 0);
}

// XP y oro base que se pueden ganar hoy con los hábitos
function gananciaPosibleHoy(estado) {
  const hoy = hoyDe(estado);
  const { minimos, otros } = listaDeHoy(estado);
  let xp = 0;
  let oro = 0;
  for (const a of [...minimos, ...otros]) {
    if (esPeriodico(a) && vecesEnPeriodo(a, hoy) >= a.frecuencia.veces && !a.hechos[hoy]) continue;
    xp += REGLAS.dificultades[a.dificultad].xp;
    oro += REGLAS.dificultades[a.dificultad].oro;
  }
  return { xp, oro };
}

// Comprueba que un objeto importado parece una partida válida
function pareceEstadoValido(obj) {
  return !!obj && typeof obj === 'object' && obj.version === 1 &&
    typeof obj.ultimoDia === 'string' && typeof obj.vida === 'number' && typeof obj.xp === 'number' &&
    Array.isArray(obj.actividades) && obj.recompensas && obj.stats && obj.inventario;
}

const Motor = {
  REGLAS,
  // fechas
  claveDia, sumarDias, diasEntre, diaSemana, inicioSemana, proximoReinicio,
  // niveles
  xpParaSubir, xpAcumuladoNivel, nivelDesdeXP, progresoNivel, progresoStat, rangoDeNivel, siguienteRango,
  // estado
  crearEstadoInicial, actualizar, cerrarDia, pareceEstadoValido, registrar,
  // consultas
  buscar, programadoEl, esPeriodico, vecesEnPeriodo, motivoNoMarcar, bonusRacha, multiplicadorActivo,
  calcularXP, vidaJefe, versionFutura, listaDeHoy, danoPendienteHoy, danoMaximoDiario, gananciaPosibleHoy,
  proximasRecompensas, simularCompra,
  // acciones
  marcarHabito, desmarcarHabito, completarMision, deshacerMision, completarSubtarea, deshacerSubtarea,
  crearActividad, editarActividad, quitarActividad, cancelarQuitar, volverAPoner, volverAPonerConFecha, borrarActividad,
  comprar, usarObjeto,
  agregarRecompensa, editarRecompensa, borrarRecompensa, moverRecompensa, reclamarRecompensa,
};

// Para poder usar el motor en las pruebas automáticas (con Node.js)
if (typeof module !== 'undefined') module.exports = Motor;
