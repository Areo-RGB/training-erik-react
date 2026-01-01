# Training Erik - Project Overview

## Project Purpose
Training Erik is a professional training management Progressive Web App (PWA) that provides various cognitive and physical training tools. The app is designed for German-speaking users and offers multiple interactive training modules.

## Tech Stack
- **Frontend Framework**: React 18.3.1 with TypeScript 5.6.2
- **Build Tool**: Vite 6.0.5
- **Routing**: React Router DOM 6.28.0
- **Styling**: Tailwind CSS 3.4.17 with custom color scheme
- **PWA**: vite-plugin-pwa 1.2.0 for offline support and installability
- **Additional Libraries**: 
  - canvas-confetti 1.9.2 for celebration effects

## Project Structure
```
src/
├── pages/           # Page components for each training tool
│   ├── Home.tsx                # Main navigation/dashboard
│   ├── SoundCounter.tsx        # Sound-triggered counter
│   ├── Farben.tsx              # Stroop effect color trainer
│   ├── Kettenrechner.tsx       # Chain calculation trainer
│   ├── Timers.tsx              # Interval timer manager
│   ├── Intervall.tsx           # Custom interval audio reminders
│   └── Capitals.tsx            # Capital cities quiz
├── components/      # Shared components
│   ├── Layout.tsx              # Main app layout
│   └── timers/                 # Timer-related components
├── hooks/           # Custom React hooks
│   ├── useAudio.ts             # Audio playback functionality
│   └── useLocalStorage.ts      # Local state persistence
├── App.tsx          # Route configuration
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## Key Features
- **PWA Support**: Offline-first architecture with service worker
- **Audio Integration**: Web Audio API for sound effects and alerts
- **Responsive Design**: Mobile-first approach with portrait orientation
- **Local Storage**: Client-side state persistence
- **Google Fonts Caching**: Optimized font loading with 1-year cache
- **Dark Theme**: Dark color scheme (#0B0E14 base)

## Application Type
Single Page Application (SPA) with client-side routing, deployed as a PWA for standalone mobile app experience.
