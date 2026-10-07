# EcoPulse — Tokens de diseño

## Concepto visual

Noche urbana con pulsos de datos: fondo casi negro con un leve tinte azul,
paneles de vidrio translúcido y dos acentos —violeta y turquesa— que
representan la lectura de sensores en vivo, contrastados con ámbar para
alertas moderadas.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0b0f1a` | Fondo base |
| `--color-bg-elevated` | `#111726` | Secciones alternas (galería) |
| `--color-glass` | `rgba(255,255,255,0.055)` | Paneles y tarjetas |
| `--color-text` | `#e9edf4` | Texto principal |
| `--color-text-muted` | `#93a0b4` | Texto secundario |
| `--color-accent-teal` | `#35d6bd` | Aire / positivo / marca |
| `--color-accent-violet` | `#8c7bff` | Marca / agua |
| `--color-accent-amber` | `#f2b545` | Ruido / advertencia moderada |
| `--color-accent-rose` | `#ff7a90` | Errores de formulario |

## Tipografía

- **Space Grotesk** — titulares (H1–H3), valores numéricos de métricas.
  Carácter técnico, geométrico, apropiado para un panel de datos.
- **Plus Jakarta Sans** — cuerpo de texto, formularios, navegación.
  Más neutra y legible en párrafos largos.

Escala: H1 `clamp(2.25rem, 5vw + 1rem, 4rem)` → H2 `clamp(1.75rem, 3vw + 1rem, 2.75rem)`
→ cuerpo `1rem`.

## Layout

- Grid de 4 columnas en escritorio para métricas y galería, colapsando a
  `auto-fit, minmax(240px, 1fr)` en pantallas intermedias y a una sola
  columna en móvil.
- Alineación predominante a la izquierda (no centrada), para reforzar la
  sensación de panel de control en vez de landing page de marketing.
- Un solo momento de animación no disparado por el usuario: los contadores
  del hero suben de 0 a su valor final una sola vez al cargar. Todo lo
  demás (hover de tarjetas, menú móvil) responde a una acción del usuario.

## Principios

1. Los datos son el protagonista — la tipografía numérica (Space Grotesk)
   siempre es más grande y más oscura en peso que su etiqueta.
2. El glassmorphism es funcional, no decorativo: separa capas de
   información (fondo de video → contenido → tarjetas), no se aplica a
   todo por igual.
3. Ámbar se reserva exclusivamente para estados de advertencia — nunca se
   usa como acento decorativo en otras zonas de la interfaz.
