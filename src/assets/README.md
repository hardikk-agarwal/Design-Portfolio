# Material Sources

## Personal Photographs

Hardik supplied and approved these three images for the personal scroll-story
prototype on 28 September 2026. Originals in the Images folder are unchanged.

| Bundled Derivative | Original | Dimensions |
| --- | --- | --- |
| hardik-portrait.jpg | [Image (3).jpg](../../Images/Image%20(3).jpg) | 1122x1402 |
| hardik-candid.jpg | [Image (4).jpg](../../Images/Image%20(4).jpg) | 1024x1024 |
| hardik-camera.jpg | [Image (5).jpg](../../Images/Image%20(5).jpg) | 1269x1800 |
| hardik-cutout.webp | [Image (5).jpg](../../Images/Image%20(5).jpg) | 512x1400 |
| hardik-camera.webp | hardik-camera.jpg | 1269x1800 |
| hardik-camera-chip.webp | hardik-camera.jpg | 529x289 |
| hardik-candid.webp | hardik-candid.jpg | 1024x1024 |

The React portfolio uses the WebP copies (quality 86, Sharp effort 6); `story.html`
keeps the JPEGs. Mean per-channel difference from the JPEG is under 2 of 255, and
they are 34 to 41% smaller. `hardik-camera-chip.webp` is the exact region the
Approach statement's inline "lens" chip used to show by scaling the full portrait
2.4x (left 370, top 393), so that chip no longer downloads the 339 KB portrait.

The JPEG derivatives are quality 88, with metadata removed. They are resized,
not retouched or generated. Responsive CSS crops them without asserting a place,
date, or occasion. No external image service receives these files.

The transparent WebP is a local foreground extraction of the camera portrait,
encoded at quality 90 with an alpha channel. It uses an upper-body CSS crop for
the opening. Facial features are neither synthesized nor retouched. The bench
photo was rejected for foreground extraction because the bench produced poor
segmentation edges; its intact photograph is used instead.

`hardik-bench-subject.webp` (1122x1402, quality 86, alpha quality 92) is the
front layer for the landing page cover, where the name passes behind Hardik's
head. Its colour pixels are the unchanged `hardik-portrait.jpg`; its alpha is
taken from Hardik's supplied background-removed export
([Image (3) 1.png](../../Images/PNGs/Image%20(3)%201.png), measured as registered
to the photo within JPEG noise). It sits exactly over the photograph beneath.

`hardik-bench-scene.webp` (1122x1402, quality 84) is the landing cover
photograph. Hardik, the bench slats and everything below the seat (legs,
cobblestones) are the photograph's own pixels. Only the ivy wall above the rail
and between the slats is replaced by a flat painted-looking wall: a radial
gradient (#34453b to #121814) with fine monochrome grain, a soft shadow band
under the rail and a soft shadow cast by Hardik. Slat rows were classified by
row colour statistics (teal, low texture versus dark, textured ivy). No part of
Hardik was generated or retouched.

The earlier matte used `@imgly/background-removal-node`; both current files
were composed with Sharp in an isolated temporary tools directory, not as
portfolio dependencies. The segmentation ran
locally using downloaded model assets. Neither the model nor the processing
library is included in the site. When regenerating from a temporary installation,
set `publicPath` to the package's resolved `dist` directory: its default otherwise
looks for model files under the current working directory. Inspect edges on a
light background and validate alpha values and output dimensions before use.

For PowerShell/System.Drawing conversions, use an explicitly floating-point
scale, for example `[Math]::Min([double]1, [double]1800 / $longestEdge)`. An
integer first argument can select an integer overload and round the scale to 1.
Verify the decoded dimensions against the intended size cap, not just against
the intermediate calculation.

The opening and photographic panes share source URLs through `data-photo-from`.
Keep each original image source in one HTML location: the single-file build
otherwise repeats its base64 payload for every literal occurrence. Source reuse
reduced the current standalone export from 6.68 MB to 3.71 MB without changing
image quality. Verify all shared copies after building, including in a local file.

## Work Screens

`work/*.webp` are product screens from Hardik's Figma file "Portfolio projects"
(pages Company Account, Copilot sports and Windows Developer portal), exported
as the original uploaded images, then cropped, resized (1600px wide for full
screens, 900 to 960px for cards) and encoded as WebP quality 80 with Sharp in a
temporary folder. The Copilot cover is Hardik's chosen crop (node 3:2340),
rendered at 3x and resized to 1400px wide. The four sports cards are cropped to the card and padded with
the screenshot's own background so they share one size; they start at the card,
without Copilot's intro sentence. Store screens drop the browser bar and Windows
taskbar (rows 80 to 964 of the 1600x1020 originals). The Copilot before/after
pair shares one crop around the answer (880x588), and `copilot-shell.webp` is the
redesign screen (Figma node 1:21717) cropped to the prompt and card. On Windows,
run `sharp.cache(false)` and write buffers with `fs.writeFileSync` when
overwriting a source image, or Sharp keeps the file locked. Screens containing
personal contact details were left out. They power the React work sheets, Work
index and project pages; project screens open in a full-size viewer.

The Windows Developer Center screens are under NDA. They live with the case
study text in `src/protected/portal/` (git-ignored) and ship only inside the
encrypted `src/app/lib/sealed-case-studies.json`. The public
`work/portal-cover-locked.webp` is the cover reduced to an 8x5 colour field,
scaled back up and blurred, with a lock badge, so no layout or text survives.

## Exhibition Covers

The four `cover-*.jpg` images are original renders of the project models in
[src/exhibition-stage.js](../exhibition-stage.js), not product screenshots.
They are bundled locally for the archived story page's work index, readers, and graphics fallback.

To regenerate them, mount `createExhibition(host, { centered: true })` in a
1440x960 host in the dev browser. Wait for `data-renderer="webgl"`, then select
each project instantly and allow two animation frames. Composite its WebGL
canvas onto a 1440x960 2D canvas filled with that exhibit's colour. Export the
raw canvas with `toBlob` as JPEG at quality 0.92, then dispose the temporary scene.
Do not use a page screenshot for asset exports: the integrated browser can apply
display scaling and include scrollbars even with Playwright's `scale: 'css'`.
Validate the saved image dimensions and content before replacing the covers.

Keep extruded front and back face normals planar while smoothing sidewalls and
bevels. Averaging normals across every shared vertex can produce triangular
highlights on otherwise flat faces. Inspect both curved edges and flat surfaces
at full resolution before exporting.

## Desk Study Assets

The black-oak color, OpenGL normal, and roughness maps are optimized JPEG derivatives of 1K scans from
[Black Oak Veneer, Poly Haven](https://polyhaven.com/a/black_oak_veneer).
Poly Haven distributes these texture assets under
[CC0](https://polyhaven.com/license).

The maps are bundled locally. Viewing the portfolio does not contact Poly Haven.

The telescope uses [Orion Rainbow of Infrared Light, PIA13959](https://images.nasa.gov/details/PIA13959),
credited to NASA/ESA/JPL-Caltech/IRAM. This is an infrared composite, not a
simulation of the view through a visible-light telescope. It is shown with its
credit under the [JPL image use policy](https://www.jpl.nasa.gov/jpl-image-use-policy/)
for this personal, unpublished portfolio. Review third-party image terms before
commercial publication; the image is not described as CC0 or as the author's work.