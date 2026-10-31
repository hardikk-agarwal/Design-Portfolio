import { Hero } from '@/sections/hero'
import { Approach } from '@/sections/approach'
import { SelectedWork } from '@/sections/work'
import { BuiltWithAI } from '@/sections/built-with-ai'
import { Experience } from '@/sections/experience'
import { BeyondWork } from '@/sections/beyond'
import { InTheirWords } from '@/sections/words'

export function HomePage() {
  return (
    <>
      <Hero />
      <Approach />
      <SelectedWork />
      <BuiltWithAI />
      <InTheirWords />
      <Experience />
      <BeyondWork />
    </>
  )
}
