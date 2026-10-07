---
version: alpha
name: Supreme-Art-design-system
description: A calm, paper-white editorial system for Supreme Art, a pharmaceutical carton printer. The canvas is white and warm off-white paper; type is a geometric grotesk display over Inter body; the only strong colour is the logo's maroon, used sparingly as an accent, with a little natural wood brown as a second quiet note. The factory photographs are the brand. They are always shown whole, never cropped or zoomed, and every effect on the site is a quiet "glass" treatment: frosted menu, glass buttons, a loupe over photos, ice-white glows. Storytelling is simple: a few chapters that pin and slide over one another, told with the quality-control window effect.

colors:
  canvas: "#ffffff"
  surface: "#ffffff"
  surface-alt: "#f6f5f2"
  paper: "#faf8f4"
  paper-deep: "#f3efe7"
  kraft: "#f1e9dd"
  ink: "#1b1c1f"
  muted: "#616369"
  accent: "#a02830"
  accent-dark: "#7d1f26"
  accent-soft: "rgba(160, 40, 48, .12)"
  wood: "#a67c52"
  border: "#e7e5e0"
  line: "#e7e1d6"
  on-accent: "#ffffff"
  glow-ice: "rgba(242, 248, 255, .5)"
  shadow-warm: "rgba(60, 45, 30, .5)"
  glass-rim: "rgba(255, 255, 255, .75)"

typography:
  display-xl:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: clamp(2.6rem, 5.6vw, 5rem)
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.01em
  display-lg:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: clamp(2.4rem, 5vw, 4rem)
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.01em
  display-md:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: clamp(1.9rem, 3.6vw, 2.8rem)
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0
  display-sm:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: clamp(1.7rem, 3vw, 2.7rem)
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: 0
  title-md:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  title-sm:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: 1.15rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  lead:
    fontFamily: "Inter, sans-serif"
    fontSize: 1.12rem
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.93rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.76rem
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0
  eyebrow:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.72rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.22em
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.95rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  stat:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: 2.4rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  machine-plate:
    fontFamily: "Michroma, Eurostile Extended, sans-serif"
    fontSize: 0.8rem
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.08em

rounded:
  xs: 3px
  sm: 10px
  md: 12px
  lg: 16px
  xl: 18px
  pill: 999px
  full: 50%

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px
  chapter: 100svh

components:
  top-nav:
    backgroundColor: "rgba(255, 255, 255, .9)"
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    height: 68px
    blur: 10px
  nav-cta:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 9px 18px
  button-accent:
    backgroundColor: "linear-gradient(115deg, rgba(173, 54, 62, .93), rgba(134, 31, 39, .88))"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 18px
    minHeight: 48px
    border: "1px solid {colors.glass-rim}"
  button-ghost:
    backgroundColor: "linear-gradient(115deg, #ffffff1f, #f2f8ff12)"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 18px
    minHeight: 48px
    border: "1px solid rgba(60, 45, 30, .28)"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.lg}"
    padding: 28px
    border: "1px solid {colors.border}"
  news-card:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: 26px
    padding: 32px
    border: "1px solid {colors.line}"
  client-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 18px
    border: "1px solid {colors.line}"
  stat:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.stat}"
  eyebrow:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.eyebrow}"
  page-banner:
    backgroundColor: "linear-gradient(180deg, {colors.paper} 0%, {colors.paper-deep} 100%)"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    padding: 196px 0 44px
  section-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "{spacing.section} 0"
  section-band-alt:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink}"
    padding: "{spacing.section} 0"
  chapter-page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    minHeight: "{spacing.chapter}"
    border: "1px solid {colors.line}"
  qc-window:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: 115svh
  cta-band:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    border: "inset 0 2px 0 {colors.wood}"
  text-input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px 14px
    border: "1px solid {colors.border}"
  photo-frame:
    backgroundColor: transparent
    rounded: "{rounded.sm}"
    shadow: "0 18px 22px rgba(60, 45, 30, .22)"
  footer:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    padding: 56px 0 28px
    border: "1px solid {colors.border}"
---

## Overview

Supreme Art prints pharmaceutical cartons in Pakistan. The site has to feel like the thing it sells: clean board, exact colour, careful finishing. So the whole system is paper. White and warm off-white surfaces, dark ink, a hairline here and there, and one strong colour, the maroon sampled from the logo, used the way a printer uses a spot colour: rarely, and only where it means something.

Three things carry the brand:

1. **The photographs of the factory.** The Speedmaster press hall, the CTP room, the die-cutters, the folder-gluer, the people. They are shown whole, at their natural proportions, never cropped to a shape and never zoomed as decoration. The layout fits itself to the photo, not the other way round.
2. **The maroon accent.** `{colors.accent}` (#a02830) on eyebrows, stat numbers, the nav pill, the primary button, a focus ring, a thin underline. Never a background band. Never a tint over a photo.
3. **Glass.** Every interactive effect on the site is a piece of clear glass: the frosted menu bar, the pill buttons that expand with a white rim and ice-white glow, the round loupe that follows the cursor over a photo, the lift-and-glow of a card. Nothing bounces, nothing slides in one by one, nothing fades up on scroll.

The tone is calm and plain. Copy is short and factual. Headlines are a geometric grotesk set tight, body is Inter at a comfortable measure.

## Colors

### Canvas & Surfaces

| Token | Value | Use |
|---|---|---|
| `{colors.canvas}` | #ffffff | Page background, cards, inputs |
| `{colors.surface-alt}` | #f6f5f2 | Alternate section band, footer |
| `{colors.paper}` | #faf8f4 | Home chapters, process pages, inner-page banners |
| `{colors.paper-deep}` | #f3efe7 | Bottom of the banner gradient |
| `{colors.kraft}` | #f1e9dd | Call-to-action band, the one "warmer" surface |

Sections alternate between white and one of the off-whites. There is no dark band, no grey band and no black section anywhere on the site. If a page needs contrast, it comes from a photo, not from a coloured surface.

### Text

| Token | Value | Use |
|---|---|---|
| `{colors.ink}` | #1b1c1f | Headlines, body, nav link on hover |
| `{colors.muted}` | #616369 | Body copy in cards, captions, nav links at rest, footer |

### Accent

| Token | Value | Use |
|---|---|---|
| `{colors.accent}` | #a02830 | Eyebrows, stat numbers, nav pill, accent button, focus rings, inline links |
| `{colors.accent-dark}` | #7d1f26 | Hover state of maroon fills |
| `{colors.accent-soft}` | maroon at 12% | Focus halo on inputs, hover tint on ghost chips |
| `{colors.wood}` | #a67c52 | The second accent: a 2px bullet dash in fact lists, the trail underline, the thin line above the CTA band |

Maroon is a spot colour. It appears small and seldom. Wood brown is even quieter and never appears as text.

### Hairlines & Shadows

| Token | Value | Use |
|---|---|---|
| `{colors.border}` | #e7e5e0 | Card and input borders, header and footer rules |
| `{colors.line}` | #e7e1d6 | Hairlines on paper surfaces, chapter tops, trail connectors |
| `{colors.shadow-warm}` | warm brown at 50% | All drop shadows are warm brown, never neutral grey or black |
| `{colors.glow-ice}` | ice white | Glows around glass buttons and lifted cards |

### Never

Blue is not in the palette. Not as an accent, not as a link colour, not as a tint. The CMYK cyan `--c` exists only inside the press-loader animation and the carton artwork and must not leak into UI.

## Typography

### Font Family

- **Display:** Space Grotesk 400 to 700, loaded from Google Fonts. All h1, h2, h3, stat numbers, card numbers.
- **Body:** Inter 400 to 600. Everything else.
- **Machine plates:** Michroma, used once, for the nameplate lettering on the press models. Never for UI.

### Hierarchy

| Token | Size | Weight | Use |
|---|---|---|---|
| `{typography.display-xl}` | clamp(2.6rem, 5.6vw, 5rem) | 700 | Chapter titles on the home process pages, line height .95 |
| `{typography.display-lg}` | clamp(2.4rem, 5vw, 4rem) | 700 | Hero and story headlines |
| `{typography.display-md}` | clamp(1.9rem, 3.6vw, 2.8rem) | 700 | Section h2, inner-page banner h1 |
| `{typography.display-sm}` | clamp(1.7rem, 3vw, 2.7rem) | 700 | Process scene headings |
| `{typography.title-md}` | 1.5rem | 600 | News card titles |
| `{typography.title-sm}` | 1.15rem | 600 | Card titles |
| `{typography.lead}` | 1.12rem | 400 | Section leads, max 680px |
| `{typography.body-md}` | 1rem | 400 | Body and story copy, measure 46 to 62ch, line height 1.7 |
| `{typography.body-sm}` | .93rem | 400 | Fact lists, footer |
| `{typography.caption}` | .76rem | 400 | Photo captions in muted |
| `{typography.eyebrow}` | .72rem | 600 | Uppercase, .22em tracking, maroon |

### Principles

- Headlines are tight. Display sizes use negative or zero tracking and a line height under 1.1.
- Eyebrows are the one uppercase element. Nothing else is set in caps.
- Body copy sits in a measure, never full width. 46ch for stories beside a photo, 62ch on the process page.
- Numbers are not used to label stages. The process is "Pre press, Press, Post press", never "1, 2, 3" or "01 02 03" or "Chapter one".
- "Post press" is the term everywhere. Not "offpress", not "finishing".

## Layout

### Spacing System

Based on 4px. `{spacing.section}` (96px) separates ordinary sections. Home chapters are full-viewport pages (`{spacing.chapter}`, 100svh) and get their own internal padding with `clamp()`.

### Grid & Container

- `.container` is 1140px max with 24px side gutters.
- Two-column story pages split 5fr / 7fr: copy left, photo composition right, aligned to centre.
- Photo collages use a six-column grid with a fixed height so every chapter fits one page. Each photo sits in its cell at its own proportions with `object-fit: contain`. Hierarchy comes from cell size: one hero photo, the others supporting.
- Card grids are `auto-fit, minmax(240px, 1fr)` with a 20px gap.

### The chapter stack

On the home page every section after the hero pins to the viewport and the next one slides over it. Each chapter is `position: sticky` with a z-index that increases down the page. This is the only page-level motion on the site. It replaces scroll-reveals, parallax and staged entrances, all of which were tried and rejected.

### The quality-control window

A full-height section clipped with `clip-path: inset(0)` holding a fixed photo, so the photo appears to be seen through a window in the page as the page scrolls past. Used for "Who we are", home Quality, and the quality page. The photo inside is whole and still.

## Elevation & Depth

Depth is shallow and warm.

- Cards at rest: 1px `{colors.border}`, no shadow.
- Cards, tiles and stats on hover: lift 6px, scale 1.04, border turns maroon at 35%, a 4px white ring, a 28px ice-white glow, and a warm brown shadow `0 26px 48px -22px`. Eased with `cubic-bezier(.22, 1, .36, 1)` over 350ms.
- Photos: a warm drop shadow `0 18px 22px rgba(60, 45, 30, .22)` on the frame, never on the image itself.
- The menu bar: white at 90% with a 10px backdrop blur and a hairline below. Over an inner-page banner it becomes a frosted pill at 78% white.
- Nothing uses a neutral grey or black shadow.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 3px | Carton artwork details only |
| `{rounded.sm}` | 10px | Inputs, photo frames, the loupe's photo |
| `{rounded.md}` | 12px | Client tiles on phone |
| `{rounded.lg}` | 16px | Cards, client tiles |
| `{rounded.xl}` | 18px | Larger panels |
| `{rounded.pill}` | 999px | Every button, the nav call to action |
| `{rounded.full}` | 50% | The loupe, icon dots |

### Photography Geometry

Photos keep their own aspect ratio. Frames are sized to the photo by script where the layout would otherwise stretch them. Corners are 10px. There is no circle crop, no tall crop, no "cover" fill on a factory photo. The only time a photo fills the viewport is the hero, where the camera moves through the real building: facade, entrance doors, lobby doors, the open showroom doors, press hall, Speedmaster, a continuous walk driven by scroll. Shut doors swing open on their hinges as the camera passes; the leaves are cut from the photo itself, never drawn.

## Components

### Top Navigation

**`top-nav`** - 68px sticky bar, white at 90% with a 10px blur, hairline below. Logo left, links in `{colors.muted}` turning `{colors.ink}` on hover, 26px apart. Order: Home, Services, Clients, Process, Quality, Careers, News, Contact. Right side carries **`nav-cta`**, a maroon pill, 9px by 18px padding, white text, the only filled maroon element on most pages. On wide screens the hero's building photo is anchored so the facade's horizontal joint line meets the bottom of this bar.

### Buttons

Every `.btn` on the site is a glass button. There are two kinds.

**`button-accent`** - Maroon glass. A 115deg gradient from maroon at 93% to deep maroon at 88%, white text, pill shape, 48px tall, a 1px white rim at 75%, a second inner hairline, an 8px backdrop blur and an ice-white glow. On hover or focus it expands its side padding from 18px to 44px over 1.1s with an expo ease and the glow brightens. Used for "Request a quote", "View full process" and form submits.

**`button-ghost`** - Clear glass. Near-transparent white gradient, ink text, border of warm brown at 28%, same size and expansion. Used beside the accent button and on paper surfaces.

Buttons never bounce, never darken to black and never lose their rim.

### Cards & Containers

**`card`** - White, 1px border, 16px corners, 28px padding. Title in `{typography.title-sm}`, body in `{colors.muted}`. Hover lift as described under Elevation. Cards are present on load. They do not fade or stagger in.

**`news-card`** - Same lift, white with a warm hairline, 26px corners, 32px padding, title at 1.5rem, link in maroon.

**`client-tile`** - A square white tile holding one client logo on transparency, 16px corners. On hover it lifts in place with the same white ring and glow. It does not move toward the centre or open anything.

**`stat`** - A number in Space Grotesk 2.4rem maroon over a muted label. Lifts on hover like a card.

**`chapter-page`** - A full-viewport paper page with a hairline top. Left column: eyebrow, `{typography.display-xl}` title, story paragraph, an "On the floor" list of equipment facts with wood-brown dashes, and a trail of the three chapter names joined by hairlines with the current one underlined in wood brown. Right column: the photo collage. The last chapter adds a `button-accent` under the trail.

**`qc-window`** - 115svh clipped window over a fixed photo with a copy band on alternate sides.

**`process-glance`** - On the process page, under the intro: a facility paragraph beside four numbers from the company profile (boxes a day, colours, people, year), each number in Space Grotesk maroon over a muted label with a 2px wood-brown rule on its left.

**`process-intro`** - The first page of each process chapter: eyebrow, chapter title, story, an "On the floor" list of equipment facts with wood-brown dashes, and one or two hairline lists of what the chapter handles (materials, finishes, carton styles). It shares the first scene's carton position so the travelling carton sits beside it.

**`quality-pillars`** - Four `card`s on an off-white band: colour standards, security built in, full traceability, registered and compliant. The same four appear as a hairline list on the home Quality chapter page.

**`cta-band`** - Kraft paper with a 2px wood line along the top. Ink headline, muted lead, ghost and accent buttons.

**`page-banner`** - Inner pages open with a paper gradient banner, 196px top padding under the frosted nav, ink h1, muted breadcrumbs.

### Inputs & Forms

**`text-input`** - White, 1px border, 10px corners, 12px by 14px padding, full width. Focus: border turns maroon with a 2px maroon-at-12% outline. Labels are .85rem semibold above the field.

### Photo loupe

**`photo-frame`** with `.glass-photo` - A round 170px lens follows the cursor over the photo and shows that spot at 2.2x, with a thin white rim and a soft shadow, like a magnifier laid on a print. The photo underneath stays still. No sheen, no tilt, no scale. Disabled on touch and under reduced motion.

### Footer

**`footer`** - Off-white, hairline top, 56px top padding, three columns (brand, links, contact), muted .9rem text. Never dark.

## Do's and Don'ts

### Do
- Keep every surface white or warm off-white. Alternate white and paper bands for rhythm.
- Show factory photos whole. Fit the frame to the photo.
- Use maroon for one or two small things per view. Let it be scarce.
- Use the chapter stack and the quality window for storytelling. Three chapters, one page each, one photo per stage.
- Keep every effect "glass": frosted, rimmed, glowing ice-white, warm-shadowed.
- Write short, factual copy. Equipment facts should name the real machines (Speedmaster CD 102, SM 74, Bobst folder-gluer).

### Don't
- Don't add a black, grey or dark band, a dark footer or a dark photo overlay.
- Don't use blue anywhere, including links and focus rings.
- Don't crop, zoom, tilt or "cover" a factory photo.
- Don't number the process stages or add big decorative numerals behind collages.
- Don't animate cards in one by one, fade sections up on scroll, or add parallax or 3D turns. A smooth camera glide between two photos is fine; a cube flip is not.
- Don't invent a second display face or set body text in Space Grotesk.
- Don't use neutral grey shadows. Shadows are warm brown, glows are ice white.
- Don't put captions or labels under client logos on the Clients page. The logo and the carton float side by side without text.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Phone | < 780px | Hamburger nav; chapter pages become single column with the collage in two columns; display-xl drops to clamp(2.2rem, 10vw, 3.2rem); photos cap at 46svh tall |
| Small tablet | 780 to 900px | Collage grid collapses, photo frames go full-width, copy stays above |
| Tablet | 900 to 1024px | Two-column story layout returns; card grids 2-up |
| Desktop | 1024 to 1440px | Full nav, 5/7 story split, 6-column collages, client wall 5 to 6 across |
| Wide | > 1440px | Container stays 1140px; the hero facade anchors its joint line to the nav bottom |

### Touch Targets
- Buttons are 48px tall minimum.
- Client tiles and cards are fully tappable.
- The loupe, hover lift and button expansion are off on `hover: none` and `prefers-reduced-motion`.

### Motion
- Hero: the page's own scroll is the playhead, 70svh of scrolling per stop. The camera glides towards the scroll position with a damped lag (1 - e^(-2.4 dt)) and slows into each stop without halting, the same model as the portfolio site's gallery tour. Scrolling back walks back out.
- Hero stages: building, entrance, lobby, showroom, press hall, Speedmaster. Each move dives through the doors of the front layer around its door point while the layer behind settles from 1.18x to 1x.
- Chapter stack: native scroll, sticky sections, no JavaScript tween.
- Everything else: 150 to 400ms eases on hover only.

## Iteration Guide

When adding a page or section:

1. Start on `{colors.paper}` or white. Put the photo in whole. Fit the layout around it.
2. Write the eyebrow in maroon, the headline in Space Grotesk, the copy in Inter at 46 to 62ch.
3. Reuse `.btn.btn--accent` or `.btn.btn--ghost`. They get the glass treatment automatically.
4. Reuse `.card` for anything tile-shaped. It gets the lift automatically.
5. If the section tells a story, make it a chapter: full viewport, pinned, next one slides over.
6. Check that nothing new is blue, black, grey, cropped, numbered or staggered.

## Known Gaps

- The news section still carries an older white-on-glass card style in one rule set; the lifted white card is the current direction.
- The press loader uses CMYK colours; it is the one place cyan appears and should stay contained there.
- Michroma is loaded site-wide for one nameplate; it could be subset later.
