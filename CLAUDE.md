# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Training Erik is a German-language Progressive Web App (PWA) providing cognitive and physical training tools. The project is organized as a **Turborepo monorepo** containing:
- **Web App** (`apps/web/`): React 18 PWA with Vite, TypeScript, and Tailwind CSS
- **Mobile App** (`apps/mobile/`): React Native app with Expo, Expo Router, and Uniwind
- **Shared Package** (`packages/shared/`): Common hooks, constants, and types

The web app is a fully client-side application with offline support and is deployed to Vercel.

**Production URL**: https://training-erik-react-jbwpwrqyi-asds-projects-d827e0fc.vercel.app

## Common Commands

**Note**: This project uses Bun as the package manager and Turborepo for monorepo management.

### Development
```bash
bun install          # Install all dependencies
bun run dev          # Start all apps (web + mobile)
bun run dev:web      # Start web dev server only (http://localhost:5173)
bun run dev:mobile   # Start mobile dev server only (Expo)
bun run build        # Build all apps
bun run preview      # Preview web production build locally (http://localhost:4173)
```

### Web App Specific
```bash
cd apps/web
bun run dev          # Start web dev server
bun run build        # Build web app for production
bun run preview      # Preview production build
bun run test         # Run tests in watch mode
bun run test:ui      # Vitest UI in browser
bun run coverage     # Generate coverage report
```

### Mobile App Specific
```bash
cd apps/mobile
bunx expo start      # Start Expo development server
bunx expo start -a   # Start and open in Android emulator
```

### Linting & Formatting
```bash
bun run lint         # Run ESLint on all apps
bun run format       # Format all code with Prettier
bun run format:check # Check formatting
bun run clean        # Clean all build artifacts
```

### Testing PWA Features
```bash
bun run build && bun run preview
# Then use Chrome DevTools:
# - Application > Service Workers (verify registration)
# - Application > Manifest (verify installability)
# - Network > Offline checkbox (test offline mode)
```

### Deployment
```bash
vercel --prod --yes  # Deploy web app to Vercel production
```

## Architecture

### Monorepo Structure

```
training-erik-react/
├── apps/
│   ├── web/              # React PWA with Vite
│   └── mobile/           # React Native with Expo
├── packages/
│   └── shared/           # Shared code between apps
│       ├── hooks/        # useInterval, useStorage (with adapters)
│       ├── constants/    # Game constants, colors, quiz data
│       └── types/        # Shared TypeScript types
├── turbo.json            # Turborepo configuration
└── vercel.json           # Vercel deployment config
```

### Web App Structure (`apps/web/`)

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
- Local storage via `useStorage` hook from shared package

**Component Organization**:
- `src/pages/` - Page components (one per route)
- `src/components/` - Shared components (Layout, timer components)
- `src/hooks/` - Web-specific hooks (useAudio, useMicrophoneInput, useFontSize)

### Mobile App Structure (`apps/mobile/`)

**Routing**: Expo Router (file-based routing)
- `/` - Home screen with navigation cards
- `/kettenrechner` - Mental math game
- `/farben` - Stroop effect trainer
- `/capitals` - European capitals quiz

**State Management**: React state + AsyncStorage via `useStorage` hook from shared package

**Component Organization**:
- `app/` - Expo Router screens (file-based routing)
- `components/` - React Native components
- `hooks/` - Mobile-specific hooks (asyncStorageAdapter)

### Shared Package (`packages/shared/`)

Platform-agnostic code shared between web and mobile:
- **Hooks**: `useInterval`, `useStorage` (with adapter pattern)
- **Constants**: Game configs, colors, quiz data (FONT_SIZE, FARBEN, CAPITALS, KETTENRECHNER, EUROPE_CAPITALS, STROOP_COLORS)
- **Types**: GameStatus, GameConfig, utility functions (shuffleArray)
- **Adapters**:
  - `localStorageAdapter` (web) in `apps/web/src/hooks/useLocalStorage.ts`
  - `asyncStorageAdapter` (mobile) in `apps/mobile/hooks/asyncStorageAdapter.ts`

### Audio System

Uses Web Audio API exclusively (no audio files):
- Oscillator-based sound generation via `useAudio` hook
- Singleton `AudioContext` stored in `useRef`
- Proper cleanup: always call `stop()` and `disconnect()` on oscillators
- Google Actions sounds cached via PWA for interval timers

### PWA Architecture

- **Service Worker**: Prompt-based update registration (`registerType: 'prompt'`)
- **Caching**:
  - CacheFirst for static assets and fonts (1-year expiration)
  - Google Fonts, gstatic, and Google Actions sounds cached
  - Offline-first for core functionality
- **Manifest**: Standalone display, any orientation allowed
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

- **Monorepo**: Uses Turborepo for task orchestration and caching across apps
- **Package Manager**: Bun 1.1.0+ required (faster than npm/yarn)
- **Language**: German for UI text and domain comments, English for general code comments
- **No Backend**: Web app is fully client-side, can deploy to any static host
- **Testing**: Vitest with React Testing Library and jsdom environment (web app only)
- **Vite**: HMR enabled, TypeScript errors shown in browser overlay and terminal
- **Storage**:
  - Web: localStorage via `localStorageAdapter`
  - Mobile: AsyncStorage via `asyncStorageAdapter`
  - Both use the shared `useStorage` hook
- **Deployment**:
  - Web app deployed to Vercel
  - Configured in `vercel.json` with Bun build commands
  - Production URL: https://training-erik-react-jbwpwrqyi-asds-projects-d827e0fc.vercel.app

