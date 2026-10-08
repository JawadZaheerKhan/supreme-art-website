# Supreme Art website

Static site: `node build.js` renders `templates/*.html` (+ `templates/partials`) with `content/*.json` into `dist/`.
Missing template values are build errors. Repo files use CRLF line endings.

## Design system

Read `DESIGN.md` before adding or changing any UI. It holds the colour, type, spacing, component and motion rules
for this site (paper-white surfaces, maroon as a scarce accent, whole uncropped factory photos, glass effects,
three-chapter storytelling, no stage numbering, no blue, no dark bands, no one-by-one card entrances).

## Git

Commit and push to the `hamza` branch on the `supreme` remote only. Never merge with or push `main`.
