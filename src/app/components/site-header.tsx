import { Mail, Moon, Sun } from 'lucide-react'
import { Link, useNavigation } from '@/lib/navigation'
import { useTheme } from '@/lib/theme'
import { email } from '@/lib/content'
import { cn } from '@/lib/utils'

const items = [
  { to: '#work', label: 'Work', pages: ['work', 'project'] },
  { to: '#about', label: 'About', pages: ['about'] },
  { to: '#resume', label: 'Resume', pages: ['resume'] },
]

export function SiteHeader() {
  const { route } = useNavigation()
  const { theme, toggle } = useTheme()
  const nextTheme = theme === 'dark' ? 'daylight' : 'evening'

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 text-foreground backdrop-blur-xl transition-[background-color,border-color,color] duration-500 header-clear:border-transparent header-clear:bg-transparent header-clear:text-[#f4f4f1] header-clear:backdrop-blur-none">
      <div className="flex h-[var(--header-height)] items-center gap-4 px-5 md:px-10">
        <Link to="#top" className="mr-auto text-[1.35rem] font-extrabold tracking-[-0.04em] [font-stretch:115%]">
          <span aria-hidden="true">ha<span className="text-primary header-clear:text-[#ff8aa3]">.</span></span>
          <span className="ml-3 text-[15px] font-medium tracking-normal [font-stretch:100%] max-sm:sr-only">Hardik Agarwal</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-[15px] font-medium">
          {items.map((item) => {
            const current = item.pages.includes(route.page)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={current ? 'page' : undefined}
                className={cn('relative rounded-full px-3 py-2 transition-opacity hover:opacity-100 md:px-4', current ? 'opacity-100' : 'opacity-75')}
              >
                {item.label}
                {current && <span aria-hidden="true" className="absolute inset-x-3 bottom-1 h-px bg-current md:inset-x-4" />}
              </Link>
            )
          })}
        </nav>
        <a href={`mailto:${email}`} className="hidden h-10 items-center rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition-transform active:scale-[0.97] header-clear:bg-[#f4f4f1] header-clear:text-[#111315] md:inline-flex">
          Get in touch
        </a>
        <a href={`mailto:${email}`} aria-label="Get in touch by email" title="Get in touch" className="grid size-10 place-items-center rounded-full md:hidden">
          <Mail aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
          className="grid size-10 place-items-center rounded-full transition-transform active:scale-[0.94]"
        >
          {theme === 'dark' ? <Sun aria-hidden="true" className="size-[18px]" strokeWidth={1.75} /> : <Moon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  )
}
