// Pantalla AJUSTES: modo de muerte, copia de seguridad, historial de
// muertes, diario de la partida y empezar de cero.

function pantallaAjustes() {
  const R = Motor.REGLAS;
  const modo = estado.ajustes.modoMuerte;
  const ultima = estado.ajustes.ultimaCopia;
  return `
  <h1 class="pagina">AJUSTES</h1>
  <div class="suave" style="margin-bottom:20px">Tu partida se guarda sola en este navegador. Haz copias de seguridad de vez en cuando.</div>
  <div class="rejilla">
    <div style="display:flex;flex-direction:column;gap:26px">
      <section class="caja">
        <h2 class="titulo"><span data-px="calavera" data-s="2"></span>MODO DE MUERTE</h2>
        <div class="suave" style="margin-bottom:12px">Qué pierdes si tu vida llega a 0.</div>
        <div class="opciones">
          ${Object.entries(R.modosMuerte).map(([id, m]) => `
            <button class="opcion ${modo === id ? 'elegida' : ''}" data-accion="modoMuerte" data-valor="${id}">
              <div class="cab">${m.nombre}${id === 'hardcore' ? ' <span class="suave">(el que elegiste)</span>' : ''}</div><div class="det">${m.texto}</div></button>`).join('')}
        </div>
      </section>

      <section class="caja">
        <h2 class="titulo"><span data-px="cofre" data-s="2"></span>COPIA DE SEGURIDAD</h2>
        <p class="suave" style="margin:0 0 14px">Si borras los datos del navegador, se borra la partida. Una copia es un archivo que puedes guardar donde quieras y recuperar después.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn dorado" data-accion="exportar">DESCARGAR COPIA</button>
          <label class="btn" for="archivo-copia" style="cursor:pointer">RECUPERAR UNA COPIA</label>
          <input type="file" id="archivo-copia" accept=".json,application/json" hidden>
        </div>
        <div class="ayuda">Última copia: ${ultima ? UI.fechaLarga(ultima) : 'nunca'}.</div>
      </section>

      <section class="caja">
        <h2 class="titulo"><span data-px="calavera" data-s="2"></span>HISTORIAL DE MUERTES</h2>
        <div class="historial">${estado.muertes.map(m => `<div><span class="dia">${UI.fechaCorta(m.dia)}</span> Nivel ${m.nivel} (${UI.esc(m.rango)}) · modo ${R.modosMuerte[m.modo].nombre}</div>`).join('') || '<div class="vacio">Muertes: 0. ¡Que siga así!</div>'}</div>
      </section>

      <section class="caja">
        <h2 class="titulo" style="color:var(--vida)">EMPEZAR DE CERO</h2>
        <p class="suave" style="margin:0 0 14px">Borra la partida entera de este navegador y empieza una nueva. No se puede deshacer (salvo que tengas una copia).</p>
        <button class="btn peligro" data-accion="reiniciar">BORRAR LA PARTIDA</button>
      </section>
    </div>

    <section class="caja">
      <h2 class="titulo">DIARIO DE LA PARTIDA <span class="der">Lo que ha pasado</span></h2>
      <div class="registro">${estado.registro.slice(0, 150).map(r => `<div><span class="dia">${UI.fechaCorta(r.dia)}</span>${UI.esc(r.texto)}</div>`).join('') || '<div class="vacio">Todavía no ha pasado nada.</div>'}</div>
    </section>
  </div>`;
}
