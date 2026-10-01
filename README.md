# Hardik Agarwal: Full Circle

A cinematic, scroll-led product-design portfolio: from customizing Windows as a kid to helping design it at Microsoft. Built with React 19, Vite, Tailwind CSS v4, GSAP (ScrollTrigger, SplitText), Lenis smooth scrolling, a ThreeUI Community canvas, Lucide icons, and a self-hosted Mona Sans variable font. It has no backend, makes no external requests, and never accesses the visitor's camera or microphone. The previous scroll story is preserved at [story.html](story.html) and the first-person desk experiment at [desk.html](desk.html).

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Check And Export

```sh
npm run check
npm run build
```

`check` type-checks the React app, syntax-checks the legacy scripts, and runs the route and journey tests. The build produces three independent, self-contained files: [dist/index.html](dist/index.html) for the portfolio, [dist/story/story.html](dist/story/story.html) for the previous scroll story, and [dist/desk/desk.html](dist/desk/desk.html) for the desk study. Each embeds its JavaScript, CSS, fonts, and images and opens directly from disk. The resume PDF ships beside the portfolio as `dist/Hardik_Agarwal_Resume.pdf`.

## Password-Protected Case Study

The Windows Developer Center case study is under NDA, so the site ships it encrypted. Its readable source is `src/protected/portal/` (`case-study.json` plus its screens). That folder and `.env.local` are git-ignored and stay on this machine; keep a private backup of the folder.

1. Add the password to `.env.local`: `CASE_STUDY_PASSWORD=your-long-passphrase`. Use 12+ characters; a few random words work well.
2. Run `npm run seal`. It encrypts the case study and its screens with AES-256-GCM, using a key derived from the password with PBKDF2-SHA256 (600,000 iterations), into `src/app/lib/sealed-case-studies.json`.
3. Commit that sealed file. Run `npm run seal` again after editing `src/protected/` or changing the password. The production build stops if the seal is missing and warns when the source is newer than the seal.

Visitors see the public teaser and an NDA gate that asks for the password or offers an email request. The browser derives the key from the typed password and decrypts in memory; a wrong password fails the integrity check. Nothing is stored, so a reload asks again. Anyone given the password can read and save the case study. Decryption uses Web Crypto, which needs https or localhost.

## Deploy To GitHub Pages

The build needs no secrets because it ships only the sealed copy. Routes use the hash and asset URLs are relative, so the site works at a user site root or a `/<repo>/` project path without a 404 fallback.

`npm run build:pages` is the hosted build. Unlike `npm run build`, it keeps JavaScript, CSS, fonts and images as separate hashed files, so the first visit downloads roughly a quarter of the single-file export: images load as they near the viewport, the browser fetches only the font subsets it needs, and the sealed case study loads only on its gate. The HTML preloads the display font and, when the URL opens the home page, both hero layers, so the first render matches the single-file build. Its `desk` and `story` exports are unchanged.

1. Push the repository to GitHub. A public repository is fine: it holds only the sealed case study.
2. In Settings > Pages, set Source to GitHub Actions.
3. Push to `main`. [The workflow](.github/workflows/deploy-pages.yml) deploys every push automatically: it installs dependencies from the public npm registry, runs `npm run build:pages`, and publishes `dist`. To redeploy without a new commit, use Actions > Deploy to GitHub Pages > Run workflow.
4. With a custom domain, turn on Enforce HTTPS.

Before going live, remove `noindex, nofollow` from the HTML files if the site should appear in search.

## Portfolio

- **Opening.** An annotated magazine cover. Hardik sits on the bench against a plain painted wall (the original ivy was too busy), and "HARDIK AGARWAL" runs across the top, passing behind his head through a registered cutout layer. From 1024px wide, a rose layout grid draws in and each body part is selected, pinned, and annotated like a design comp: Head (systems thinking), Eyes (research), Arm (AI prototyping), Heart (photography and space), and Brooch (20% fewer craft bugs on Windows Hello). Notes rest as a body-part tag and a title so the cover stays calm and scannable. Hovering, focusing, or tapping a note opens its detail, and pointing at the body part itself shows that part's selection bounds and opens its note; clicking keeps it open while the others step back, and clicking the note again, clicking the empty canvas, or pressing Escape closes it. Note cards stack beside their pins, clear of the name and intro copy, with room reserved for the opened detail; the lowest-priority notes drop on short screens. The photograph pulls into focus on load, and on fine pointers the name drifts against the photo for depth. On large screens, scrolling fades the notes, contracts the photograph into a window while the name parts, and "I grew up customizing Windows. Now I help design it." arrives on either side. Phones and portrait screens set the name in front of the photo at the bottom without notes; short screens and reduced motion get the static cover with the same statement below it.
- **Approach.** A large statement fills in word by word as it scrolls, with an inline photo in place of the word "lens". Design, Build, and Research follow with their toolkits.
- **Selected work.** The period in "Selected work." opens like a camera aperture onto Microsoft Store. Three real projects from Hardik's Figma case studies (Microsoft Store company onboarding, Windows Developer Center and Copilot Sports) stack as full-screen colour sheets; each shows the outcome headline, two impact figures, role and a "Read project" link beside a real product screen. The Windows Developer Center is under NDA: its sheet shows an abstract locked cover and an "Unlock case study" link to a password gate. Each project page opens on the same cover with its impact figures, then an at-a-glance sidebar (role, team, timeline, scope), the problem, the key insight, three key decisions with screens, the result and a takeaway: a 2 to 3 minute read, with the full process left in Figma.
- **Experience, interests, contact.** Career rows and a scroll-reactive toolkit marquee, a personal photo with interests, and a closing contact screen over the ThreeUI Typography Vortex with a magnetic "Get in touch" button.
- **Pages.** `#work`, `#work/<id>`, `#about`, and `#resume` open reading pages behind a curtain transition that names the destination. Browser Back restores the previous scroll position, and Escape returns from a reading page. Legacy `#exhibition/<id>`, `#my-story`, `#my-approach`, `#selected-work`, and `#beyond-work` links still resolve, and links to the retired placeholder projects (`#work/hello`, `#work/vr`) open the Work index. The resume page downloads Hardik's final resume, served from [public/Hardik_Agarwal_Resume.pdf](public/Hardik_Agarwal_Resume.pdf) at a stable URL next to the page; replace that file to update it.
- **Motion and access.** GSAP matchMedia gates the pinned sequences to screens at least 1024x620 without reduced motion. Content reveals use opacity so assistive technology can always read the text. Invisible controls are made non-interactive, and keyboard focus scrolls hidden story content into view. Lenis runs only for fine pointers without reduced motion.

## Design Tooling

- **Taste Skill:** the full pack is installed globally in `~/.agents/skills` (including `design-taste-frontend` v2 and `redesign-existing-projects`).
- **21st:** the MCP server is configured in [.vscode/mcp.json](.vscode/mcp.json). VS Code asks for the API key from [21st.dev/mcp](https://21st.dev/mcp) the first time the server starts and stores it securely. Its agent skills are in `.claude/skills` (plus Cursor and Codex copies). The project is shadcn-compatible ([components.json](components.json), `@/` alias, `cn` helper, Tailwind v4 tokens), so `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"` works once signed in. The registry returns 403 without a key.
- **ThreeUI:** `@designcodeio/threeui` (Community, MIT). Import individual components from `@designcodeio/threeui/components/<Name>`. Many Community components render iframe demos that load Tailwind's CDN, GSAP, and remote images; prefer the native canvas components. The ThreeUI MCP server requires a Pro account and is not configured.
- **GSAP:** 3.15 with `@gsap/react`. ScrollTrigger and SplitText are registered in [src/app/lib/gsap.ts](src/app/lib/gsap.ts).

## Previous Scroll Story

- The desktop opening layers a locally prepared portrait silhouette, two photographic windows, and expressive name typography. As the visitor scrolls, the secondary windows and type move away and the intact portrait expands. Work and resume are reachable immediately; the sticky header remains available throughout. Phones retain a readable full-photo opening.
- Four photographic window panes assemble with scroll progress as the story moves from childhood PC customization to contributing to Windows at Microsoft. The copy remains visible and readable throughout.
- The camera portrait and a lime typographic scene carry his shared-perspective approach. A later candid photograph accompanies photography, astronomy, technology, and fitness interests.
- One native-text work sequence covers Microsoft Store, Copilot Sports, Windows Hello, and PlayShifu. On large screens with ordinary motion, a single full-width Three.js stage sits behind the project text. Rectangular apertures expand matching concept artwork to cover each model change and reverse with scrolling. There is no carousel and no duplicate homepage catalogue.
- Phones, shorter screens, and reduced motion use static project imagery with ordinary document scrolling. Fresh visits in these modes do not initialize WebGL. GSAP coordinates transforms and chapter selection without scroll smoothing, wheel interception, or pinned spacer elements.
- `#work`, `#about`, `#resume`, and `#work/store` style reading links remain valid. Legacy `#exhibition/store`, `#exhibition/copilot`, `#exhibition/hello`, and `#exhibition/vr` hashes now jump to their story chapters. `#my-story`, `#my-approach`, `#selected-work`, and `#beyond-work` link to the new sections.
- Project readers preserve ownership and outcomes before the narrative and illustrative art. Back to story and Escape return to the corresponding chapter. Browser Back restores the previous story position. Sharing and resume PDF actions retain visible, announced feedback and never copy local machine paths.
- The Work page keeps the scannable comparison catalogue. About contains the supplied Windows story, communication approach, values, interests, and career history.
- The 3D studies remain clearly conceptual, not shipped product screenshots or real biometric data. Matching local covers serve the readers and graphics fallback. The renderer compiles asynchronously, starts only near the work section, and pauses outside it, on reading pages, and in hidden tabs.
- Approved personal photographs are optimized and metadata-free in the bundle; original files remain unchanged. Asset provenance is in [src/assets/README.md](src/assets/README.md).

## Desk Study

The earlier experience is available at [desk.html](desk.html) during development. Its existing camera, telescope, paper, and monitor interactions are retained. It is an archived alternative, not a prerequisite for the exhibition.

- Interviewers can go directly to Work, Resume, or Email from 48px corner shortcuts. Exploring the camera and personal objects is optional.
- The reading view has a scannable work index showing the problem, Hardik's role, and a result for each project. Work, About, Resume, and the PDF download remain directly accessible while reading.
- Project links such as `#work/store`, `#work/copilot`, `#work/hello`, and `#work/vr` open focused summaries. `#work`, `#about`, and `#resume` open the corresponding overview pages. A fresh reading link does not initialize the 3D renderer.
- Browser Back/Forward follows reading navigation. Escape or the return button restores the previous physical view, selected project, camera power, and focus. Background rendering pauses while reading.
- The hanging nameplate introduces Hardik and opens the clipped resume. The paper moves toward the visitor for reading and returns to its original place.
- The left monitor selects work; the right monitor presents it and states Hardik's role. Room-based reading stays on that monitor, with the separate Reading view available for larger text and conventional navigation.
- A Canon DSLR rests on the desk, moves continuously into a held position, powers on, and displays a live room view. Its dial selects objects; its shutter enters the viewfinder.
- Capture opens the selected physical reading surface and adds a scene thumbnail to playback inside the camera. Returning preserves the camera view, including after switching projects.
- The working notebook has keyboard-accessible Design, Build, and Research pages.
- The Meta Quest 3 opens Hardik's PlayShifu AR/VR background on the project monitor. The telescope reveals a zoomable, credited NASA/ESA infrared image of the Orion Nebula, not a simulated visible-light observation.
- The custom PC, keyboard, fitness equipment, bottle, and desk lighting are personal surroundings, not arbitrary navigation items.
- Portrait layouts use a stacked dual-monitor arm and a front-of-desk camera position. Paper and monitor readers keep their own scrolling surfaces.
- The resume download is a PDF generated locally with jsPDF from the supplied resume facts, not a copy of the original attachment.
- Daylight/evening lighting, reduced-motion support, keyboard controls, and explicit graphics-context recovery are included.

WebGL and CSS3DRenderer share one viewing camera, so geometry, text, and interaction targets use the same perspective. The DSLR's separate offscreen lens camera only supplies its live display. Cached html-to-image snapshots put real monitor and paper content into that display and captured frames.

Physical materials distinguish coated metal, textured rubber, molded polymer, glass, paper, and scanned wood veneer. The DSLR has a smooth shaped shell and woven strap; the workstation has thin monitor bezels, a labelled mechanical keyboard, cable routing, and layered PC internals. Area lights, a rear light strip, local contact shadows, and cached soft VSM shadows provide depth without a full-screen postprocessing pass. Rendering pauses when the scene is settled or the document is hidden. Asset provenance and publication caveats are in [src/assets/README.md](src/assets/README.md).

Drag the room to look around. Arrow keys select objects in the viewfinder; its zoom controls change framing. Enter/Space activate focused controls. Escape steps back through the current experience. The first keyboard-accessible skip control opens the readable portfolio. CSS3D assumes 100% browser/display zoom; the readable view is the alternative for magnified or conventional reading.

Captured frames and visited-object state exist only in memory and reset on reload. Only the theme preference is saved to localStorage. Captures are rendered room images, not photos from the device.

Additional personal photo sourcing, Instagram integration, detailed research case studies, and deployment remain deferred. Three personal photographs were supplied and approved for the scroll-story iteration. Project text and metrics are grounded in the supplied resume. No confidential product screenshots are included. The HTML remains `noindex, nofollow` until publication is approved.

## Edit

- [index.html](index.html) and [src/app/main.tsx](src/app/main.tsx): portfolio entry point, theme bootstrap, fonts, and styles.
- [src/app/App.tsx](src/app/App.tsx): hash routes, history and scroll restoration, Lenis, curtain transitions, focus, and Escape handling.
- [src/app/sections](src/app/sections): homepage sections (hero sequence, approach, selected work, experience, interests).
- [src/app/pages](src/app/pages): Work, project, About, and Resume pages.
- [src/app/components](src/app/components): header, contact footer with the ThreeUI vortex, curtain, magnetic control, and page title.
- [src/app/lib/content.ts](src/app/lib/content.ts): adapts the shared project, resume, and story data for the app.
- [src/app/lib/routes.js](src/app/lib/routes.js) and [routes.test.js](src/app/lib/routes.test.js): allowlisted route parsing, including legacy links.
- [src/app/styles.css](src/app/styles.css): Tailwind v4 theme tokens (shadcn names), light and dark palettes, and the hero, aperture, and stack CSS.
- [story.html](story.html): preserved previous scroll story, using the files below.
- [src/exhibits.js](src/exhibits.js): project order, study data, colours, and selection helpers.
- [src/exhibition.js](src/exhibition.js): story navigation, reader routes, theme, lazy artwork initialization, and PDF action.
- [src/portfolio-scroll.js](src/portfolio-scroll.js): GSAP scroll-linked transforms, responsive lifecycle, work chapter selection, and scene visibility.
- [src/exhibition-stage.js](src/exhibition-stage.js): Three.js project sculptures, lighting, picking, responsive framing, and graphics recovery.
- [src/exhibition-art.js](src/exhibition-art.js): bundled study renders for project imagery and the HTML fallback.
- [src/exhibition.css](src/exhibition.css): exhibition layout and accessible, responsive reading styles.
- [desk.html](desk.html): preserved desk-study entry point.
- [src/desk.css](src/desk.css): physical screen and paper styles, responsive typography, and theme tokens.
- [src/room.js](src/room.js): geometry, shared perspective, surface compositing, picking, and physical movement.
- [src/desk.js](src/desk.js): UI bindings, reading routes, lazy room startup, screen snapshots, lighting, notebook tabs, and camera playback.
- [src/surfaces.js](src/surfaces.js): project catalogue and scroll chapters, world-mapped HTML, interviewer reading pages, and resume PDF generation.
- [src/journey.js](src/journey.js): pure desk/camera transitions and allowlisted reading-link parsing.
- [src/journey.test.js](src/journey.test.js): state transition regression tests.
- [src/stories.js](src/stories.js): resume-grounded story content.
- [PRODUCT.md](PRODUCT.md): agreed audience, direction, and scope.

The `clawpilotTheme=light` or `clawpilotTheme=dark` query parameter can force the initial theme for previewing. Without an override, the page follows the saved preference or operating system theme.

The generated reflection map is GPU-backed. Release it on graphics-context loss and regenerate it on restoration; retaining the old render target restores geometry without its lighting.

## Story Verification

A desktop production audit of the type-and-photo iteration measured 82 performance, 100 accessibility, and 100 best practices: 1.9 s LCP, 0 ms total blocking time, and 0.001 layout shift. The standalone file is approximately 3.71 MB and embeds the photographs, foreground cutout, scripts, fonts, and artwork. Reusing image sources reduced it from 6.68 MB without lowering image quality. It is still larger than the prior photo-free exhibition; lazy images defer decoding, not transfer inside a single-file export. These are local lab results, not field performance guarantees. Lighthouse saved its complete report before a Windows temporary-profile cleanup error. The report's remaining source-map warning is informational.

- Check the portrait and opening links at desktop, phone, and short landscape sizes. Keep the face unobscured, text within its bounds, and a hint of the next section visible.
- Check the first frame explicitly: the 60px glimpse of the next chapter must not start the opening animation before the visitor scrolls. The person and name must remain fully visible at scroll zero and after reversing.
- Repeated photographic panes use `data-photo-from` to share an existing source URL. Verify these copies in the standalone export: repeated literal HTML image sources embed the same bytes more than once. For automated decoding checks, scroll lazy images into view or temporarily load them eagerly and restore their original setting.
- The homepage must contain exactly four work chapters, each once, with native contribution, role, result, and reading links. Work retains its separate comparison catalogue.
- Verify window-pane transforms at two scroll positions and in reverse. Body copy must never be gated by an animation or a reveal class.
- Sample the portrait handoff and photographic-pane assembly midway as well as at their endpoints. At each project boundary, the artwork aperture must cover the full stage when the model changes and clear completely afterward. Reduced motion must remove transition layers, unmask headings, and restore the initial composition.
- Measure overlay contrast against the colour field and scrim together. Keep the brighter artwork area separate from the text, and use per-project ink for its small credit.
- The work sequence needs its own dark base beneath the sticky visual. Otherwise offscreen light text is measured against the pale page, and may briefly appear there before the artwork is painted. Check each active scene as well as the whole document.
- Validate all four work scenes with nonblank canvas pixels and no graphics errors. Allow two animation frames, then wait for `data-moving="false"`. Sticky artwork naturally releases at the end of its parent; do not mistake that for broken pinning.
- Resize between cinematic, short-screen, phone, and reduced-motion layouts. Fresh reduced-motion and phone visits must create no WebGL canvas, show all four covers, and retain native Home, End, arrow, and touch scrolling.
- Navigation waits two animation frames after responsive motion setup before restoring an anchor. A breakpoint refresh can otherwise overwrite a simultaneous chapter jump. Wait for `body.dataset.routeReady` to match the requested hash before asserting route position, not merely for the URL or early view flag.
- A sticky section's viewport rectangle is not its original document position. Route photo-scene anchors through the static sequence wrapper. When checking reader return, record the actual departure scroll position: Playwright `locator.click()` can scroll a sticky header before clicking. A coordinate click at its measured visible bounds avoids this automation-induced jump.
- Fresh project reading links skip WebGL. Back and Escape return to the right chapter below the sticky header; browser Back restores the previous story position. Sticky reader controls must not overlap the site header.
- Keep project narrative ahead of its illustration in DOM order. On phones, the illustration follows all three narrative sections. Reserve image dimensions before lazy loading.
- Test successful and denied clipboard writes with an isolated mock, never the user's clipboard. Local file links must not be copied. Validate the generated PDF blob's MIME type and `%PDF` signature.
- Accessible link names must contain the visible label intact: use `Read project: Microsoft Store`, not `Read Microsoft Store project`. Check the wordmark too; decorative initials can otherwise cause label-in-name failures despite a perfect aggregate accessibility score.
- Keep the static cover visible during shader preparation and after context loss; verify restoration. Pause the scene outside the work section, in readers, and on hidden tabs.
- Integrated-browser hidden tabs pause animation frames. Test in a visible page and check viewport dimensions before and after screenshots rather than changing rendering logic to compensate for the test environment.
- Reference-site inspections that navigate or scroll the same browser page must run serially. Parallel navigation on one page races the screenshot and locator checks; independent file reads or checks can still run in parallel.
- Keep the supplied personal facts and approximate project figures accurate. The photos are approved user assets. Project screens and figures come from Hardik's Figma case studies; Windows Developer Center figures are targets and must stay labelled as targets. The archived story and desk pages still use the earlier generated concept covers.

## Desk Verification Notes

The earlier visual-only build's desktop headless audit measured 2.2 s LCP, zero layout shift, and 2.03 s total blocking time. Those figures are not a new audit of the interviewer changes. Software-rendered room startup remains a performance limitation; direct reading links now bypass 3D initialization. Projected object controls still need accessibility review; the native interviewer shortcuts and reader controls provide a larger-target route.

- Check phone, tablet, and desktop framing; nonuniform canvas pixels; physical camera controls; capture and return; playback revisits; notebook tabs; readable fallback; and PDF generation.
- Verify a fresh `#work/store` load has no room canvas, browser Back returns to the work index, and returning from reading resumes the same monitor/camera state. At 320px, the first overview project and its result should fit in the initial reading viewport.
- Keep route markers distinct from component markers. Reading uses `data-reader-route`; notebook handlers are scoped to `.notebook-tabs [data-page]` so navigation and download clicks cannot be mistaken for notebook tabs.
- Wait for the room's `data-mode` and `data-moving="false"` before measuring. The body's UI state changes before the 3D animation finishes. After changing the viewport, also allow two animation frames: the canvas backing size can update before CSS3D's projected surfaces, producing transient, wildly incorrect bounds. Check viewport dimensions before and after embedded-browser screenshots.
- Measure text and target sizes after perspective projection, not just their source CSS sizes. Inactive background surfaces must remain inert while an object is being inspected.
- Zero-alpha cutout meshes need black RGB with `NoBlending`; white RGB at zero alpha causes invalid premultiplied compositing and hides the HTML. Screens and papers need opaque DOM backgrounds. Camera controls use individual circular cutouts so the curved 3D grip remains visible between them; rebuild these from source-layout offsets after CSS3D has mounted the controls, including after responsive changes.
- Place physical control surfaces ahead of raised geometry. Sampling canvas alpha at control centers detects a dial or other mesh obscuring HTML controls.
- Rasterize HTML surface content before entering the viewfinder. CSS3D is not part of the WebGL render buffer, so otherwise captures have blank screens and papers.
- Keep captured images at their original aspect ratio with `height: auto`. Avoid scaling a transformed control's outer element on press, which can move its hit target.
- Release and regenerate the reflection map after graphics-context loss. Verify that the readable view stays available until restoration succeeds.
- The embedded browser may intercept downloads without a Playwright download event. Check the generated PDF blob's MIME type and `%PDF` signature separately from native download handling.
- Restart an active preview with `npm run dev -- --force` if dependency changes produce `504 Outdated Optimize Dep` responses. A multi-file update also produced a stale module with a missing export despite passing source tests; restarting resolved it. Use a full reload, not just hash navigation, when checking updated page-shell markup.
- A white page with "does not provide an export named …" means Vite cached a file it read mid-save (seen when several files were saved at once). Confirm by fetching the module from the page: an empty module has only a source map with `sourcesContent: [""]`. Update that file's timestamp (`(Get-Item <file>).LastWriteTime = Get-Date`) and reload; no restart needed.