# SPEC 03 — Página «Acerca de» con formulario de contacto vía Resend

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-23
> **Objetivo:** Portar la página «Acerca de» de `references/home-about/about.jsx` a `/about` y hacer que su formulario de contacto envíe un correo real al equipo con Resend.

## Por qué existe este spec

El SPEC 02 portó el home de `references/home-about/` y dejó fuera, a propósito, la página «Acerca de» y su link. Este spec la agrega.

La referencia (`about.jsx` y `styles.css`, líneas 1071–1146) tiene tres bloques: un hero con la misión y tres tarjetas destacadas, un divisor de píxeles parpadeantes y una sección de contacto con formulario. En la referencia el formulario es simulado: valida que los campos no estén vacíos y muestra una terminal verde de «mensaje recibido» sin enviar nada. Aquí el envío pasa a ser real: una Server Action valida los datos en el servidor y manda un correo al equipo con [Resend](https://resend.com).

Es la primera funcionalidad del proyecto que ejecuta código propio en el servidor y usa variables de entorno secretas. Todo lo demás sigue simulado en `localStorage`.

## Alcance

**Incluye:**

- **Ruta `/about`** con el título de pestaña `Acerca de · Arcade E1230` y tres bloques, en este orden:
  1. **Hero** (`about.jsx`, líneas 30–51): kicker «▸ ACERCA DE» en amarillo, título «ACERCA DE ARCADE E1230» con degradado blanco-cian, párrafo de misión y 3 tarjetas destacadas con ícono pixel en SVG: «HECHO CON ❤️ PARA JUGADORES» (rosa, `HEART`), «JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR» (cian, `BROWSER`) y «PROYECTO EN CONSTANTE CRECIMIENTO» (verde, `PLANT`). Las tarjetas se elevan en hover.
  2. **Divisor** (`about.jsx`, líneas 54–60): dos barras con degradado rosa y 24 píxeles en el centro que parpadean escalonados.
  3. **Contacto** (`about.jsx`, líneas 63–116): a la izquierda, kicker «▸ CONTACTO», título «CONTÁCTANOS», texto de invitación y 3 indicadores con LED («RESPUESTA EN 24-48H», «SUGERENCIAS BIENVENIDAS», «SIN SPAM, JAMÁS»). A la derecha, el panel del formulario con NOMBRE, CORREO ELECTRÓNICO, MENSAJE y el botón «▶ ENVIAR MENSAJE».
- **Textos idénticos a la referencia**, incluidos los placeholders (`px_kai`, `jugador@email.gg`, `Cuéntanos qué tienes en mente…`) y el emoji ❤️.
- **Reveal al hacer scroll** en el divisor y en la sección de contacto, reutilizando `Reveal` del SPEC 02. El hero no lleva reveal, igual que en la referencia.
- **Validación en cliente y servidor:** campos no vacíos (después de `trim`), correo con formato válido y largos máximos (nombre 60, correo 254, mensaje 2000). Si falla en el cliente, el formulario se sacude, los campos inválidos se marcan en rosa y no se llama al servidor.
- **Estado de envío:** mientras se espera al servidor, los campos y el botón se deshabilitan y el botón dice «▶ TRANSMITIENDO…».
- **Terminal de éxito** (la de la referencia, líneas 97–112): reemplaza al formulario cuando el correo se envió. El botón «ENVIAR OTRO MENSAJE» vuelve al formulario vacío.
- **Terminal de error** (nueva, mismo diseño en rosa): reemplaza al formulario si el envío falla. El botón «REINTENTAR» vuelve al formulario con los datos intactos.
- **Envío real con Resend** desde una Server Action: un solo correo a `CONTACT_TO_EMAIL`, con `replyTo` igual al correo del jugador, cuerpo en texto y en HTML simple con los valores escapados.
- **Honeypot anti-spam:** un campo oculto `website`. Si llega con valor, la acción responde éxito sin enviar nada.
- **Variables de entorno** `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL` en `.env.local`, documentadas en un `.env.example` versionado.
- **Navegación:** link «Acerca de» → `/about` como cuarto link del navbar y del menú móvil.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` no parpadean los píxeles del divisor ni el cursor `_`, y el formulario no se sacude (los campos inválidos igual se marcan en rosa).
- **Documentación:** actualizar la sección «Proyecto» de `CLAUDE.md` (ruta, estructura y variables de entorno).

**Fuera de alcance (para futuros specs):**

- Rate limiting por IP o por usuario, CAPTCHA o Turnstile.
- Correo de confirmación al jugador.
- Dominio propio verificado en Resend (el remitente se cambia solo con `CONTACT_FROM_EMAIL`).
- Guardar los mensajes en una base de datos o en `localStorage`.
- Plantillas con React Email.
- Autocompletar nombre o correo con la sesión simulada.
- El contador «CRÉDITOS · 03» y la moneda del navbar de la referencia.
- Mover `Reveal` fuera de `components/home/`.
- Modificar `specs/01-mvp-visual.md` o `specs/02-home-landing.md`.

## Rutas y archivos

```
app/
  about/page.tsx                (nuevo) Server Component: metadata y composición de la página
  about/actions.ts              (nuevo) Server Action sendContactMessage
  globals.css                   (cambia) keyframes e-shake y e-pxblink, tokens y reduced motion
components/
  about/    AboutHero.tsx, HighlightIcon.tsx, PixelDivider.tsx, ContactSection.tsx,
            ContactForm.tsx, ContactField.tsx, ContactTerminal.tsx
  layout/   nav-links.ts (cambia) link «Acerca de»
lib/
  contact.ts                    (nuevo) tipos, límites y validateContact (cliente y servidor)
  contact-email.ts              (nuevo) buildContactEmail: asunto, texto y HTML escapado
.env.example                    (nuevo) las 3 variables, vacías y comentadas
.gitignore                      (cambia) excepción !.env.example
package.json / package-lock.json (cambia) dependencia resend
CLAUDE.md                       (cambia) sección «Proyecto»
```

Convenciones:

- `app/about/page.tsx` es un Server Component que compone `AboutHero`, `PixelDivider` y `ContactSection`, envolviendo los dos últimos en `Reveal`.
- Solo `ContactForm.tsx` es componente cliente (`"use client"`), además de `Reveal`, que ya existe. `ContactField` y `ContactTerminal` no declaran `"use client"`: se usan solo dentro de `ContactForm`.
- `lib/contact.ts` no importa nada de servidor, porque lo usan el formulario y la acción. `lib/contact-email.ts` solo lo importa la acción.
- Los textos fijos de cada bloque (tarjetas destacadas, indicadores, líneas de la terminal) viven como constantes en su componente, igual que en el SPEC 02.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano, componentes en PascalCase y módulos sin JSX en kebab-case.

### Traducción de tokens de la referencia

Los estilos se toman de `references/home-about/styles.css` (líneas 1071–1146, más `.field` en 813–824) y se traducen a utilidades de Tailwind con estos tokens de `app/globals.css`:

| Referencia                      | Proyecto                               |
| ------------------------------- | -------------------------------------- |
| `--bg`                          | `background`                           |
| `--bg-2`                        | `surface`                              |
| `--line`                        | `border-neon`                          |
| `--ink`                         | `foreground`                           |
| `--ink-dim`                     | `muted`                                |
| `--ink-faint`                   | `subtle` (placeholders: `placeholder`) |
| `--cyan`, `--yellow`, `--green` | `cyan`, `yellow`, `green`              |
| `--magenta`                     | `pink`                                 |

Los colores de los puntos de la barra de la terminal (`#ff5f56`, `#ffbd2e`, `#27c93f`) y el fondo `#000` quedan como valores arbitrarios, porque solo se usan ahí.

## Modelo de datos

### Mensaje de contacto — `lib/contact.ts`

```ts
export interface ContactInput {
  name: string; // "px_kai"
  email: string; // "jugador@email.gg"
  message: string; // texto libre, puede tener saltos de línea
  website: string; // honeypot: siempre "" para humanos
}

export type ContactFieldName = "name" | "email" | "message";

export const CONTACT_LIMITS: Record<ContactFieldName, number> = {
  name: 60,
  email: 254,
  message: 2000,
};

export const EMPTY_CONTACT: ContactInput = { name: "", email: "", message: "", website: "" };

// Devuelve los campos inválidos en orden (name, email, message); [] si todo es válido
export function validateContact(input: ContactInput): ContactFieldName[];

export type ContactErrorCode = "invalid" | "config" | "send";

export type ContactResult = { status: "success" } | { status: "error"; code: ContactErrorCode };
```

Reglas de `validateContact` (todas sobre el valor con `trim`):

- Un campo es inválido si queda vacío o si supera su límite de `CONTACT_LIMITS`.
- `email` además es inválido si no cumple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- No mira `website`: el honeypot lo resuelve la acción.

Significado de cada `ContactErrorCode`:

| Código    | Cuándo                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `invalid` | La acción recibió datos con forma incorrecta o que no pasan la validación.                               |
| `config`  | Falta `RESEND_API_KEY` o `CONTACT_TO_EMAIL` en el servidor.                                              |
| `send`    | Resend devolvió un error, la llamada lanzó una excepción o la acción no pudo invocarse desde el cliente. |

`ContactResult` no devuelve datos del mensaje ni detalles del error de Resend: el cliente solo necesita saber qué terminal mostrar.

### Correo — `lib/contact-email.ts`

```ts
export interface ContactEmail {
  subject: string;
  text: string;
  html: string;
}

export function buildContactEmail(input: Pick<ContactInput, "name" | "email" | "message">): ContactEmail;
```

- `subject`: `[Arcade E1230] Nuevo mensaje de {name}`, con cualquier `\r` o `\n` del nombre reemplazado por un espacio.
- `text`: `Nombre: {name}\nCorreo: {email}\n\n{message}`.
- `html`: un bloque mínimo con «Nombre» y «Correo» en negrita y el mensaje en un `<p>` con `white-space: pre-wrap`. Los tres valores pasan por una función `escapeHtml` local que reemplaza `&`, `<`, `>`, `"` y `'`.

### Variables de entorno

| Variable             | Obligatoria | Uso                                                                                          |
| -------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Sí          | Clave de API de Resend. Solo se lee dentro de la Server Action.                              |
| `CONTACT_TO_EMAIL`   | Sí          | Correo que recibe los mensajes. En el entorno del usuario: su correo de la cuenta de Resend. |
| `CONTACT_FROM_EMAIL` | No          | Remitente. Si falta, se usa `Arcade E1230 <onboarding@resend.dev>`.                          |

Ninguna lleva el prefijo `NEXT_PUBLIC_`, así que Next no las incluye en el bundle del cliente.

### Estado del formulario — `components/about/ContactForm.tsx`

```ts
const [values, setValues] = useState<ContactInput>(EMPTY_CONTACT);
const [invalid, setInvalid] = useState<ContactFieldName[]>([]);
const [shake, setShake] = useState(false);
const [result, setResult] = useState<ContactResult | null>(null);
const [isPending, startTransition] = useTransition();
```

- `result === null` → se ve el formulario. `result.status === "success"` → terminal de éxito. `result.status === "error"` → terminal de error.
- Editar un campo lo quita de `invalid`.
- «REINTENTAR» hace `setResult(null)` y conserva `values`.
- «ENVIAR OTRO MENSAJE» hace `setResult(null)`, `setValues(EMPTY_CONTACT)` y `setInvalid([])`.

Esta feature no introduce nuevas claves de `localStorage`.

### Navegación — `components/layout/nav-links.ts`

- `NAV_LINKS` agrega `{ href: "/about", label: "Acerca de" }` al final: Inicio, Biblioteca, Salón de la Fama, Acerca de.
- `getActiveHref` devuelve `"/about"` cuando `pathname === "/about"`. El resto de las reglas del SPEC 02 no cambia.

## Plan de implementación

Cada paso deja la app compilando (`npx tsc --noEmit`) y corriendo con `npm run dev`.

1. **Dependencia y variables.** Correr `npm install resend`. Crear `.env.example` con las tres variables vacías y un comentario en español para cada una, incluida la advertencia de que con `onboarding@resend.dev` solo se puede enviar al correo de la cuenta de Resend. Agregar `!.env.example` al `.gitignore`, debajo de `.env*`. Verificación: `git check-ignore .env.example` no imprime nada y `git check-ignore .env.local` imprime `.env.local`.
2. **Tokens y keyframes.** En `app/globals.css`:
   - Agregar `e-shake` (`translateX` 0 → −6px → 6px → −4px → 4px → 0 en 0/20/40/60/80/100 %) y `e-pxblink` (`opacity: 0.2` al 50 %).
   - Declarar `--animate-shake` (0,4 s, una vez) y `--animate-pxblink` (2,4 s, `steps(2)`, bucle).
   - Agregar `.animate-pxblink` al bloque `prefers-reduced-motion`.

   Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
3. **Hero.** Crear `components/about/HighlightIcon.tsx` con los 3 SVG de la referencia (`about.jsx`, líneas 121–155; prop `kind: "HEART" | "BROWSER" | "PLANT"`, el relleno oscuro `#0a0a0f` pasa a `var(--background)`). Crear `components/about/AboutHero.tsx` (líneas 30–51 de `about.jsx` y 1073–1094 de `styles.css`): contenedor de 1100 px con `pt-20 pb-10`, título `clamp(26px,5vw,52px)` con degradado y `drop-shadow` cian, misión de 720 px de ancho máximo, grilla de 3 tarjetas que pasa a 1 columna debajo de 820 px, y hover con `-translate-y-[3px]`, borde y sombra `currentColor`. Crear `app/about/page.tsx` con `metadata.title = "Acerca de"`, un contenedor con `motion-safe:animate-fade` (el `.fade-in` de la referencia) y solo `AboutHero`. Verificación: `/about` muestra el hero y el título de pestaña es `Acerca de · Arcade E1230`.
4. **Navegación.** Actualizar `components/layout/nav-links.ts` según el modelo de datos. Verificación: el navbar y el menú móvil muestran «Acerca de», que solo está activo en `/about`, y a 768 px el navbar entra en una línea. Si no entra, pasar `Navbar` y `MobileMenu` del breakpoint `md` a `lg` (mitigación prevista en el SPEC 02).
5. **Divisor.** Crear `components/about/PixelDivider.tsx` (líneas 54–60 de `about.jsx` y 1096–1102 de `styles.css`) con `aria-hidden`: dos barras `h-px` con degradado transparente-rosa-transparente y 24 cuadrados de 6 px con `motion-safe:animate-pxblink` y `animation-delay: i × 80ms`. El color sale del índice 1-based `n`: amarillo si `n % 5 === 0`, si no rosa si `n % 3 === 0`, si no cian (misma prioridad que los `nth-child` de la referencia). Montarlo en `app/about/page.tsx` dentro de `Reveal`. Verificación: se ven los 24 píxeles parpadeando, con el 15 y el 5 en amarillo y el 3 en rosa.
6. **Validación.** Crear `lib/contact.ts` con los tipos, `CONTACT_LIMITS`, `EMPTY_CONTACT` y `validateContact` según el modelo de datos. Verificación: `npx tsc --noEmit` pasa.
7. **Plantilla de correo.** Crear `lib/contact-email.ts` con `escapeHtml` y `buildContactEmail`. Verificación: `npx tsc --noEmit` pasa.
8. **Server Action.** Crear `app/about/actions.ts` con `"use server"` y `export async function sendContactMessage(input: ContactInput): Promise<ContactResult>`, consultando antes `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` como pide `AGENTS.md`, y los tipos de `node_modules/resend` para confirmar el nombre del campo `replyTo`. La acción trata `input` como no confiable:
   1. Si `input` no es un objeto o alguno de sus cuatro campos no es `string` → `{ status: "error", code: "invalid" }`.
   2. Si `website.trim()` no está vacío → `{ status: "success" }` sin llamar a Resend.
   3. Aplicar `trim` a `name`, `email` y `message` y correr `validateContact`. Si devuelve campos → `invalid`.
   4. Leer `RESEND_API_KEY` y `CONTACT_TO_EMAIL`. Si falta alguna → `console.error` con el nombre de la variable faltante y `config`.
   5. Crear `new Resend(apiKey)` dentro de la acción y llamar a `resend.emails.send({ from, to, replyTo: email, subject, text, html })` con el resultado de `buildContactEmail`. `from` es `CONTACT_FROM_EMAIL` o el valor por defecto.
   6. Si la respuesta trae `error` o la llamada lanza → `console.error` con el nombre y el mensaje del error (sin el contenido del mensaje del jugador) y `send`.
   7. Si no → `{ status: "success" }`.

   Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
9. **Campo y terminal.** Crear `components/about/ContactField.tsx` (estilos `.field` de la referencia, líneas 813–824 y 1124–1130): etiqueta mono de 10 px en mayúsculas, `subtle`, con `tracking-[0.16em]`; `input` de 44 px de alto o `textarea` de 5 filas (`min-h-[110px]`, `resize-y`) según la prop `multiline`; fondo `background`, borde `border-neon`, foco cian con resplandor; props `label`, `name`, `type`, `value`, `onChange`, `placeholder`, `maxLength`, `disabled`, `invalid`. Con `invalid`, el borde es rosa y el control lleva `aria-invalid="true"`. Crear `components/about/ContactTerminal.tsx` (líneas 97–112 de `about.jsx` y 1134–1146 de `styles.css`) con props `result`, `playerName` y `onReset`, `role="status"` y `aria-live="polite"`:
   - **Éxito:** borde y resplandor verdes; barra con los tres puntos y «E1230-OS // TERMINAL»; líneas `e1230@arcade:~$ ./send_message --to=team`, `[OK] Conectando con servidor…`, `[OK] Validando contenido…`, `[OK] Transmitiendo paquete…` y `> MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {PLAYERNAME}.` con el cursor `_` en `motion-safe:animate-blink`; botón «ENVIAR OTRO MENSAJE».
   - **Error:** mismo diseño con borde y resplandor rosas; líneas `e1230@arcade:~$ ./send_message --to=team`, `[OK] Conectando con servidor…`, `[ERROR] {mensaje del código}` y `> NO SE PUDO ENVIAR EL MENSAJE.` con el cursor; botón «REINTENTAR».
   - Mensajes por código: `invalid` → «Datos inválidos. Revisa los campos.», `config` → «Servidor de correo no configurado.», `send` → «Transmisión fallida. Intenta de nuevo.».
   - Cada línea entra con `motion-safe:animate-tick` y `animation-delay: i × 150ms`. Los botones son `NeonButton` `ghost` tamaño `sm`.

   Verificación: `npx tsc --noEmit` pasa.
10. **Formulario y sección de contacto.** Crear `components/about/ContactForm.tsx` (cliente) con el estado del modelo de datos, dentro del panel `bg-surface border border-border-neon p-7` con el borde punteado interior (`before:inset-1 before:border-dashed before:border-cyan/15`). El panel contiene el `<form noValidate>` o la terminal, según `result`. El submit:
    1. Hace `event.preventDefault()` y corre `validateContact(values)`.
    2. Si hay campos inválidos: `setInvalid`, activa `shake` (`motion-safe:animate-shake` en el panel) y lo apaga a los 400 ms con un timeout que se limpia al desmontar.
    3. Si todo es válido: `startTransition(async () => { … })` llama a `sendContactMessage(values)` dentro de un `try/catch` (el `catch` produce `{ status: "error", code: "send" }`) y guarda el resultado con `setResult` dentro de otro `startTransition`, como pide React 19 para las actualizaciones después de un `await`.

    El honeypot no usa `ContactField`: es un `input name="website"` con su `label` «Sitio web», dentro de un contenedor `absolute -left-[9999px] h-px w-px overflow-hidden` con `aria-hidden`, `tabIndex={-1}` y `autoComplete="off"`. Con `isPending`, los campos se deshabilitan y el botón es un `NeonButton` cian `lg` a ancho completo con «▶ TRANSMITIENDO…» y `disabled`; si no, dice «▶ ENVIAR MENSAJE». `playerName` es `values.name.trim().toUpperCase()`. Crear `components/about/ContactSection.tsx` (líneas 63–78 de `about.jsx` y 1104–1114 de `styles.css`): contenedor de 1200 px con `mb-20`, grilla `1fr 1.2fr` con `gap-10` que pasa a una columna con `gap-6` debajo de 900 px, intro con kicker cian, título `clamp(22px,3.5vw,36px)` cian con resplandor, texto y los 3 indicadores con LED verde, amarillo y rosa, y `ContactForm` a la derecha. Montarla en `app/about/page.tsx` dentro de `Reveal`. Verificación: los criterios de «Formulario» con el envío fallando por configuración (sin `.env.local`).
11. **Envío real.** Crear `.env.local` (no versionado) con una clave válida de Resend y `CONTACT_TO_EMAIL` igual al correo de la cuenta de Resend. Verificación: los criterios de «Envío con Resend».
12. **Documentación.** Actualizar la sección «Proyecto» de `CLAUDE.md`: agregar la ruta `/about`, la carpeta `components/about/`, `lib/contact.ts`, `lib/contact-email.ts`, `app/about/actions.ts` y una subsección «Variables de entorno» con la tabla del modelo de datos y la advertencia sobre `onboarding@resend.dev`. Ajustar la frase de «Fuera de alcance» para aclarar que el único código de servidor es el envío de contacto. Verificación: el texto describe el estado real del repo.

## Criterios de aceptación

**Generales**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Al recorrer `/about`, `/`, `/games` y `/hall-of-fame`, la consola del navegador no muestra errores ni advertencias de hidratación.
- [ ] El título de pestaña de `/about` es `Acerca de · Arcade E1230`.
- [ ] Después de `npm run build`, `grep -rn "RESEND_API_KEY\|CONTACT_TO_EMAIL" .next/static` no devuelve nada.
- [ ] `git check-ignore .env.example` no imprime nada y `git check-ignore .env.local` imprime `.env.local`.
- [ ] `.env.example` contiene `RESEND_API_KEY=`, `CONTACT_TO_EMAIL=` y `CONTACT_FROM_EMAIL=` sin valores.
- [ ] `package.json` lista `resend` en `dependencies`.
- [ ] A 375 px de ancho, `/about` no genera scroll horizontal.

**Navegación**

- [ ] El navbar de escritorio muestra, en orden, «Inicio», «Biblioteca», «Salón de la Fama» y «Acerca de».
- [ ] En `/about` está activo «Acerca de» y ningún otro. En `/`, `/games` y `/hall-of-fame` «Acerca de» no está activo.
- [ ] El menú móvil (375 px) muestra los mismos cuatro links con el mismo estado activo, y tocar «Acerca de» lleva a `/about` y cierra el menú.
- [ ] A 768 px de ancho, el navbar entra en una sola línea y no genera scroll horizontal.

**Hero y divisor**

- [ ] `/about` muestra «▸ ACERCA DE» en amarillo, el título «ACERCA DE ARCADE E1230» con degradado blanco-cian y el párrafo que empieza con «ARCADE E1230 nació del amor por los videojuegos clásicos.».
- [ ] Las 3 tarjetas muestran sus textos con el ícono de corazón en rosa, el de navegador en cian y el de planta en verde.
- [ ] Las tarjetas están en 3 columnas a 1280 px y en 1 columna a 800 px.
- [ ] Al pasar el mouse, cada tarjeta sube y su borde toma su color.
- [ ] El divisor muestra 24 píxeles que parpadean escalonados. El 3.º es rosa, el 5.º amarillo y el 15.º amarillo.
- [ ] Al cargar `/about` con una ventana baja, el divisor y el contacto aparecen con fundido al hacer scroll hasta ellos y no vuelven a ocultarse al subir.

**Formulario**

- [ ] La sección de contacto muestra «▸ CONTACTO», «CONTÁCTANOS», el texto de invitación y los 3 indicadores con LED verde, amarillo y rosa.
- [ ] Los campos se llaman NOMBRE, CORREO ELECTRÓNICO y MENSAJE, con los placeholders `px_kai`, `jugador@email.gg` y `Cuéntanos qué tienes en mente…`.
- [ ] A 1280 px, la intro y el formulario están lado a lado. A 800 px, el formulario queda debajo de la intro.
- [ ] Enviar con los tres campos vacíos sacude el panel, marca los tres campos en rosa y no genera ninguna petición POST en la pestaña Network.
- [ ] Enviar con nombre `px_kai`, correo `jugador@email` y un mensaje marca solo CORREO ELECTRÓNICO en rosa y no genera ninguna petición POST.
- [ ] Enviar con nombre `   ` (solo espacios) marca NOMBRE como inválido.
- [ ] Al escribir en un campo marcado, ese campo deja de estar en rosa.
- [ ] En NOMBRE no se pueden escribir más de 60 caracteres ni en MENSAJE más de 2000.
- [ ] El navegador no muestra sus propios mensajes de validación (el formulario tiene `noValidate`).
- [ ] El campo `website` no se ve ni recibe foco con Tab.
- [ ] Sin `.env.local`, enviar datos válidos muestra «▶ TRANSMITIENDO…» con los campos deshabilitados y luego la terminal rosa con `[ERROR] Servidor de correo no configurado.`. La terminal del servidor muestra el `console.error` con la variable faltante.
- [ ] En la terminal de error, «REINTENTAR» vuelve al formulario con los tres valores intactos.
- [ ] Con `prefers-reduced-motion: reduce` emulado, los píxeles del divisor y el cursor `_` no parpadean, y un envío inválido marca los campos sin sacudir el panel.

**Envío con Resend** (con `.env.local` válido)

- [ ] Enviar `px_kai` / un correo propio / `Hola\nsegunda línea <b>negrita</b>` muestra la terminal verde con las 5 líneas de la referencia y la última termina en `GRACIAS, PX_KAI._`.
- [ ] Llega un correo a `CONTACT_TO_EMAIL` con asunto `[Arcade E1230] Nuevo mensaje de px_kai`, remitente `Arcade E1230 <onboarding@resend.dev>` (sin `CONTACT_FROM_EMAIL`) y el mensaje con el salto de línea conservado y `<b>negrita</b>` como texto literal.
- [ ] En Gmail, «Responder» a ese correo pone como destinatario el correo ingresado en el formulario.
- [ ] «ENVIAR OTRO MENSAJE» vuelve al formulario con los tres campos vacíos.
- [ ] Con `RESEND_API_KEY=re_invalida` en `.env.local`, un envío válido muestra la terminal rosa con `[ERROR] Transmisión fallida. Intenta de nuevo.`.
- [ ] Llenando `website` desde DevTools y enviando datos válidos, se ve la terminal verde y no llega ningún correo (el panel de Resend no registra un envío nuevo).

## Decisiones

- **Sí:** Server Action en `app/about/actions.ts`. Es el patrón de Next 16 para mutaciones, no hay que escribir un endpoint ni un `fetch`, y la clave de Resend nunca sale del servidor.
- **No:** Route Handler en `app/api/contact/route.ts`. Más código y un endpoint explícito que ningún otro cliente necesita.
- **Sí:** invocar la acción desde `onSubmit` con `useTransition` y un objeto `ContactInput`.
- **No:** `useActionState` con `<form action>`. React 19 reinicia el formulario al terminar la acción y `useActionState` no tiene forma directa de volver al estado inicial, lo que complica «REINTENTAR» con los datos intactos y «ENVIAR OTRO MENSAJE» con el formulario vacío. (En la fase de preguntas se habló de `useActionState`; lo que se decidió fue la Server Action, y esta es la forma más simple de invocarla.)
- **Sí:** destinatario en `CONTACT_TO_EMAIL`. El repo no lleva correos personales y el destino se cambia sin tocar código.
- **Sí:** remitente en `CONTACT_FROM_EMAIL` con `Arcade E1230 <onboarding@resend.dev>` por defecto. Funciona hoy sin configurar DNS y se migra a un dominio propio cambiando una variable.
- **Sí:** un solo correo al equipo con `replyTo` del jugador. Se responde directo desde el cliente de correo.
- **No:** confirmación al jugador. Con `onboarding@resend.dev` Resend rechaza destinatarios que no sean el dueño de la cuenta.
- **Sí:** cuerpo en texto y HTML simple armado en `lib/contact-email.ts`, con los valores escapados. No agrega dependencias.
- **No:** React Email. Otra dependencia para un correo interno de tres campos.
- **Sí:** validación de requeridos, formato de correo y largo en cliente y servidor con la misma función `validateContact`. El cliente da respuesta inmediata y el servidor es la validación que cuenta, porque la acción se puede invocar sin pasar por la UI.
- **Sí:** marcar en rosa los campos inválidos, además de la sacudida. Con validación de formato y largo, solo sacudir no le dice al jugador qué corregir.
- **Sí:** `noValidate` en el formulario y `maxLength` en los campos. La validación visible es la de la referencia (sacudida) y no los globos del navegador, y el largo no se puede exceder al escribir.
- **Sí:** honeypot `website` que responde éxito sin enviar. Frena bots simples sin fricción ni dependencias, y el bot no aprende que fue detectado.
- **No:** rate limiting en memoria. Se pierde al reiniciar y no se comparte entre instancias serverless. Va en su propio spec si hace falta.
- **Sí:** terminal de error rosa con «REINTENTAR». Mantiene el tono de la referencia, que solo define el caso de éxito.
- **Sí:** tres códigos de error (`invalid`, `config`, `send`) con mensajes distintos. Separan un problema de configuración de una falla de Resend al probar, sin exponer detalles internos.
- **Sí:** estado «▶ TRANSMITIENDO…» con los campos deshabilitados y la terminal solo al tener respuesta. Ninguna línea dice `[OK]` antes de que sea cierto.
- **No:** terminal «en vivo» que escribe líneas mientras espera. Más estado que coordinar y muestra `[OK]` antes de saber el resultado.
- **Sí:** `new Resend()` dentro de la acción, después de comprobar la variable. El constructor lanza si la clave falta, y a nivel de módulo rompería la carga de la acción.
- **Sí:** `.env.example` versionado con la excepción `!.env.example`. Quien clone el repo ve qué variables configurar.
- **Sí:** «Acerca de» como cuarto link del navbar y del menú móvil, como en `nav.jsx` de la referencia. Revierte a propósito la exclusión del SPEC 02, que dependía de que la página no existiera.
- **Sí:** reutilizar `Reveal` desde `components/home/` sin moverlo. Moverlo a `components/ui/` tocaría el home y no aporta nada a este spec.
- **Sí:** `ContactField` propio con los estilos de `.field`.
- **No:** reutilizar `AuthField`. Su estilo (borde de 2 px, etiqueta en negrita) no coincide con `.field`, y no soporta `textarea` ni el estado inválido.
- **Sí:** `NeonButton` para «ENVIAR MENSAJE», «ENVIAR OTRO MENSAJE» y «REINTENTAR», igual que el SPEC 02 con los `.btn` de la referencia.
- **No:** portar `.btn` con su `clip-path` de esquinas cortadas. Rompería la coherencia con el resto de los botones del proyecto.
- **Sí:** tokens del proyecto según la tabla de traducción, y los valores de la barra de la terminal como arbitrarios.
- **Sí:** `motion-safe:` en la sacudida, aunque sea de una sola pasada. Es un movimiento brusco, y la marca en rosa ya comunica el error.
- **Sí:** textos idénticos a la referencia, incluido el emoji ❤️. El usuario pidió la página exactamente igual.
- **Sí:** no tocar `specs/01-mvp-visual.md` ni `specs/02-home-landing.md`. Son el registro de lo implementado en su momento.

## Riesgos

| Riesgo                                                                                                                                | Mitigación                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Con `onboarding@resend.dev`, Resend rechaza cualquier `to` que no sea el correo de la cuenta, y el formulario muestra error de envío. | Advertencia en `.env.example` y en `CLAUDE.md`. El criterio de «Envío con Resend» usa el correo de la cuenta como `CONTACT_TO_EMAIL`. |
| Si falta alguna variable en el despliegue, el formulario siempre falla.                                                               | Código `config` con mensaje propio en la terminal y `console.error` con el nombre de la variable en los logs del servidor.            |
| El honeypot no frena bots dirigidos, que pueden agotar el límite diario del plan gratuito de Resend.                                  | Se acepta para el MVP. Rate limiting o CAPTCHA quedan fuera de alcance y van en su propio spec.                                       |
| Tras un nuevo despliegue, un cliente con la página vieja invoca un id de acción que ya no existe («Failed to find Server Action»).    | El `try/catch` del cliente muestra la terminal de error, y «REINTENTAR» conserva los datos; recargar la página lo resuelve.           |
| Si Resend no responde, el botón queda en «TRANSMITIENDO…» indefinidamente.                                                            | Se acepta. El SDK usa `fetch` y la plataforma de despliegue corta la función por tiempo, lo que termina en la terminal de error.      |
| Con 4 links, el navbar no entra en una línea a 768 px.                                                                                | Hay un criterio a 768 px. Si falla, `Navbar` y `MobileMenu` pasan del breakpoint `md` al `lg`, como ya preveía el SPEC 02.            |
| El contenido del jugador se inyecta en el HTML del correo o rompe el asunto.                                                          | `escapeHtml` en los tres valores del HTML y saltos de línea eliminados del asunto. Criterio con `<b>negrita</b>` literal.             |
| El emoji ❤️ no existe en Press Start 2P y se ve con la fuente de emoji del sistema.                                                    | Se acepta: es lo mismo que pasa en la referencia.                                                                                     |
| Un cambio de versión mayor del SDK de Resend renombra `replyTo` o cambia la forma de `{ data, error }`.                               | El paso 8 revisa los tipos de `node_modules/resend` antes de escribir la llamada, y `npx tsc --noEmit` lo detecta.                    |

## Lo que **no** entra en este spec

- Rate limiting, CAPTCHA o Turnstile.
- Correo de confirmación al jugador.
- Dominio propio en Resend.
- Guardar los mensajes.
- React Email.
- Autocompletar el formulario con la sesión.
- El contador de créditos del navbar.
- Cambios en `specs/01-mvp-visual.md` o `specs/02-home-landing.md`.

Si alguna de estas llega, va en su propio spec.
