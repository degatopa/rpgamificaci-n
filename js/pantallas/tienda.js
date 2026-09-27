// Pantalla TIENDA: pociones y multiplicador, con su precio en XP y oro
// y lo que pasará si los compro (por ejemplo, bajar de nivel).

const DESCRIPCIONES_TIENDA = {
  vida: { icono: 'pocion', efecto: () => `Llena tu vida al máximo: de ${estado.vida} a <b>${Motor.REGLAS.vidaMaxima} HP</b>. Es la única forma de recuperar vida.` },
  descanso: { icono: 'descanso', efecto: () => 'Protege un día: esa noche no pierdes vida por lo <b>fácil y mediano</b>. No protege de misiones grandes ni de jefes.' },
  multiplicador: { icono: 'elixir', efecto: () => `Duplica todo el XP que ganas durante <b>${Motor.REGLAS.diasMultiplicador} días</b>. Se suma al bonus de racha.` },
};

// Texto del botón cuando no alcanza
function textoFalta(s) {
  if (s.faltaXP && s.faltaOro) return `TE FALTAN ${s.faltaXP} XP Y ${UI.num(s.faltaOro)} DE ORO`;
  if (s.faltaXP) return `TE FALTAN ${s.faltaXP} XP`;
  return `TE FALTAN ${UI.num(s.faltaOro)} DE ORO`;
}

function productoTienda(objeto) {
  const p = Motor.REGLAS.tienda[objeto];
  const info = DESCRIPCIONES_TIENDA[objeto];
  const s = Motor.simularCompra(estado, objeto);
  let nota;
  if (s.puede && s.despues.nivel < s.nivelAntes) {
    nota = `<div class="nota peligro">Esta compra te bajaría al <b style="color:#fff">nivel ${s.despues.nivel}</b> (${UI.num(s.despues.actual)}/${UI.num(s.despues.necesario)} XP). En este juego se puede bajar de nivel.</div>`;
  } else if (s.puede) {
    nota = `<div class="nota ok">Te quedarían <b>${UI.num(s.oroDespues)} de oro</b> y seguirías en el <b>nivel ${s.despues.nivel}</b> (${UI.num(s.despues.actual)}/${UI.num(s.despues.necesario)} XP).</div>`;
  } else if (objeto === 'multiplicador') {
    nota = '<div class="nota">Con unos 130 XP al día, da unos <b>900 XP extra</b> en 7 días (unos 700 netos tras pagar su precio).</div>';
  } else {
    nota = `<div class="nota">Tienes ${estado.inventario[objeto]} en el inventario.</div>`;
  }
  return `
    <section class="caja producto ${s.puede ? 'dorada' : ''}">
      <div class="vitrina"><span data-px="${info.icono}" data-s="7"></span></div>
      <div class="nom">${p.nombre.toUpperCase()}</div>
      <div class="efecto">${info.efecto()}</div>
      <div class="precio"><span class="chip"><span data-px="xp" data-s="2"></span>${p.xp} XP</span>+<span class="chip"><span data-px="moneda" data-s="2"></span>${UI.num(p.oro)} oro</span></div>
      ${s.puede
        ? `<button class="btn grande dorado" data-accion="comprar" data-objeto="${objeto}">COMPRAR</button>`
        : `<button class="btn grande apagado" disabled>${textoFalta(s)}</button>`}
      ${nota}
    </section>`;
}

function pantallaTienda() {
  const R = Motor.REGLAS;
  const nivel = Motor.progresoNivel(estado.xp);
  const inv = estado.inventario;
  const hoy = estado.ultimoDia;
  const protegido = estado.descansoDias.includes(hoy);
  return `
  <h1 class="pagina">TIENDA</h1>
  <div class="suave">Todo es caro a propósito: se paga con <b>XP y oro a la vez</b>, para que cada error cueste parte de tu esfuerzo.</div>
  <div class="bolsa">
    <span class="suave">Tienes:</span>
    <span class="chip"><span data-px="moneda" data-s="2"></span><b class="oro">${UI.num(estado.oro)}</b> oro</span>
    <span class="chip"><span data-px="xp" data-s="2"></span><b style="color:var(--xp)">${UI.num(estado.xp)}</b> XP en total · nivel ${nivel.nivel} (${UI.num(nivel.actual)}/${UI.num(nivel.necesario)})</span>
    <span class="chip minimo"><span data-px="corazon" data-s="2"></span>Vida ${estado.vida}/${R.vidaMaxima}</span>
  </div>
  <div class="productos">${['vida', 'descanso', 'multiplicador'].map(productoTienda).join('')}</div>
  <div class="abajo">
    <section class="caja">
      <h2 class="titulo">INVENTARIO</h2>
      <div class="inv">
        <div class="it ${inv.descanso ? '' : 'tenue'}"><span data-px="descanso" data-s="2"></span>Poción de descanso ×${inv.descanso}
          ${inv.descanso ? `<button class="btn chico" data-accion="usar" data-objeto="descanso" ${protegido ? 'disabled' : ''}>${protegido ? 'HOY PROTEGIDO' : 'USAR HOY'}</button>` : ''}</div>
        <div class="it ${inv.vida ? '' : 'tenue'}"><span data-px="pocion" data-s="2"></span>Poción de vida ×${inv.vida}
          ${inv.vida ? `<button class="btn chico" data-accion="usar" data-objeto="vida" ${estado.vida >= R.vidaMaxima ? 'disabled' : ''}>USAR</button>` : ''}</div>
        <div class="it ${inv.multiplicador ? '' : 'tenue'}"><span data-px="elixir" data-s="2"></span>Multiplicador ×${inv.multiplicador}
          ${inv.multiplicador ? '<button class="btn chico" data-accion="usar" data-objeto="multiplicador">ACTIVAR</button>' : ''}</div>
        ${Motor.multiplicadorActivo(estado, hoy) ? `<div class="suave" style="font-size:20px">XP ×2 activo hasta el ${UI.fechaCorta(estado.multiplicadorHasta)}.</div>` : ''}
      </div>
    </section>
    <section class="caja">
      <h2 class="titulo">REGLAS</h2>
      <ul class="reglas">
        <li>La poción de descanso se toma <b>antes de las 3:00 a.m.</b> del día que quieres proteger.</li>
        <li>Ese día la racha no se rompe, pero tampoco suma.</li>
        <li>Puedes comprar pociones antes de necesitarlas y guardarlas.</li>
        <li>El XP de las compras sale de tu nivel general; tus estadísticas no bajan.</li>
      </ul>
    </section>
    <section class="caja" style="opacity:.75">
      <h2 class="titulo">PRÓXIMAMENTE</h2>
      <div style="display:flex;gap:18px;align-items:center">
        <span data-px="corona" data-s="4"></span>
        <div class="suave">Sombreros y accesorios para tu caballero. Se añadirán en una versión futura.</div>
      </div>
    </section>
  </div>`;
}
