# Documento de diseño — RPG de hábitos

> **Estado:** borrador v0.2. La mayoría de las reglas ya están decididas; quedan
> unas pocas preguntas al final.
>
> **Leyenda:**
> ✅ = decidido · 🟡 = propuesta (se puede cambiar) · ❓ = falta decidir

---

## 1. Concepto

✅ Un juego web de uso personal que convierte mis hábitos en un RPG. Mi
personaje es un **caballero en pixel art** que asciende, como en una película,
de **soldado raso a emperador** a medida que cumplo mis hábitos.

- Cumplir un hábito = **derrotar a un enemigo** y ganar XP.
- Las misiones grandes son **jefes finales** con su propia barra de vida.
- Si no cumplo mis **mínimos diarios**, pierdo vida. Si la vida llega a 0, **muero** y pierdo mi progreso.

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
| 15–19   | Capitán       | ~5–6 semanas                   |
| 20–29   | Comandante    | ~2 meses                       |
| 30–39   | Señor feudal  | ~3,5 meses                     |
| 40–49   | Duque         | ~5,5 meses                     |
| 50–59   | Rey           | ~8 meses                       |
| 60+     | Emperador     | **~11,5 meses**                |

Los tiempos salen de la fórmula de la sección 4. Suponen que cumplo más o menos
el 85 % de mis hábitos y que mantengo la racha de mínimos. Los jefes finales y
los multiplicadores de la tienda acortan el camino.

✅ Después del nivel 60 se puede seguir subiendo de nivel (el rango sigue siendo Emperador).

### 2.2 Accesorios

✅ Al personaje se le pueden poner sombreros y accesorios. Se añaden a la tienda **más adelante** (no en la primera versión).

### 2.3 Estadísticas

✅ 4 estadísticas: **Cuerpo, Espíritu, Mente, Creatividad**.

✅ Cada estadística tiene **su propio nivel y su propia barra de XP**, además del nivel general.

✅ Cuando gano XP en un hábito, ese XP cuenta **a la vez** para la estadística del hábito y para el nivel general.

🟡 Fórmula de nivel de estadística: pasar del nivel `N` al `N+1` cuesta `50 + 10 × N` XP.
Como cada estadística recibe solo parte del XP, su curva es más barata que la del nivel general.

---

## 3. Hábitos (enemigos)

### 3.1 Reglas generales

✅ Cada hábito está ligado a **una** estadística.

✅ Todo se puede **agregar, editar y borrar** desde una **pantalla de configuración**:
hábitos, estadística, dificultad, frecuencia y si es mínimo o no.

✅ Frecuencias posibles: **diaria**, **semanal** (X veces por semana) y **mensual** (X veces por mes).

🟡 Cada vez que marco un hábito semanal o mensual recibo su XP. Llevar la cuenta
(por ejemplo "iglesia: 2/3 esta semana") sirve para los jefes de racha (ver 3.4).

🟡 Puedo desmarcar un hábito el mismo día si lo marqué por error (se devuelve el XP y el oro).

### 3.2 Dificultad = tipo de enemigo

✅

| Dificultad | Enemigo          | XP  | Oro (🟡) |
|------------|------------------|-----|---------|
| Fácil      | Enemigo común    | 10  | 2       |
| Media      | Enemigo élite    | 20  | 5       |
| Difícil    | Mini jefe        | 40  | 10      |

### 3.3 Hábitos iniciales

✅ Lista inicial (dificultad 🟡 propuesta por mí, se puede cambiar en la configuración):

| Hábito                                 | Estadística  | Frecuencia    | Dificultad (🟡) | Mínimo |
|----------------------------------------|--------------|---------------|-----------------|--------|
| Ejercicios para enderezar la espalda   | Cuerpo       | Diaria        | Fácil           | ✅ Sí  |
| Crema del acné en la noche             | Cuerpo       | Diaria        | Fácil           | ✅ Sí  |
| Actividad física 20 min                | Cuerpo       | Diaria        | Media           | ✅ Sí  |
| Levantarme a la misma hora             | Cuerpo       | Diaria        | Media           | No     |
| Comer a horas decentes                 | Cuerpo       | Diaria        | Fácil           | No     |
| Leer la Biblia 10 min                  | Espíritu     | Diaria        | Fácil           | ✅ Sí  |
| Orar 30 min                            | Espíritu     | Diaria        | Media           | No     |
| Ir a la iglesia                        | Espíritu     | 3 × semana    | Media           | No     |
| Aprender algo nuevo 30 min             | Creatividad  | Diaria        | Media           | No     |
| Tareas de la universidad               | Mente        | Misiones (ver 3.5) | Según la tarea | No |

✅ Los **mínimos diarios** también son configurables.

### 3.4 Jefes finales

✅ Misiones grandes con **su propia barra de vida**. Dan **mucha XP** y una **recompensa especial**.

🟡 Hay dos tipos de jefe:

1. **Jefe por subtareas.** Divido la misión en subtareas. Cada subtarea completada le quita vida al jefe. Cuando todas están hechas, el jefe cae.
   - Ejemplos: *Terminar la tesis*, *Escribir el guion del cortometraje*.
2. **Jefe por racha.** Está ligado a un hábito. Recibe daño cada vez que cumplo la meta de ese hábito, y se **cura por completo** si rompo la racha.
   - Ejemplo: *Un mes de racha yendo a la iglesia* = 4 semanas seguidas cumpliendo 3/3.

🟡 Cada jefe tiene una estadística y un tamaño:

| Tamaño  | XP al derrotarlo | Oro | Ejemplo            |
|---------|------------------|-----|--------------------|
| Pequeño | 200              | 50  | Un mes de iglesia  |
| Grande  | 500              | 120 | Guion del corto    |
| Épico   | 1000             | 250 | La tesis           |

🟡 Cada subtarea da además el XP de un enemigo común (10 XP).

✅ La **recompensa especial** de cada jefe la escribo yo al crearlo.

### 3.5 Misiones de la universidad (Mente)

✅ Las tareas de la universidad son **misiones con fecha de entrega**.

🟡 Al crear una misión elijo su dificultad (común / élite / mini jefe). Si es muy grande, la convierto en jefe final.

---

## 4. Experiencia (XP) y nivel general

✅ Todo el XP ganado (de cualquier estadística) suma al nivel general.

🟡 Fórmula: pasar del nivel `N` al `N+1` cuesta **`200 + 30 × N` XP**.
Está ajustada para que llegar a Emperador (nivel 60) tome unos 11–12 meses.

| Nivel | XP para el siguiente | XP total acumulado para llegar |
|-------|----------------------|--------------------------------|
| 1     | 230                  | 0                              |
| 5     | 350                  | 1 100                          |
| 10    | 500                  | 3 150                          |
| 20    | 800                  | 9 500                          |
| 30    | 1 100                | 18 850                         |
| 40    | 1 400                | 31 200                         |
| 50    | 1 700                | 46 550                         |
| 60    | 2 000                | 64 900                         |

*Cálculo:* con los hábitos iniciales, un día perfecto da unos 150 XP. Cumpliendo el
~85 % son unos 128 XP al día, y con la racha se llega a unos 190. Eso da ~11,5 meses
hasta el nivel 60.

---

## 5. Vida (HP)

✅ La vida solo baja por **no cumplir mínimos diarios**.

🟡 Vida máxima: **100 HP**.
🟡 Al reiniciarse el día pierdo **10 HP por cada mínimo no cumplido**. Con 4 mínimos, un día sin cumplir ninguno quita 40 HP.

✅ La vida **no se recupera sola**, solo con **pociones** (ver 6).

✅ **Reinicio del día: 3:00 a.m.** Lo que marque entre las 00:00 y las 02:59 cuenta para el día anterior.

---

## 6. Tienda

### 6.1 Pociones de vida (se pagan con XP)

✅ Las pociones se pagan con XP.

**Problema:** si pagar con XP resta de mi XP total, puedo **bajar de nivel**, e
incluso **perder un rango**. Eso tiene varias consecuencias raras:
- El personaje "pierde" armadura por comprar una poción.
- Podría volver a cobrar una recompensa real de un nivel que ya había alcanzado.
- Puede sentirse como un castigo doble: me quedo sin vida y encima bajo de nivel.

**Opciones:**

| Opción | Cómo funciona | Pros | Contras |
|--------|---------------|------|---------|
| A. Restar del XP total | Se resta y puedo bajar de nivel | Muy simple | Los problemas de arriba |
| **B. Solo XP de la barra actual** 🟡 **(recomendada)** | Solo puedo gastar el XP que llevo **dentro de mi nivel actual**. La barra retrocede, pero **nunca bajo de nivel** | Hay un costo real (tardo más en subir) y nunca pierdo rango | Justo después de subir de nivel la barra está casi vacía y no me alcanza |
| C. Dos contadores | "XP total" (define el nivel, nunca baja) y "XP gastable" | Nunca bajo de nivel | En la práctica es otra moneda igual al oro |

🟡 Propuesta con la opción B:
- **Poción de vida:** +25 HP, cuesta **150 XP** (aprox. un día de hábitos).
- Puedo **comprar pociones por adelantado** y guardarlas en el inventario, para no quedarme sin XP en la barra justo cuando lo necesito.

### 6.2 Multiplicadores de XP

✅ La tienda vende multiplicadores de XP.

🟡 Se pagan con **oro**:
- **Multiplicador ×1,5** hasta el siguiente reinicio del día (3:00 a.m.): 100 de oro.
- **Multiplicador ×2** hasta el siguiente reinicio: 250 de oro.
- 🟡 Se combinan multiplicando con el bonus de racha (ejemplo: racha +20 % × poción ×1,5 = ×1,8).

### 6.3 Oro

🟡 Se gana oro al derrotar enemigos (tabla 3.2) y jefes (tabla 3.4).
Con los hábitos iniciales son unos 30 de oro al día.
🟡 El oro se usa para los multiplicadores y, más adelante, para sombreros y accesorios.

---

## 7. Rachas

✅ Una racha es la cantidad de **días seguidos cumpliendo todos los mínimos**.
✅ Da **+10 % de XP por cada 7 días** de racha.
🟡 **Tope: +50 %** (a partir de 35 días). Sin tope, al cabo de un año el bonus
sería de +520 % y el ritmo de la sección 4 dejaría de tener sentido.
🟡 La racha se rompe con **un solo** mínimo no cumplido, y el bonus vuelve a 0 %.

---

## 8. Recompensas de la vida real

✅ **Pequeña** cada 5 niveles y **grande** con cada cambio de rango. Todas editables.

✅ Ejemplos iniciales:
- **Pequeñas:** ver una película, comer algo que me guste, una salida.
- **Grandes:** cuerdas nuevas para la guitarra, un curso de colorización, un accesorio para la cámara.

🟡 **Cuando coinciden** (niveles 5, 10, 15, 20, 30, 40, 50, 60 son múltiplos de 5 *y*
cambios de rango): recibo **solo la grande**. Por eso las pequeñas salen en los
niveles 25, 35, 45, 55, 65…

🟡 Funcionamiento: cada tipo de recompensa es una **lista ordenada** que edito en
la configuración. Al llegar al nivel, el juego me muestra la siguiente de la
lista y un botón **"Reclamar"** para marcar que ya me la di. Queda un historial
de recompensas cobradas.

🟡 Hay 8 cambios de rango y solo 3 recompensas grandes de ejemplo. Si la lista se
acaba, el juego me avisa para que añada más.

---

## 9. Muerte

✅ Si la vida llega a 0, **muero**.

✅ La penalización es **configurable**. Por defecto (elegida por mí) es **Hardcore**:

| Modo (🟡 nombres)   | Qué pierdo |
|---------------------|------------|
| **Hardcore** ✅ (por defecto) | **Todo**: nivel general, niveles de estadísticas, XP, oro, objetos, racha |
| Duro                | Vuelvo al inicio de mi rango actual y pierdo oro y objetos |
| Suave               | Pierdo la mitad del oro y los objetos, sin bajar de nivel |

🟡 Tras morir la vida vuelve a 100 HP. **No se borra** la configuración: hábitos,
mínimos, lista de recompensas y jefes (con sus subtareas hechas, porque la tesis
sigue avanzada en la vida real). Los jefes vuelven a dar su XP cuando los termine.

🟡 Queda registrado un **historial de muertes** (fecha y nivel alcanzado), como en los juegos *roguelike*.

---

## 10. Aspectos técnicos

✅ Se juega en el navegador del PC.
🟡 HTML + CSS + JavaScript, sin servidor ni instalación.
🟡 Los datos se guardan en el navegador (`localStorage`).
🟡 **Exportar e importar una copia de seguridad** (un archivo `.json`). Si limpio los
datos del navegador, se borra la partida. Sería una "muerte" que no merecí.

🟡 **Días en que no abro el juego:** una página web solo funciona mientras está
abierta. Por eso, al abrirla, el juego revisa todos los reinicios de las 3:00 a.m.
que pasaron desde la última vez y aplica a cada uno el daño y las rachas que
correspondan.

---

## 11. Preguntas abiertas

1. **Pociones:** ¿aceptas la **opción B** (solo se gasta el XP de la barra actual y nunca se baja de nivel)? ¿Te parecen bien +25 HP por 150 XP?
2. **Oro:** en tus respuestas no lo mencionaste. ¿Lo mantengo para los multiplicadores y los accesorios, o quieres que **todo** se pague con XP?
3. **Tope de racha:** ¿aceptas el tope de +50 %? Si no, llegarás a Emperador mucho antes de un año.
4. **Fecha de entrega vencida:** ¿qué pasa si una misión de la universidad vence sin completarse? (Sugerencia: pierdes 10 HP y la misión queda marcada como "fallida", pero puedes seguir completándola por la mitad de XP).
5. **Días especiales:** ¿quieres un **modo descanso** para días de enfermedad o viaje, en el que los mínimos no quiten vida (con un límite, por ejemplo 3 días al mes)? En modo Hardcore, una gripe fuerte de 3 días podría matarte.
6. **Recompensas que coinciden:** en los niveles con cambio de rango, ¿solo la grande (mi propuesta) o las dos?
7. **Pixel art:** ¿quién hace los dibujos del caballero (9 rangos)? Opciones: dibujarlos tú, usar recursos gratuitos de internet o que yo genere sprites sencillos con código para empezar.
8. **Confirmar valores 🟡:** 100 HP, −10 HP por mínimo, oro por enemigo, XP de los jefes y dificultades de los hábitos iniciales. ¿Algo que cambiar?
