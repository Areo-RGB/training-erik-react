# Monorepo Design: Web + React Native Mobile

**Date:** 2026-01-06
**Status:** Approved

## Overview

Convert the Training Erik web app into a Turborepo monorepo containing the existing web app and a new React Native mobile app (Android only).

## Technology Stack

- **Monorepo:** Turborepo
- **Package Manager:** Bun
- **Mobile Framework:** Expo with Expo Router
- **Mobile Styling:** Uniwind (Tailwind bindings for RN)
- **Platforms:** Web (existing) + Android (new)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Code sharing | Shared logic only | Hooks/constants share well; UI differs too much |
| Hook abstraction | Storage only | Audio APIs too different to abstract usefully |
| Package structure | Flat (single shared pkg) | Small codebase; can split later if needed |
| Initial mobile screens | 4 screens | Home, Kettenrechner, Farben, Capitals (no audio deps) |
| Mobile testing | Deferred | Focus on architecture first |
| PWA | Keep | Serves desktop/tablet users |

## Directory Structure

```
training-erik/
├── apps/
│   ├── web/                    # Vite React app (moved from root)
│   │   ├── src/
│   │   │   ├── components/     # Web-specific UI components
│   │   │   ├── hooks/          # Web-specific hooks (useAudio, useMicrophoneInput)
│   │   │   ├── pages/          # All 7 pages
│   │   │   └── ...
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── mobile/                 # Expo app
│       ├── app/                # Expo Router file-based routes
│       │   ├── _layout.tsx
│       │   ├── index.tsx       # Home
│       │   ├── kettenrechner.tsx
│       │   ├── farben.tsx
│       │   └── capitals.tsx
│       ├── components/         # RN-specific UI components
│       ├── hooks/              # RN-specific hooks
│       ├── package.json
│       ├── app.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── hooks/          # useInterval, useStorage
│       │   ├── types/          # Shared TypeScript types
│       │   └── constants/      # Quiz data, config values
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json
├── package.json
└── bun.lockb
```

## Shared Package

### Hooks

**useInterval** - Works identically on both platforms (setInterval is universal).

**useStorage** - Abstract interface with platform-specific adapters:

```typescript
export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  adapter: StorageAdapter
): [T, (value: T) => void];
```

Web uses `localStorageAdapter`, mobile uses `asyncStorageAdapter`.

### Constants

- `CAPITALS_DATA` - Quiz questions for capitals game
- Color definitions for Farben game
- Game configuration values

### Types

- Game state interfaces
- Timer configuration types
- Common utility types

## Platform-Specific Code

### Web Only

- `useAudio.ts` - Web Audio API
- `useMicrophoneInput.ts` - MediaDevices API
- `PWAUpdateToast.tsx` - PWA update UI
- Pages: Timers, Intervall, SoundCounter (phase 2 mobile candidates)

### Mobile Only

- Expo-specific navigation
- Native UI components with Uniwind styling
- AsyncStorage adapter

## Root Configuration

### package.json

```json
{
  "name": "training-erik-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "prettier": "^3.7.4"
  },
  "packageManager": "bun@1.1.0"
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Mobile App Configuration

### app.json

```json
{
  "expo": {
    "name": "Training Erik",
    "slug": "training-erik",
    "version": "1.0.0",
    "scheme": "training-erik",
    "platforms": ["android"],
    "android": {
      "package": "com.trainingerik.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0B0E14"
      }
    }
  }
}
```

### Uniwind Theme

Custom colors from web's `tailwind.config.js`:
- canvas: `#0B0E14`
- surface: `#151A23`
- primary, secondary, action, success, etc.

## Migration Phases

### Phase 1: Scaffold Monorepo
1. Create root package.json, turbo.json, .gitignore
2. Create apps/ and packages/ directories
3. Move current codebase into apps/web/
4. Verify web app works: `bun run dev:web`

### Phase 2: Extract Shared Package
1. Create packages/shared/ with package.json, tsconfig
2. Move useInterval hook to shared
3. Create useStorage abstraction with adapters
4. Refactor web's useLocalStorage to use shared useStorage
5. Move constants and types to shared
6. Update web app imports, verify functionality

### Phase 3: Create Mobile App
1. Initialize Expo app: `bunx create-expo-app apps/mobile`
2. Add Expo Router and Uniwind
3. Configure Uniwind theme with custom colors
4. Create root layout with Stack navigation
5. Build Home screen to validate setup

### Phase 4: Port Screens
1. **Kettenrechner** - Math logic, number input components
2. **Farben** - Color display, touch interaction
3. **Capitals** - Quiz logic, shared constants

Each screen: create RN components, wire up shared hooks, test on Android emulator.

## Commands After Setup

```bash
bun install              # Install all workspace dependencies
bun run dev:web          # Start web dev server (localhost:5173)
bun run dev:mobile       # Start Expo dev server
bun run build            # Build all packages
bun run lint             # Lint all packages
```

## Future Considerations

- **Phase 2 screens:** Timers, Intervall, SoundCounter require expo-av for audio
- **iOS support:** Add when needed; Expo makes this straightforward
- **Testing:** Add Jest + React Native Testing Library when screens stabilize
- **CI/CD:** GitHub Actions with Turborepo remote caching
