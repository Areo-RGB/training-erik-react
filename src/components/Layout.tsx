import { useRef, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { title: 'Home', link: '/' },
  { title: 'Sound-Zähler', link: '/sound-counter' },
  { title: 'Farben', link: '/farben' },
  { title: 'Kettenrechner', link: '/kettenrechner' },
  { title: 'Timer', link: '/timers' },
  { title: 'Intervall', link: '/intervall' },
  { title: 'Hauptstädte Quiz', link: '/capitals' },
]

export default function Layout() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)


  const scroll = (direction: number) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerHeight * 0.6
      scrollContainerRef.current.scrollBy({
        top: scrollAmount * direction,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full w-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#0B0E14] text-[#F1F5F9] font-sans antialiased selection:bg-[#3B82F6] selection:text-white relative scroll-smooth"
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[60] p-2.5 sm:p-3 bg-[#151A23]/90 backdrop-blur-sm border border-white/10 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-lg transition-all hover-spring touch-manipulation"
        aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Slide-out Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <nav
        className={`fixed top-0 right-0 z-[58] h-full w-64 sm:w-72 bg-[#151A23]/95 backdrop-blur-md border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-16 sm:pt-20 px-4 sm:px-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.link}>
                <Link
                  to={item.link}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    location.pathname === item.link
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Navbar (Hidden on Home) */}
      {!isHome && (
        <nav className="w-full bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 py-3 sm:py-4 mb-4 animate-enter">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer text-[#F1F5F9] hover:text-[#3B82F6] transition-colors select-none"
            >
              <div className="text-[#3B82F6] group-hover:-translate-x-1 transition-transform p-1 -ml-1 sm:m-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
              </div>
              <h1 className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-[#94A3B8] group-hover:text-[#F1F5F9]">
                Zurück
              </h1>
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-24">
        <Outlet />
      </main>

      {/* Scroll Controls - Hidden on mobile where less useful */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-50 flex-col gap-3 animate-enter delay-500 opacity-0">
        <button
          onClick={() => scroll(-1)}
          className="p-3 bg-[#151A23]/90 backdrop-blur-sm border border-white/10 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-lg transition-all hover-spring group touch-manipulation"
          aria-label="Scroll Up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <button
          onClick={() => scroll(1)}
          className="p-3 bg-[#151A23]/90 backdrop-blur-sm border border-white/10 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-lg transition-all hover-spring group touch-manipulation"
          aria-label="Scroll Down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  )
}
