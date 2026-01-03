import { Link } from 'react-router-dom'

const tools = [
  {
    title: 'Sound-Zähler',
    description: 'Erhöht einen Zähler, wenn der Geräuschpegel einen Schwellenwert überschreitet.',
    link: '/sound-counter',
    icon: 'sound-counter',
    tags: ['AUDIO', 'TRIGGER'],
    accentGradient: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:text-blue-500'
  },
  {
    title: 'Farben',
    description: 'Stroop-Effekt-Trainer. Farben und Wörter blinken, um die Reaktionsgeschwindigkeit zu verbessern.',
    link: '/farben',
    icon: 'farben',
    tags: ['KOGNITIV', 'REAKTION'],
    accentGradient: 'from-pink-500 to-rose-600',
    hoverColor: 'group-hover:text-pink-500'
  },
  {
    title: 'Kettenrechner',
    description: 'Kopfrechnen-Kettenaufgaben. Löse fortlaufende Rechenoperationen.',
    link: '/kettenrechner',
    icon: 'kettenrechner',
    tags: ['MATHE', 'FOKUS'],
    accentGradient: 'from-emerald-500 to-green-600',
    hoverColor: 'group-hover:text-emerald-500'
  },
  {
    title: 'Timer',
    description: 'Intervall-Timer und Schleifen-Voreinstellungen für verschiedene Trainingseinheiten.',
    link: '/timers',
    icon: 'timers',
    tags: ['WERKZEUG', 'INTERVALL'],
    accentGradient: 'from-orange-500 to-amber-600',
    hoverColor: 'group-hover:text-orange-500'
  },
  {
    title: 'Intervall',
    description: 'Setze benutzerdefinierte Intervalle für Audio-Erinnerungen.',
    link: '/intervall',
    icon: 'intervall',
    tags: ['AUDIO', 'TAKT'],
    accentGradient: 'from-purple-500 to-violet-600',
    hoverColor: 'group-hover:text-purple-500'
  },
  {
    title: 'Hauptstädte Quiz',
    description: 'Teste dein Wissen über europäische Hauptstädte mit diesem Zeit-Quiz.',
    link: '/capitals',
    icon: 'capitals',
    tags: ['GEOGRAPHIE', 'GEDÄCHTNIS'],
    accentGradient: 'from-cyan-500 to-teal-600',
    hoverColor: 'group-hover:text-cyan-500'
  }
]

function ToolIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'timers':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    case 'farben':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      )
    case 'kettenrechner':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
        </svg>
      )
    case 'intervall':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20"/>
          <path d="M2 12h20"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
          <path d="M2 12a10 10 0 0 1 10-10"/>
        </svg>
      )
    case 'sound-counter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      )
    case 'capitals':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    default:
      return null
  }
}

export default function Home() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 py-4 sm:py-6 animate-enter">
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2 mb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
          Training Erik
        </h1>
        <p className="text-[#94A3B8] text-[10px] sm:text-xs md:text-sm font-medium tracking-wide uppercase">
          Professionelles Trainings-Management
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {tools.map((tool, i) => (
          <Link
            key={tool.title}
            to={tool.link}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group relative overflow-hidden rounded-xl bg-[#151A23] border border-white/5 hover:border-white/10 transition-all hover-spring animate-enter opacity-0 cursor-pointer h-full touch-manipulation active:scale-[0.98]"
          >
            {/* Left Accent Border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b group-hover:w-1.5 transition-all ${tool.accentGradient}`}></div>

            <div className="flex items-start p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 lg:gap-5 h-full">
              {/* Icon Box */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-[#0B0E14] border border-white/5 flex items-center justify-center text-[#64748B] transition-colors shrink-0 mt-0.5 ${tool.hoverColor}`}>
                <ToolIcon icon={tool.icon} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                <div>
                  <h3 className={`text-sm sm:text-base lg:text-lg font-bold text-[#F1F5F9] mb-1 transition-colors truncate leading-tight ${tool.hoverColor}`}>
                    {tool.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-[#94A3B8] leading-relaxed line-clamp-2 mb-2">
                    {tool.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-auto">
                  {tool.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-[4px] text-[8px] sm:text-[9px] font-bold tracking-wider bg-[#0B0E14] text-[#64748B] border border-white/5 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
