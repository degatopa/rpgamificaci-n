# Documento de diseño — RPG de hábitos

> **Estado:** borrador v0.1 — faltan decisiones (ver sección "Preguntas abiertas").
>
> **Leyenda:**
> ✅ = decidido · 🟡 = propuesta (se puede cambiar) · ❓ = falta decidir

---

## 1. Concepto

✅ Un juego web de uso personal que convierte mis hábitos diarios en un RPG.
Tengo un personaje en pixel art que mejora cuando cumplo mis hábitos y sufre
cuando no cumplo los mínimos del día.

**Objetivo del juego:** que sea motivador cumplir hábitos, y que fallar tenga
una consecuencia visible pero no tan dura como para abandonar.

---

## 2. El personaje

✅ Personaje en pixel art.

✅ Tiene 4 estadísticas:

| Estadística     | Qué representa (🟡 propuesta)              | Ejemplos de hábitos            |
|-----------------|--------------------------------------------|--------------------------------|
| **Cuerpo**      | Salud física                               | Ejercicio, dormir 8h, beber agua |
| **Espíritu**    | Bienestar emocional, calma, relaciones     | Meditar, llamar a un amigo     |
| **Mente**       | Aprendizaje, estudio, orden                | Leer, estudiar, programar      |
| **Creatividad** | Crear cosas                                | Dibujar, escribir, música      |

❓ ¿Cada estadística tiene su propio nivel, o solo un número de puntos?
❓ ¿El aspecto del personaje cambia al subir de nivel o al comprar objetos?

---

## 3. Hábitos

✅ Cada hábito está ligado a **una** estadística y da XP al cumplirlo.

🟡 Tipos de hábito:
- **Mínimos diarios:** los que *tengo* que hacer cada día. Si no los cumplo, pierdo vida.
- **Extra:** opcionales. Dan XP y oro, pero no quitan vida si no los hago.

🟡 Dificultad de cada hábito (define cuánto da):

| Dificultad | XP  | Oro |
|------------|-----|-----|
| Fácil      | 10  | 2   |
| Media      | 20  | 5   |
| Difícil    | 40  | 10  |

❓ Frecuencia: ¿solo diarios, o también semanales (ej. "ir al gimnasio 3 veces por semana")?
❓ ¿Puedo marcar un hábito varias veces al día (ej. "beber un vaso de agua" x8)?

---

## 4. Experiencia (XP) y nivel general

✅ Hay un **nivel general** del personaje.

🟡 Todo el XP que gano (de cualquier estadística) suma al nivel general.

🟡 Fórmula para subir de nivel: para pasar del nivel `N` al `N+1` hacen falta
`100 × N` XP. Ejemplo:

| Nivel | XP necesario para el siguiente |
|-------|--------------------------------|
| 1 → 2 | 100                            |
| 2 → 3 | 200                            |
| 5 → 6 | 500                            |

(Así cada nivel cuesta un poco más que el anterior.)

---

## 5. Vida (HP)

✅ Hay una barra de vida que baja si no cumplo mis hábitos mínimos del día.

🟡 Vida máxima: **100 HP**.
🟡 Al terminar el día, pierdo **10 HP por cada hábito mínimo no cumplido**.
❓ ¿Cómo se recupera vida? (ver preguntas)
❓ ¿Qué pasa si la vida llega a 0?
❓ ¿A qué hora "termina" el día? (medianoche u otra hora)

---

## 6. Oro y tienda

✅ Gano oro y lo gasto en objetos.

❓ ¿Qué tipo de objetos hay? (cosméticos, pociones de vida, recompensas reales…)
❓ ¿Cuánto cuestan?

---

## 7. Recompensas de la vida real

✅ Al subir de nivel desbloqueo una recompensa de la vida real.

🟡 Yo mismo escribo la lista de recompensas (ej. nivel 5 → ir al cine).
❓ ¿Una recompensa en cada nivel o solo en algunos (cada 5 niveles)?

---

## 8. Aspectos técnicos

🟡 Se juega en el navegador (HTML + CSS + JavaScript), sin servidor.
🟡 Los datos se guardan en el propio navegador (`localStorage`).
❓ ¿Lo usaré desde el móvil, el ordenador o ambos?

---

## 9. Preguntas abiertas

*(Se irán respondiendo y moviendo a las secciones de arriba.)*

1. Estadísticas: ¿nivel propio por estadística o solo puntos?
2. Frecuencia de los hábitos: ¿diarios, semanales, repetibles?
3. Vida: ¿cómo se recupera? ¿qué pasa al llegar a 0?
4. Hora de fin del día.
5. Tipos de objetos de la tienda.
6. Frecuencia de recompensas reales.
7. Dispositivo principal (móvil / ordenador).
8. Rachas (días seguidos cumpliendo): ¿dan bonus?
9. Estilo visual: colores, tipo de personaje (caballero, mago, animal…).
