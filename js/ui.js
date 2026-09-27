// Ayudas comunes a todas las pantallas: textos, fechas, etiquetas,
// ventanas emergentes (modales) y avisos que aparecen abajo.
const UI = (() => {
  const R = Motor.REGLAS;
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const LETRAS_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Evita que un texto escrito por mí rompa el HTML (por ejemplo, si lleva "<")
  function esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // 1980 → "1 980"
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function partes(clave) {
    const [a, m, d] = clave.split('-').map(Number);
    const f = new Date(Date.UTC(a, m - 1, d));
    return { a, m, d, dia: f.getUTCDay() };
  }
  // "domingo 27 de septiembre"
  function fechaLarga(clave) { const p = partes(clave); return `${DIAS[p.dia]} ${p.d} de ${MESES[p.m - 1]}`; }
  // "lun 28 sep"
  function fechaCorta(clave) { const p = partes(clave); return `${DIAS_CORTOS[p.dia]} ${p.d} ${MESES_CORTOS[p.m - 1]}`; }
  // "15 jun 2027"
  function fechaConAno(clave) { const p = partes(clave); return `${p.d} ${MESES_CORTOS[p.m - 1]} ${p.a}`; }

  function cuandoVence(clave, hoy) {
    const dias = Motor.diasEntre(hoy, clave);
    if (dias < 0) return 'Venció';
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    if (dias < 7) return `Vence el ${DIAS[partes(clave).dia]} ${partes(clave).d}`;
    return `Vence en ${dias} días`;
  }

  function tiempoHastaReinicio(ahora) {
    const minutos = Math.max(0, Math.round((Motor.proximoReinicio(ahora) - ahora) / 60000));
    return `${Math.floor(minutos / 60)} H ${minutos % 60} MIN`;
  }

  function textoFrecuencia(f) {
    if (f.tipo === 'diaria') return 'Todos los días';
    if (f.tipo === 'dias') return f.dias.map(d => LETRAS_DIAS[d - 1]).join(' · ');
    if (f.tipo === 'semanal') return `${f.veces} ${f.veces === 1 ? 'vez' : 'veces'} por semana`;
    return `${f.veces} ${f.veces === 1 ? 'vez' : 'veces'} por mes`;
  }

  // Dibujo del enemigo según la dificultad
  function iconoEnemigo(dificultad) { return { facil: 'comun', media: 'elite', dificil: 'minijefe' }[dificultad]; }

  function chipStat(stat, escala = 1) {
    return `<span class="chip ${stat}"><span data-px="${stat}" data-s="${escala}"></span>${esc(R.estadisticas[stat])}</span>`;
  }

  function barra(actual, maximo, clase = '', estilo = '') {
    const p = maximo > 0 ? Math.max(0, Math.min(100, (actual / maximo) * 100)) : 0;
    return `<div class="barra ${clase}" style="--p:${p}%;${estilo}"><i></i></div>`;
  }

  // ---------- Ventanas emergentes ----------
  let alCerrar = null;
  function abrirModal(html, { dorada = true, cerrable = true } = {}) {
    cerrarModal();
    const velo = document.createElement('div');
    velo.className = 'velo';
    velo.innerHTML = `<div class="caja ${dorada ? 'dorada' : ''} modal" role="dialog">${html}</div>`;
    if (cerrable) velo.addEventListener('click', e => { if (e.target === velo) cerrarModal(); });
    document.body.append(velo);
    Pixel.dibujar(velo);
    const foco = velo.querySelector('[autofocus]') || velo.querySelector('.bts .btn:last-child');
    if (foco) foco.focus();
    return velo;
  }
  function cerrarModal(valor) {
    const velo = document.querySelector('.velo');
    if (velo) velo.remove();
    if (alCerrar) { const f = alCerrar; alCerrar = null; f(valor); }
  }
  // Pregunta sí/no. Devuelve una promesa con true o false.
  function confirmar({ titulo, texto, si = 'SÍ', no = 'CANCELAR', peligro = false, icono = '' }) {
    return new Promise(resolver => {
      abrirModal(`
        <div class="t">${icono}${esc(titulo)}</div>
        ${texto}
        <div class="bts">
          <button class="btn" data-modal="no">${esc(no)}</button>
          <button class="btn ${peligro ? 'peligro' : 'dorado'}" data-modal="si">${esc(si)}</button>
        </div>`);
      alCerrar = valor => resolver(valor === true);
    });
  }
  // Pide un texto o una fecha. Devuelve el valor o null.
  function pedir({ titulo, texto = '', tipo = 'text', valor = '', min = '', boton = 'GUARDAR' }) {
    return new Promise(resolver => {
      abrirModal(`
        <div class="t">${esc(titulo)}</div>
        ${texto}
        <input class="campo" data-modal-valor type="${tipo}" value="${esc(valor)}" ${min ? `min="${min}"` : ''} maxlength="80" autofocus>
        <div class="bts">
          <button class="btn" data-modal="no">CANCELAR</button>
          <button class="btn dorado" data-modal="valor">${esc(boton)}</button>
        </div>`);
      alCerrar = v => resolver(v === undefined || v === false ? null : v);
    });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-modal]');
    if (!b) return;
    const tipo = b.dataset.modal;
    if (tipo === 'si') cerrarModal(true);
    else if (tipo === 'valor') cerrarModal(document.querySelector('[data-modal-valor]').value);
    else cerrarModal(false);
  });
  document.addEventListener('keydown', e => {
    if (!document.querySelector('.velo')) return;
    // preventDefault: que el mismo Enter no "pulse" un botón de la ventana siguiente
    if (e.key === 'Escape') { e.preventDefault(); cerrarModal(false); }
    if (e.key === 'Enter' && e.target.matches('[data-modal-valor]')) { e.preventDefault(); cerrarModal(e.target.value); }
  });

  // ---------- Avisos cortos ----------
  function aviso(texto, tipo = '') {
    let caja = document.querySelector('.avisos');
    if (!caja) {
      caja = document.createElement('div');
      caja.className = 'avisos';
      document.body.append(caja);
    }
    const el = document.createElement('div');
    el.className = `aviso-toast ${tipo}`;
    el.textContent = texto;
    caja.append(el);
    while (caja.children.length > 3) caja.firstElementChild.remove();
    setTimeout(() => el.remove(), tipo === 'error' ? 4500 : 3000);
  }

  return {
    esc, num, fechaLarga, fechaCorta, fechaConAno, cuandoVence, tiempoHastaReinicio, textoFrecuencia,
    iconoEnemigo, chipStat, barra, abrirModal, cerrarModal, confirmar, pedir, aviso, LETRAS_DIAS,
  };
})();
