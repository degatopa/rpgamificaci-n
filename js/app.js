// =====================================================================
// ARRANQUE DEL JUEGO
// Carga la partida, dibuja la pantalla que toca y responde a los botones.
// =====================================================================

let estado = Guardado.cargar();
const partidaNueva = !estado;
if (!estado) estado = Motor.crearEstadoInicial(new Date());

// Cosas de la pantalla que no se guardan en la partida
const vista = { filtroTipo: 'todas', filtroStat: 'todas' };
let borrador = null; // formulario de actividad a medio rellenar

function guardar() {
  if (!Guardado.guardar(estado)) UI.aviso('No se pudo guardar la partida en este navegador.', 'error');
}

// ---------------------------------------------------------------------
// Navegación: la pantalla depende de lo que va después de "#" en la dirección
// (#hoy, #actividades, #nueva, #editar/ID, #tienda, #recompensas, #ajustes)
// ---------------------------------------------------------------------
const PANTALLAS = {
  hoy: pantallaHoy,
  actividades: pantallaActividades,
  nueva: pantallaFormulario,
  editar: pantallaFormulario,
  tienda: pantallaTienda,
  recompensas: pantallaRecompensas,
  ajustes: pantallaAjustes,
};
const MENU = [['hoy', 'HOY'], ['actividades', 'ACTIVIDADES'], ['tienda', 'TIENDA'], ['recompensas', 'RECOMPENSAS'], ['ajustes', 'AJUSTES']];

function rutaActual() {
  const [pantalla, param] = location.hash.replace(/^#/, '').split('/');
  return { pantalla: PANTALLAS[pantalla] ? pantalla : 'hoy', param: param ? decodeURIComponent(param) : null };
}

function cabecera(pantalla) {
  const activa = pantalla === 'nueva' || pantalla === 'editar' ? 'actividades' : pantalla;
  const nivel = Motor.nivelDesdeXP(estado.xp);
  return `
    <div class="logo"><span data-px="k:${Motor.rangoDeNivel(nivel).id}" data-s="2"></span>RPGAMIFICACIÓN</div>
    <nav class="menu">${MENU.map(([id, texto]) => `<a href="#${id}" class="${id === activa ? 'activo' : ''}">${texto}</a>`).join('')}</nav>
    <div class="hud">
      <span title="Nivel"><span data-px="xp" data-s="2"></span>Nv ${nivel}</span>
      <span title="Vida"><span data-px="corazon" data-s="2"></span>${estado.vida}/${Motor.REGLAS.vidaMaxima}</span>
      <span title="Oro"><span data-px="moneda" data-s="2"></span>${UI.num(estado.oro)}</span>
      <span title="Racha"><span data-px="llama" data-s="2"></span>${estado.racha} ${estado.racha === 1 ? 'día' : 'días'}</span>
    </div>`;
}

let ultimaRuta = null;
function render() {
  const { pantalla, param } = rutaActual();
  document.getElementById('cabecera').innerHTML = cabecera(pantalla);
  const app = document.getElementById('app');
  app.className = `envoltura p-${pantalla === 'editar' ? 'nueva' : pantalla}`;
  app.innerHTML = PANTALLAS[pantalla](param);
  Pixel.dibujar();
  if (ultimaRuta !== location.hash) {
    ultimaRuta = location.hash;
    window.scrollTo(0, 0);
    const foco = app.querySelector('[autofocus]');
    if (foco) foco.focus();
  }
}

window.addEventListener('hashchange', () => {
  const { pantalla } = rutaActual();
  if (pantalla !== 'nueva' && pantalla !== 'editar') borrador = null;
  render();
});

// ---------------------------------------------------------------------
// El paso de los días
// ---------------------------------------------------------------------
// Cierra los días que hayan pasado (a las 3:00 a.m.) y enseña el informe.
function revisarDia() {
  const antes = estado.ultimoDia;
  const eventos = Motor.actualizar(estado, new Date());
  if (estado.ultimoDia === antes) return false;
  guardar();
  render();
  mostrarInforme(eventos);
  return true;
}

const CLASE_EVENTO = { dano: 'dano', muerte: 'dano', 'racha-rota': 'dano', 'jefe-curado': 'dano' };

function listaEventos(eventos) {
  let html = '';
  let diaAnterior = null;
  for (const ev of eventos) {
    if (ev.dia && ev.dia !== diaAnterior) {
      html += `<div class="dia">${UI.fechaLarga(ev.dia).toUpperCase()}</div>`;
      diaAnterior = ev.dia;
    }
    html += `<div class="${CLASE_EVENTO[ev.tipo] || 'bueno'}">${UI.esc(ev.texto)}</div>`;
  }
  return `<div class="lista-eventos">${html}</div>`;
}

function mostrarInforme(eventos) {
  const muerte = eventos.find(e => e.tipo === 'muerte');
  const dias = new Set(eventos.map(e => e.dia).filter(Boolean)).size;
  const sinNovedad = '<p>Cerraste el día sin perder vida. ¡Bien hecho!</p>';
  UI.abrirModal(`
    ${muerte
      ? `<div class="centro"><span data-px="calavera" data-s="6"></span></div><div class="t" style="justify-content:center;color:var(--vida)">HAS MUERTO</div><p class="centro">${UI.esc(muerte.texto)}</p>`
      : `<div class="t"><span data-px="calendario" data-s="2"></span>${dias > 1 ? 'MIENTRAS NO ESTABAS' : 'INFORME DE LA NOCHE'}</div>`}
    ${eventos.length ? listaEventos(eventos) : sinNovedad}
    <p style="margin-top:14px">Vida ahora: <b>${estado.vida}/${Motor.REGLAS.vidaMaxima} HP</b> · Racha: <b>${estado.racha} ${estado.racha === 1 ? 'día' : 'días'}</b></p>
    <div class="bts"><button class="btn dorado" data-modal="no">${muerte ? 'VOLVER A EMPEZAR' : 'ENTENDIDO'}</button></div>`);
}

// Ventana de celebración al subir de nivel, cambiar de rango o derrotar un jefe
function celebrar(eventos) {
  const importantes = (eventos || []).filter(e => ['nivel', 'rango', 'recompensa', 'jefe'].includes(e.tipo));
  if (!importantes.length) return;
  const rango = importantes.find(e => e.tipo === 'rango');
  const jefe = importantes.find(e => e.tipo === 'jefe');
  const titulo = rango ? '¡NUEVO RANGO!' : jefe ? '¡JEFE DERROTADO!' : '¡SUBISTE DE NIVEL!';
  const dibujo = rango ? `k:${rango.rango}` : jefe ? 'jefe' : `k:${Motor.rangoDeNivel(Motor.nivelDesdeXP(estado.xp)).id}`;
  const hayRecompensa = importantes.some(e => e.tipo === 'recompensa' || e.tipo === 'jefe');
  UI.abrirModal(`
    <div class="centro"><span data-px="${dibujo}" data-s="7"></span></div>
    <div class="t" style="justify-content:center">${titulo}</div>
    <div class="lista-eventos centro">${importantes.map(e => `<div class="bueno">${UI.esc(e.texto)}</div>`).join('')}</div>
    <div class="bts">
      ${hayRecompensa ? '<a class="btn" href="#recompensas" data-modal="no">VER RECOMPENSAS</a>' : ''}
      <button class="btn dorado" data-modal="no">¡A POR MÁS!</button>
    </div>`);
}

function bienvenida() {
  UI.abrirModal(`
    <div class="centro"><span data-px="k:soldado" data-s="7"></span></div>
    <div class="t" style="justify-content:center">¡BIENVENIDO, SOLDADO RASO!</div>
    <p>Cada hábito es un <b>enemigo</b>: cuando lo cumplas, pulsa <b>ATACAR</b> para ganar XP y oro.</p>
    <p>Tus 4 hábitos <b>sagrados</b> son tus mínimos: si alguno no está hecho a las <b>3:00 a.m.</b>, pierdes 10 HP por cada uno. La vida solo se recupera con pociones.</p>
    <p>Tu partida se guarda sola en este navegador. De vez en cuando, descarga una copia en <b>Ajustes</b>.</p>
    <div class="bts"><button class="btn dorado" data-modal="no">¡EMPEZAR!</button></div>`, { cerrable: false });
}

// ---------------------------------------------------------------------
// Acciones: cada botón con data-accion="..." llama a una de estas funciones
// ---------------------------------------------------------------------
// Ejecuta una acción del motor, guarda, redibuja y avisa
function ejecutar(funcion, ...args) {
  revisarDia();
  const r = funcion(estado, ...args);
  if (!r.ok) {
    UI.aviso(r.error, 'error');
    return r;
  }
  guardar();
  render();
  celebrar(r.eventos);
  return r;
}

const ganancia = r => `+${r.xp} XP · +${r.oro} oro`;

const ACCIONES = {
  // --- Hoy ---
  marcar: d => { const r = ejecutar(Motor.marcarHabito, d.id); if (r.ok) UI.aviso(`¡Enemigo derrotado! ${ganancia(r)}`); },
  desmarcar: d => ejecutar(Motor.desmarcarHabito, d.id),
  completarMision: d => { const r = ejecutar(Motor.completarMision, d.id); if (r.ok) UI.aviso(`¡Misión completada! ${ganancia(r)}`); },
  deshacerMision: d => ejecutar(Motor.deshacerMision, d.id),
  subtarea: d => { const r = ejecutar(Motor.completarSubtarea, d.id, Number(d.i)); if (r.ok) UI.aviso(`¡Golpe al jefe! ${ganancia(r)}`); },
  deshacerSubtarea: d => ejecutar(Motor.deshacerSubtarea, d.id, Number(d.i)),

  // --- Inventario y tienda ---
  usar: async d => {
    const activo = Motor.multiplicadorActivo(estado, estado.ultimoDia);
    const textos = {
      vida: ['¿USAR LA POCIÓN DE VIDA?', `<p>Tu vida pasará de ${estado.vida} a <b>${Motor.REGLAS.vidaMaxima} HP</b>.</p>`],
      descanso: ['¿PROTEGER EL DÍA DE HOY?', '<p>Esta noche no perderás vida por los mínimos fáciles y medianos ni por misiones pequeñas o medianas. Tu racha se mantiene, pero no sube.</p><p>No protege de misiones grandes ni de jefes.</p>'],
      multiplicador: ['¿ACTIVAR EL MULTIPLICADOR ×2?', `<p>Todo el XP que ganes valdrá el doble durante <b>7 días</b>${activo ? ', sumados a los que ya te quedan' : ''}.</p>`],
    };
    const [titulo, texto] = textos[d.objeto];
    if (!(await UI.confirmar({ titulo, texto, si: 'USAR' }))) return;
    const r = ejecutar(Motor.usarObjeto, d.objeto);
    if (r.ok) UI.aviso({ vida: 'Vida llena.', descanso: 'Hoy estás protegido.', multiplicador: 'XP ×2 activado.' }[d.objeto]);
  },
  comprar: async d => {
    const p = Motor.REGLAS.tienda[d.objeto];
    const s = Motor.simularCompra(estado, d.objeto);
    const baja = s.despues.nivel < s.nivelAntes;
    const texto = `<p>Pagarás <b>${p.xp} XP</b> y <b>${UI.num(p.oro)} de oro</b>. Irá a tu inventario.</p>
      ${baja ? `<div class="nota peligro">Esta compra te baja al <b style="color:#fff">nivel ${s.despues.nivel}</b>.</div>` : ''}`;
    if (!(await UI.confirmar({ titulo: `¿COMPRAR ${p.nombre.toUpperCase()}?`, texto, si: 'COMPRAR', peligro: baja }))) return;
    const r = ejecutar(Motor.comprar, d.objeto);
    if (r.ok) UI.aviso(`Compraste ${p.nombre}. Está en tu inventario.`);
  },

  // --- Actividades ---
  filtroTipo: d => { vista.filtroTipo = d.valor; render(); },
  filtroStat: d => { vista.filtroStat = d.valor; render(); },
  editar: d => { borrador = null; location.hash = `#editar/${encodeURIComponent(d.id)}`; },
  quitar: async d => {
    const a = Motor.buscar(estado, d.id);
    if (!a) return;
    let texto = a.tipo === 'habito' && a.minimo
      ? `<p>«${UI.esc(a.nombre)}» es un mínimo: <b>hoy sigue contando</b> y se quitará mañana a las 3:00 a.m.</p>`
      : `<p>«${UI.esc(a.nombre)}» desaparecerá de Hoy y pasará a <b>Quitadas</b> con su historial. Podrás volver a ponerla cuando quieras.</p>`;
    if (a.tipo !== 'habito') texto += '<p>Quitarla no te quita vida.</p>';
    if (!(await UI.confirmar({ titulo: '¿QUITAR ESTA ACTIVIDAD?', texto, si: 'SÍ, QUITAR', peligro: true }))) return;
    const r = ejecutar(Motor.quitarActividad, d.id);
    if (r.ok) UI.aviso(r.programado ? 'Se quitará mañana.' : 'Quitada: la tienes en «Quitadas».');
  },
  cancelarQuitar: d => { const r = ejecutar(Motor.cancelarQuitar, d.id); if (r.ok) UI.aviso('Ya no se quitará.'); },
  volver: async d => {
    revisarDia();
    const r = Motor.volverAPoner(estado, d.id);
    if (r.ok) { guardar(); render(); UI.aviso('De vuelta en tu lista.'); return; }
    if (!r.necesitaFecha) { UI.aviso(r.error, 'error'); return; }
    const fecha = await UI.pedir({ titulo: 'ELIGE UNA FECHA NUEVA', texto: `<p>${UI.esc(r.error)}</p>`, tipo: 'date', valor: estado.ultimoDia, min: estado.ultimoDia, boton: 'VOLVER A PONER' });
    if (fecha) { const r2 = ejecutar(Motor.volverAPonerConFecha, d.id, fecha); if (r2.ok) UI.aviso('De vuelta en tu lista.'); }
  },
  borrar: async d => {
    const a = Motor.buscar(estado, d.id);
    if (!a) return;
    const texto = `<p>«${UI.esc(a.nombre)}» se borrará <b>para siempre</b>, con su historial. El XP que ya ganaste se queda.</p>`;
    if (!(await UI.confirmar({ titulo: '¿BORRAR PARA SIEMPRE?', texto, si: 'BORRAR', peligro: true }))) return;
    const r = ejecutar(Motor.borrarActividad, d.id);
    if (r.ok) UI.aviso('Borrada.');
  },

  // --- Formulario de actividad ---
  elegir: d => {
    borrador[d.campo] = d.valor;
    if (d.campo === 'frecTipo' && (d.valor === 'semanal' || d.valor === 'mensual')) borrador.minimo = false;
    borrador.error = '';
    render();
  },
  dia: d => {
    const n = Number(d.valor);
    const i = borrador.dias.indexOf(n);
    if (i >= 0) borrador.dias.splice(i, 1);
    else borrador.dias.push(n);
    render();
  },
  alternar: d => { borrador[d.campo] = !borrador[d.campo]; render(); },
  agregarSubtarea: () => {
    borrador.subtareas.push({ texto: '' });
    render();
    const campos = document.querySelectorAll('[data-subtarea]');
    if (campos.length) campos[campos.length - 1].focus();
  },
  quitarSubtarea: d => { borrador.subtareas.splice(Number(d.i), 1); render(); },
  guardarFormulario: () => {
    revisarDia();
    const b = borrador;
    const datos = datosDelBorrador(b);
    const r = b.modo === 'editar' ? Motor.editarActividad(estado, b.id, datos) : Motor.crearActividad(estado, datos);
    if (!r.ok) {
      b.error = r.error;
      render();
      UI.aviso(r.error, 'error');
      return;
    }
    guardar();
    let mensaje;
    if (b.modo === 'editar') mensaje = r.diferido ? 'Guardado. Algunos cambios se aplican mañana.' : 'Cambios guardados.';
    else mensaje = b.tipo === 'habito' && b.minimo ? 'Hábito creado. Como mínimo cuenta desde mañana.' : '¡Actividad creada!';
    borrador = null;
    location.hash = '#actividades';
    UI.aviso(mensaje);
  },
  cancelarFormulario: () => { borrador = null; location.hash = '#actividades'; },

  // --- Recompensas ---
  reclamar: d => { const r = ejecutar(Motor.reclamarRecompensa, Number(d.i)); if (r.ok) UI.aviso('¡Disfrútala! Queda en tu historial.'); },
  agregarRecompensa: d => {
    const campo = document.getElementById(`nueva-${d.tipo}`);
    const r = ejecutar(Motor.agregarRecompensa, d.tipo, campo ? campo.value : '');
    if (r.ok) UI.aviso(r.rellenoHueco ? 'Añadida: ocupa el hueco de una recompensa que ya ganaste.' : 'Recompensa añadida.');
  },
  editarRecompensa: async d => {
    const lista = d.tipo === 'grande' ? estado.recompensas.grandes : estado.recompensas.pequenas;
    const texto = await UI.pedir({ titulo: 'EDITAR RECOMPENSA', valor: lista[Number(d.i)] });
    if (texto !== null) ejecutar(Motor.editarRecompensa, d.tipo, Number(d.i), texto);
  },
  borrarRecompensa: async d => {
    const lista = d.tipo === 'grande' ? estado.recompensas.grandes : estado.recompensas.pequenas;
    if (await UI.confirmar({ titulo: '¿BORRAR RECOMPENSA?', texto: `<p>«${UI.esc(lista[Number(d.i)])}» se quitará de tu lista.</p>`, si: 'BORRAR', peligro: true })) {
      ejecutar(Motor.borrarRecompensa, d.tipo, Number(d.i));
    }
  },
  moverRecompensa: d => ejecutar(Motor.moverRecompensa, d.tipo, Number(d.i), Number(d.dir)),

  // --- Ajustes ---
  modoMuerte: async d => {
    if (d.valor === estado.ajustes.modoMuerte) return;
    if (estado.ajustes.modoMuerte === 'hardcore') {
      const seguro = await UI.confirmar({
        titulo: '¿DEJAR EL MODO HARDCORE?',
        texto: '<p>Elegiste Hardcore para ponerte presión de verdad. ¿Seguro que quieres cambiarlo?</p>',
        si: 'SÍ, CAMBIAR', peligro: true,
      });
      if (!seguro) return;
    }
    estado.ajustes.modoMuerte = d.valor;
    Motor.registrar(estado, `Modo de muerte: ${Motor.REGLAS.modosMuerte[d.valor].nombre}`);
    guardar();
    render();
    UI.aviso(`Modo de muerte: ${Motor.REGLAS.modosMuerte[d.valor].nombre}.`);
  },
  exportar: () => {
    revisarDia();
    estado.ajustes.ultimaCopia = estado.ultimoDia;
    guardar();
    Guardado.exportar(estado);
    render();
    UI.aviso('Copia descargada. Guárdala en un lugar seguro.');
  },
  reiniciar: async () => {
    const primero = await UI.confirmar({
      titulo: '¿BORRAR LA PARTIDA?',
      texto: '<p>Se perderá todo: niveles, oro, actividades y recompensas. Si quieres guardarla, descarga antes una copia.</p>',
      si: 'CONTINUAR', peligro: true,
    });
    if (!primero) return;
    const texto = await UI.pedir({ titulo: 'ESCRIBE «BORRAR» PARA CONFIRMAR', boton: 'BORRAR PARTIDA' });
    if (!texto || texto.trim().toUpperCase() !== 'BORRAR') { UI.aviso('No se borró nada.'); return; }
    Guardado.borrar();
    estado = Motor.crearEstadoInicial(new Date());
    guardar();
    location.hash = '#hoy';
    render();
    bienvenida();
  },
};

async function importarCopia(archivo) {
  if (!archivo) return;
  const copia = await Guardado.leerArchivo(archivo);
  if (!copia) { UI.aviso('Ese archivo no es una copia válida de RPGamificación.', 'error'); return; }
  const hoy = Motor.claveDia(new Date());
  const texto = `
    <p>Tu partida actual (nivel ${Motor.nivelDesdeXP(estado.xp)}) se <b>reemplazará</b> por la de la copia: nivel ${Motor.nivelDesdeXP(copia.xp)}, guardada el ${UI.fechaLarga(copia.ultimoDia)}.</p>
    ${copia.ultimoDia < hoy ? '<p>Los días entre la copia y hoy <b>no se cuentan</b> (no se cierran ni quitan vida).</p>' : ''}`;
  if (!(await UI.confirmar({ titulo: '¿RECUPERAR ESTA COPIA?', texto, si: 'RECUPERAR', peligro: true }))) return;
  estado = copia;
  if (estado.ultimoDia < hoy) {
    estado.ultimoDia = hoy;
    estado.hoy = { clave: hoy, xp: 0, oro: 0, derrotados: 0 };
    estado.descansoDias = [];
  }
  Motor.registrar(estado, 'Recuperaste una copia de seguridad');
  guardar();
  render();
  UI.aviso('Copia recuperada.');
}

// ---------------------------------------------------------------------
// Escuchar clics, escritura y teclado
// ---------------------------------------------------------------------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-accion]');
  if (!el || el.disabled) return;
  const accion = ACCIONES[el.dataset.accion];
  if (!accion) return;
  e.preventDefault();
  accion(el.dataset, el);
});

// Mientras se escribe en el formulario: se actualiza el borrador y la vista previa
document.addEventListener('input', e => {
  const el = e.target;
  if (!borrador) return;
  if (el.dataset.campo) borrador[el.dataset.campo] = el.value;
  else if (el.dataset.subtarea !== undefined) borrador.subtareas[Number(el.dataset.subtarea)].texto = el.value;
  else return;
  if (el.dataset.campo === 'nombre') {
    const contador = document.getElementById('contador');
    if (contador) contador.textContent = `${el.value.length}/${Motor.REGLAS.largoNombre}`;
  }
  const vistaPrevia = document.getElementById('vista-previa');
  if (vistaPrevia) {
    vistaPrevia.innerHTML = vistaPreviaFormulario(borrador);
    Pixel.dibujar(vistaPrevia);
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'archivo-copia') {
    importarCopia(e.target.files[0]);
    e.target.value = '';
  } else if (borrador && e.target.matches('select[data-campo]')) {
    render();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id && e.target.id.startsWith('nueva-') && !document.querySelector('.velo')) {
    e.preventDefault();
    ACCIONES.agregarRecompensa({ tipo: e.target.id.replace('nueva-', '') });
  }
});

// Cada 30 segundos: ¿ya son las 3:00 a.m.? Si no, solo se actualiza el reloj.
setInterval(() => {
  if (!revisarDia()) {
    const reloj = document.getElementById('reloj');
    if (reloj) reloj.textContent = UI.tiempoHastaReinicio(new Date());
  }
}, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarDia(); });

// ---------------------------------------------------------------------
// Empezar
// ---------------------------------------------------------------------
(function iniciar() {
  // Icono de la pestaña: una corona pixelada
  const icono = document.querySelector('link[rel="icon"]');
  if (icono) icono.href = 'data:image/svg+xml,' + encodeURIComponent(Pixel.svg(Pixel.ICONOS.corona, 4));
  const antes = estado.ultimoDia;
  const eventos = Motor.actualizar(estado, new Date());
  guardar();
  render();
  if (partidaNueva) bienvenida();
  else if (estado.ultimoDia !== antes) mostrarInforme(eventos);
})();
