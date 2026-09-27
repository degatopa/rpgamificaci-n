// Cabecera y menú compartidos por todos los bocetos.
// Cada página indica cuál es la pestaña activa con <body data-pagina="...">.
const MENU = [
  ['hoy', 'HOY'],
  ['actividades', 'ACTIVIDADES'],
  ['tienda', 'TIENDA'],
  ['recompensas', 'RECOMPENSAS'],
  ['ajustes', 'AJUSTES'],
];

document.addEventListener('DOMContentLoaded', () => {
  const activa = document.body.dataset.pagina;
  const cabecera = document.createElement('header');
  cabecera.className = 'cabecera';
  cabecera.innerHTML = `
    <div class="logo"><span data-px="k:escudero" data-s="2"></span>RPGAMIFICACIÓN</div>
    <nav class="menu">${MENU.map(([id, texto]) => `<a class="${id === activa ? 'activo' : ''}">${texto}</a>`).join('')}</nav>
    <div class="hud">
      <span><span data-px="xp" data-s="2"></span>Nv 7</span>
      <span><span data-px="corazon" data-s="2"></span>70/100</span>
      <span><span data-px="moneda" data-s="2"></span>640</span>
      <span><span data-px="llama" data-s="2"></span>12 días</span>
    </div>`;
  document.body.prepend(cabecera);
  const rotulo = document.createElement('div');
  rotulo.className = 'rotulo-boceto';
  rotulo.textContent = 'BOCETO · DATOS DE EJEMPLO';
  document.body.append(rotulo);
  dibujar();
});
