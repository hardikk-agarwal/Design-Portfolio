import { Hero } from '@/sections/hero'
import { Approach } from '@/sections/approach'
import { SelectedWork } from '@/sections/work'
import { Experience } from '@/sections/experience'
import { BeyondWork } from '@/sections/beyond'

export function HomePage() {
  return (
    <>
      <Hero />
      <Approach />
      <SelectedWork />
      <Experience />
      <BeyondWork />
    </>
  )
}
