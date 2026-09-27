// Pruebas automáticas de las reglas del juego.
// Se ejecutan con:  node --test pruebas/
// Cada prueba monta una partida, hace algo y comprueba que el resultado
// es el que dice DISENO.md.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../js/motor.js');

// Mediodía (hora local) de un día de juego 'AAAA-MM-DD'
function mediodia(clave) {
  const [a, m, d] = clave.split('-').map(Number);
  return new Date(a, m - 1, d, 12, 0, 0);
}
// Partida nueva que empieza el lunes 28 de septiembre de 2026
function partida() { return M.crearEstadoInicial(mediodia('2026-09-28')); }
function pasarDias(estado, n = 1) { return M.actualizar(estado, mediodia(M.sumarDias(estado.ultimoDia, n))); }
function sagrados(estado) { return estado.actividades.filter(a => a.sagrado); }
function cumplirMinimos(estado) { for (const a of sagrados(estado)) M.marcarHabito(estado, a.id); }
function porNombre(estado, nombre) { return estado.actividades.find(a => a.nombre === nombre); }

test('el día de juego empieza a las 3:00 a.m.', () => {
  assert.equal(M.claveDia(new Date(2026, 8, 28, 1, 30)), '2026-09-27');
  assert.equal(M.claveDia(new Date(2026, 8, 28, 2, 59)), '2026-09-27');
  assert.equal(M.claveDia(new Date(2026, 8, 28, 3, 0)), '2026-09-28');
  assert.equal(M.diaSemana('2026-09-28'), 1); // lunes
  assert.equal(M.diaSemana('2026-10-04'), 7); // domingo
});

test('fórmula de niveles: 200 + 30 × N', () => {
  assert.equal(M.xpAcumuladoNivel(2), 230);
  assert.equal(M.xpAcumuladoNivel(7), 1830);
  assert.equal(M.xpAcumuladoNivel(60), 64900);
  assert.equal(M.nivelDesdeXP(1829), 6);
  assert.equal(M.nivelDesdeXP(1830), 7);
  assert.deepEqual(M.progresoNivel(1980), { nivel: 7, actual: 150, necesario: 410 });
  assert.equal(M.rangoDeNivel(7).nombre, 'Escudero');
  assert.equal(M.rangoDeNivel(60).nombre, 'Emperador');
});

test('la partida empieza con los 4 sagrados como mínimos medios y el resto fáciles', () => {
  const e = partida();
  assert.equal(e.actividades.length, 10);
  assert.equal(sagrados(e).length, 4);
  for (const a of sagrados(e)) { assert.equal(a.minimo, true); assert.equal(a.dificultad, 'media'); }
  for (const a of e.actividades.filter(x => !x.sagrado)) { assert.equal(a.minimo, false); assert.equal(a.dificultad, 'facil'); }
  assert.equal(M.danoMaximoDiario(e), 40);
});

test('cumplir un hábito da XP y oro, y se puede deshacer el mismo día', () => {
  const e = partida();
  const biblia = porNombre(e, 'Leer la Biblia 10 min');
  const r = M.marcarHabito(e, biblia.id);
  assert.equal(r.ok, true);
  assert.equal(e.xp, 20);
  assert.equal(e.oro, 10);
  assert.equal(e.stats.espiritu, 20);
  assert.equal(M.marcarHabito(e, biblia.id).ok, false, 'no se puede marcar dos veces');
  M.desmarcarHabito(e, biblia.id);
  assert.equal(e.xp, 0);
  assert.equal(e.oro, 0);
  assert.equal(e.stats.espiritu, 0);
});

test('no cumplir los 4 mínimos quita 40 HP al cerrar el día', () => {
  const e = partida();
  const eventos = pasarDias(e);
  assert.equal(e.vida, 60);
  assert.equal(e.ultimoDia, '2026-09-29');
  assert.equal(eventos.filter(ev => ev.tipo === 'dano').length, 4);
});

test('cumplir los mínimos 7 días da racha y +10 % de XP', () => {
  const e = partida();
  for (let i = 0; i < 7; i++) { cumplirMinimos(e); pasarDias(e); }
  assert.equal(e.vida, 100);
  assert.equal(e.racha, 7);
  assert.equal(M.bonusRacha(e), 10);
  M.marcarHabito(e, porNombre(e, 'Orar 30 min').id);
  assert.equal(porNombre(e, 'Orar 30 min').hechos[e.ultimoDia].xp, 22);
});

test('el bonus de racha llega como mucho a +50 %', () => {
  const e = partida();
  e.racha = 100;
  assert.equal(M.bonusRacha(e), 50);
});

test('un solo mínimo sin cumplir rompe la racha', () => {
  const e = partida();
  e.racha = 10;
  const [a, b, c] = sagrados(e);
  for (const h of [a, b, c]) M.marcarHabito(e, h.id);
  pasarDias(e);
  assert.equal(e.racha, 0);
  assert.equal(e.vida, 90);
});

test('la poción de descanso protege de lo fácil y mediano y congela la racha', () => {
  const e = partida();
  e.racha = 5;
  e.inventario.descanso = 1;
  assert.equal(M.usarObjeto(e, 'descanso').ok, true);
  pasarDias(e);
  assert.equal(e.vida, 100);
  assert.equal(e.racha, 5);
  assert.equal(e.inventario.descanso, 0);
});

test('la poción de descanso no protege de un mínimo difícil', () => {
  const e = partida();
  M.crearActividad(e, { tipo: 'habito', nombre: 'Correr 5 km', stat: 'cuerpo', dificultad: 'dificil', frecuencia: { tipo: 'diaria' }, minimo: true });
  pasarDias(e); // el mínimo nuevo empieza a contar mañana
  e.vida = 100;
  cumplirMinimos(e);
  e.inventario.descanso = 1;
  M.usarObjeto(e, 'descanso');
  pasarDias(e);
  assert.equal(e.vida, 75);
});

test('una misión que vence quita vida según su tamaño y queda fallida', () => {
  const e = partida();
  const r = M.crearActividad(e, { tipo: 'mision', nombre: 'Ensayo', stat: 'mente', dificultad: 'media', fecha: '2026-09-29' });
  assert.equal(r.ok, true);
  cumplirMinimos(e);
  pasarDias(e); // cierra el 28: aún no vence
  assert.equal(e.vida, 100);
  cumplirMinimos(e);
  pasarDias(e); // cierra el 29: vence
  assert.equal(e.vida, 90);
  assert.equal(r.actividad.estado, 'fallida');
  assert.equal(M.completarMision(e, r.actividad.id).ok, false, 'una misión fallida ya no da XP');
});

test('completar una misión a tiempo evita el daño', () => {
  const e = partida();
  const r = M.crearActividad(e, { tipo: 'mision', nombre: 'Leer capítulo', stat: 'mente', dificultad: 'dificil', fecha: '2026-09-28' });
  assert.equal(M.completarMision(e, r.actividad.id).xp, 50);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(e.vida, 100);
});

test('jefe por subtareas: al completar todas cae y da su premio', () => {
  const e = partida();
  const r = M.crearActividad(e, {
    tipo: 'jefe', nombre: 'La tesis', stat: 'mente', tamano: 'epico', modo: 'subtareas',
    subtareas: [{ texto: 'Tema' }, { texto: 'Marco teórico' }], recompensa: 'Una cena especial',
  });
  assert.equal(r.ok, true);
  const jefe = r.actividad;
  assert.deepEqual(M.vidaJefe(jefe), { actual: 2, maxima: 2 });
  M.completarSubtarea(e, jefe.id, 0);
  const fin = M.completarSubtarea(e, jefe.id, 1);
  assert.equal(jefe.estado, 'derrotado');
  assert.equal(e.xp, 10 + 10 + 1000);
  assert.ok(fin.eventos.some(ev => ev.tipo === 'jefe'));
  assert.equal(e.recompensas.pendientes.at(-1).texto, 'Una cena especial');
});

test('un jefe con la fecha límite vencida quita 50 HP (ni la poción de descanso lo evita)', () => {
  const e = partida();
  M.crearActividad(e, {
    tipo: 'jefe', nombre: 'Guion del corto', stat: 'creatividad', tamano: 'grande', modo: 'subtareas',
    subtareas: [{ texto: 'Idea' }, { texto: 'Borrador' }], fechaLimite: '2026-09-28',
  });
  cumplirMinimos(e);
  e.inventario.descanso = 1;
  M.usarObjeto(e, 'descanso');
  pasarDias(e);
  assert.equal(e.vida, 50);
});

test('jefe por racha de un hábito semanal: 2 semanas cumpliendo 3/3 lo derrotan', () => {
  const e = partida();
  const iglesia = porNombre(e, 'Ir a la iglesia');
  const r = M.crearActividad(e, { tipo: 'jefe', nombre: 'Dos semanas de iglesia', stat: 'espiritu', tamano: 'pequeno', modo: 'racha', habitoId: iglesia.id, meta: 2 });
  const jefe = r.actividad;
  for (let semana = 0; semana < 2; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      cumplirMinimos(e);
      if (dia < 3) assert.equal(M.marcarHabito(e, iglesia.id).ok, true);
      if (dia === 3) assert.equal(M.marcarHabito(e, iglesia.id).ok, false, 'meta semanal ya cumplida');
      pasarDias(e);
    }
  }
  assert.equal(jefe.estado, 'derrotado');
});

test('jefe por racha: si rompes la racha se cura por completo', () => {
  const e = partida();
  const crema = porNombre(e, 'Crema del acné en la noche');
  const jefe = M.crearActividad(e, { tipo: 'jefe', nombre: 'Piel perfecta', stat: 'cuerpo', tamano: 'pequeno', modo: 'racha', habitoId: crema.id, meta: 10 }).actividad;
  for (let i = 0; i < 3; i++) { cumplirMinimos(e); M.marcarHabito(e, crema.id); pasarDias(e); }
  assert.equal(jefe.progreso, 3);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(jefe.progreso, 0);
});

test('muerte en Hardcore: se pierde todo y las recompensas sin reclamar vuelven a su lista', () => {
  const e = partida();
  e.xp = 1500; // nivel 5
  M.marcarHabito(e, porNombre(e, 'Crema del acné en la noche').id); // provoca la subida al 5
  assert.equal(e.recompensas.pendientes.length, 2);
  e.oro = 500;
  e.inventario.vida = 2;
  e.vida = 30;
  const eventos = pasarDias(e);
  assert.ok(eventos.some(ev => ev.tipo === 'muerte'));
  assert.equal(e.vida, 100);
  assert.equal(e.xp, 0);
  assert.equal(e.oro, 0);
  assert.equal(e.nivelRecord, 1);
  assert.equal(e.inventario.vida, 0);
  assert.equal(e.muertes.length, 1);
  assert.equal(e.recompensas.pendientes.length, 0);
  assert.equal(e.recompensas.grandes[0], 'Cuerdas nuevas para la guitarra');
  assert.equal(e.recompensas.pequenas[0], 'Ver una película');
  assert.equal(e.actividades.length, 10, 'los hábitos no se borran al morir');
});

test('muerte en modo Duro: vuelves al inicio de tu rango', () => {
  const e = partida();
  e.ajustes.modoMuerte = 'duro';
  e.xp = M.xpAcumuladoNivel(12) + 100;
  e.oro = 300;
  e.vida = 10;
  pasarDias(e);
  assert.equal(M.nivelDesdeXP(e.xp), 10);
  assert.equal(e.xp, M.xpAcumuladoNivel(10));
  assert.equal(e.oro, 0);
});

test('muerte en modo Suave: la mitad del oro y de los objetos', () => {
  const e = partida();
  e.ajustes.modoMuerte = 'suave';
  e.xp = 5000;
  e.oro = 301;
  e.inventario.descanso = 3;
  e.vida = 10;
  pasarDias(e);
  assert.equal(e.xp, 5000);
  assert.equal(e.oro, 150);
  assert.equal(e.inventario.descanso, 1);
});

test('si no abro el juego en varios días, se cierran todos (y puedo morir)', () => {
  const e = partida();
  const eventos = pasarDias(e, 3); // 3 días × 40 HP = 120
  assert.equal(e.muertes.length, 1);
  assert.equal(e.ultimoDia, '2026-10-01');
  assert.ok(eventos.some(ev => ev.tipo === 'muerte'));
});

test('recompensas: en el nivel 5 se ganan la grande y la pequeña; se reclaman', () => {
  const e = partida();
  e.xp = M.xpAcumuladoNivel(5) - 5;
  const r = M.marcarHabito(e, porNombre(e, 'Crema del acné en la noche').id);
  assert.ok(r.eventos.some(ev => ev.tipo === 'rango'));
  const textos = e.recompensas.pendientes.map(p => p.texto);
  assert.deepEqual(textos, ['Cuerdas nuevas para la guitarra', 'Ver una película']);
  assert.equal(e.recompensas.grandes.length, 2);
  assert.equal(M.reclamarRecompensa(e, 0).ok, true);
  assert.equal(e.recompensas.historial[0].texto, 'Cuerdas nuevas para la guitarra');
});

test('recompensas: bajar de nivel y volver a subir no repite la recompensa', () => {
  const e = partida();
  e.xp = M.xpAcumuladoNivel(5) - 5;
  M.marcarHabito(e, porNombre(e, 'Crema del acné en la noche').id);
  const antes = e.recompensas.pendientes.length;
  e.xp = M.xpAcumuladoNivel(4); // baja al 4
  M.marcarHabito(e, porNombre(e, 'Comer a horas decentes').id);
  e.xp = M.xpAcumuladoNivel(5) + 10; // vuelve al 5
  M.marcarHabito(e, porNombre(e, 'Levantarme a la misma hora').id);
  assert.equal(e.recompensas.pendientes.length, antes);
});

test('recompensas: con la lista vacía queda un hueco que se llena al añadir', () => {
  const e = partida();
  e.recompensas.pequenas = [];
  e.xp = M.xpAcumuladoNivel(5) - 5;
  M.marcarHabito(e, porNombre(e, 'Crema del acné en la noche').id);
  const hueco = e.recompensas.pendientes.find(p => p.tipo === 'pequena');
  assert.equal(hueco.texto, null);
  assert.equal(M.reclamarRecompensa(e, e.recompensas.pendientes.indexOf(hueco)).ok, false);
  M.agregarRecompensa(e, 'pequena', 'Un helado');
  assert.equal(hueco.texto, 'Un helado');
  assert.equal(e.recompensas.pequenas.length, 0);
});

test('próximas recompensas: niveles 5, 10, 15 y 20 con sus listas', () => {
  const e = partida();
  const hitos = M.proximasRecompensas(e, 4);
  assert.deepEqual(hitos.map(h => h.nivel), [5, 10, 15, 20]);
  assert.equal(hitos[1].grande, 'Un curso de colorización');
  assert.equal(hitos[1].pequena, 'Comer algo que me guste');
  assert.equal(hitos[3].grande, null);
});

test('tienda: la poción de vida cuesta 200 XP + 1000 oro y puede bajarte de nivel', () => {
  const e = partida();
  e.xp = 1980; // nivel 7 (150/410)
  e.oro = 640;
  assert.equal(M.comprar(e, 'vida').ok, false);
  e.oro = 1000;
  const r = M.comprar(e, 'vida');
  assert.equal(r.ok, true);
  assert.equal(r.bajaste, true);
  assert.equal(M.nivelDesdeXP(e.xp), 6);
  assert.equal(e.oro, 0);
  e.vida = 40;
  M.usarObjeto(e, 'vida');
  assert.equal(e.vida, 100);
  assert.equal(M.usarObjeto(e, 'vida').ok, false, 'ya no quedan');
});

test('multiplicador: XP ×2 durante 7 días', () => {
  const e = partida();
  e.inventario.multiplicador = 1;
  M.usarObjeto(e, 'multiplicador');
  assert.equal(e.multiplicadorHasta, '2026-10-04');
  const crema = porNombre(e, 'Crema del acné en la noche');
  M.marcarHabito(e, crema.id);
  assert.equal(crema.hechos['2026-09-28'].xp, 20);
  for (let i = 0; i < 7; i++) { cumplirMinimos(e); pasarDias(e); }
  assert.equal(e.ultimoDia, '2026-10-05');
  assert.equal(M.multiplicadorActivo(e, e.ultimoDia), false);
});

test('editar la dificultad de un hábito se aplica desde mañana', () => {
  const e = partida();
  const crema = porNombre(e, 'Crema del acné en la noche');
  const r = M.editarActividad(e, crema.id, { dificultad: 'dificil', nombre: 'Crema del acné' });
  assert.equal(r.ok, true);
  assert.equal(r.diferido, true);
  assert.equal(crema.nombre, 'Crema del acné', 'el nombre cambia al momento');
  assert.equal(crema.dificultad, 'facil', 'hoy sigue siendo fácil');
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(crema.dificultad, 'dificil');
  assert.equal(crema.pendiente, null);
});

test('un hábito nuevo marcado como mínimo empieza a contar mañana', () => {
  const e = partida();
  const r = M.crearActividad(e, { tipo: 'habito', nombre: 'Guitarra', stat: 'creatividad', dificultad: 'facil', frecuencia: { tipo: 'diaria' }, minimo: true });
  assert.equal(r.actividad.minimo, false);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(e.vida, 100, 'hoy no quitó vida');
  assert.equal(r.actividad.minimo, true);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(e.vida, 95);
});

test('quitar un mínimo: sigue contando hoy y se quita mañana', () => {
  const e = partida();
  const guitarra = M.crearActividad(e, { tipo: 'habito', nombre: 'Guitarra', stat: 'creatividad', dificultad: 'media', frecuencia: { tipo: 'diaria' }, minimo: true }).actividad;
  cumplirMinimos(e);
  pasarDias(e);
  const r = M.quitarActividad(e, guitarra.id);
  assert.equal(r.programado, true);
  assert.equal(guitarra.archivado, false);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(e.vida, 90, 'contó como mínimo el día que la quité');
  assert.equal(guitarra.archivado, true);
});

test('quitar un hábito normal es inmediato; se puede volver a poner y borrar', () => {
  const e = partida();
  const comer = porNombre(e, 'Comer a horas decentes');
  assert.equal(M.borrarActividad(e, comer.id).ok, false, 'primero hay que quitarla');
  M.quitarActividad(e, comer.id);
  assert.equal(comer.archivado, true);
  M.volverAPoner(e, comer.id);
  assert.equal(comer.archivado, false);
  M.quitarActividad(e, comer.id);
  assert.equal(M.borrarActividad(e, comer.id).ok, true);
  assert.equal(porNombre(e, 'Comer a horas decentes'), undefined);
});

test('quitar un hábito con cambios pendientes los aplica; al volver, el mínimo cuenta desde mañana', () => {
  const e = partida();
  const guitarra = M.crearActividad(e, { tipo: 'habito', nombre: 'Guitarra', stat: 'creatividad', dificultad: 'facil', frecuencia: { tipo: 'diaria' }, minimo: true }).actividad;
  M.quitarActividad(e, guitarra.id);
  assert.equal(guitarra.archivado, true);
  assert.equal(guitarra.pendiente, null);
  assert.equal(guitarra.minimo, true);
  M.volverAPoner(e, guitarra.id);
  assert.equal(guitarra.minimo, false);
  assert.deepEqual(guitarra.pendiente.cambios, { minimo: true });
});

test('quitar una misión no quita vida (rendirse no tiene castigo por ahora)', () => {
  const e = partida();
  const m = M.crearActividad(e, { tipo: 'mision', nombre: 'Taller', stat: 'mente', dificultad: 'dificil', fecha: '2026-09-28' }).actividad;
  M.quitarActividad(e, m.id);
  cumplirMinimos(e);
  pasarDias(e);
  assert.equal(e.vida, 100);
  const r = M.volverAPoner(e, m.id);
  assert.equal(r.ok, false);
  assert.equal(r.necesitaFecha, true);
  assert.equal(M.volverAPonerConFecha(e, m.id, '2026-10-02').ok, true);
  assert.equal(m.archivado, false);
});

test('los hábitos sagrados no se pueden editar, quitar ni borrar', () => {
  const e = partida();
  const orar = porNombre(e, 'Orar 30 min');
  assert.equal(M.editarActividad(e, orar.id, { nombre: 'Orar 1 min' }).ok, false);
  assert.equal(M.quitarActividad(e, orar.id).ok, false);
  assert.equal(M.borrarActividad(e, orar.id).ok, false);
  assert.equal(orar.nombre, 'Orar 30 min');
});

test('días concretos: solo aparece y solo quita vida los días que le tocan', () => {
  const e = partida(); // lunes
  const guitarra = M.crearActividad(e, { tipo: 'habito', nombre: 'Guitarra', stat: 'creatividad', dificultad: 'media', frecuencia: { tipo: 'dias', dias: [1, 3, 5] }, minimo: true }).actividad;
  cumplirMinimos(e);
  pasarDias(e); // martes: no le toca
  assert.equal(guitarra.minimo, true);
  assert.equal(M.motivoNoMarcar(guitarra, e.ultimoDia), 'Hoy no le toca.');
  cumplirMinimos(e);
  pasarDias(e); // cierra el martes sin daño
  assert.equal(e.vida, 100);
  cumplirMinimos(e);
  pasarDias(e); // cierra el miércoles: sí le tocaba
  assert.equal(e.vida, 90);
});

test('validaciones al crear actividades', () => {
  const e = partida();
  assert.equal(M.crearActividad(e, { tipo: 'habito', nombre: 'orar 30 MIN', stat: 'espiritu', dificultad: 'facil', frecuencia: { tipo: 'diaria' } }).ok, false, 'nombre repetido');
  assert.equal(M.crearActividad(e, { tipo: 'mision', nombre: 'Tarde', stat: 'mente', dificultad: 'facil', fecha: '2026-09-01' }).ok, false, 'fecha pasada');
  assert.equal(M.crearActividad(e, { tipo: 'habito', nombre: 'Semanal mínimo', stat: 'mente', dificultad: 'facil', frecuencia: { tipo: 'semanal', veces: 2 }, minimo: true }).ok, false, 'un semanal no puede ser mínimo');
  assert.equal(M.crearActividad(e, { tipo: 'jefe', nombre: 'Jefe', stat: 'mente', tamano: 'grande', modo: 'subtareas', subtareas: [{ texto: 'Solo una' }] }).ok, false, 'faltan subtareas');
  assert.equal(M.crearActividad(e, { tipo: 'habito', nombre: 'x'.repeat(41), stat: 'mente', dificultad: 'facil', frecuencia: { tipo: 'diaria' } }).ok, false, 'nombre largo');
});
