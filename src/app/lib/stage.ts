// The home page renders the cover first and each section below it in a later task, so the first layout covers the
// cover alone and no single task blocks the page for long. The cover's intro waits for the sections (see hero.tsx).
let resolve = () => {}
export const sectionsReady = new Promise<void>((done) => {
  resolve = done
})
export const markSectionsReady = () => resolve()
