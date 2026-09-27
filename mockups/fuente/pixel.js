// Dibujos pixel art de los bocetos.
// Cada dibujo es una lista de filas: cada letra es un color de la paleta
// y "." es un píxel transparente. Se convierten en SVG al cargar la página.

const BASE = {
  K: '#10101f', // contorno
  w: '#ffffff',
  s: '#dfe6f0', m: '#a3aec2', d: '#66718a', // acero
  y: '#f4c542', o: '#c98a12', // oro
  r: '#d0463f', R: '#8e2a2a', // rojo
  b: '#9a6334', B: '#5f3b20', // cuero / madera
  f: '#f1c08e', F: '#d99a6c', e: '#10101f', // piel y ojos
};

// ---------- Iconos pequeños ----------
const ICONOS = {
  corazon: { pal: { r: '#e5484d', R: '#9e2430', w: '#ffc2c4' }, rows: [
    '.KKK...KKK.',
    'KrwrK.KrrrK',
    'KrrrrKrrrRK',
    'KrrrrrrrrRK',
    'KrrrrrrrrRK',
    '.KrrrrrrRK.',
    '..KrrrrRK..',
    '...KrrRK...',
    '....KRK....',
    '.....K.....'] },
  moneda: { pal: { y: '#f4c542', o: '#c98a12', w: '#fff3b0' }, rows: [
    '..KKKKKK..',
    '.KwwyyyyK.',
    'KwyyooyyyK',
    'KyyoyyoyoK',
    'KyyoyyoyoK',
    'KyyoyyoyoK',
    'KyyyooyyoK',
    '.KyyyyyoK.',
    '..KKKKKK..'] },
  xp: { pal: { c: '#45d7e6', C: '#1c8f9e', w: '#dffbff' }, rows: [
    '....K....',
    '...KwK...',
    '..KwcCK..',
    '.KwccCCK.',
    'KwcccCCCK',
    '.KccCCCK.',
    '..KcCCK..',
    '...KCK...',
    '....K....'] },
  llama: { pal: { o: '#ff8a3d', O: '#d9442b', y: '#ffd84a', w: '#fff8d6' }, rows: [
    '....K....',
    '...KoK...',
    '...KooK..',
    '..KoooK..',
    '.KooyooK.',
    '.KoyyyoK.',
    'KooyyyooK',
    'KoyywyyoK',
    'KoyywyyoK',
    'KooyyyooK',
    '.KooooOK.',
    '..KKKKK..'] },
  candado: { pal: { y: '#f4c542', o: '#b98a16', s: '#dfe6f0', m: '#8b96aa' }, rows: [
    '...KKKK...',
    '..KmssmK..',
    '.KmK..KmK.',
    '.KmK..KmK.',
    'KKKKKKKKKK',
    'KyyyyyyyoK',
    'KyyyKKyyoK',
    'KyyyKKyyoK',
    'KyyyKyyyoK',
    'KyyyyyyyoK',
    'KooooooooK',
    'KKKKKKKKKK'] },
  espada: { pal: { w: '#eef3fa', y: '#f4c542', b: '#8a5a33' }, rows: [
    '...KK..',
    '..KwsK.',
    '..KwsK.',
    '..KwsK.',
    '..KwsK.',
    '..KwsK.',
    '..KwsK.',
    'KKKKKKK',
    'KyyyyyK',
    'KKKKKKK',
    '..KbbK.',
    '..KbbK.',
    '..KyyK.',
    '..KKKK.'] },
  calendario: { pal: { r: '#e5484d', w: '#eef0ff', m: '#8b93c7' }, rows: [
    '.K.....K...',
    'KKKKKKKKKKK',
    'KrrrrrrrrrK',
    'KrrrrrrrrrK',
    'KKKKKKKKKKK',
    'KwwwwwwwwwK',
    'KwmwmwmwmwK',
    'KwwwwwwwwwK',
    'KwmwmwmwwwK',
    'KwwwwwwwwwK',
    'KKKKKKKKKKK'] },
  cofre: { pal: { b: '#a0632f', B: '#6b3f1d', y: '#f4c542' }, rows: [
    '..KKKKKKKK..',
    '.KbbbyybbbK.',
    'KbbbbyybbbbK',
    'KBBBByyBBBBK',
    'KKKKKKKKKKKK',
    'KbbbKyyKbbbK',
    'KbbbKyyKbbbK',
    'KbbbbKKbbbbK',
    'KBBBByyBBBBK',
    'KKKKKKKKKKKK'] },
  corona: { pal: { y: '#f4c542', o: '#b98a16', R: '#e5484d', B: '#5b8cff' }, rows: [
    'K....KK....K',
    'KK..KyyK..KK',
    'KyK.KyyK.KyK',
    'KyyKyyyyKyyK',
    'KyyyyyyyyyyK',
    'KyRyyBByyRyK',
    'KyyyyyyyyyyK',
    'KooooooooooK',
    'KKKKKKKKKKKK'] },
  calavera: { pal: { w: '#e8e2cf', W: '#b3ab92' }, rows: [
    '...KKKKK...',
    '..KwwwwwK..',
    '.KwwwwwwwK.',
    'KwwwwwwwwWK',
    'KwKKwwwKKWK',
    'KwKKwwwKKWK',
    'KwwwwKwwwWK',
    '.KKwwwwwKK.',
    '..KwKwKwK..',
    '..KKKKKKK..'] },
  // Estadísticas
  cuerpo: { pal: { o: '#ff8a3d', O: '#c4561b', m: '#cfd6e6' }, rows: [
    '...........',
    'KKKK...KKKK',
    'KoOK...KoOK',
    'KoOKKKKKoOK',
    'KoOKmmmKoOK',
    'KoOKKKKKoOK',
    'KoOK...KoOK',
    'KKKK...KKKK',
    '...........'] },
  espiritu: { pal: { v: '#b07cff', V: '#7447c9', w: '#f1e9ff', o: '#ff8a3d', y: '#ffd84a' }, rows: [
    '....K....',
    '...KoK...',
    '..KoyoK..',
    '..KoyoK..',
    '...KKK...',
    '....K....',
    '..KKKKK..',
    '..KwvVK..',
    '..KwvVK..',
    '..KwvVK..',
    'KKKKKKKKK',
    'KvvvvvvVK',
    'KKKKKKKKK'] },
  mente: { pal: { w: '#eef0ff', m: '#9aa5d6', B: '#5b8cff' }, rows: [
    '.KKKK.KKKK.',
    'KwwwwKwwwwK',
    'KwmmwKwmmwK',
    'KwwwwKwwwwK',
    'KwmmwKwmmwK',
    'KwwwwKwwwwK',
    'KBBBBKBBBBK',
    '.KKKKKKKKK.'] },
  creatividad: { pal: { g: '#5fd068', G: '#2f8f3c', w: '#f4fff0' }, rows: [
    '........KKK',
    '......KKggK',
    '.....KgggGK',
    '....KggwGK.',
    '...KggwGK..',
    '..KgGwGK...',
    '..KGwGK....',
    '.KKwKK.....',
    '.KwK.......',
    'KwK........',
    'KK.........'] },
  // Enemigos (dificultad)
  comun: { pal: { g: '#9be36d', G: '#4f9e36', w: '#effbe6' }, rows: [
    '....KKK....',
    '...KgggK...',
    '..KgwgggK..',
    '.KgwgggggK.',
    '.KggKgKggK.',
    'KggggggggGK',
    'KgggggggGGK',
    '.KKKKKKKKK.'] },
  elite: { pal: { w: '#e8e2cf', W: '#b3ab92' }, rows: [
    '...KKKKK...',
    '..KwwwwwK..',
    '.KwwwwwwwK.',
    'KwwwwwwwwWK',
    'KwKKwwwKKWK',
    'KwKKwwwKKWK',
    'KwwwwKwwwWK',
    '.KKwwwwwKK.',
    '..KwKwKwK..',
    '..KKKKKKK..'] },
  minijefe: { pal: { r: '#d8434a', R: '#8f1f28', h: '#e8e2cf', y: '#ffd84a', w: '#ffffff' }, rows: [
    'K.........K',
    'KhK.....KhK',
    '.KhKKKKKhK.',
    '.KrrrrrrrK.',
    'KrrrrrrrrRK',
    'KryKrrrKyRK',
    'KrrrrrrrrRK',
    'KrKwwwwwKRK',
    '.KrKKKKKRK.',
    '..KKKKKKK..'] },
  // Pociones grandes
  pocion: { pal: { g: '#cfe3ff', w: '#ffffff', b: '#8a5a33', L: '#e5484d', l: '#ff9a9c', D: '#9e2430' }, rows: [
    '....KKKK....',
    '....KbbK....',
    '....KKKK....',
    '....KggK....',
    '...KggggK...',
    '..KggggggK..',
    '.KwLLLLLLgK.',
    'KwLLLLLLLLgK',
    'KwLlLLLLLLDK',
    'KLlLLLLLLLDK',
    'KLLLLLLLLLDK',
    '.KLLLLLLLDK.',
    '..KDDDDDDK..',
    '...KKKKKK...'] },
};
// Variantes de color de la poción
ICONOS.descanso = { rows: ICONOS.pocion.rows, pal: { ...ICONOS.pocion.pal, L: '#5b8cff', l: '#a8c4ff', D: '#2b4fa8' } };
ICONOS.elixir = { rows: ICONOS.pocion.rows, pal: { ...ICONOS.pocion.pal, L: '#f4c542', l: '#fff0a0', D: '#b98a16' } };

// Jefe final: el mini jefe con corona y más grande
ICONOS.jefe = { pal: { p: '#8b4fd6', P: '#57308f', h: '#e8e2cf', y: '#f4c542', o: '#b98a16', r: '#ff4b4b', w: '#ffffff', R: '#e5484d' }, rows: [
  'K..............K',
  'KhK....yy....KhK',
  '.KhK..yRRy..KhK.',
  '..KhKyyyyyyKhK..',
  '..KhKyKyyKyKhK..',
  '..KKppppppppKK..',
  '.KppppppppppppK.',
  '.KpKKppppppKKpK.',
  '.KprrKppppKrrPK.',
  '.KppppppppppppK.',
  '.KpppKKKKKKppPK.',
  '.KppKwKwwKwKpPK.',
  '..KppKKKKKKpPK..',
  '...KppppppPPK...',
  '....KKKKKKKK....'] };

// ---------- El caballero ----------
// Se arma por capas: capa, espada, cuerpo, casco, escudo y adorno (pluma o corona).
const CUERPO = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..KsmmKrrKmmdK..',
  '.KsmmdKrrKmmddK.',
  '.KfKKKrrrrKKKfK.',
  '...KbbbyybbbK...',
  '....KmdKKmdK....',
  '....KmdKKmdK....',
  '...KBBBKKBBBK...',
];
const CASCOS = {
  cerrado: [
    '................', '................',
    '.....KKKKKK.....',
    '....KssssmmK....',
    '...KsswssmmdK...',
    '...KssssmmmdK...',
    '...KKKKKKKKKK...',
    '...KdyKddKydK...',
    '...KssmmmmmdK...',
    '....KKKKKKKK....'],
  abierto: [
    '................', '................',
    '.....KKKKKK.....',
    '....KssssmmK....',
    '...KsswssmmdK...',
    '...KKKKKKKKKK...',
    '...KmffffffmK...',
    '...KmfeffefmK...',
    '...KmffFFffmK...',
    '....KKKKKKKK....'],
  gorro: [
    '................', '................',
    '................',
    '.....KKKKKK.....',
    '....KbbbbbBK....',
    '...KKKKKKKKKK...',
    '...KBffffffBK...',
    '...KffeffeffK...',
    '...KfffFFfffK...',
    '....KKKKKKKK....'],
};
const PLUMA = ['......ppp.......', '.....pPpp.......'];
const CORONA_REY = ['....y..yy..y....', '....yy.yy.yy....', '....yyryyryy....'];
const CORONA_EMP = ['...y.y.yy.y.y...', '...yyyyyyyyyy...', '...yyByyyyyByy..'];
const CAPA = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................',
  '..KKKKKKKKKKKK..',
  '.KccccccccccccK.',
  '.KccccccccccccK.',
  '.KccccccccccccK.',
  '.KccccccccccccK.',
  '.KccccccccccccK.',
  '.KCccccccccccCK.',
  '.KKKKKKKKKKKKKK.',
];
const ARMINO = ['................', '................', '................', '................', '................',
  '................', '................', '................', '................', '................',
  '..KnNnnKrrKnnNK.'];
const ESPADA = [ // en coordenadas del lienzo (20 de ancho)
  '..K', '.KwK', '.KwK', '.KwK', '.KwK', '.KwK', '.KwK', '.KwK', '.KwK',
  'KyyyK', '.KbK', '.KyK', '..K'];
const ESCUDO_MADERA = ['KKKKK', 'KbBbK', 'KbbbK', 'KbBbK', '.KbK.', '..K..'];
const ESCUDO_CRUZ = ['KKKKK', 'KqwqK', 'KwwwK', 'KqwqK', '.KqK.', '..K..'];

const RANGOS = [
  { id: 'soldado', nombre: 'Soldado raso', nivel: 1, casco: 'gorro', pal: { s: '#c08a57', m: '#9a6a3e', d: '#6e4726', r: '#6f7f45', R: '#4d5a2e', y: '#b0915a' } },
  { id: 'escudero', nombre: 'Escudero', nivel: 5, casco: 'abierto', escudo: ESCUDO_MADERA },
  { id: 'caballero', nombre: 'Caballero', nivel: 10, casco: 'cerrado', escudo: ESCUDO_CRUZ, pluma: ['#d0463f', '#8e2a2a'] },
  { id: 'capitan', nombre: 'Capitán', nivel: 15, casco: 'cerrado', escudo: ESCUDO_CRUZ, pluma: ['#d0463f', '#8e2a2a'], capa: ['#3f6fd8', '#243f86'] },
  { id: 'comandante', nombre: 'Comandante', nivel: 20, casco: 'cerrado', escudo: ESCUDO_CRUZ, pluma: ['#ffffff', '#b9c2d6'], capa: ['#c63b3b', '#7c1f22'] },
  { id: 'senor', nombre: 'Señor feudal', nivel: 30, casco: 'cerrado', escudo: ESCUDO_CRUZ, pluma: ['#b07cff', '#7447c9'], capa: ['#7447c9', '#43237f'] },
  { id: 'duque', nombre: 'Duque', nivel: 40, casco: 'cerrado', escudo: ESCUDO_CRUZ, pluma: ['#f4c542', '#b98a16'], capa: ['#7447c9', '#43237f'], armino: true },
  { id: 'rey', nombre: 'Rey', nivel: 50, casco: 'cerrado', escudo: ESCUDO_CRUZ, corona: CORONA_REY, capa: ['#c63b3b', '#7c1f22'], armino: true },
  { id: 'emperador', nombre: 'Emperador', nivel: 60, casco: 'cerrado', escudo: ESCUDO_CRUZ, corona: CORONA_EMP, capa: ['#6b2fb8', '#f4c542'], armino: true,
    pal: { s: '#fff0b3', m: '#f4c542', d: '#b98a16' } },
];

function vacio(w, h) { return Array.from({ length: h }, () => Array(w).fill('.')); }
function pegar(lienzo, filas, dx = 0, dy = 0) {
  filas.forEach((fila, y) => [...fila].forEach((c, x) => {
    if (c !== '.' && lienzo[y + dy] && x + dx < lienzo[0].length) lienzo[y + dy][x + dx] = c;
  }));
}

function caballero(id) {
  const rango = RANGOS.find(r => r.id === id);
  const W = 20, H = 18, X = 2;
  const l = vacio(W, H);
  const pal = { ...BASE, q: '#d0463f', n: '#ffffff', N: '#10101f', ...(rango.pal || {}) };
  if (rango.capa) { pegar(l, CAPA, X); pal.c = rango.capa[0]; pal.C = rango.capa[1]; }
  pegar(l, ESPADA, 0, 3);
  pegar(l, CUERPO, X);
  if (rango.armino) pegar(l, ARMINO, X);
  pegar(l, CASCOS[rango.casco], X);
  if (rango.pluma) { pegar(l, PLUMA, X); pal.p = rango.pluma[0]; pal.P = rango.pluma[1]; }
  if (rango.corona) { pegar(l, rango.corona, X); pal.B = '#5b8cff'; }
  if (rango.escudo) pegar(l, rango.escudo, 14, 10);
  return { rows: l.map(f => f.join('')), pal };
}

function svg(dibujo, escala, silueta) {
  const pal = { ...BASE, ...dibujo.pal };
  const h = dibujo.rows.length;
  const w = Math.max(...dibujo.rows.map(r => r.length));
  let rects = '';
  dibujo.rows.forEach((fila, y) => {
    let x = 0;
    while (x < fila.length) {
      const c = fila[x];
      if (c === '.' || c === ' ') { x++; continue; }
      let x2 = x;
      while (x2 < fila.length && fila[x2] === c) x2++;
      const color = silueta ? silueta : (pal[c] || '#ff00ff');
      rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${color}"/>`;
      x = x2;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * escala}" height="${h * escala}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
}

function dibujar() {
  document.querySelectorAll('[data-px]').forEach(el => {
    const nombre = el.dataset.px;
    const escala = Number(el.dataset.s || 2);
    const dibujo = nombre.startsWith('k:') ? caballero(nombre.slice(2)) : ICONOS[nombre];
    if (!dibujo) { el.textContent = '?' + nombre; return; }
    el.innerHTML = svg(dibujo, escala, el.dataset.sil);
    el.classList.add('px');
  });
}

document.addEventListener('DOMContentLoaded', dibujar);
