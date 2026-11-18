# Luminous Host Solutions: rediseño

Una versión local y completamente nueva de luminoushostsolutions.com. Es independiente de la web publicada: no toca el dominio, el DNS ni el sitio en Netlify.

## Ver la web en tu ordenador

Necesitas **Node.js** (ya está instalado en este equipo). No hace falta instalar nada más.

**Opción fácil (Windows):** haz doble clic en `start-preview.bat`. Se abre el navegador en `http://localhost:4321`.

**Desde una terminal**, dentro de esta carpeta:

```bash
node tools/serve.mjs
```

y abre http://localhost:4321. Para pararlo, pulsa `Ctrl+C`.

> No abras `index.html` con doble clic: las rutas empiezan por `/`, así que necesitan el servidor local, igual que en Netlify.

## Qué hay en la carpeta

```
index.html               Página principal
privacy/  terms/  payment-terms/   Páginas legales (mismas rutas que la web actual)
thank-you/               Página de agradecimiento tras enviar el formulario
404.html                 Página de error
assets/css/site.css      Todos los estilos
assets/js/site.js        Animaciones e interacciones (GSAP + ScrollTrigger)
assets/vendor/           GSAP 3.13 y ScrollTrigger, copiados en local
assets/images/           Fotos optimizadas (.webp) y logos (.svg)
assets/images/originals/ Las fotos originales de la web, sin tocar
src/legal/               Texto legal original, la fuente de las páginas legales
tools/serve.mjs          Servidor local sin dependencias
tools/build-pages.mjs    Regenera las páginas legales y la de agradecimiento
tools/optimize-images.sh Convierte fotos nuevas a WebP
netlify.toml             Configuración para Netlify
robots.txt, sitemap.xml  SEO
CONFIGURATION.md         Formulario, claves y ajustes (sin secretos)
```

## Dirección creativa

- **Paleta:** blancos cálidos (`#f7f3ec`), piedra, arena, carbón (`#26221d`) y un verde salvia apagado. El **morado de marca** (`#240561`) queda como acento en cursivas, en la sección del formulario y en el pie, y el **dorado** del logo se usa en el botón de enviar. El logo original no se ha modificado.
- **Tipografía:** Cormorant Garamond (titulares editoriales, con cursivas en morado) y Jost, que ya era la tipografía de la marca, para el texto.
- **Fotografía:** las 13 fotos reales de la web, a pantalla completa o en composiciones asimétricas. No se ha añadido ninguna imagen de stock ni ninguna foto inventada de Emma o del equipo.

## La experiencia de scroll

Se construye con GSAP ScrollTrigger, siguiendo el método de la skill `scroll-world`: una escena fija en la que el scroll mueve una cámara, con transiciones encadenadas y sin cortes. Se usan las fotos reales en lugar de vídeo generado por IA.

1. **Apertura:** el titular aparece junto a una ventana con el dormitorio. Al hacer scroll, el texto se retira y la ventana se abre hasta ocupar toda la pantalla, con un acercamiento lento de cámara.
2. **Recorrido por la propiedad:** dormitorio, baño, cocina y detalles. Cada estancia entra con un recorte distinto (desde abajo, desde la derecha, desde el centro) y con su propio titular. Un índice lateral marca dónde estás.
3. **Servicios:** titular fijo a la izquierda y tres composiciones fotográficas asimétricas a la derecha. Las fotos se descubren con una máscara.
4. **Cómo funciona:** una línea se dibuja con el scroll y los cuatro pasos aparecen sobre ella.
5. **Ventajas:** las fotos quedan fijas mientras avanza la lista.
6. **Emma:** retrato en arco con una frase de fondo que se desplaza.
7. **Galería:** el scroll vertical mueve la galería en horizontal (en escritorio), con un contador de progreso. En móvil es un carrusel que se desliza con el dedo.
8. Testimonios, zona de servicio (los dos nombres se acercan con el scroll), preguntas frecuentes y formulario.

Solo hay dos secciones bloqueadas por el scroll (la apertura y la galería); el resto se desplaza con normalidad. Con `prefers-reduced-motion` activado, o sin JavaScript, la web se muestra como un documento estático completo, sin animaciones.

## Cambiar o añadir fotos y vídeos

1. Copia la foto original (JPG o PNG, cuanto más grande mejor) en `assets/images/originals/`, por ejemplo `bedroom-green.jpg`.
2. Ejecuta `bash tools/optimize-images.sh`. Genera `bedroom-green.webp` y `bedroom-green-720.webp`.
3. Si conservas el nombre de archivo, la web la usa automáticamente. Si es una foto nueva, cambia la ruta en `index.html`.

Las fotos actuales miden 1200×800 px. Con originales de 2400 px o más, la apertura a pantalla completa se verá notablemente más nítida en monitores grandes.

**Vídeo:** cualquier `<img>` de una escena de `.film` puede sustituirse por `<video muted playsinline loop autoplay poster="...">` con un MP4 corto. La animación de la escena funciona igual, porque solo mueve su contenedor.

## Publicar en Netlify (cuando decidas hacerlo)

No se ha publicado nada. Cuando quieras hacerlo:

1. En Netlify, crea un sitio nuevo con **Deploy manually** y arrastra esta carpeta (o el ZIP descomprimido). `netlify.toml` ya está listo: no hay comando de build.
2. Revisa el sitio en la URL `*.netlify.app` que te dé Netlify.
3. Para sustituir la web actual, despliega en el sitio existente de Netlify en lugar de crear uno nuevo. Hazlo solo cuando estés seguro.

## Notas de la auditoría

- **Contenido:** se conserva todo el contenido de la web original: hero, servicios, cómo funciona, las seis ventajas, la historia de Emma, las 12 fotos de la galería, los dos testimonios con su atribución exacta, la zona de servicio, las 11 preguntas frecuentes, el formulario, el contacto, las redes sociales y el pie. Solo se han hecho dos cambios de ortografía al inglés estadounidense: "neighbourhood" pasa a "neighborhood" y "enquiry" a "inquiry". Además, "agree a standard" pasa a "agree on a standard" y "linen cupboard" a "linen closet". Los textos de cada estancia de la apertura son nuevos, pero solo describen tareas que la web ya menciona.
- **Textos legales:** son idénticos al original, comprobado automáticamente palabra por palabra. Solo cambia el diseño y se añade un índice. Observaciones, sin cambiar nada:
  - *Payment Terms* dice que los métodos de pago aceptados figuran en el acuerdo de servicio, mientras que *Terms of Service* dice que hay que seguir las instrucciones de pago de la factura. No se contradicen, pero conviene que ambos remitan al mismo documento.
  - *Payment Terms* está fechado el 9 de noviembre de 2026, y *Privacy* y *Terms* el 13 de noviembre de 2026. No es un error, solo una diferencia a tener en cuenta.
  - La Política de Privacidad indica que la web usa Google Fonts. Por eso se ha mantenido Google Fonts (ver `CONFIGURATION.md`).
- **La web original** no tenía `robots.txt` ni `sitemap.xml` (devolvían 404). Se han añadido.
- **Aplicación privada:** no se ha accedido ni se ha tocado nada de la aplicación de operaciones (Supabase, Expo, Sentry, cuentas, calendarios ni datos de propiedades).
