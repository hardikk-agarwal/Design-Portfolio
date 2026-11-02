import { useEffect, useState } from 'react'
import { useNavigation } from '@/lib/navigation'
import { markSectionsReady } from '@/lib/stage'
import { Hero } from '@/sections/hero'
import { Approach } from '@/sections/approach'
import { SelectedWork } from '@/sections/work'
import { BuiltWithAI } from '@/sections/built-with-ai'
import { Experience } from '@/sections/experience'
import { BeyondWork } from '@/sections/beyond'
import { InTheirWords } from '@/sections/words'

const sections = [Approach, SelectedWork, BuiltWithAI, InTheirWords, Experience, BeyondWork]

// Only the first visit to the cover arrives in steps; a section link or a later return renders the page whole.
let staged = false

export function HomePage() {
  const { route } = useNavigation()
  const [shown, setShown] = useState(() => (staged ? sections.length : 0))
  const count = route.page === 'home' && route.anchor ? sections.length : shown

  useEffect(() => {
    staged = true
    if (count >= sections.length) {
      markSectionsReady()
      return
    }
    const timer = window.setTimeout(() => setShown(count + 1))
    return () => window.clearTimeout(timer)
  }, [count])

  return (
    <>
      <Hero />
      {sections.slice(0, count).map((Section, index) => <Section key={index} />)}
    </>
  )
}
