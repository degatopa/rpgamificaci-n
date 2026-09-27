# Documento de diseño — RPG de hábitos

> **Estado:** borrador v0.3. Casi todo está decidido; quedan 3 preguntas al final.
>
> **Leyenda:**
> ✅ = decidido · 🟡 = propuesta (se puede cambiar) · ❓ = falta decidir

---

## 1. Concepto

✅ Un juego web de uso personal que convierte mis hábitos en un RPG. Mi
personaje es un **caballero en pixel art** que asciende, como en una película,
de **soldado raso a emperador** a medida que cumplo mis hábitos.

- Cumplir un hábito = **derrotar a un enemigo** y ganar XP y oro.
- Las misiones grandes son **jefes finales** con su propia barra de vida.
- Lo que no cumplo me **quita vida**. La vida **solo** se recupera con pociones caras.
- Si la vida llega a 0, **muero** y pierdo todo mi progreso.

✅ **Filosofía:** el juego debe presionar de verdad. No hay modo descanso ni
regeneración gratis: cada error se paga con el esfuerzo (XP y oro) que ya hice.

✅ Plataforma: **PC** (navegador). La versión para celular se verá más adelante.

---

## 2. El personaje

### 2.1 Rangos

✅ El aspecto del caballero cambia con cada rango (armadura, capa, corona, etc.).

✅ Rangos según el **nivel general**:

| Nivel   | Rango         | Tiempo aprox. para llegar (🟡) |
|---------|---------------|--------------------------------|
| 1–4     | Soldado raso  | inicio                         |
| 5–9     | Escudero      | ~1,5 semanas                   |
| 10–14   | Caballero     | ~3 semanas                     |
| 15–19   | Capitán       | ~6 semanas                     |
| 20–29   | Comandante    | ~2 meses                       |
| 30–39   | Señor feudal  | ~3,5 meses                     |
| 40–49   | Duque         | ~6 meses                       |
| 50–59   | Rey           | ~8,5 meses                     |
| 60+     | Emperador     | **~12 meses**                  |

Los tiempos salen de la fórmula de la sección 4. Suponen que cumplo más o menos
el 85 % de mis hábitos y que mantengo la racha de mínimos. Los jefes finales
acortan el camino, y comprar pociones y multiplicadores lo alarga.

✅ Después del nivel 60 se puede seguir subiendo de nivel (el rango sigue siendo Emperador).

✅ Si bajo de nivel (ver 6.1) y caigo por debajo del mínimo de mi rango, **pierdo el rango** y el caballero vuelve a su aspecto anterior.

### 2.2 Aspecto (sprites)

✅ Para empezar, **sprites sencillos hechos con código**: un caballero en pixel art
dibujado con cuadraditos, con una variante por rango. Más adelante se pueden
cambiar por dibujos más elaborados.

✅ Sombreros y accesorios: se añaden **más adelante** (no en la primera versión).

### 2.3 Estadísticas

✅ 4 estadísticas: **Cuerpo, Espíritu, Mente, Creatividad**.

✅ Cada estadística tiene **su propio nivel y su propia barra de XP**, además del nivel general.

✅ Cuando gano XP en un hábito, ese XP cuenta **a la vez** para la estadística del hábito y para el nivel general.

🟡 Fórmula de nivel de estadística: pasar del nivel `N` al `N+1` cuesta `50 + 10 × N` XP.

---

## 3. Hábitos (enemigos)

### 3.1 Reglas generales

✅ Cada hábito está ligado a **una** estadística.

✅ Hay una **pantalla de configuración** donde puedo **agregar, editar y borrar**
hábitos: nombre, estadística, dificultad, frecuencia y si es mínimo o no.

✅ Frecuencias posibles: **diaria**, **semanal** (X veces por semana) y **mensual** (X veces por mes).

🟡 Cada vez que marco un hábito semanal o mensual recibo su XP. La cuenta
("iglesia: 2/3 esta semana") sirve para los jefes de racha (ver 3.5).

🟡 Puedo desmarcar un hábito el mismo día si lo marqué por error (se devuelven el XP y el oro).

### 3.2 Hábitos sagrados (no se pueden quitar)

✅ Hay **4 hábitos fijos** que **no se pueden borrar** por más que quiera:

| Hábito sagrado                     | Estadística  | Frecuencia | Dificultad |
|------------------------------------|--------------|------------|------------|
| Leer la Biblia 10 min              | Espíritu     | Diaria     | Media      |
| Orar 30 min                        | Espíritu     | Diaria     | Media      |
| Ejercicios para enderezar la espalda | Cuerpo     | Diaria     | Media      |
| Escribir al menos una página       | Creatividad  | Diaria     | Media      |

🟡 En la configuración aparecen con un 🔒 candado. **No se pueden** borrar,
pausar, cambiar de dificultad ni cambiar de frecuencia. Tampoco se les puede
quitar la marca de mínimo, si la tienen (ver pregunta 1).

*Nota:* como los datos están en mi propio navegador, técnicamente siempre podría
hacer trampa tocando el código. El candado es un **compromiso de honor**: el juego
no ofrece ninguna forma de quitarlos.

### 3.3 Dificultad = tipo de enemigo

✅

| Dificultad | Enemigo          | XP al cumplir | Oro al cumplir | Vida que pierdo si no lo cumplo* |
|------------|------------------|---------------|----------------|----------------------------------|
| Fácil      | Enemigo común    | 10            | 5              | −5 HP                            |
| Media      | Enemigo élite    | 20            | 10             | −10 HP                           |
| Difícil    | Mini jefe        | 50            | 20             | −25 HP                           |

\* Solo quitan vida los **mínimos diarios** y las **misiones vencidas** (ver 5.1).

### 3.4 Hábitos iniciales

✅ Lista inicial (las dificultades que no diste son 🟡 propuestas mías):

| Hábito                               | Estadística  | Frecuencia         | Dificultad     | Mínimo | Sagrado |
|--------------------------------------|--------------|--------------------|----------------|--------|---------|
| Leer la Biblia 10 min                | Espíritu     | Diaria             | Media ✅       | ✅ Sí  | 🔒      |
| Orar 30 min                          | Espíritu     | Diaria             | Media ✅       | ❓     | 🔒      |
| Ejercicios para enderezar la espalda | Cuerpo       | Diaria             | Media ✅       | ✅ Sí  | 🔒      |
| Escribir al menos una página         | Creatividad  | Diaria             | Media ✅       | ❓     | 🔒      |
| Crema del acné en la noche           | Cuerpo       | Diaria             | Fácil 🟡       | ✅ Sí  |         |
| Actividad física 20 min              | Cuerpo       | Diaria             | Media 🟡       | ✅ Sí  |         |
| Levantarme a la misma hora           | Cuerpo       | Diaria             | Media 🟡       | No     |         |
| Comer a horas decentes               | Cuerpo       | Diaria             | Fácil 🟡       | No     |         |
| Ir a la iglesia                      | Espíritu     | 3 × semana         | Media 🟡       | No     |         |
| Aprender algo nuevo 30 min           | Creatividad  | Diaria             | Media 🟡       | No     |         |
| Tareas de la universidad             | Mente        | Misiones (ver 3.6) | Según la tarea | —      |         |

✅ Los **mínimos diarios** son configurables (salvo lo que diga la pregunta 1 sobre los sagrados).

### 3.5 Jefes finales

✅ Misiones grandes con **su propia barra de vida**. Dan **mucha XP** y una **recompensa especial**.

✅ Hay dos tipos de jefe:

1. **Jefe por subtareas.** Divido la misión en subtareas. Cada subtarea completada le quita vida al jefe. Cuando todas están hechas, el jefe cae.
   - Ejemplos: *Terminar la tesis*, *Escribir el guion del cortometraje*.
2. **Jefe por racha.** Está ligado a un hábito. Recibe daño cada vez que cumplo la meta de ese hábito, y se **cura por completo** si rompo la racha.
   - Ejemplo: *Un mes de racha yendo a la iglesia* = 4 semanas seguidas cumpliendo 3/3.

✅ Cada jefe tiene una estadística y un tamaño:

| Tamaño  | XP al derrotarlo | Oro | Ejemplo            |
|---------|------------------|-----|--------------------|
| Pequeño | 200              | 50  | Un mes de iglesia  |
| Grande  | 500              | 120 | Guion del corto    |
| Épico   | 1000             | 250 | La tesis           |

✅ Cada subtarea da además el XP y el oro de un enemigo común (10 XP, 5 de oro).

✅ La **recompensa especial** de cada jefe la escribo yo al crearlo.

🟡 Un jefe puede tener **fecha límite** (opcional). Si vence sin derrotarlo, ver 5.1.

### 3.6 Misiones de la universidad (Mente)

✅ Las tareas de la universidad son **misiones con fecha de entrega**. Al crear una
misión elijo su tamaño (pequeña / mediana / grande = común / élite / mini jefe).
Si es muy grande, la convierto en jefe final.

✅ Si la fecha de entrega pasa sin completarla, **pierdo vida según su tamaño** (ver 5.1).

🟡 Después de vencer, la misión queda marcada como **"fallida"**. Todavía puedo
completarla, pero solo recibo la **mitad** de XP y oro.

---

## 4. Experiencia (XP) y nivel general

✅ Todo el XP ganado (de cualquier estadística) suma al nivel general.

🟡 Fórmula: pasar del nivel `N` al `N+1` cuesta **`250 + 40 × N` XP**.
Está ajustada para que llegar a Emperador (nivel 60) tome más o menos un año.

| Nivel | XP para el siguiente | XP total acumulado para llegar |
|-------|----------------------|--------------------------------|
| 1     | 290                  | 0                              |
| 5     | 450                  | 1 400                          |
| 10    | 650                  | 4 050                          |
| 20    | 1 050                | 12 350                         |
| 30    | 1 450                | 24 650                         |
| 40    | 1 850                | 40 950                         |
| 50    | 2 250                | 61 250                         |
| 60    | 2 650                | 85 550                         |

*Cálculo:* con los hábitos iniciales y los nuevos valores, un día perfecto da unos
190 XP y unos 95 de oro. Cumpliendo el ~85 % son unos 160 XP y 80 de oro al día. Con
el bonus máximo de racha (+50 %) se llega a unos 240 XP. Eso da ~12 meses hasta el nivel 60.

✅ Si gasto XP en la tienda, **puedo bajar de nivel** (ver 6.1).

---

## 5. Vida (HP)

✅ Vida máxima: **100 HP**.

✅ La vida **no se recupera sola**, solo con la **poción de vida** (ver 6.1).

✅ **No hay modo descanso.** Si un día estoy enfermo o mal, el daño se paga con
pociones. La única protección es la **poción de descanso**, que se compra (ver 6.2).

✅ **Reinicio del día: 3:00 a.m.** Lo que marque entre las 00:00 y las 02:59 cuenta para el día anterior.

### 5.1 Qué quita vida

✅ Pierdo vida por cada cosa que no complete, **según su tamaño**:

| Qué no cumplí                          | Cuándo se aplica            | Daño                       |
|----------------------------------------|-----------------------------|----------------------------|
| Mínimo diario fácil                    | Reinicio de las 3:00 a.m.   | −5 HP                      |
| Mínimo diario medio                    | Reinicio de las 3:00 a.m.   | −10 HP                     |
| Mínimo diario difícil                  | Reinicio de las 3:00 a.m.   | −25 HP                     |
| Misión pequeña vencida                 | Al pasar la fecha de entrega | −5 HP                     |
| Misión mediana vencida                 | Al pasar la fecha de entrega | −10 HP                    |
| Misión grande vencida                  | Al pasar la fecha de entrega | −25 HP                    |
| Jefe final con fecha límite vencida 🟡 | Al pasar la fecha límite    | −50 HP                     |

🟡 Los hábitos que **no** son mínimos no quitan vida (solo dejan de dar XP y oro).

**Ejemplo:** con los mínimos actuales (Biblia, espalda y actividad física medios;
crema fácil), un día sin cumplir ninguno quita **35 HP**. Si orar y escribir también
fueran mínimos, serían **55 HP**: dos días malos seguidos me dejarían casi muerto.

---

## 6. Tienda

✅ Todo en la tienda es **caro a propósito**: se paga con **XP y oro a la vez**,
para que cada error cueste parte del esfuerzo ya hecho.

| Objeto                   | Efecto                                              | Precio                  |
|--------------------------|-----------------------------------------------------|-------------------------|
| **Poción de vida**       | Llena la vida al **máximo** (100 HP)                | **200 XP + 1 000 oro**  |
| **Poción de descanso**   | Ese día **no pierdo vida** aunque no haga nada      | **100 XP + 300 oro**    |
| **Multiplicador de XP**  | Multiplica el XP ganado (ver pregunta 2)            | **200 XP + 1 000 oro**  |

Con unos 80 de oro al día, una poción de vida cuesta **~12 días de oro**, una de
descanso **~4 días** y un multiplicador **~12 días**.

### 6.1 Poción de vida y bajar de nivel

✅ El XP se resta del **XP total**, así que **puedo bajar de nivel**, e incluso de rango.

🟡 Para que esto no se pueda aprovechar mal:
- El XP se resta **solo del nivel general**. Los niveles de las estadísticas no bajan, porque reflejan lo que realmente hice.
- **Las recompensas reales se cobran una sola vez por nivel.** El juego guarda mi **nivel récord**. Si bajo del 31 al 29 y vuelvo a subir al 30, no me toca otra recompensa: solo al superar mi récord.
- No se puede comprar si no tengo suficiente XP y oro. (No existe XP negativo: el mínimo es nivel 1 con 0 XP).

### 6.2 Poción de descanso

✅ Protege un día entero: esa noche, a las 3:00 a.m., **no pierdo vida**.

🟡 Reglas:
- Hay que **tomarla antes** del reinicio de las 3:00 a.m. del día que quiero proteger. No sirve para días que ya pasaron.
- Protege también de las misiones que venzan ese día.
- La **racha no se rompe**, pero ese día tampoco suma a la racha (queda "congelada").
- Se pueden comprar por adelantado y guardar en el inventario.

### 6.3 Multiplicador de XP

✅ Se vende en la tienda por 200 XP + 1 000 oro. ❓ Falta decidir cuánto multiplica y cuánto dura (pregunta 2).

🟡 Se combina multiplicando con el bonus de racha (ejemplo: racha +50 % × multiplicador ×2 = ×3).

### 6.4 Oro

✅ Se gana oro al derrotar enemigos (tabla 3.3) y jefes (tabla 3.5).
✅ El oro se usa para pociones, multiplicadores y, más adelante, sombreros y accesorios.

---

## 7. Rachas

✅ Una racha es la cantidad de **días seguidos cumpliendo todos los mínimos**.
✅ Da **+10 % de XP por cada 7 días** de racha, con un **tope de +50 %** (a partir de 35 días).
✅ La racha se rompe con **un solo** mínimo no cumplido, y el bonus vuelve a 0 %.
✅ Un día protegido con poción de descanso no rompe la racha, pero tampoco la aumenta.

---

## 8. Recompensas de la vida real

✅ **Pequeña** cada 5 niveles y **grande** con cada cambio de rango. Todas editables.

✅ **Cuando coinciden** (niveles 5, 10, 15, 20, 30, 40, 50 y 60): recibo **las dos**.

✅ Ejemplos iniciales:
- **Pequeñas:** ver una película, comer algo que me guste, una salida.
- **Grandes:** cuerdas nuevas para la guitarra, un curso de colorización, un accesorio para la cámara.

🟡 Funcionamiento: cada tipo de recompensa es una **lista ordenada** que edito en
la configuración. Al llegar a un nivel récord, el juego me muestra la siguiente
de la lista y un botón **"Reclamar"** para marcar que ya me la di. Queda un
historial de recompensas cobradas.

🟡 Hay 8 cambios de rango y solo 3 recompensas grandes de ejemplo. Si una lista
se acaba, el juego me avisa para que añada más.

---

## 9. Muerte

✅ Si la vida llega a 0, **muero**.

✅ La penalización es **configurable**. Por defecto es **Hardcore**:

| Modo              | Qué pierdo |
|-------------------|------------|
| **Hardcore** ✅ (por defecto) | **Todo**: nivel general, niveles de estadísticas, XP, oro, objetos, racha y nivel récord |
| Duro 🟡           | Vuelvo al inicio de mi rango actual y pierdo oro y objetos |
| Suave 🟡          | Pierdo la mitad del oro y los objetos, sin bajar de nivel |

🟡 Tras morir la vida vuelve a 100 HP. **No se borra** la configuración: hábitos
(incluidos los sagrados), mínimos, lista de recompensas y jefes, con las
subtareas que ya hice. Los jefes vuelven a dar su XP cuando los termine.

🟡 Como el nivel récord también se pierde, **las recompensas reales se pueden volver a ganar** después de morir.

🟡 Queda registrado un **historial de muertes** (fecha y nivel alcanzado), como en los juegos *roguelike*.

---

## 10. Aspectos técnicos

✅ Se juega en el navegador del PC.
✅ Personaje con sprites sencillos hechos con código.
🟡 HTML + CSS + JavaScript, sin servidor ni instalación.
🟡 Los datos se guardan en el navegador (`localStorage`).
🟡 **Exportar e importar una copia de seguridad** (un archivo `.json`). Si limpio los
datos del navegador, se borra la partida. Sería una "muerte" que no merecí.

🟡 **Días en que no abro el juego:** una página web solo funciona mientras está
abierta. Por eso, al abrirla, el juego revisa todos los reinicios de las 3:00 a.m.
y las fechas de entrega que pasaron desde la última vez, y aplica a cada uno el
daño y las rachas que correspondan.

---

## 11. Preguntas abiertas

1. **Sagrados y mínimos:** Biblia y espalda ya eran mínimos. ¿**Orar 30 min** y **escribir una página** también deben ser mínimos (quitar vida si no los hago)? Si la respuesta es sí, un día sin hacer nada quitaría 55 HP en vez de 35.
2. **Multiplicador de XP:** con 200 XP de precio, un multiplicador ×2 que dure **un solo día** me haría **perder** XP: gano unos +160 extra y pago 200. Propuesta: **×2 durante 7 días** (unos +1 100 XP extra, ganancia neta de ~900). ¿Te parece, u otra combinación?
3. **Confirmar los 🟡 que quedan:** jefe vencido −50 HP, misión fallida a mitad de XP, la poción de descanso protege también de misiones vencidas, y las dificultades propuestas para los hábitos no sagrados.
