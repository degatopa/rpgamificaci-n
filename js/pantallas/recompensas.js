// Pantalla RECOMPENSAS: el camino al trono, las recompensas ganadas,
// las próximas, y mis listas de recompensas de la vida real.

function pantallaRecompensas() {
  const R = Motor.REGLAS;
  const nivel = Motor.nivelDesdeXP(estado.xp);
  const rangoActual = Motor.rangoDeNivel(nivel);
  const indiceActual = R.rangos.indexOf(rangoActual);
  const xpEmperador = Motor.xpAcumuladoNivel(60);
  const rec = estado.recompensas;

  const camino = R.rangos.map((r, i) => {
    const clase = i < indiceActual ? 'pasado' : i === indiceActual ? 'actual' : '';
    const silueta = i > indiceActual ? 'data-sil="#0a0b19"' : '';
    return `<div class="rango ${clase}"><span data-px="k:${r.id}" data-s="4" ${silueta}></span><span class="n">${r.nombre.toUpperCase()}</span>
      ${i === indiceActual ? '<span class="tu">ESTÁS AQUÍ</span>' : `<span class="nv">Nv ${r.nivel}</span>`}</div>`;
  }).join('');

  const nombreTipo = { grande: 'GRANDE', pequena: 'PEQUEÑA', especial: 'ESPECIAL' };
  const pendientes = rec.pendientes.map((p, i) => `
    <div class="premio-fila"><span class="tipo ${p.tipo}">${nombreTipo[p.tipo]}</span>
      <span>${p.texto ? UI.esc(p.texto) : '<span class="rojo">Tu lista está vacía: añade una recompensa</span>'}${p.jefe ? ` <span class="suave">(jefe «${UI.esc(p.jefe)}»)</span>` : p.nivel ? ` <span class="suave">(nivel ${p.nivel})</span>` : ''}</span>
      ${p.texto ? `<button class="btn chico dorado" data-accion="reclamar" data-i="${i}">RECLAMAR</button>` : '<span></span>'}</div>`).join('');

  const proximas = Motor.proximasRecompensas(estado, 4).map(h => {
    const faltan = h.nivel - nivel;
    const icono = h.rango ? `<span data-px="k:${h.rango.id}" data-s="2" data-sil="#0a0b19"></span>` : '<span data-px="cofre" data-s="2"></span>';
    const filas = [];
    if (h.grande !== undefined) filas.push(`<div class="premio-fila"><span class="tipo grande">GRANDE</span><span>${h.grande ? UI.esc(h.grande) : '<span class="rojo">Lista vacía</span>'}</span><span></span></div>`);
    if (h.pequena !== undefined) filas.push(`<div class="premio-fila"><span class="tipo">PEQUEÑA</span><span>${h.pequena ? UI.esc(h.pequena) : '<span class="rojo">Lista vacía</span>'}</span><span></span></div>`);
    return `
      <div class="hito">
        <div class="cab">${icono}<span class="t">NIVEL ${h.nivel}${h.rango ? ` · ${h.rango.nombre.toUpperCase()}` : ''}</span><span class="estado">Faltan ${faltan} ${faltan === 1 ? 'nivel' : 'niveles'}</span></div>
        ${filas.join('')}
      </div>`;
  }).join('');

  const lista = (tipo, titulo, icono) => {
    const items = tipo === 'grande' ? rec.grandes : rec.pequenas;
    return `
      <div class="sub"><span data-px="${icono}" data-s="1"></span>${titulo}</div>
      <div class="lista-ed">
        ${items.map((t, i) => `
          <div class="item"><span class="num">${i + 1}</span><div class="campo">${UI.esc(t)}</div>
            <button class="btn chico" data-accion="moverRecompensa" data-tipo="${tipo}" data-i="${i}" data-dir="-1" title="Subir" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn chico" data-accion="moverRecompensa" data-tipo="${tipo}" data-i="${i}" data-dir="1" title="Bajar" ${i === items.length - 1 ? 'disabled' : ''}>▼</button>
            <button class="btn chico" data-accion="editarRecompensa" data-tipo="${tipo}" data-i="${i}">EDITAR</button>
            <button class="btn chico" data-accion="borrarRecompensa" data-tipo="${tipo}" data-i="${i}" title="Borrar">✕</button></div>`).join('') || '<div class="vacio">Lista vacía.</div>'}
      </div>
      <div class="agregar"><input class="campo" id="nueva-${tipo}" maxlength="80" placeholder="Nueva recompensa ${tipo === 'grande' ? 'grande' : 'pequeña'}…">
        <button class="btn chico" data-accion="agregarRecompensa" data-tipo="${tipo}">+ AÑADIR</button></div>`;
  };

  return `
  <h1 class="pagina">RECOMPENSAS</h1>
  <div class="suave" style="margin-bottom:20px">Premios de la vida real: uno <b>pequeño</b> cada 5 niveles y uno <b>grande</b> con cada rango nuevo. Si coinciden, recibes los dos.</div>

  <section class="caja">
    <h2 class="titulo"><span data-px="corona" data-s="2"></span>CAMINO AL TRONO <span class="der">Nivel actual: ${nivel} · Nivel récord: ${estado.nivelRecord}</span></h2>
    <div class="camino">${camino}</div>
    <div style="margin-top:16px">
      <div style="display:flex;font-size:21px"><span class="suave">Progreso hacia Emperador</span><b style="margin-left:auto">${UI.num(Math.min(estado.xp, xpEmperador))} / ${UI.num(xpEmperador)} XP</b></div>
      ${UI.barra(estado.xp, xpEmperador, 'xp')}
    </div>
  </section>

  <div class="columnas">
    <div style="display:flex;flex-direction:column;gap:26px">
      <section class="caja ${rec.pendientes.length ? 'dorada' : ''}">
        <h2 class="titulo"><span data-px="cofre" data-s="2"></span>GANADAS · SIN RECLAMAR</h2>
        ${pendientes || '<div class="vacio">Nada por reclamar todavía. ¡Sigue subiendo de nivel!</div>'}
        ${rec.pendientes.length ? '<div class="ayuda">Pulsa «Reclamar» cuando ya te hayas dado la recompensa en la vida real.</div>' : ''}
      </section>
      <section class="caja">
        <h2 class="titulo">PRÓXIMAS RECOMPENSAS</h2>
        ${proximas}
      </section>
    </div>

    <div style="display:flex;flex-direction:column;gap:26px">
      <section class="caja">
        <h2 class="titulo">TUS LISTAS <span class="der">En el orden en que las recibes</span></h2>
        ${lista('grande', 'GRANDES (CAMBIO DE RANGO)', 'cofre')}
        ${lista('pequena', 'PEQUEÑAS (CADA 5 NIVELES)', 'moneda')}
      </section>
      <section class="caja">
        <h2 class="titulo"><span data-px="cofre" data-s="2"></span>HISTORIAL</h2>
        <div class="historial">${rec.historial.map(h => `<div><span class="dia">${UI.fechaCorta(h.dia)}</span> ${UI.esc(h.texto)}</div>`).join('') || '<div class="vacio">Todavía no has reclamado ninguna recompensa.</div>'}</div>
      </section>
    </div>
  </div>`;
}
