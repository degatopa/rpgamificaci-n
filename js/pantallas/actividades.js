// Pantalla ACTIVIDADES: la lista de hábitos, misiones y jefes,
// con los botones para editar, quitar, volver a poner y borrar.

function filaActividad(estado, a) {
  const R = Motor.REGLAS;
  const hoy = estado.ultimoDia;
  let icono;
  let frecuencia;
  let dificultad;
  let minimo;
  if (a.tipo === 'habito') {
    icono = `<span data-px="${UI.iconoEnemigo(a.dificultad)}" data-s="3"></span>`;
    frecuencia = UI.textoFrecuencia(a.frecuencia);
    dificultad = `${R.dificultades[a.dificultad].enemigo} (${R.dificultades[a.dificultad].nombre.toLowerCase()})`;
    minimo = a.minimo ? `<span class="rojo">Sí · −${R.dificultades[a.dificultad].dano} HP</span>` : 'No';
  } else if (a.tipo === 'mision') {
    icono = `<span data-px="${UI.iconoEnemigo(a.dificultad)}" data-s="3"></span>`;
    frecuencia = a.estado === 'activa' ? `Entrega: ${UI.fechaCorta(a.fecha)}` : a.estado === 'completada' ? 'Completada' : 'Fallida';
    dificultad = R.dificultades[a.dificultad].mision;
    minimo = a.estado === 'activa' ? `<span class="rojo">−${R.dificultades[a.dificultad].dano} HP si vence</span>` : '—';
  } else {
    const vida = Motor.vidaJefe(a);
    icono = '<span data-px="jefe" data-s="2"></span>';
    frecuencia = a.estado !== 'activo' ? (a.estado === 'derrotado' ? 'Derrotado' : 'Fallido')
      : a.fechaLimite ? `Límite: ${UI.fechaConAno(a.fechaLimite)}` : 'Sin fecha límite';
    dificultad = `${R.jefes[a.tamano].nombre} · ${vida.actual}/${vida.maxima}`;
    minimo = a.estado === 'activo' && a.fechaLimite ? `<span class="rojo">−${R.danoJefeVencido} HP si vence</span>` : '—';
  }

  let acciones;
  if (a.sagrado) {
    acciones = '<span class="candado" title="Hábito sagrado: no se puede quitar, pausar, renombrar ni cambiar su dificultad. Siempre cuenta como mínimo."><span data-px="candado" data-s="1"></span>SAGRADO</span>';
  } else if (a.archivado) {
    acciones = `<button class="btn chico dorado" data-accion="volver" data-id="${a.id}">VOLVER A PONER</button><button class="btn chico peligro" data-accion="borrar" data-id="${a.id}">BORRAR</button>`;
  } else if (a.pendiente && a.pendiente.cambios.archivado) {
    acciones = `<button class="btn chico" data-accion="editar" data-id="${a.id}">EDITAR</button><button class="btn chico" data-accion="cancelarQuitar" data-id="${a.id}">NO QUITAR</button>`;
  } else {
    const editable = !(a.tipo === 'mision' && a.estado !== 'activa') && !(a.tipo === 'jefe' && a.estado !== 'activo');
    acciones = `${editable ? `<button class="btn chico" data-accion="editar" data-id="${a.id}">EDITAR</button>` : ''}<button class="btn chico" data-accion="quitar" data-id="${a.id}">QUITAR</button>`;
  }

  // Avisos de cambios que se aplican mañana
  const avisos = [];
  if (a.pendiente) {
    const c = a.pendiente.cambios;
    if (c.archivado) avisos.push('se quitará mañana (hoy aún cuenta como mínimo)');
    if (c.dificultad) avisos.push(`dificultad: ${R.dificultades[c.dificultad].nombre.toLowerCase()}`);
    if (c.frecuencia) avisos.push(`frecuencia: ${UI.textoFrecuencia(c.frecuencia).toLowerCase()}`);
    if (c.minimo === true) avisos.push('pasa a ser mínimo');
    if (c.minimo === false) avisos.push('deja de ser mínimo');
  }
  const quitadaEl = a.archivado && a.quitadoEl ? `Quitada el ${UI.fechaCorta(a.quitadoEl)}` : null;

  return `
    <div class="fila ${a.sagrado ? 'sagrada' : ''} ${a.archivado ? 'quitada' : ''}">
      <div class="nom"><span class="retrato">${icono}</span><span class="texto" title="${UI.esc(a.nombre)}">${UI.esc(a.nombre)}</span></div>
      <div class="cel c-${a.stat}">${R.estadisticas[a.stat]}</div>
      <div class="cel">${quitadaEl || frecuencia}</div>
      <div class="cel">${dificultad}</div>
      <div class="cel">${minimo}</div>
      <div class="acc">${acciones}</div>
      ${avisos.length ? `<div class="aviso-pendiente">Desde mañana: ${avisos.join(' · ')}</div>` : ''}
    </div>`;
}

function pantallaActividades() {
  const R = Motor.REGLAS;
  const todas = estado.actividades;
  const activas = todas.filter(a => !a.archivado);
  const cuenta = {
    todas: activas.length,
    habito: activas.filter(a => a.tipo === 'habito').length,
    mision: activas.filter(a => a.tipo === 'mision').length,
    jefe: activas.filter(a => a.tipo === 'jefe').length,
    quitadas: todas.filter(a => a.archivado).length,
  };
  const ft = vista.filtroTipo;
  const fs = vista.filtroStat;
  const pasaStat = a => fs === 'todas' || a.stat === fs;
  const ver = tipo => (ft === 'todas' || ft === tipo);
  const grupo = lista => lista.filter(pasaStat).map(a => filaActividad(estado, a)).join('');

  const sagrados = activas.filter(a => a.sagrado);
  const habitos = activas.filter(a => a.tipo === 'habito' && !a.sagrado);
  const misiones = activas.filter(a => a.tipo === 'mision').sort((a, b) => (a.estado === 'activa' ? 0 : 1) - (b.estado === 'activa' ? 0 : 1) || a.fecha.localeCompare(b.fecha));
  const jefes = activas.filter(a => a.tipo === 'jefe');
  const quitadas = todas.filter(a => a.archivado);
  const posible = Motor.gananciaPosibleHoy(estado);

  const seccion = (icono, titulo, descripcion, contenido, vacio) => `
    <div class="seccion"><span data-px="${icono}" data-s="2"></span><span class="t">${titulo}</span><span class="d">${descripcion}</span></div>
    ${contenido || `<div class="vacio">${vacio}</div>`}`;

  const boton = (id, texto) => `<button class="${ft === id ? 'activa' : ''}" data-accion="filtroTipo" data-valor="${id}">${texto}</button>`;
  const botonStat = (id, texto, clase = '') => `<button class="chip ${clase} ${fs === id ? 'activa' : ''}" data-accion="filtroStat" data-valor="${id}">${texto}</button>`;

  return `
  <div class="encabezado">
    <div>
      <h1 class="pagina">ACTIVIDADES</h1>
      <div class="suave">Aquí agregas, editas y quitas tus hábitos, misiones y jefes finales.</div>
    </div>
    <a class="btn dorado grande" href="#nueva">+ NUEVA ACTIVIDAD</a>
  </div>

  <div class="filtros">
    <div class="pestanas">
      ${boton('todas', `TODAS · ${cuenta.todas}`)}${boton('habito', `HÁBITOS · ${cuenta.habito}`)}${boton('mision', `MISIONES · ${cuenta.mision}`)}${boton('jefe', `JEFES · ${cuenta.jefe}`)}${boton('quitadas', `QUITADAS · ${cuenta.quitadas}`)}
    </div>
    <div class="filtro-stat">Estadística:
      ${botonStat('todas', 'Todas')}${Object.keys(R.estadisticas).map(s => botonStat(s, R.estadisticas[s], s)).join('')}
    </div>
  </div>

  <div class="resumen">
    <span class="chip minimo"><span data-px="corazon" data-s="1"></span>Mínimos: como mucho −${Motor.danoMaximoDiario(estado)} HP por día</span>
    <span class="chip"><span data-px="xp" data-s="1"></span>Si cumples todos los hábitos de hoy: +${posible.xp} XP · +${posible.oro} oro (más los bonus)</span>
  </div>

  <div class="tabla">
    <div class="fila cab"><div>NOMBRE</div><div>ESTADÍSTICA</div><div>FRECUENCIA / FECHA</div><div>DIFICULTAD</div><div>¿MÍNIMO?</div><div style="text-align:right">ACCIONES</div></div>
    ${ver('habito') ? seccion('candado', `SAGRADOS · ${sagrados.length}`, 'Siempre son mínimos. No se pueden quitar ni modificar.', grupo(sagrados), 'Ninguno con este filtro.') : ''}
    ${ver('habito') ? seccion('espada', `HÁBITOS · ${habitos.length}`, 'Los puedes editar, quitar y volver a poner cuando quieras.', grupo(habitos), 'No hay hábitos con este filtro.') : ''}
    ${ver('mision') ? seccion('calendario', `MISIONES · ${misiones.length}`, 'Se hacen una vez. Si vence la fecha, quitan vida y quedan fallidas.', grupo(misiones), 'No hay misiones. Créalas con «+ Nueva actividad».') : ''}
    ${ver('jefe') ? seccion('corona', `JEFES FINALES · ${jefes.length}`, 'Retos grandes con barra de vida.', grupo(jefes), 'No hay jefes finales.') : ''}
    ${ft === 'todas' || ft === 'quitadas' ? seccion('cofre', `QUITADAS · ${quitadas.length}`, 'Guardadas con su historial. Puedes volver a ponerlas.', grupo(quitadas), 'No has quitado nada.') : ''}
  </div>`;
}
