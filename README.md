# RPGamificación

Juego web de hábitos tipo RPG, para uso personal. Un caballero en pixel art sube
de **soldado raso a emperador** a medida que cumples tus hábitos. Si no cumples
tus mínimos, pierdes vida.

Las reglas completas están en [`DISENO.md`](DISENO.md).

## Cómo jugar

1. Descarga el repositorio (en GitHub: botón verde **Code → Download ZIP**) y descomprímelo.
2. Abre el archivo **`index.html`** con doble clic. Se abre en tu navegador (Chrome, Edge o Firefox).
3. ¡Listo! No hace falta instalar nada ni tener internet.

Consejo: guarda la página en marcadores para abrirla rápido cada día.

### Dónde se guarda tu partida

La partida se guarda **sola** en el navegador (en su `localStorage`). Eso significa que:

- Si abres el juego con otro navegador u otro ordenador, empezarás de cero.
- Si borras los datos de navegación, **se borra la partida**.

Por eso, de vez en cuando, ve a **Ajustes → Descargar copia**. Se descarga un archivo
`.json` con toda tu partida. Si algún día la pierdes, usa **Ajustes → Recuperar una copia**.

## Qué hay en cada archivo

```
index.html              La página que abres. Carga todo lo demás.
css/estilos.css         Colores, tamaños y aspecto pixel art.
fuentes/                Las dos fuentes pixel art (Silkscreen y Jersey 10).
js/motor.js             LAS REGLAS DEL JUEGO: XP, niveles, vida, cierre del día a
                        las 3:00 a.m., tienda, recompensas, muerte... No dibuja nada.
js/pixel.js             Los dibujos: el caballero (9 rangos), enemigos, pociones e iconos.
js/guardado.js          Guardar y cargar la partida, y las copias de seguridad.
js/ui.js                Ayudas para las pantallas: fechas, ventanas emergentes, avisos.
js/pantallas/*.js       Una pantalla por archivo: hoy, actividades, formulario,
                        tienda, recompensas y ajustes.
js/app.js               Arranca el juego, cambia de pantalla y responde a los botones.
pruebas/motor.test.js   Pruebas automáticas de las reglas.
mockups/                Los bocetos de la interfaz (imágenes del diseño).
```

La idea importante: **las reglas (`motor.js`) están separadas de las pantallas**.
Si quieres cambiar un número del juego (por ejemplo, el precio de una poción),
está todo junto al principio de `js/motor.js`, en el objeto `REGLAS`.

## Pruebas automáticas (opcional)

Las pruebas comprueban que las reglas funcionan como dice `DISENO.md`
(por ejemplo: "no cumplir los 4 mínimos quita 40 HP"). Necesitas tener
[Node.js](https://nodejs.org) instalado. Desde la carpeta del proyecto:

```
node --test pruebas/*.test.js
```

Si todo está bien, al final verás `# fail 0`.

## Qué falta (ideas para más adelante)

- Versión para el celular.
- Sombreros y accesorios para el caballero.
- Dibujos más elaborados.
