# Luli Di Lorenzo — publicación independiente en Cloudflare Pages

Esta carpeta contiene un sitio estático completo y **autónomo** de Luli Di Lorenzo. Se puede publicar como otro proyecto en Cloudflare Pages sin duplicar GitHub, ni modificar la portada de CayeLab.

## Configuración recomendada

- Plataforma: **Cloudflare Pages** → Create a project → Connect to Git.
- GitHub: **caye2404/cayelab-web** (el mismo repositorio que ya usa CayeLab).
- Nombre de proyecto deseado: **luli-di-lorenzo** (si el nombre está disponible).
- Branch de producción: **main**.
- Framework preset: **None**.
- Root directory (advanced): **luli-di-lorenzo**.
- Build command: **exit 0**.
- Build output directory: **.** (directorio actual de la raíz de este proyecto).
- Sin variables de entorno ni dependencias.
- Salida esperada, solo si Cloudflare acepta el nombre y publica con éxito: `https://luli-di-lorenzo.pages.dev/`.

## Antes de compartir el sitio definitivo

1. Abrir el nuevo subdominio y comprobar logo, imágenes, CSS, WhatsApp e Instagram.
2. Actualizar los tags `og:url` y `canonical` del archivo `index.html` con la URL **realmente confirmada** por Cloudflare. También usar la URL pública real para `og:image`.
3. Elegir una foto original de la embarcación en alta calidad para la vista previa de WhatsApp (ideal JPEG 1200 × 630 px); ahora se usa una imagen de publicaciones públicas de Instagram del emprendimiento.
4. Confirmar consentimiento de Luli para mostrar sus fotografías, teléfono y marca; reemplazar fotos públicas comprimidas por los originales que entregue.
5. Verificar recorridos, duraciones, capacidad, precios y cualquier salida con comida antes de promocionarlos como servicios disponibles.
6. Mantener el crédito al pie: **Diseñado por CayeLab** → https://cayelab-web.pages.dev/.
7. Una vez que el proyecto esté publicado y verificado, considerar una redirección desde la demo temporal de CayeLab a la nueva dirección.

## Observaciones

- La ruta actual `https://cayelab-web.pages.dev/luli-di-lorenzo/` es una **demo temporal válida**.
- No debe afirmarse que el nuevo subdominio existe hasta que Cloudflare confirme el despliegue.
- Este archivo no crea el proyecto automáticamente; requiere una operación en la cuenta de Cloudflare.
- Fuente: documentación de Cloudflare Pages sobre repositorios monorepo y Git integration.
