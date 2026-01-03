# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Training Erik is a German-language Progressive Web App (PWA) providing cognitive and physical training tools. Built with React 18, TypeScript, Vite, and Tailwind CSS, it's a fully client-side application with offline support.

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript compile + production build
npm run preview      # Preview production build locally
```

### Testing PWA Features
```bash
npm run build && npm run preview
# Then use Chrome DevTools:
# - Application > Service Workers (verify registration)
# - Application > Manifest (verify installability)
# - Network > Offline checkbox (test offline mode)
```

## Architecture

### Application Structure

**Routing**: Single-page app with React Router DOM. All routes share `<Layout />` component:
- `/` - Home dashboard with navigation cards
- `/intervall` - Custom interval audio reminders
- `/farben` - Stroop effect color trainer
- `/kettenrechner` - Chain calculation mental math
- `/timers` - Interval timer manager with sequences
- `/sound-counter` - Sound-triggered counting (requires microphone)
- `/capitals` - Capital cities quiz

**State Management**: No global state library. Uses:
- Local component state (`useState`)
- URL state (React Router)
- Local storage via `useLocalStorage` hook for persistence

**Component Organization**:
- `src/pages/` - Page components (one per route)
- `src/components/` - Shared components (Layout, timer components)
- `src/hooks/` - Custom hooks (useAudio, useLocalStorage)

### Audio System

Uses Web Audio API exclusively (no audio files):
- Oscillator-based sound generation via `useAudio` hook
- Singleton `AudioContext` stored in `useRef`
- Proper cleanup: always call `stop()` and `disconnect()` on oscillators
- Google Actions sounds cached via PWA for interval timers

### PWA Architecture

- **Service Worker**: Auto-update registration strategy
- **Caching**:
  - CacheFirst for static assets and fonts (1-year expiration)
  - Google Fonts, gstatic, and Google Actions sounds cached
  - Offline-first for core functionality
- **Manifest**: Standalone display, portrait orientation locked
- **Requires HTTPS**: For PWA features and microphone access (localhost OK for dev)

### Styling System

Tailwind CSS with custom color palette defined in `tailwind.config.js`:
- Dark theme base: `#0B0E14` (canvas), `#151A23` (surface)
- Mobile-first responsive design
- Custom colors: `canvas`, `surface`, `surface-hover`, `subtle`, `primary`, `secondary`, `action`, `success`, `icon`, `muted-red`, `muted-orange`
- Inter font family

## Code Conventions

### TypeScript
- Strict mode enabled
- ESNext modules, ES2020 target
- React JSX transform (no React import needed)
- Unused locals/params allowed

### Component Patterns
- Functional components only
- Default exports for components
- PascalCase for components, camelCase for functions/variables
- Hooks: `useRef` for DOM refs and persistent values, `useCallback` for memoization

### Import Organization
```typescript
// External dependencies first
import { useRef, useCallback } from 'react'

// Internal imports after
import Layout from './components/Layout'
import { useAudio } from './hooks/useAudio'
```

### Error Handling
- Console logging with `console.error()`
- Silent failures with try-catch for expected errors (e.g., audio initialization)
- TypeScript strict mode provides compile-time safety

## Key Implementation Details

### Custom Hooks Pattern
Encapsulate complex logic in custom hooks with clean APIs:
```typescript
export function useAudio() {
  const refs = useRef(...)
  const callbacks = useCallback(...)
  return { publicMethods }
}
```

### Audio Implementation Notes
- Create new oscillator for each beep (don't reuse)
- Connect to AudioContext before calling `start()`
- Always cleanup: `oscillator.stop()` then `oscillator.disconnect()`
- Frequencies and durations passed as parameters for flexibility

### Environment Variables
Create `.env.local` for environment variables (not committed):
- `GEMINI_API_KEY` - if using Gemini API (mentioned in README)

## Development Notes

- **Language**: German for UI text and domain comments, English for general code comments
- **No Backend**: Fully client-side, can deploy to any static host
- **No Testing Framework**: Manual testing via dev server and browser DevTools
- **Vite**: HMR enabled, TypeScript errors shown in browser overlay and terminal
- **Local Storage**: Use Chrome DevTools > Application > Local Storage to debug persistence
