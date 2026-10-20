# Sonosus VR logo options

## What is in this folder

| Files | What they are |
| --- | --- |
| `0-current-*` | The logo the site uses today, exported so it can be improved or replaced |
| `0-current-where-it-appears.png` | Every place the current logo shows up, captured from the site |
| `1-fan-*` | Concept 1: solid ultrasound fan with depth lines |
| `2-outline-*` | Concept 2: outlined fan |
| `3-serif-*` | Concept 3: fan with a serif wordmark |
| `preview*.png` | Side-by-side boards of concepts 1 to 3 |

Current logo files:

| File | Use |
| --- | --- |
| `0-current-mark-navy.svg` | The mark alone, for light backgrounds (vector, editable) |
| `0-current-mark-white.svg` | The mark alone, for navy backgrounds (vector, editable) |
| `0-current-tab-icon.svg` / `.png` | Browser-tab icon |
| `0-current-iphone-icon.png` | iPhone home-screen icon |
| `0-current-icon.png` | The mark at 1024 px |
| `0-current-logo-light-bg.png` / `-dark-bg.png` | Mark and wordmark together |
| `0-current-link-preview.png` | The card shown when a link is shared |

## Why the current mark looks off

- **The curves don't share a center.** In a real ultrasound fan, the bottom edge and the depth lines all curve
  around the top point. Here each curve has a different radius, so the bottom bulges like a cone and the inner
  lines look like bowls cut off by the sides.
- **The dots look accidental.** The blue dot sits on top of a depth line, and the gold dot floats outside the
  shape.
- **Thin lines.** The outline style thins out at small sizes, such as the browser tab and the certificate
  header.

## Where the logo appears

Every one of these is drawn from a single definition in `src/lib/brand-mark.tsx`:

- Site header and footer (every page)
- Sign-in and sign-up pages
- Studio sidebar and mobile Studio header
- Lesson player and exam headers
- Certificate: header line and the center of the "Verified" seal
- Certificate page header (print view)
- 404 page and the sonosusvr.com landing page
- Browser-tab icons (SVG and PNG) and the iPhone home-screen icon
- Link-preview cards for sonosusvr.org and sonosusvr.com

The automatic emails show the name as text only. A logo image can be added to them once the final logo is
chosen.

## What to send for the new logo

1. **An SVG file** (vector) of the mark on its own, without the words. Figma, Illustrator, Canva and most
   logo tools can export SVG. A PNG also works: send it at least 1024 px on a transparent background, and it
   will be redrawn as a vector.
2. **The colors**, if they differ from the current navy `#0b1f3a`, blue `#35a3de` and gold `#b58b33`.
3. **How it should look on navy** (white, or a different color version).
4. **The words, if they change.** Today "Sonosus VR" and "EDUCATION" are typed in Plus Jakarta Sans. Send a
   full logo file too if the lettering is custom.

Tips: keep the mark roughly square so it fits icons, and check that it still reads at 16 px wide, which is
the size of the browser-tab icon.

## What happens when the new logo arrives

The new shapes replace the definition in `src/lib/brand-mark.tsx`, which updates every place listed above at
once: the site, the certificates, the tab and iPhone icons, and the link previews. The `0-current-*` files in
this folder are then regenerated from the new logo so they always match the live site.
