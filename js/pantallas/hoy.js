// Pantalla HOY: el caballero, los mínimos del día, los otros hábitos,
// las misiones y los jefes finales.

// Una fila de "enemigo" (se usa aquí y en la vista previa del formulario)
function filaEnemigo({ icono, nombre, chips = '', premio = '', accion = '', clases = '' }) {
  return `
    <div class="enemigo ${clases}">
      <div class="retrato"><span data-px="${icono}" data-s="3"></span></div>
      <div><div class="nombre">${UI.esc(nombre)}</div><div class="meta">${chips}</div></div>
      <div class="premio ${clases.includes('hecho') ? '' : 'oro'}">${premio}</div>
      ${accion !== null ? `<div class="accion">${accion}</div>` : ''}
    </div>`;
}

function selloDerrotado(texto, accionDeshacer) {
  return `<span class="sello"><span data-px="espada" data-s="1"></span>${texto}</span>
    ${accionDeshacer ? `<button class="enlace" ${accionDeshacer}>deshacer</button>` : ''}`;
}

function filaHabito(estado, h) {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  const d = R.dificultades[h.dificultad];
  const hecho = h.hechos[hoy];
  const periodico = Motor.esPeriodico(h);
  const veces = periodico ? Motor.vecesEnPeriodo(h, hoy) : 0;
  const metaCumplida = periodico && veces >= h.frecuencia.veces;

  let chips = UI.chipStat(h.stat) + `<span class="chip">${d.enemigo}</span>`;
  if (h.sagrado) chips += '<span class="chip sagrado">Sagrado</span>';
  if (h.minimo && !hecho) chips += `<span class="chip minimo">−${d.dano} HP si no</span>`;
  if (periodico) chips += `<span class="chip">${h.frecuencia.veces} por ${h.frecuencia.tipo === 'semanal' ? 'semana' : 'mes'}: ${veces}/${h.frecuencia.veces}</span>`;
  if (h.pendiente && h.pendiente.cambios.minimo === true) chips += '<span class="chip aviso">Mínimo desde mañana</span>';
  if (h.pendiente && h.pendiente.cambios.archivado) chips += '<span class="chip aviso">Se quita mañana</span>';

  let accion;
  let premio;
  if (hecho) {
    premio = `+${hecho.xp} XP<br>+${hecho.oro} oro`;
    accion = selloDerrotado('DERROTADO', `data-accion="desmarcar" data-id="${h.id}"`);
  } else if (metaCumplida) {
    premio = '';
    accion = selloDerrotado('META CUMPLIDA');
  } else {
    premio = `+${Motor.calcularXP(estado, d.xp, hoy)} XP<br>+${d.oro} oro`;
    accion = `<button class="btn ${h.minimo ? 'dorado' : ''}" data-accion="marcar" data-id="${h.id}"><span data-px="espada" data-s="1"></span>ATACAR</button>`;
  }
  return filaEnemigo({
    icono: UI.iconoEnemigo(h.dificultad), nombre: h.nombre, chips, premio, accion,
    clases: hecho || metaCumplida ? 'hecho' : '',
  });
}

function filaMision(estado, m) {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  const d = R.dificultades[m.dificultad];
  const completada = m.estado === 'completada';
  let chips = UI.chipStat(m.stat) + `<span class="chip">${d.mision}</span>`;
  if (!completada) {
    const dias = Motor.diasEntre(hoy, m.fecha);
    chips += `<span class="chip ${dias <= 1 ? 'minimo' : ''}">${UI.cuandoVence(m.fecha, hoy)} · −${d.dano} HP</span>`;
  }
  const accion = completada
    ? selloDerrotado('COMPLETADA', `data-accion="deshacerMision" data-id="${m.id}"`)
    : `<button class="btn ${Motor.diasEntre(hoy, m.fecha) <= 1 ? 'dorado' : ''}" data-accion="completarMision" data-id="${m.id}"><span data-px="espada" data-s="1"></span>COMPLETAR</button>`;
  const premio = completada ? `+${m.ganado.xp} XP<br>+${m.ganado.oro} oro` : `+${Motor.calcularXP(estado, d.xp, hoy)} XP<br>+${d.oro} oro`;
  return filaEnemigo({ icono: UI.iconoEnemigo(m.dificultad), nombre: m.nombre, chips, premio, accion, clases: completada ? 'hecho' : '' });
}

function bloqueJefe(estado, j) {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  const vida = Motor.vidaJefe(j);
  const t = R.jefes[j.tamano];
  let detalle = '';
  if (j.estado === 'derrotado') {
    detalle = `<div style="margin-top:12px">${selloDerrotado('¡JEFE DERROTADO!')}</div>`;
  } else if (j.modo === 'subtareas') {
    const indice = j.subtareas.findIndex(s => !s.hechaEl);
    const hechasHoy = j.subtareas.map((s, i) => ({ s, i })).filter(x => x.s.hechaEl === hoy);
    detalle = `
      <div class="subtarea-sig">Próxima subtarea: <b>${UI.esc(j.subtareas[indice].texto)}</b>
        <button class="btn dorado" data-accion="subtarea" data-id="${j.id}" data-i="${indice}"><span data-px="espada" data-s="1"></span>ATACAR</button></div>
      ${hechasHoy.map(x => `<div class="suave" style="font-size:19px">Hoy: ${UI.esc(x.s.texto)} ✓ <button class="enlace" data-accion="deshacerSubtarea" data-id="${j.id}" data-i="${x.i}">deshacer</button></div>`).join('')}`;
  } else {
    const h = Motor.buscar(estado, j.habitoId);
    const unidad = !h ? '' : h.frecuencia.tipo === 'semanal' ? 'semanas' : h.frecuencia.tipo === 'mensual' ? 'meses' : 'días';
    detalle = `<div class="suave" style="font-size:20px;margin-top:10px">Se le hace daño cumpliendo <b>${UI.esc(h ? h.nombre : '(hábito borrado)')}</b>. Racha: <b>${j.progreso}/${j.meta} ${unidad}</b>. Si la rompes, se cura.</div>`;
  }
  const limite = j.fechaLimite && j.estado === 'activo'
    ? ` · Fecha límite: ${UI.fechaConAno(j.fechaLimite)} (−${R.danoJefeVencido} HP si vence)` : '';
  return `
    <div class="jefe-fila">
      <div class="retrato"><span data-px="jefe" data-s="6"></span></div>
      <div>
        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap"><span class="pixel" style="font-size:20px">${UI.esc(j.nombre.toUpperCase())}</span>${UI.chipStat(j.stat)}<span class="chip c-espiritu">${t.nombre}</span></div>
        <div class="linea">Vida del jefe <b>${vida.actual} / ${vida.maxima}</b></div>
        ${UI.barra(vida.actual, vida.maxima, 'jefe')}
        ${detalle}
        <div style="font-size:20px;margin-top:8px" class="suave">Premio: <b class="oro">+${t.xp} XP · +${t.oro} oro</b>${j.recompensa ? ` + ${UI.esc(j.recompensa)}` : ''}${limite}</div>
      </div>
    </div>`;
}

function pantallaHoy() {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  const nivel = Motor.progresoNivel(estado.xp);
  const rango = Motor.rangoDeNivel(nivel.nivel);
  const siguiente = Motor.siguienteRango(nivel.nivel);
  const { minimos, otros, misiones, jefes } = Motor.listaDeHoy(estado);
  const minimosHechos = minimos.filter(m => m.hechos[hoy]).length;
  const otrosHechos = otros.filter(h => h.hechos[hoy]).length;
  const danoPendiente = Motor.danoPendienteHoy(estado);
  const protegido = estado.descansoDias.includes(hoy);
  const bonus = Motor.bonusRacha(estado);
  const multi = Motor.multiplicadorActivo(estado, hoy);

  let avisoMinimos;
  if (protegido) {
    avisoMinimos = '<div class="nota ok" style="margin-bottom:14px">Hoy estás protegido con la <b>poción de descanso</b>: los mínimos fáciles y medianos no quitan vida y tu racha se mantiene.</div>';
  } else if (danoPendiente > 0) {
    const faltan = minimos.length - minimosHechos;
    avisoMinimos = `<div class="nota peligro" style="margin-bottom:14px"><b style="color:#fff">Si no cumples ${faltan === 1 ? 'el que falta' : `los ${faltan} que faltan`} antes de las 3:00 a.m.:</b> −${danoPendiente} HP${estado.racha > 0 ? ` y pierdes la racha de ${estado.racha} días` : ''}.</div>`;
  } else if (minimos.length) {
    avisoMinimos = `<div class="nota ok" style="margin-bottom:14px">¡Cumpliste todos los mínimos! Esta noche tu racha sube a <b>${estado.racha + 1} días</b>.</div>`;
  } else {
    avisoMinimos = '';
  }

  const inv = estado.inventario;
  const copiaVieja = !estado.ajustes.ultimaCopia || Motor.diasEntre(estado.ajustes.ultimaCopia, hoy) >= 7;

  return `
  <div class="rejilla">
    <div class="col">
      <section class="caja dorada">
        <div class="pixel rango-nombre">${rango.nombre.toUpperCase()}</div>
        <div class="suave" style="font-size:21px;margin-top:4px">Nivel ${nivel.nivel}${siguiente ? ` · Próximo rango: <b>${siguiente.nombre}</b> en nivel ${siguiente.nivel}` : ' · ¡Rango máximo!'}</div>
        <div class="escenario"><div class="estrellas"></div><span data-px="k:${rango.id}" data-s="8"></span></div>
        <div class="linea"><span data-px="corazon" data-s="2"></span>VIDA <b>${estado.vida} / ${R.vidaMaxima}</b></div>
        ${UI.barra(estado.vida, R.vidaMaxima, 'vida')}
        <div class="linea"><span data-px="xp" data-s="2"></span>XP hacia el nivel ${nivel.nivel + 1} <b>${UI.num(nivel.actual)} / ${UI.num(nivel.necesario)}</b></div>
        ${UI.barra(nivel.actual, nivel.necesario, 'xp')}
        <div class="fila2">
          <span class="chip"><span data-px="moneda" data-s="2"></span><b class="oro">${UI.num(estado.oro)}</b> oro</span>
          <span class="chip"><span data-px="llama" data-s="2"></span>Racha <b>${estado.racha} ${estado.racha === 1 ? 'día' : 'días'}</b>${bonus ? ` · +${bonus} % XP` : ''}</span>
          ${multi ? `<span class="chip" style="color:var(--oro)"><span data-px="elixir" data-s="2"></span>XP ×2 hasta el ${UI.fechaCorta(estado.multiplicadorHasta)}</span>` : ''}
        </div>
      </section>

      <section class="caja">
        <h2 class="titulo">ESTADÍSTICAS</h2>
        <div class="stats">
          ${Object.keys(R.estadisticas).map(s => {
            const p = Motor.progresoStat(estado.stats[s]);
            return `<span data-px="${s}" data-s="2"></span><span class="c-${s}">${R.estadisticas[s]}</span><span class="nv">NV ${p.nivel}</span><span class="num">${p.actual}/${p.necesario} XP</span>
              ${UI.barra(p.actual, p.necesario, 'fina', `--c1:var(--${s});--c2:var(--${s}-2)`)}`;
          }).join('')}
        </div>
      </section>

      <section class="caja">
        <h2 class="titulo">INVENTARIO</h2>
        <div class="inv">
          <div class="it ${inv.descanso ? '' : 'tenue'}"><span data-px="descanso" data-s="2"></span>Poción de descanso ×${inv.descanso}
            ${inv.descanso ? `<button class="btn chico" data-accion="usar" data-objeto="descanso" ${protegido ? 'disabled' : ''}>${protegido ? 'HOY PROTEGIDO' : 'USAR HOY'}</button>` : ''}</div>
          <div class="it ${inv.vida ? '' : 'tenue'}"><span data-px="pocion" data-s="2"></span>Poción de vida ×${inv.vida}
            ${inv.vida ? `<button class="btn chico" data-accion="usar" data-objeto="vida" ${estado.vida >= R.vidaMaxima ? 'disabled' : ''}>USAR</button>` : '<a class="btn chico apagado" href="#tienda">IR A LA TIENDA</a>'}</div>
          <div class="it ${inv.multiplicador ? '' : 'tenue'}"><span data-px="elixir" data-s="2"></span>Multiplicador ×${inv.multiplicador}
            ${inv.multiplicador ? '<button class="btn chico" data-accion="usar" data-objeto="multiplicador">ACTIVAR</button>' : ''}</div>
        </div>
      </section>
    </div>

    <div class="col">
      <section class="caja dia">
        <span data-px="calendario" data-s="3"></span>
        <div>
          <div class="fecha">${UI.fechaLarga(hoy).toUpperCase()}</div>
          <div class="suave" style="margin-top:6px">Hoy llevas <b class="oro">+${estado.hoy.xp} XP</b> y <b class="oro">+${estado.hoy.oro} oro</b> · ${estado.hoy.derrotados} ${estado.hoy.derrotados === 1 ? 'enemigo derrotado' : 'enemigos derrotados'}</div>
          ${copiaVieja ? '<div style="margin-top:6px;font-size:19px"><a href="#ajustes">Haz una copia de seguridad de tu partida (Ajustes)</a></div>' : ''}
        </div>
        <div class="reloj">El día se cierra en<br><b id="reloj">${UI.tiempoHastaReinicio(new Date())}</b> <span class="suave">(3:00 a.m.)</span></div>
      </section>

      <section class="caja">
        <h2 class="titulo"><span data-px="candado" data-s="2"></span>MÍNIMOS DEL DÍA · ${minimosHechos}/${minimos.length} <span class="der">Si no los cumples, pierdes vida</span></h2>
        ${avisoMinimos}
        <div class="lista">${minimos.map(h => filaHabito(estado, h)).join('') || '<div class="vacio">Hoy no tienes mínimos.</div>'}</div>
      </section>

      <section class="caja">
        <h2 class="titulo">OTROS HÁBITOS · ${otrosHechos}/${otros.length} <span class="der">No quitan vida</span></h2>
        <div class="lista">${otros.map(h => filaHabito(estado, h)).join('') || '<div class="vacio">No hay otros hábitos para hoy.</div>'}</div>
      </section>
    </div>
  </div>

  <div class="inferior">
    <section class="caja">
      <h2 class="titulo"><span data-px="calendario" data-s="2"></span>MISIONES <span class="der">Tareas con fecha de entrega</span></h2>
      <div class="lista">${misiones.map(m => filaMision(estado, m)).join('') || '<div class="vacio">No tienes misiones. <a href="#nueva">Crea una</a> para tus tareas con fecha de entrega.</div>'}</div>
    </section>
    <section class="caja">
      <h2 class="titulo"><span data-px="corona" data-s="2"></span>JEFES FINALES <span class="der">${jefes.filter(j => j.estado === 'activo').length} activos</span></h2>
      ${jefes.map(j => bloqueJefe(estado, j)).join('') || '<div class="vacio">No tienes jefes finales. <a href="#nueva">Crea uno</a> para un reto grande, como la tesis.</div>'}
    </section>
  </div>`;
}
