import { Fragment } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

export type Note = { id: string; part: string; title: string; text: string; side: 'left' | 'right'; pin: [number, number]; box: [number, number, number, number] }

// Layout position ignoring transforms, so notes lay out the same at any scroll or animation state.
export function offsetIn(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0
  let y = 0
  let node: HTMLElement | null = element
  while (node && node !== ancestor) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}

const corners = ['left-0 top-0', 'left-full top-0', 'left-0 top-full', 'left-full top-full']

// Selection boxes and pins, placed in fractions of their positioned parent.
export function NoteMarks({ notes }: { notes: Note[] }) {
  return (
    <>
      {notes.map(({ id, pin, box }) => (
        <Fragment key={id}>
          <span
            data-note-box={id}
            aria-hidden="true"
            className="pointer-events-none absolute hidden border-[1.5px] border-[#f0587a] opacity-0 lg:block"
            style={{ left: `${box[0] * 100}%`, top: `${box[1] * 100}%`, width: `${(box[2] - box[0]) * 100}%`, height: `${(box[3] - box[1]) * 100}%` }}
          >
            {corners.map((corner) => (
              <span key={corner} className={`absolute size-[7px] -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-[#f0587a] bg-white ${corner}`} />
            ))}
          </span>
          <span
            data-note-pin={id}
            aria-hidden="true"
            className="pointer-events-none absolute hidden size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0587a] ring-2 ring-[#f4f4f1] lg:block"
            style={{ left: `${pin[0] * 100}%`, top: `${pin[1] * 100}%` }}
          />
        </Fragment>
      ))}
    </>
  )
}

export function NoteCards({ notes }: { notes: Note[] }) {
  return (
    <div className="note-overlay pointer-events-none absolute inset-0 z-10 hidden lg:block">
      <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        {notes.map(({ id }) => (
          <path key={id} data-note-line={id} fill="none" stroke="#f0587a" strokeWidth={1.25} />
        ))}
      </svg>
      <ul aria-label="Notes on Hardik">
        {notes.map((note) => (
          <li
            key={note.id}
            data-note-card={note.id}
            className={cn(
              'pointer-events-auto absolute top-0 w-[15.5rem] rounded-xl bg-[rgb(10_16_11/0.62)] text-[#f4f4f1] ring-1 ring-white/10 backdrop-blur-md',
              note.side === 'left' ? 'left-10' : 'right-10',
            )}
          >
            <button type="button" aria-expanded="false" className="block w-full cursor-pointer rounded-xl p-3.5 text-left">
              <span className="note-chip inline-block rounded-[4px] bg-[#f0587a] px-1.5 py-1 text-[12px] font-semibold leading-none text-[#1b0910]">{note.part}</span>
              <span className="sr-only">: </span>
              <span className="mt-2 block text-[15px] font-semibold leading-snug">{note.title}</span>
              <span className="sr-only">. </span>
              <span className="note-detail">
                <span className="block pt-1 text-[13px] leading-snug text-[#f4f4f1]/70">{note.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const find = (root: HTMLElement, kind: 'box' | 'pin' | 'card', id: string) => root.querySelector<HTMLElement>(`[data-note-${kind}="${id}"]`)!
const line = (root: HTMLElement, id: string) => root.querySelector<SVGPathElement>(`[data-note-line="${id}"]`)!

// Stacks each column's cards beside their pins in the space left around the blockers, then draws the leader lines.
// `scale` is the pins' resting transform scale about the stage centre.
export function layoutNotes(root: HTMLElement, notes: Note[], stage: HTMLElement, blockers: HTMLElement[], scale = 1) {
  const overlay = root.querySelector<HTMLElement>('.note-overlay')
  if (!overlay?.offsetWidth) return
  const width = stage.clientWidth
  const height = stage.clientHeight
  const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 72
  const rects = blockers.map((element) => {
    const { x, y } = offsetIn(element, stage)
    return { left: x, top: y, right: x + element.offsetWidth, bottom: y + element.offsetHeight }
  })
  const spacing = 14
  for (const side of ['left', 'right'] as const) {
    const items = notes.flatMap((note, rank) => {
      if (note.side !== side) return []
      const card = find(root, 'card', note.id)
      const pin = find(root, 'pin', note.id)
      const path = line(root, note.id)
      card.style.display = pin.style.display = path.style.display = ''
      const anchor = offsetIn(pin, stage)
      const x = width / 2 + (anchor.x - width / 2) * scale
      const y = height / 2 + (anchor.y - height / 2) * scale
      // Reserve the opened height, so a note can expand in place without covering its neighbour.
      const detail = card.querySelector<HTMLElement>('.note-detail')
      const reserved = detail ? card.offsetHeight - detail.offsetHeight + (detail.firstElementChild as HTMLElement).scrollHeight : card.offsetHeight
      return [{ note, rank, card, pin, path, height: reserved, x, y, top: 0 }]
    })
    if (!items.length) continue
    const left = items[0].card.offsetLeft
    const right = left + items[0].card.offsetWidth
    let spans: [number, number][] = [[header + 20, height - 40]]
    for (const rect of rects) {
      if (rect.right < left || rect.left > right) continue
      spans = spans.flatMap(([start, end]): [number, number][] => {
        if (rect.bottom + 24 <= start || rect.top - 24 >= end) return [[start, end]]
        const pieces: [number, number][] = [[start, Math.min(end, rect.top - 24)], [Math.max(start, rect.bottom + 24), end]]
        return pieces.filter(([from, to]) => to > from)
      })
    }
    const groups = spans.map(() => [] as typeof items)
    for (const item of items) {
      let nearest = -1
      let distance = Infinity
      spans.forEach(([start, end], index) => {
        const away = item.y < start ? start - item.y : item.y > end ? item.y - end : 0
        if (away < distance) {
          distance = away
          nearest = index
        }
      })
      if (nearest >= 0) groups[nearest].push(item)
    }
    const shown = new Set<(typeof items)[number]>()
    groups.forEach((group, index) => {
      const [start, end] = spans[index]
      group.sort((a, b) => a.y - b.y)
      const needed = () => group.reduce((sum, item) => sum + item.height, 0) + spacing * (group.length - 1)
      while (group.length && needed() > end - start) group.splice(group.indexOf(group.reduce((a, b) => (b.rank > a.rank ? b : a))), 1)
      let cursor = start
      for (const item of group) {
        item.top = Math.max(item.y - 22, cursor)
        cursor = item.top + item.height + spacing
      }
      let limit = end
      for (const item of [...group].reverse()) {
        item.top = Math.min(item.top, limit - item.height)
        limit = item.top - spacing
      }
      group.forEach((item) => shown.add(item))
    })
    for (const item of items) {
      if (!shown.has(item)) {
        item.card.style.display = item.pin.style.display = item.path.style.display = 'none'
        continue
      }
      item.card.style.top = `${item.top}px`
      const chip = item.card.querySelector<HTMLElement>('.note-chip')!
      const startY = item.top + chip.offsetTop + chip.offsetHeight / 2
      const startX = side === 'left' ? item.card.offsetLeft + item.card.offsetWidth : item.card.offsetLeft
      const bendX = startX + (side === 'left' ? 20 : -20)
      const reach = Math.hypot(item.x - bendX, item.y - startY) || 1
      const endX = item.x - ((item.x - bendX) / reach) * 7
      const endY = item.y - ((item.y - startY) / reach) * 7
      item.path.setAttribute('d', `M${startX} ${startY}H${bendX}L${endX} ${endY}`)
    }
  }
  overlay.dataset.ready = 'true'
}

export function hideNotes(root: HTMLElement, notes: Note[]) {
  gsap.set(notes.map(({ id }) => find(root, 'pin', id)), { scale: 0 })
  gsap.set(notes.flatMap(({ id }) => [find(root, 'card', id), line(root, id)]), { opacity: 0 })
}

// Each part is selected, pinned, then annotated, like marking up a comp. Inline styles are cleared at the end so the
// hover and open states in CSS take over.
export function revealNotes(root: HTMLElement, notes: Note[]) {
  const sequence = gsap.timeline()
  let step = 0
  for (const note of notes) {
    const path = line(root, note.id)
    const box = find(root, 'box', note.id)
    const pin = find(root, 'pin', note.id)
    const card = find(root, 'card', note.id)
    if (path.style.display === 'none') {
      gsap.set([pin, card, path], { clearProps: 'opacity,transform' })
      continue
    }
    const at = step++ * 0.3
    const length = path.getTotalLength()
    sequence
      .fromTo(box, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, at)
      .to(box, { opacity: 0, duration: 0.5, ease: 'power1.in', clearProps: 'opacity,transform' }, at + 1.1)
      .to(pin, { scale: 1, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' }, at + 0.3)
      .fromTo(path, { opacity: 1, strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut', clearProps: 'opacity,strokeDasharray,strokeDashoffset' }, at + 0.35)
      .fromTo(card, { opacity: 0, x: note.side === 'left' ? -14 : 14 }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', clearProps: 'opacity,transform' }, at + 0.6)
  }
  return sequence
}

// The smallest body-part box under a viewport point, so the eyes win over the head that contains them.
export function noteAt(root: HTMLElement, notes: Note[], x: number, y: number) {
  let found: string | null = null
  let area = Infinity
  for (const { id } of notes) {
    if (find(root, 'pin', id).style.display === 'none') continue
    const box = find(root, 'box', id).getBoundingClientRect()
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue
    if (box.width * box.height < area) {
      area = box.width * box.height
      found = id
    }
  }
  return found
}

// Notes rest as titles. Hovering or focusing a note (or its body part) opens it; clicking keeps it open until it is
// clicked again, the empty canvas is clicked, or Escape is pressed.
export function bindNotes(root: HTMLElement, notes: Note[]) {
  let hovered: string | null = null
  let pinned: string | null = null
  const apply = () => {
    const active = hovered ?? pinned
    if (active) root.dataset.note = active
    else delete root.dataset.note
    for (const { id } of notes) {
      const open = id === active
      for (const element of [find(root, 'card', id), find(root, 'pin', id), find(root, 'box', id), line(root, id)]) element.toggleAttribute('data-open', open)
      find(root, 'card', id).querySelector('button')?.setAttribute('aria-expanded', String(open))
    }
  }
  const hover = (id: string | null) => {
    if (hovered === id) return
    hovered = id
    apply()
  }
  const toggle = (id: string) => {
    pinned = pinned === id ? null : id
    apply()
  }
  const clear = () => {
    if (!pinned) return
    pinned = null
    apply()
  }
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') clear() }
  window.addEventListener('keydown', escape)
  const unbind = notes.map(({ id }) => {
    const card = find(root, 'card', id)
    const button = card.querySelector('button')!
    const enter = () => hover(id)
    const leave = () => { if (hovered === id) hover(null) }
    const click = () => toggle(id)
    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    button.addEventListener('focus', enter)
    button.addEventListener('blur', leave)
    button.addEventListener('click', click)
    return () => {
      card.removeEventListener('pointerenter', enter)
      card.removeEventListener('pointerleave', leave)
      button.removeEventListener('focus', enter)
      button.removeEventListener('blur', leave)
      button.removeEventListener('click', click)
    }
  })
  return {
    hover,
    toggle,
    clear,
    dispose() {
      unbind.forEach((remove) => remove())
      window.removeEventListener('keydown', escape)
      hovered = pinned = null
      apply()
    },
  }
}
