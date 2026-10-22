# Sitio TigreNegro: HTML, CSS y JS vanilla

## Context
The site map is approved for now (`Mapa-del-sitio.md`, v3). Peter wants the next step: a simple static site (HTML, CSS, vanilla JS, no libraries) built with the client's assets, using materra.tech as the template for interactions, scroll effects and part of the layout, adapted to the TigreNegro brand. Decisions from Peter: titles in a Google Fonts look-alike of Reckless (Fraunces), and **no JS libraries**.

## What we take from materra.tech (observed in the browser)
Webflow + GSAP. Interactions to recreate by hand:
1. **Hero:** full-screen drone video with a giant wordmark centered. While scrolling, the wordmark shrinks and flies into the header logo spot, changing color (Flip, scrubbed).
2. **Header:** sticky cream bar, hidden while the hero is on screen; afterwards it hides on scroll down and slides back on scroll up (translateY −100 %, ~800 ms, expo-out).
3. **Statement band:** full-bleed photo with a big centered sentence + subline.
4. **Marquee:** infinite horizontal loop (18 s).
5. **Headings:** huge uppercase H2 whose letters fade in with a stagger; paragraphs slide up 10 px + fade on entering.
6. **Image cards:** title + round arrow button; photo zooms 1 → 1.1 slowly on hover.
7. **Scale-in image:** big rounded image that grows 0.85 → 1 as it scrolls into view, with small floating info chips on top.
8. **Stat cards** (their "Impact" dashboard).
9. **Closing band:** full-bleed photo + giant uppercase statement + pill CTA.
10. **Footer:** solid color block, link columns, giant wordmark across the bottom.
Also: image parallax (±30 px while in view), cards that flip (rotateY 180°) on hover/tap, accordions.

## Brand (from the manual, bag files and brief)
- **Colors:** `#382F2D` main dark · beige gradient `#90836F → #C1AD91` · seal tan `#AA9575` · warm off-white `#F8F6F3` · cream on brown `#F7DDCB` · heading tan `#877667` · accent orange `#EE7E00` (ridge/sunrise only). Brown "bag" background = diagonal gradient `#382F2D → #5D3927 → #6D5344 → #9F8874`. No red, no gray (brief): secondary text uses warm browns.
- **Variety glows:** Gesha `#FF7F82` · Acaia `#638C69` · Catucai `#F2A400` · Arara `#98669C` · Castillo `#EA7749` · IPR 103 `#6379C4` · Tupi `#72ABAE`.
- **Type (Google Fonts):** Fraunces (titles, uppercase, heavy, sharp: `SOFT 0, WONK 0`) as the stand-in for Reckless Wide · Corben (text) · Tenor Sans (small wide-tracked uppercase labels, as on the bag). Swapping in Reckless later = one CSS variable.
- **Voice:** poetic, restrained, short sentences. Reuse the bag copy: «Intensidad que no necesita anunciarse», «Entre la luz y la sombra, se mueve el jaguar», the dawn story text (with typos fixed), "Quiet Intensity".
- **Logos:** the SVGs are 2–8 MB (thousands of gradient specks). Build light versions: wordmark letters from `logo-TigreNegro-1.svg` as a clean SVG with `fill="currentColor"` (needed for the color change in the hero flight; also gives the missing white version), and the grain dot, jaguar (`-9`), seal (`-5`) and T (`-6`, favicon) rendered once to transparent 2× PNG/WebP via a browser canvas.

## Structure
Self-contained folder, originals in `Assets/` untouched:
```
site/
  index.html · nosotros.html · terroir-y-proceso.html · variedades.html
  variedad.html            (ficha; renders ?v=gesha from data)
  privacidad.html · 404.html
  css/styles.css           (tokens, layout, components, motion, reduced-motion)
  js/main.js               (header, hero flight, reveals, parallax, scale-in, counters, menu, flip cards)
  js/variedades.js         (7 varieties: name, slug, glow, proceso, notas; WhatsApp config)
  media/img · media/video · media/logo   (optimized copies)
```
- Images (no catalog; the photo inventory was stopped): the cloud session views the photos and picks per section. `Assets/img/About us/DJI_*.jpg` are drone shots, good for hero and full-bleed landscape bands. `Assets/img/About us/YANAPUMA SEP*.jpg` cover the reserve, people, plants and processing; some also have a smaller hyphenated web copy (`YANAPUMA-SEP*.jpg`), and the rest only exist full-size, so resize those (~2000 px, ~75 % quality) before using them. `Assets/img/Filter/` relates to the Graycano filtering. `Assets/img/Product/` has the two packaging images. Copy only the ones used; resize the drone shots to 2000 px at ~75 % quality. Video: re-encode to ~4–5 MB with a poster frame if `ffmpeg` is available; otherwise keep the 11 MB file.
- WhatsApp placeholder number in one constant; messages built per variety + grind. Instagram placeholder.

## Pages (materra pattern → TigreNegro content)
**Global:** header (wordmark · Nosotros · Terroir y Proceso · Variedades · «Pedir por WhatsApp» pill) · full-screen mobile menu · floating WhatsApp button · footer in the brown-bag gradient with link columns, Yanapuma logo ↗, «Planifica tu visita» ↗, Instagram, and the giant wordmark across the bottom (10).

**Inicio**
1. Hero (1): video + giant wordmark that flies into the header.
2. Statement band (3): reserve photo + «Un café con propósito de altísima calidad» + subline.
3. Marquee (4): GESHA · ACAIA · CATUCAI · ARARA · CASTILLO · IPR 103 · TUPI · 1% cultivado · 99% conservado.
4. «Por qué es diferente» (5, 6): letter-fade H2 + three image cards with hover zoom → Variedades exóticas / Terroir único / Beneficio propio.
5. Producto (7): heading + text + pill, packaging image scaling in, floating chips («Gesha · Natural», «1.200–1.750 msnm», «Bolsa 200 g»).
6. Variedades destacadas: three flip cards (front: glow + name; back: notas + «Pedir»).
7. Terroir en cifras (8): count-up stat cards (msnm · 11 ha · 1 % / 99 % · 7 variedades hoy, ~20 en camino).
8. Respaldo: Lean Coffee Management quote.
9. Closing band (9): reserve photo + «1% CULTIVADO. 99% CONSERVADO.» + «Visita la reserva ↗».

**Nosotros:** split-heading hero · historia (Yanapuma, centro de rescate) with parallax images · «El nombre» with the stippled jaguar · café con propósito (1 %, chacos, camino) · la limitación que exige excelencia · productores vecinos · asesor (Pexels-style placeholder if no photo fits) · misión y visión · band to Yanapuma.

**Terroir y Proceso:** hero · terroir facts over a scale-in drone image · cultivo bajo sombra · banco genético → Variedades · beneficio cards (Palini Alves, galpón con laboratorio, secador invernadero) · «Del cultivo a la taza» as an accordion of steps · filtrado Graycano.

**Variedades:** heading · grid of 7 flip cards in their glow colors · «Nuevas variedades exóticas» block · cafeterías y café verde (WhatsApp).

**Ficha (`variedad.html?v=…`):** sticky packaging image with the variety glow · name, «Proceso natural», notas, details from the bag (cosecha manual, origen, altitud) · grind selector «Grano / Fino / Medio / Grueso» (from the bag) · «Pedir por WhatsApp» with the pre-filled message · otras variedades.

## Motion (vanilla JS)
- One `requestAnimationFrame` scroll loop: hero flight (interpolate translate/scale from hero rect to header-logo rect, color mix), parallax `[data-parallax]`, scale-in `[data-scale]`.
- `IntersectionObserver` for reveals: `[data-split]` headings split into letter spans with staggered `transition-delay`; `[data-reveal]` slide-up; counters.
- Header direction detection (hide on down, show on up).
- Marquee and hover zoom in pure CSS; flip cards via CSS 3D + tap toggle for touch.
- `prefers-reduced-motion`: no flight, no parallax, everything visible.

## Build in the cloud (Peter's request)
**Status for the cloud session:** steps 1–3 are done (all photos were committed in the end, originals included). Your job is step 4.

Cloud sessions need a GitHub repo, and this folder isn't one yet. So, here, after approval:
1. `git init` with a `.gitignore` that leaves out the full-size duplicates `Assets/img/**/YANAPUMA SEP*.jpg` (the space-named originals; the hyphenated web copies stay, ~90 MB saved), `.DS_Store` and `.claude/settings.local.json`. Everything else goes in, `Context/` included (~130 MB).
2. Save this plan as `PLAN-sitio-web.md` in the repo root so the cloud session can read it.
3. First commit, then `gh repo create Giro54BO/tigrenegro-web --public --source=. --remote=origin --push` (public, as Peter chose).
4. Start a cloud session on that repo with a brief: build `site/` following `PLAN-sitio-web.md`, verify it, push a branch and open a PR for Peter to review.

The cloud session doesn't report back here; Peter follows it in its own session view.

## Verification
- In the cloud session: serve `site/` with `python3 -m http.server 8080` and drive it with a headless browser (Playwright, installed there if missing), taking screenshots at 1280 px and 375 px. Back here, after the PR lands: a `.claude/launch.json` entry and `preview_start` for Peter to click through.
- For every page, at 1280 px and 375 px: no horizontal scroll, header and mobile menu work, hero flight runs both directions, reveals fire, flip cards work by tap, console has no errors.
- Check each variety's WhatsApp link (variety + grind in the message).
- Emulate reduced motion and confirm all content shows.
- Page weight without the video under ~4 MB.
