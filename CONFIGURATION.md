# Configuración y variables

Este sitio es **estático**: no tiene build, servidor propio, base de datos ni variables de entorno. No hay ningún secreto en el proyecto.

## Formulario de presupuestos (Web3Forms)

El formulario de `index.html` (sección `#quote`) envía los datos **directamente a Web3Forms**, exactamente igual que la web actual. No se ha cambiado nada de la integración:

| Campo oculto | Valor | Para qué sirve |
|---|---|---|
| `access_key` | `932b9571-a6f7-4057-a475-7713f602f192` | Identifica el formulario en Web3Forms y decide a qué correo llega. Es la misma clave que usa la web publicada. |
| `redirect` | `https://luminoushostsolutions.com/thank-you` | Página a la que vuelve el visitante tras enviar. |
| `subject` | `New quote request from the website` | Asunto del correo que recibe la empresa. |
| `from_name` | `Luminous Host Solutions website` | Remitente que aparece en el correo. |
| `botcheck` | casilla oculta (honeypot) | Antispam: si un bot la marca, Web3Forms descarta el envío. |

**La `access_key` no es un secreto.** Web3Forms está diseñado para que esta clave sea pública en el HTML (no permite leer envíos, solo enviarlos). Es la misma que ya está visible en la web actual.

Campos visibles (nombres sin cambios): `name`*, `email`*, `phone`*, `location`*, `service`*, `bedrooms`, `bathrooms`, `frequency`, `start`, `details`. Los marcados con * son obligatorios, igual que en la web original. Envío: `POST` nativo (`application/x-www-form-urlencoded`) a `https://api.web3forms.com/submit`, sin JavaScript de por medio.

### Si alguna vez hay que cambiar algo

- **Cambiar el correo de destino:** se hace en el panel de Web3Forms (o generando una clave nueva allí). No se cambia en el código salvo que se cree una clave nueva.
- **No renombres** los campos: el correo que recibe la empresa usa estos nombres.
- **Página de agradecimiento:** el `redirect` apunta a la web publicada. Si despliegas esta versión en el mismo dominio, la ruta `/thank-you` ya existe en este proyecto (`thank-you/index.html`). Si la despliegas en un dominio de pruebas, el visitante volverá a la web publicada tras enviar; cámbialo solo si lo necesitas.

## Fuentes

Se cargan desde **Google Fonts** (Cormorant Garamond + Jost). Se mantiene Google Fonts a propósito porque la Política de Privacidad publicada dice que la web usa Google Fonts. Si en el futuro se alojan las fuentes en local, habrá que actualizar esa política.

## Librerías

GSAP 3.13 y ScrollTrigger están **copiadas en local** en `assets/vendor/` (no dependen de un CDN). Son gratuitas para este uso.

## Netlify

`netlify.toml` publica la carpeta tal cual (`publish = "."`, sin comando de build), bloquea `/tools/` y `/src/` y repite las cabeceras de seguridad que envía la web actual.

## Modo de prueba `?qa`

Añadir `?qa` a la URL (por ejemplo `http://localhost:4321/?qa`) quita el suavizado del scroll y las animaciones de entrada. Solo sirve para revisar el diseño y para pruebas automáticas; los visitantes nunca lo ven.
