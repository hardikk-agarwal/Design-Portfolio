import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger.js'

export function createPortfolioScroll(root, { onProject, onSceneActive }) {
  gsap.registerPlugin(ScrollTrigger)
  let active = true
  let workVisible = false
  let disposed = false
  const triggers = new Set()
  const media = gsap.matchMedia()
  root.dataset.scrollMode = 'stacked'

  const context = gsap.context(() => {
    root.querySelectorAll('.work-chapter').forEach((chapter, index) => {
      triggers.add(ScrollTrigger.create({
        trigger: chapter,
        start: 'top 60%',
        end: 'bottom 60%',
        onToggle: trigger => { if (active && trigger.isActive) onProject(index, root.dataset.scrollMode === 'cinematic') },
        onRefresh: trigger => { if (active && trigger.isActive) onProject(index, root.dataset.scrollMode === 'cinematic') },
      }))
    })
    media.add('(min-width: 1000px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
      root.dataset.scrollMode = 'cinematic'
      const scopedTriggers = []
      const curtains = []
      const track = animation => {
        triggers.add(animation.scrollTrigger)
        scopedTriggers.push(animation.scrollTrigger)
        return animation
      }
      root.querySelectorAll('.work-chapter').forEach((chapter, index) => {
        track(gsap.fromTo(chapter.querySelector('h3'), { clipPath: 'inset(0% 0% 100% 0%)', y: 24 }, {
          clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'none',
          scrollTrigger: { trigger: chapter, start: 'top 92%', end: 'top 55%', scrub: true },
        }))
        if (!index) return
        const curtain = document.createElement('div')
        curtain.className = 'project-curtain'
        curtain.setAttribute('aria-hidden', 'true')
        curtain.style.setProperty('--cp-curtain-color', getComputedStyle(chapter).getPropertyValue('--cp-project-bg'))
        const preview = document.createElement('img')
        preview.src = chapter.querySelector('[data-artwork]').src
        preview.alt = ''
        preview.width = 1440
        preview.height = 960
        preview.decoding = 'async'
        curtain.append(preview)
        root.querySelector('.work-visual').append(curtain)
        curtains.push(curtain)
        const transition = track(gsap.timeline({
          scrollTrigger: { trigger: chapter, start: 'top 80%', end: 'top 40%', scrub: true },
        }))
        transition.fromTo(curtain, { clipPath: 'inset(48% 48% 48% 48%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, ease: 'power2.inOut', duration: 0.5 })
        transition.to(curtain, { clipPath: 'inset(0% 0% 0% 100%)', ease: 'power2.inOut', duration: 0.5 })
      })
      const hero = root.querySelector('.story-hero')
      const headerHeight = () => parseFloat(getComputedStyle(root).getPropertyValue('--header-height'))
      const opening = track(gsap.timeline({
        scrollTrigger: {
          trigger: '.origin-story', start: 'top bottom-=60', end: () => `top top+=${headerHeight()}`, scrub: true,
          onUpdate: trigger => { hero.inert = trigger.progress > 0.94 },
        },
      }))
      opening.fromTo('.hero-photo', { clipPath: 'inset(22% 29% 6% 39%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.8 }, 0)
      opening.fromTo('.hero-photo', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.08)
      opening.to('.hero-photo img', { scale: 1.04, yPercent: -3, ease: 'none', duration: 1 }, 0)
      opening.to('.hero-cutout', { yPercent: 5, scale: 1.1, opacity: 0, transformOrigin: '50% 18%', ease: 'none', duration: 0.55 }, 0)
      opening.to('.hero-glimpse-camera', { xPercent: -115, rotation: -6, ease: 'none', duration: 0.65 }, 0)
      opening.to('.hero-glimpse-candid', { xPercent: 130, rotation: 6, ease: 'none', duration: 0.65 }, 0)
      opening.to('.hero-firstname', { xPercent: -50, opacity: 0, ease: 'none', duration: 0.45 }, 0)
      opening.to('.hero-lastname', { xPercent: 50, opacity: 0, ease: 'none', duration: 0.45 }, 0)
      opening.to('.hero-role, .hero-lead, .hero-actions', { y: 30, opacity: 0, ease: 'none', duration: 0.3 }, 0)
      const timeline = track(gsap.timeline({
        scrollTrigger: { trigger: '.origin-journey', start: 'top 68%', end: 'bottom 68%', scrub: true },
      }))
      timeline.fromTo('.window-study', { rotationY: -14, rotationX: 4, rotationZ: -5, scale: 0.84 }, { rotationY: 0, rotationX: 0, rotationZ: 0, scale: 1, ease: 'none', duration: 1 }, 0)
      timeline.fromTo(root.querySelectorAll('.window-pane'), {
        x: index => [-72, 64, -42, 58][index],
        y: index => [-40, -60, 52, 42][index],
        rotation: index => [-8, 7, -4, 9][index],
      }, { x: 0, y: 0, rotation: 0, duration: 0.85, stagger: 0.05, ease: 'none' }, 0)
      const lens = track(gsap.timeline({
        scrollTrigger: { trigger: '.lens-sequence', start: 'top bottom', end: () => `top top+=${headerHeight()}`, scrub: true },
      }))
      lens.fromTo('.lens-photo', { clipPath: 'inset(8% 18% 8% 18%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 }, 0)
      lens.fromTo('.lens-photo img', { scale: 1.12 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      lens.fromTo('.lens-copy h2', { x: -44 }, { x: 0, ease: 'none', duration: 1 }, 0)
      track(gsap.fromTo('.work-heading .section-title span', { x: 90 }, {
        x: 0, ease: 'none',
        scrollTrigger: { trigger: '.work-heading', start: 'top bottom', end: 'bottom center', scrub: true },
      }))
      track(gsap.fromTo('.candid-photo', { rotation: -3, y: 24 }, {
        rotation: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.beyond-work', start: 'top 85%', end: 'center center', scrub: true },
      }))
      const visibility = ScrollTrigger.create({
        trigger: '.work-sequence', start: 'top bottom', end: 'bottom top',
        onToggle: trigger => {
          workVisible = trigger.isActive
          onSceneActive(active && workVisible)
        },
        onRefresh: trigger => {
          workVisible = trigger.isActive
          onSceneActive(active && workVisible)
        },
      })
      triggers.add(visibility)
      scopedTriggers.push(visibility)
      if (!active) scopedTriggers.forEach(trigger => trigger.disable())
      return () => {
        hero.inert = false
        curtains.forEach(curtain => curtain.remove())
        scopedTriggers.forEach(trigger => triggers.delete(trigger))
        workVisible = false
        root.dataset.scrollMode = 'stacked'
        onSceneActive(false)
      }
    })
  }, root)

  return {
    refresh() { if (!disposed) ScrollTrigger.refresh() },
    setActive(value) {
      active = value
      for (const trigger of triggers) {
        if (value) trigger.enable(false, false)
        else trigger.disable(false)
      }
      onSceneActive(value && workVisible && root.dataset.scrollMode === 'cinematic')
    },
    dispose() {
      disposed = true
      active = false
      media.revert()
      context.revert()
      triggers.clear()
      onSceneActive(false)
      delete root.dataset.scrollMode
    },
  }
}