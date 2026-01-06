# Monorepo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert Training Erik into a Turborepo monorepo with web app + Expo mobile app (Android)

**Architecture:** Flat package structure with apps/web, apps/mobile, and packages/shared. Shared package contains platform-agnostic hooks (useInterval, useStorage) and constants. Each platform has its own UI components.

**Tech Stack:** Turborepo, Bun, Expo SDK 52, Expo Router, React Native, Uniwind, TypeScript

---

## Phase 1: Scaffold Monorepo

### Task 1.1: Create Root Directory Structure

**Files:**
- Create: `apps/` (directory)
- Create: `packages/` (directory)

**Step 1: Create directories**

```bash
mkdir -p apps packages
```

**Step 2: Verify structure**

```bash
ls -la
```

Expected: See `apps/` and `packages/` directories alongside existing `src/`

**Step 3: Commit**

```bash
git add apps packages
git commit -m "chore: create monorepo directory structure"
```

---

### Task 1.2: Create Root package.json

**Files:**
- Create: `package.json.new` (temporary, will replace existing)

**Step 1: Create root package.json**

Create file at project root with this content:

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
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "prettier": "^3.7.4"
  },
  "packageManager": "bun@1.1.0"
}
```

Note: We'll handle the replacement after moving web app.

---

### Task 1.3: Create turbo.json

**Files:**
- Create: `turbo.json`

**Step 1: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add Turborepo configuration"
```

---

### Task 1.4: Move Web App to apps/web

**Files:**
- Move: entire current app to `apps/web/`

**Step 1: Move all web app files**

```bash
mkdir -p apps/web
git mv src apps/web/
git mv public apps/web/
git mv index.html apps/web/
git mv vite.config.ts apps/web/
git mv tailwind.config.js apps/web/
git mv postcss.config.js apps/web/
git mv tsconfig.json apps/web/
git mv tsconfig.node.json apps/web/
git mv vitest.config.ts apps/web/
git mv eslint.config.js apps/web/
git mv .prettierrc apps/web/
```

**Step 2: Verify move**

```bash
ls apps/web/
```

Expected: See `src/`, `public/`, `index.html`, `vite.config.ts`, etc.

---

### Task 1.5: Create Web App package.json

**Files:**
- Create: `apps/web/package.json`

**Step 1: Create apps/web/package.json**

```json
{
  "name": "web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@training-erik/shared": "workspace:*",
    "canvas-confetti": "^1.9.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@types/canvas-confetti": "^1.6.4",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.26",
    "jsdom": "^27.4.0",
    "postcss": "^8.4.49",
    "prettier": "^3.7.4",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "sharp": "^0.34.5",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.51.0",
    "vite": "^6.0.5",
    "vite-plugin-pwa": "^1.2.0",
    "vitest": "^4.0.16"
  }
}
```

---

### Task 1.6: Replace Root package.json

**Files:**
- Replace: `package.json` (root)

**Step 1: Remove old package.json and lockfile**

```bash
rm package.json package-lock.json
```

**Step 2: Create new root package.json**

Use content from Task 1.2.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: move web app to apps/web"
```

---

### Task 1.7: Update Web App Paths

**Files:**
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/tailwind.config.js`

**Step 1: Verify vite.config.ts paths**

The existing config should work as-is since paths are relative. Read and verify.

**Step 2: Verify tailwind.config.js paths**

Content paths are relative (`./src/**/*`), should work as-is.

---

### Task 1.8: Install Dependencies and Test

**Step 1: Install bun if needed**

```bash
which bun || curl -fsSL https://bun.sh/install | bash
```

**Step 2: Install dependencies**

```bash
bun install
```

**Step 3: Test web app runs**

```bash
bun run dev:web
```

Expected: Vite dev server starts at localhost:5173

**Step 4: Stop server and commit**

```bash
git add bun.lockb
git commit -m "chore: add bun lockfile"
```

---

## Phase 2: Extract Shared Package

### Task 2.1: Create Shared Package Structure

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@training-erik/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./constants": "./src/constants/index.ts",
    "./types": "./src/types/index.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "clean": "rm -rf dist node_modules"
  },
  "devDependencies": {
    "typescript": "~5.6.2"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create directory structure**

```bash
mkdir -p packages/shared/src/{hooks,constants,types}
```

**Step 4: Create src/index.ts**

```typescript
export * from './hooks'
export * from './constants'
export * from './types'
```

**Step 5: Commit**

```bash
git add packages/shared
git commit -m "chore: scaffold shared package"
```

---

### Task 2.2: Create useInterval Hook

**Files:**
- Create: `packages/shared/src/hooks/useInterval.ts`
- Create: `packages/shared/src/hooks/index.ts`

**Step 1: Create useInterval.ts**

```typescript
import { useEffect, useRef } from 'react'

/**
 * Custom hook for running an interval that automatically cleans up.
 * Pass null as delay to pause the interval.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
```

**Step 2: Create hooks/index.ts**

```typescript
export { useInterval } from './useInterval'
```

**Step 3: Commit**

```bash
git add packages/shared/src/hooks
git commit -m "feat(shared): add useInterval hook"
```

---

### Task 2.3: Create Storage Abstraction

**Files:**
- Create: `packages/shared/src/hooks/useStorage.ts`
- Create: `packages/shared/src/hooks/adapters/localStorage.ts`
- Create: `packages/shared/src/hooks/adapters/index.ts`

**Step 1: Create StorageAdapter interface and useStorage hook**

File: `packages/shared/src/hooks/useStorage.ts`

```typescript
import { useState, useCallback, useEffect } from 'react'

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export interface Serializer<T> {
  serialize: (value: T) => string
  deserialize: (raw: string) => T
}

const jsonSerializer = <T>(): Serializer<T> => ({
  serialize: (value: T) => JSON.stringify(value),
  deserialize: (raw: string) => JSON.parse(raw) as T,
})

/**
 * Cross-platform storage hook with adapter pattern.
 * Works with localStorage (web) or AsyncStorage (React Native).
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  adapter: StorageAdapter,
  serializer: Serializer<T> = jsonSerializer<T>()
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial value from storage
  useEffect(() => {
    let mounted = true

    adapter.getItem(key).then((item) => {
      if (mounted && item !== null) {
        try {
          setStoredValue(serializer.deserialize(item))
        } catch {
          // Keep initial value on parse error
        }
      }
      if (mounted) setIsLoading(false)
    }).catch(() => {
      if (mounted) setIsLoading(false)
    })

    return () => { mounted = false }
  }, [key, adapter, serializer])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value
        adapter.setItem(key, serializer.serialize(valueToStore)).catch((error) => {
          console.error('Error saving to storage:', error)
        })
        return valueToStore
      })
    },
    [key, adapter, serializer]
  )

  return [storedValue, setValue, isLoading]
}

// Type-specific serializers
export const stringSerializer: Serializer<string> = {
  serialize: (value) => value,
  deserialize: (raw) => raw,
}

export const numberSerializer: Serializer<number> = {
  serialize: (value) => String(value),
  deserialize: (raw) => parseInt(raw, 10),
}

export const booleanSerializer: Serializer<boolean> = {
  serialize: (value) => String(value),
  deserialize: (raw) => raw === 'true',
}
```

**Step 2: Create localStorage adapter**

File: `packages/shared/src/hooks/adapters/localStorage.ts`

```typescript
import type { StorageAdapter } from '../useStorage'

/**
 * localStorage adapter for web platform.
 * Wraps synchronous localStorage in Promise API for consistency.
 */
export const localStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key)
  },
}
```

**Step 3: Create adapters/index.ts**

```typescript
export { localStorageAdapter } from './localStorage'
```

**Step 4: Update hooks/index.ts**

```typescript
export { useInterval } from './useInterval'
export { useStorage, type StorageAdapter, type Serializer, stringSerializer, numberSerializer, booleanSerializer } from './useStorage'
export { localStorageAdapter } from './adapters'
```

**Step 5: Commit**

```bash
git add packages/shared/src/hooks
git commit -m "feat(shared): add useStorage hook with localStorage adapter"
```

---

### Task 2.4: Extract Constants

**Files:**
- Create: `packages/shared/src/constants/game.ts`
- Create: `packages/shared/src/constants/capitals.ts`
- Create: `packages/shared/src/constants/colors.ts`
- Create: `packages/shared/src/constants/index.ts`

**Step 1: Create game.ts (game configuration constants)**

```typescript
/**
 * Game configuration constants.
 * Shared between web and mobile apps.
 */

export const FONT_SIZE = {
  SOUND_COUNTER: 8,
  CAPITALS: 5,
  KETTENRECHNER: 6,
  TIMER: 4,
  MIN: 4,
} as const

export const FARBEN = {
  DEFAULT_INTERVAL_MS: 2000,
  DEFAULT_STEPS: 10,
  DEFAULT_DURATION_SEC: 20,
  INTERVAL_MIN: 500,
  DURATION_MIN: 5,
  STEPS_MIN: 5,
} as const

export const CAPITALS = {
  DEFAULT_SPEED: 4,
  DEFAULT_STEPS: 10,
} as const

export const KETTENRECHNER = {
  DEFAULT_SPEED: 5,
  DEFAULT_STEPS: 5,
  SPEED_MIN: 1,
  SPEED_MAX: 30,
  STEPS_MIN: 1,
} as const
```

**Step 2: Create capitals.ts (quiz data)**

```typescript
/**
 * European capitals quiz data.
 */

export interface CapitalEntry {
  country: string
  capital: string
}

export const EUROPE_CAPITALS: CapitalEntry[] = [
  { country: 'Albanien', capital: 'Tirana' },
  { country: 'Andorra', capital: 'Andorra la Vella' },
  { country: 'Österreich', capital: 'Wien' },
  { country: 'Weißrussland', capital: 'Minsk' },
  { country: 'Belgien', capital: 'Brüssel' },
  { country: 'Bosnien und Herzegowina', capital: 'Sarajevo' },
  { country: 'Bulgarien', capital: 'Sofia' },
  { country: 'Kroatien', capital: 'Zagreb' },
  { country: 'Zypern', capital: 'Nikosia' },
  { country: 'Tschechien', capital: 'Prag' },
  { country: 'Dänemark', capital: 'Kopenhagen' },
  { country: 'Estland', capital: 'Tallinn' },
  { country: 'Finnland', capital: 'Helsinki' },
  { country: 'Frankreich', capital: 'Paris' },
  { country: 'Deutschland', capital: 'Berlin' },
  { country: 'Griechenland', capital: 'Athen' },
  { country: 'Ungarn', capital: 'Budapest' },
  { country: 'Island', capital: 'Reykjavik' },
  { country: 'Irland', capital: 'Dublin' },
  { country: 'Italien', capital: 'Rom' },
  { country: 'Lettland', capital: 'Riga' },
  { country: 'Liechtenstein', capital: 'Vaduz' },
  { country: 'Litauen', capital: 'Vilnius' },
  { country: 'Luxemburg', capital: 'Luxemburg' },
  { country: 'Malta', capital: 'Valletta' },
  { country: 'Moldawien', capital: 'Chisinau' },
  { country: 'Monaco', capital: 'Monaco' },
  { country: 'Montenegro', capital: 'Podgorica' },
  { country: 'Niederlande', capital: 'Amsterdam' },
  { country: 'Nordmazedonien', capital: 'Skopje' },
  { country: 'Norwegen', capital: 'Oslo' },
  { country: 'Polen', capital: 'Warschau' },
  { country: 'Portugal', capital: 'Lissabon' },
  { country: 'Rumänien', capital: 'Bukarest' },
  { country: 'Russland', capital: 'Moskau' },
  { country: 'San Marino', capital: 'San Marino' },
  { country: 'Serbien', capital: 'Belgrad' },
  { country: 'Slowakei', capital: 'Bratislava' },
  { country: 'Slowenien', capital: 'Ljubljana' },
  { country: 'Spanien', capital: 'Madrid' },
  { country: 'Schweden', capital: 'Stockholm' },
  { country: 'Schweiz', capital: 'Bern' },
  { country: 'Türkei', capital: 'Ankara' },
  { country: 'Ukraine', capital: 'Kiew' },
  { country: 'Vereinigtes Königreich', capital: 'London' },
  { country: 'Vatikanstadt', capital: 'Vatikanstadt' },
]
```

**Step 3: Create colors.ts (Farben game colors)**

```typescript
/**
 * Color definitions for Stroop effect game.
 */

export interface ColorConfig {
  id: string
  label: string
  german: string
  hex: string
}

export const STROOP_COLORS: Record<string, ColorConfig> = {
  white: { id: 'white', label: 'White', german: 'weiß', hex: '#F3F4F6' },
  red: { id: 'red', label: 'Red', german: 'rot', hex: '#DC2626' },
  blue: { id: 'blue', label: 'Blue', german: 'blau', hex: '#2563EB' },
  green: { id: 'green', label: 'Green', german: 'grün', hex: '#16A34A' },
  yellow: { id: 'yellow', label: 'Yellow', german: 'gelb', hex: '#FACC15' },
} as const

export type StroopColorKey = keyof typeof STROOP_COLORS
```

**Step 4: Create constants/index.ts**

```typescript
export { FONT_SIZE, FARBEN, CAPITALS, KETTENRECHNER } from './game'
export { EUROPE_CAPITALS, type CapitalEntry } from './capitals'
export { STROOP_COLORS, type ColorConfig, type StroopColorKey } from './colors'
```

**Step 5: Commit**

```bash
git add packages/shared/src/constants
git commit -m "feat(shared): add game constants and quiz data"
```

---

### Task 2.5: Create Shared Types

**Files:**
- Create: `packages/shared/src/types/game.ts`
- Create: `packages/shared/src/types/index.ts`

**Step 1: Create game.ts (shared type definitions)**

```typescript
/**
 * Shared game state types.
 */

export type GameStatus = 'config' | 'playing' | 'pending' | 'finished' | 'result'

export interface GameConfig {
  speed: number
  steps: number
}

/**
 * Utility to shuffle an array (Fisher-Yates).
 * Platform-agnostic, works on web and React Native.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
```

**Step 2: Create types/index.ts**

```typescript
export { type GameStatus, type GameConfig, shuffleArray } from './game'
```

**Step 3: Commit**

```bash
git add packages/shared/src/types
git commit -m "feat(shared): add shared game types and utilities"
```

---

### Task 2.6: Update Web App to Use Shared Package

**Files:**
- Modify: `apps/web/src/constants.ts` (keep audio-only constants)
- Modify: `apps/web/src/hooks/useLocalStorage.ts` (use shared useStorage)
- Modify: `apps/web/src/pages/Capitals.tsx` (import from shared)
- Modify: `apps/web/src/pages/Kettenrechner.tsx` (import from shared)
- Modify: `apps/web/src/pages/Farben.tsx` (import from shared)

**Step 1: Update apps/web/src/constants.ts**

Keep only audio-related constants (platform-specific):

```typescript
/**
 * Web-specific constants (audio requires Web Audio API).
 */

export const AUDIO = {
  DEFAULT_THRESHOLD: 50,
  DEFAULT_COOLDOWN: 500,
  THRESHOLD_MIN: 1,
  THRESHOLD_MAX: 100,
  COOLDOWN_MIN: 100,
  COOLDOWN_MAX: 2000,
  COOLDOWN_STEP: 100,
} as const

export const RATE_TRACKING = {
  WINDOW_MS: 1000,
  MAX_TIMESTAMPS: 100,
} as const

export const ANIMATION = {
  TRIGGER_DURATION_MS: 150,
} as const

// Re-export shared constants for convenience
export { FONT_SIZE, FARBEN, CAPITALS, KETTENRECHNER } from '@training-erik/shared/constants'
```

**Step 2: Update apps/web/src/hooks/useLocalStorage.ts**

Refactor to use shared useStorage:

```typescript
import { useStorage, localStorageAdapter, stringSerializer, numberSerializer, booleanSerializer } from '@training-erik/shared'

/**
 * Generic localStorage hook with JSON serialization.
 * Supports functional updates: setValue(prev => prev + 1)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter)
  return [value, setValue]
}

/**
 * localStorage hook for string values (no JSON serialization).
 */
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, stringSerializer)
  return [value, setValue]
}

/**
 * localStorage hook for number values.
 */
export function useLocalStorageNumber(
  key: string,
  initialValue: number
): [number, (value: number) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, numberSerializer)
  return [value, setValue]
}

/**
 * localStorage hook for boolean values.
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, booleanSerializer)
  return [value, setValue]
}
```

**Step 3: Update Capitals.tsx imports**

Change:
```typescript
// Old
const EUROPE_CAPITALS = [...]
function shuffleArray<T>(array: T[]): T[] {...}
```

To:
```typescript
import { EUROPE_CAPITALS, shuffleArray } from '@training-erik/shared'
```

Remove the local `EUROPE_CAPITALS` array and `shuffleArray` function.

**Step 4: Test web app still works**

```bash
bun run dev:web
```

Navigate to each page, verify functionality.

**Step 5: Commit**

```bash
git add apps/web/src
git commit -m "refactor(web): use shared package for hooks and constants"
```

---

### Task 2.7: Reinstall and Verify

**Step 1: Reinstall dependencies**

```bash
bun install
```

**Step 2: Run web app**

```bash
bun run dev:web
```

**Step 3: Run tests**

```bash
cd apps/web && bun run test -- --run
```

Expected: All tests pass

**Step 4: Commit any lockfile changes**

```bash
git add bun.lockb
git commit -m "chore: update lockfile after shared package integration"
```

---

## Phase 3: Create Mobile App

### Task 3.1: Initialize Expo App

**Step 1: Create Expo app**

```bash
cd apps
bunx create-expo-app@latest mobile --template blank-typescript
cd ..
```

**Step 2: Verify creation**

```bash
ls apps/mobile/
```

Expected: See `app.json`, `package.json`, `App.tsx`, etc.

---

### Task 3.2: Configure Expo for Android Only

**Files:**
- Modify: `apps/mobile/app.json`

**Step 1: Update app.json**

```json
{
  "expo": {
    "name": "Training Erik",
    "slug": "training-erik",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "training-erik",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "platforms": ["android"],
    "android": {
      "package": "com.trainingerik.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0B0E14"
      }
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

### Task 3.3: Add Expo Router

**Step 1: Install Expo Router dependencies**

```bash
cd apps/mobile
bunx expo install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens
cd ../..
```

**Step 2: Update apps/mobile/package.json main entry**

Add/update:

```json
{
  "main": "expo-router/entry"
}
```

---

### Task 3.4: Add Shared Package Dependency

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Add shared package and AsyncStorage**

```bash
cd apps/mobile
bunx expo install @react-native-async-storage/async-storage
cd ../..
```

**Step 2: Update package.json dependencies**

Add to dependencies section:

```json
{
  "dependencies": {
    "@training-erik/shared": "workspace:*"
  }
}
```

---

### Task 3.5: Add Uniwind

**Step 1: Install Uniwind**

```bash
cd apps/mobile
bun add uniwind
cd ../..
```

**Step 2: Create Uniwind config**

File: `apps/mobile/uniwind.config.ts`

```typescript
import { createConfig } from 'uniwind'

export const { styled, tw } = createConfig({
  theme: {
    colors: {
      canvas: '#0B0E14',
      surface: '#151A23',
      'surface-hover': '#1E2532',
      subtle: '#2A3441',
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      action: '#3B82F6',
      success: '#10B981',
      icon: '#64748B',
      'muted-red': '#EF4444',
      'muted-orange': '#F97316',
    },
  },
})
```

---

### Task 3.6: Create Expo Router File Structure

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Delete: `apps/mobile/App.tsx` (Expo Router replaces it)

**Step 1: Create app directory**

```bash
mkdir -p apps/mobile/app
```

**Step 2: Create _layout.tsx**

```typescript
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E14' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0E14' },
          headerTintColor: '#F1F5F9',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0B0E14' },
        }}
      />
    </View>
  )
}
```

**Step 3: Create index.tsx (Home screen)**

```typescript
import { Link } from 'expo-router'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { styled } from '../uniwind.config'

const Container = styled(ScrollView, 'flex-1 bg-canvas')
const Header = styled(View, 'items-center py-6')
const Title = styled(Text, 'text-2xl font-bold text-action')
const Subtitle = styled(Text, 'text-xs text-secondary uppercase tracking-widest mt-1')
const Grid = styled(View, 'px-4 gap-3')

const tools = [
  {
    title: 'Kettenrechner',
    description: 'Kopfrechnen-Kettenaufgaben',
    href: '/kettenrechner' as const,
    tags: ['MATHE', 'FOKUS'],
  },
  {
    title: 'Farben',
    description: 'Stroop-Effekt-Trainer',
    href: '/farben' as const,
    tags: ['KOGNITIV', 'REAKTION'],
  },
  {
    title: 'Hauptstädte Quiz',
    description: 'Europäische Hauptstädte',
    href: '/capitals' as const,
    tags: ['GEOGRAPHIE', 'GEDÄCHTNIS'],
  },
]

const Card = styled(Pressable, 'bg-surface rounded-xl p-4 border border-white/5')
const CardTitle = styled(Text, 'text-lg font-bold text-primary')
const CardDesc = styled(Text, 'text-sm text-secondary mt-1')
const TagContainer = styled(View, 'flex-row gap-2 mt-3')
const Tag = styled(View, 'bg-canvas px-2 py-1 rounded')
const TagText = styled(Text, 'text-xs text-icon font-bold')

export default function Home() {
  return (
    <Container>
      <Header>
        <Title>Training Erik</Title>
        <Subtitle>Professionelles Training</Subtitle>
      </Header>

      <Grid>
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} asChild>
            <Card>
              <CardTitle>{tool.title}</CardTitle>
              <CardDesc>{tool.description}</CardDesc>
              <TagContainer>
                {tool.tags.map((tag) => (
                  <Tag key={tag}>
                    <TagText>{tag}</TagText>
                  </Tag>
                ))}
              </TagContainer>
            </Card>
          </Link>
        ))}
      </Grid>
    </Container>
  )
}
```

**Step 4: Delete old App.tsx**

```bash
rm apps/mobile/App.tsx
```

**Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): initialize Expo app with Expo Router"
```

---

### Task 3.7: Create AsyncStorage Adapter

**Files:**
- Create: `apps/mobile/hooks/asyncStorageAdapter.ts`

**Step 1: Create adapter**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StorageAdapter } from '@training-erik/shared'

/**
 * AsyncStorage adapter for React Native.
 */
export const asyncStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key)
  },
}
```

---

### Task 3.8: Test Mobile App Runs

**Step 1: Install dependencies**

```bash
bun install
```

**Step 2: Start Expo**

```bash
bun run dev:mobile
```

**Step 3: Test on Android emulator or device**

Press `a` to open Android emulator or scan QR with Expo Go.

Expected: See Home screen with 3 training cards.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(mobile): add AsyncStorage adapter and verify app runs"
```

---

## Phase 4: Port Mobile Screens

### Task 4.1: Create Kettenrechner Screen

**Files:**
- Create: `apps/mobile/app/kettenrechner.tsx`
- Create: `apps/mobile/components/NumberPad.tsx`

**Step 1: Create NumberPad component**

```typescript
import { View, Text, Pressable } from 'react-native'
import { styled } from '../uniwind.config'

const Container = styled(View, 'w-full max-w-sm')
const Display = styled(View, 'bg-surface rounded-xl p-4 mb-4 items-center')
const DisplayText = styled(Text, 'text-4xl font-bold text-primary font-mono')
const Grid = styled(View, 'flex-row flex-wrap justify-center gap-2')
const Button = styled(Pressable, 'w-20 h-16 bg-surface rounded-xl items-center justify-center')
const ButtonText = styled(Text, 'text-2xl font-bold text-primary')
const SubmitButton = styled(Pressable, 'w-full h-14 bg-action rounded-xl items-center justify-center mt-4')
const SubmitText = styled(Text, 'text-lg font-bold text-white')

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function NumberPad({ value, onChange, onSubmit }: NumberPadProps) {
  const handlePress = (digit: string) => {
    if (digit === 'C') {
      onChange('')
    } else if (digit === '⌫') {
      onChange(value.slice(0, -1))
    } else if (digit === '±') {
      onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
    } else {
      onChange(value + digit)
    }
  }

  const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '±', '0', '⌫']

  return (
    <Container>
      <Display>
        <DisplayText>{value || '0'}</DisplayText>
      </Display>

      <Grid>
        {buttons.map((btn) => (
          <Button key={btn} onPress={() => handlePress(btn)}>
            <ButtonText>{btn}</ButtonText>
          </Button>
        ))}
      </Grid>

      <SubmitButton onPress={onSubmit}>
        <SubmitText>Prüfen</SubmitText>
      </SubmitButton>
    </Container>
  )
}
```

**Step 2: Create kettenrechner.tsx**

```typescript
import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Stack } from 'expo-router'
import { useStorage, numberSerializer, booleanSerializer } from '@training-erik/shared'
import { KETTENRECHNER } from '@training-erik/shared/constants'
import { styled } from '../uniwind.config'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'
import { NumberPad } from '../components/NumberPad'

const Container = styled(View, 'flex-1 bg-canvas items-center justify-center p-4')
const ConfigCard = styled(View, 'bg-surface rounded-2xl p-6 w-full max-w-md')
const Title = styled(Text, 'text-2xl font-bold text-primary text-center mb-6')
const SettingRow = styled(View, 'flex-row items-center justify-between py-3')
const SettingLabel = styled(Text, 'text-primary font-semibold')
const SettingValue = styled(Text, 'text-secondary font-mono')
const AdjustButton = styled(Pressable, 'w-10 h-10 bg-canvas rounded-lg items-center justify-center')
const AdjustText = styled(Text, 'text-xl text-primary font-bold')
const StartButton = styled(Pressable, 'bg-action rounded-xl py-4 mt-6')
const StartText = styled(Text, 'text-white font-bold text-lg text-center')
const Display = styled(Text, 'text-8xl font-black text-primary')
const ResultEmoji = styled(Text, 'text-6xl mb-4')
const ResultValue = styled(Text, 'text-6xl font-black text-action')
const History = styled(Text, 'text-secondary text-sm mt-4 font-mono')

type Status = 'config' | 'playing' | 'pending' | 'result'

export default function Kettenrechner() {
  const [speed, setSpeed] = useStorage('kettenrechner_speed', KETTENRECHNER.DEFAULT_SPEED, asyncStorageAdapter, numberSerializer)
  const [targetSteps, setTargetSteps] = useStorage('kettenrechner_targetSteps', KETTENRECHNER.DEFAULT_STEPS, asyncStorageAdapter, numberSerializer)

  const [status, setStatus] = useState<Status>('config')
  const [display, setDisplay] = useState('3')
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => () => clearTimer(), [])

  const startGame = () => {
    clearTimer()
    setStatus('playing')
    setTotal(0)
    setHistory([])
    setCurrentStep(0)
    runCountdown()
  }

  const runCountdown = () => {
    const seq = ['3', '2', '1']
    let idx = 0
    setDisplay(seq[0])

    timerRef.current = setInterval(() => {
      idx++
      if (idx < seq.length) {
        setDisplay(seq[idx])
      } else {
        clearTimer()
        runGameLoop()
      }
    }, 1000)
  }

  const runGameLoop = () => {
    let currentTotal = 0
    let steps = 0

    const tick = () => {
      if (steps >= targetSteps) {
        finishGame(currentTotal)
        return
      }

      const n = Math.floor(Math.random() * 9) + 1
      let add = Math.random() > 0.5
      if (!add && currentTotal - n < 0) add = true

      currentTotal = add ? currentTotal + n : currentTotal - n
      const opStr = add ? `+${n}` : `-${n}`

      setDisplay(opStr)
      setTotal(currentTotal)
      setHistory(h => [...h, opStr])
      setCurrentStep(steps + 1)
      steps++
    }

    tick()
    timerRef.current = setInterval(tick, speed * 1000)
  }

  const finishGame = (finalTotal: number) => {
    clearTimer()
    setTotal(finalTotal)
    setStatus('pending')
    setDisplay('?')
    setUserAnswer('')
    setIsCorrect(null)
  }

  const checkAnswer = () => {
    const ans = parseInt(userAnswer, 10)
    const correct = ans === total
    setIsCorrect(correct)
    setStatus('result')
  }

  if (status === 'config') {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Kettenrechner' }} />
        <ConfigCard>
          <Title>Kettenrechner</Title>

          <SettingRow>
            <SettingLabel>Geschwindigkeit</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setSpeed(Math.max(1, speed - 1))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{speed}s</SettingValue>
              <AdjustButton onPress={() => setSpeed(Math.min(30, speed + 1))}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <SettingRow>
            <SettingLabel>Schritte</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setTargetSteps(Math.max(1, targetSteps - 1))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{targetSteps}</SettingValue>
              <AdjustButton onPress={() => setTargetSteps(targetSteps + 1)}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <StartButton onPress={startGame}>
            <StartText>Start</StartText>
          </StartButton>
        </ConfigCard>
      </Container>
    )
  }

  if (status === 'playing') {
    const isCountdown = ['3', '2', '1'].includes(display)
    return (
      <Container>
        <Stack.Screen options={{ title: `${currentStep}/${targetSteps}` }} />
        <Display style={{ color: isCountdown ? '#3B82F6' : '#F1F5F9' }}>
          {display}
        </Display>
      </Container>
    )
  }

  if (status === 'pending') {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Antwort?' }} />
        <NumberPad value={userAnswer} onChange={setUserAnswer} onSubmit={checkAnswer} />
      </Container>
    )
  }

  return (
    <Container>
      <Stack.Screen options={{ title: 'Ergebnis' }} />
      <ResultEmoji>{isCorrect ? '🎉' : '❌'}</ResultEmoji>
      <ResultValue style={{ color: isCorrect ? '#10B981' : '#3B82F6' }}>{total}</ResultValue>
      <History>0 {history.join(' ')} = {total}</History>
      <StartButton onPress={startGame} style={{ marginTop: 32, width: '100%' }}>
        <StartText>Nochmal</StartText>
      </StartButton>
      <Pressable onPress={() => setStatus('config')} style={{ marginTop: 12 }}>
        <Text style={{ color: '#94A3B8' }}>Einstellungen</Text>
      </Pressable>
    </Container>
  )
}
```

**Step 3: Test screen**

```bash
bun run dev:mobile
```

Navigate to Kettenrechner, play a round.

**Step 4: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): add Kettenrechner screen"
```

---

### Task 4.2: Create Farben Screen

**Files:**
- Create: `apps/mobile/app/farben.tsx`

**Step 1: Create farben.tsx**

```typescript
import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useStorage, numberSerializer, booleanSerializer } from '@training-erik/shared'
import { FARBEN, STROOP_COLORS, type StroopColorKey } from '@training-erik/shared/constants'
import { styled } from '../uniwind.config'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'

const Container = styled(View, 'flex-1 bg-canvas items-center justify-center p-4')
const ConfigCard = styled(View, 'bg-surface rounded-2xl p-6 w-full max-w-md')
const Title = styled(Text, 'text-2xl font-bold text-primary text-center mb-6')
const SettingRow = styled(View, 'flex-row items-center justify-between py-3')
const SettingLabel = styled(Text, 'text-primary font-semibold')
const SettingValue = styled(Text, 'text-secondary font-mono')
const AdjustButton = styled(Pressable, 'w-10 h-10 bg-canvas rounded-lg items-center justify-center')
const AdjustText = styled(Text, 'text-xl text-primary font-bold')
const StartButton = styled(Pressable, 'bg-action rounded-xl py-4 mt-6')
const StartText = styled(Text, 'text-white font-bold text-lg text-center')
const FullScreen = styled(View, 'flex-1 items-center justify-center')
const StopButton = styled(Pressable, 'absolute top-4 right-4 bg-black/30 px-4 py-2 rounded-full')
const StopText = styled(Text, 'text-white font-semibold')
const Counter = styled(Text, 'absolute top-4 left-4 text-white/80 font-mono font-bold bg-black/30 px-3 py-1 rounded-full')
const RestartButton = styled(Pressable, 'bg-white px-8 py-4 rounded-2xl')
const RestartText = styled(Text, 'text-black font-bold text-xl')

const colorKeys = Object.keys(STROOP_COLORS) as StroopColorKey[]

export default function Farben() {
  const router = useRouter()

  const [intervalMs, setIntervalMs] = useStorage('farben_interval', FARBEN.DEFAULT_INTERVAL_MS, asyncStorageAdapter, numberSerializer)
  const [limitSteps, setLimitSteps] = useStorage('farben_steps', FARBEN.DEFAULT_STEPS, asyncStorageAdapter, numberSerializer)

  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [currentColor, setCurrentColor] = useState<StroopColorKey>('white')
  const [currentStep, setCurrentStep] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('finished')
  }, [])

  const step = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= limitSteps) {
        stopGame()
        return prev
      }
      return prev + 1
    })

    setCurrentColor((prevColor) => {
      const candidates = colorKeys.filter((c) => c !== prevColor)
      return candidates[Math.floor(Math.random() * candidates.length)]
    })
  }, [limitSteps, stopGame])

  const startGame = () => {
    setStatus('playing')
    setCurrentStep(0)
    step()
    intervalRef.current = setInterval(step, intervalMs)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (status === 'config') {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Farben' }} />
        <ConfigCard>
          <Title>Farben Training</Title>

          <SettingRow>
            <SettingLabel>Geschwindigkeit</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setIntervalMs(Math.max(500, intervalMs - 500))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{intervalMs}ms</SettingValue>
              <AdjustButton onPress={() => setIntervalMs(intervalMs + 500)}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <SettingRow>
            <SettingLabel>Änderungen</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setLimitSteps(Math.max(5, limitSteps - 5))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{limitSteps}</SettingValue>
              <AdjustButton onPress={() => setLimitSteps(limitSteps + 5)}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <StartButton onPress={startGame}>
            <StartText>Training Starten</StartText>
          </StartButton>
        </ConfigCard>
      </Container>
    )
  }

  const colorHex = STROOP_COLORS[currentColor].hex

  if (status === 'playing') {
    return (
      <FullScreen style={{ backgroundColor: colorHex }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Counter>{currentStep} / {limitSteps}</Counter>
        <StopButton onPress={stopGame}>
          <StopText>Stopp</StopText>
        </StopButton>
      </FullScreen>
    )
  }

  return (
    <FullScreen style={{ backgroundColor: colorHex }}>
      <Stack.Screen options={{ headerShown: false }} />
      <RestartButton onPress={startGame}>
        <RestartText>Noch einmal</RestartText>
      </RestartButton>
      <Pressable onPress={() => setStatus('config')} style={{ marginTop: 16 }}>
        <Text style={{ color: 'white' }}>Einstellungen</Text>
      </Pressable>
    </FullScreen>
  )
}
```

**Step 2: Test screen**

```bash
bun run dev:mobile
```

Navigate to Farben, start training, verify colors change.

**Step 3: Commit**

```bash
git add apps/mobile/app/farben.tsx
git commit -m "feat(mobile): add Farben screen"
```

---

### Task 4.3: Create Capitals Screen

**Files:**
- Create: `apps/mobile/app/capitals.tsx`

**Step 1: Create capitals.tsx**

```typescript
import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Stack } from 'expo-router'
import { useStorage, numberSerializer } from '@training-erik/shared'
import { CAPITALS, EUROPE_CAPITALS, shuffleArray } from '@training-erik/shared'
import { styled } from '../uniwind.config'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'

const Container = styled(View, 'flex-1 bg-canvas items-center justify-center p-4')
const ConfigCard = styled(View, 'bg-surface rounded-2xl p-6 w-full max-w-md')
const Title = styled(Text, 'text-2xl font-bold text-primary text-center mb-2')
const Subtitle = styled(Text, 'text-secondary text-center mb-6')
const SettingRow = styled(View, 'flex-row items-center justify-between py-3')
const SettingLabel = styled(Text, 'text-primary font-semibold')
const SettingValue = styled(Text, 'text-secondary font-mono')
const AdjustButton = styled(Pressable, 'w-10 h-10 bg-canvas rounded-lg items-center justify-center')
const AdjustText = styled(Text, 'text-xl text-primary font-bold')
const StartButton = styled(Pressable, 'bg-action rounded-xl py-4 mt-6')
const StartText = styled(Text, 'text-white font-bold text-lg text-center')

const PlayContainer = styled(View, 'flex-1 bg-canvas items-center justify-center p-4')
const ProgressBar = styled(View, 'absolute top-0 left-0 right-0 h-1 bg-subtle')
const ProgressFill = styled(View, 'h-1 bg-action')
const Country = styled(Text, 'text-4xl font-black text-primary text-center')
const Capital = styled(Text, 'text-2xl font-bold text-success mt-8')
const StepCounter = styled(Text, 'absolute bottom-8 text-icon font-bold')

const FinishedEmoji = styled(Text, 'text-6xl mb-4')
const FinishedText = styled(Text, 'text-2xl font-bold text-primary')
const FinishedSub = styled(Text, 'text-secondary mt-2')

interface Question {
  country: string
  capital: string
}

export default function Capitals() {
  const [speed, setSpeed] = useStorage('capitals_speed', CAPITALS.DEFAULT_SPEED, asyncStorageAdapter, numberSerializer)
  const [steps, setSteps] = useStorage('capitals_steps', CAPITALS.DEFAULT_STEPS, asyncStorageAdapter, numberSerializer)

  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [currentStep, setCurrentStep] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ country: '', capital: '' })

  const shuffledDataRef = useRef<Question[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current)
  }

  useEffect(() => () => clearTimers(), [])

  const runStep = (stepIndex: number, gameSteps: number, gameSpeed: number) => {
    if (stepIndex >= gameSteps) {
      setStatus('finished')
      return
    }

    clearTimers()
    setCurrentQuestion(shuffledDataRef.current[stepIndex])
    setShowAnswer(false)

    answerTimeoutRef.current = setTimeout(() => {
      setShowAnswer(true)
    }, (gameSpeed * 1000) / 2)

    timerRef.current = setTimeout(() => {
      const nextStep = stepIndex + 1
      setCurrentStep(nextStep)
      runStep(nextStep, gameSteps, gameSpeed)
    }, gameSpeed * 1000)
  }

  const startGame = () => {
    shuffledDataRef.current = shuffleArray(EUROPE_CAPITALS)
    setCurrentStep(0)
    setStatus('playing')
    runStep(0, steps, speed)
  }

  if (status === 'config') {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Hauptstädte Quiz' }} />
        <ConfigCard>
          <Title>Hauptstädte Quiz</Title>
          <Subtitle>Europäische Hauptstädte lernen</Subtitle>

          <SettingRow>
            <SettingLabel>Geschwindigkeit</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setSpeed(Math.max(1, speed - 1))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{speed}s</SettingValue>
              <AdjustButton onPress={() => setSpeed(Math.min(10, speed + 1))}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <SettingRow>
            <SettingLabel>Anzahl</SettingLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AdjustButton onPress={() => setSteps(Math.max(5, steps - 5))}>
                <AdjustText>-</AdjustText>
              </AdjustButton>
              <SettingValue>{steps}</SettingValue>
              <AdjustButton onPress={() => setSteps(Math.min(45, steps + 5))}>
                <AdjustText>+</AdjustText>
              </AdjustButton>
            </View>
          </SettingRow>

          <StartButton onPress={startGame}>
            <StartText>Quiz Starten</StartText>
          </StartButton>
        </ConfigCard>
      </Container>
    )
  }

  if (status === 'playing') {
    const progress = (currentStep / steps) * 100
    return (
      <PlayContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <ProgressBar>
          <ProgressFill style={{ width: `${progress}%` }} />
        </ProgressBar>

        <Country>{currentQuestion.country}</Country>
        {showAnswer && <Capital>{currentQuestion.capital}</Capital>}

        <StepCounter>{currentStep + 1} / {steps}</StepCounter>
      </PlayContainer>
    )
  }

  return (
    <Container>
      <Stack.Screen options={{ title: 'Fertig!' }} />
      <FinishedEmoji>🎉</FinishedEmoji>
      <FinishedText>Quiz Beendet!</FinishedText>
      <FinishedSub>Alle {steps} Fragen abgeschlossen</FinishedSub>

      <StartButton onPress={startGame} style={{ marginTop: 32, width: '100%' }}>
        <StartText>Nochmal</StartText>
      </StartButton>
      <Pressable onPress={() => setStatus('config')} style={{ marginTop: 12 }}>
        <Text style={{ color: '#94A3B8' }}>Einstellungen</Text>
      </Pressable>
    </Container>
  )
}
```

**Step 2: Test screen**

```bash
bun run dev:mobile
```

Navigate to Capitals, play through quiz.

**Step 3: Commit**

```bash
git add apps/mobile/app/capitals.tsx
git commit -m "feat(mobile): add Capitals quiz screen"
```

---

### Task 4.4: Final Verification

**Step 1: Verify all mobile screens work**

```bash
bun run dev:mobile
```

Test:
- Home → navigate to each game
- Kettenrechner → play full round, check answer
- Farben → start training, see color changes
- Capitals → complete quiz

**Step 2: Verify web app still works**

```bash
bun run dev:web
```

Test all pages work as before.

**Step 3: Run web tests**

```bash
cd apps/web && bun run test -- --run
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete monorepo migration with web and mobile apps"
```

---

## Summary

After completing all tasks:

**Monorepo structure:**
```
training-erik/
├── apps/
│   ├── web/        # Vite React web app (all 7 pages)
│   └── mobile/     # Expo React Native app (4 screens)
├── packages/
│   └── shared/     # Shared hooks, constants, types
├── turbo.json
├── package.json
└── bun.lockb
```

**Commands:**
- `bun install` - Install all dependencies
- `bun run dev:web` - Start web dev server
- `bun run dev:mobile` - Start Expo dev server
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages

**Shared code:**
- `useInterval` hook
- `useStorage` hook with adapters
- Game constants (FARBEN, CAPITALS, KETTENRECHNER)
- Quiz data (EUROPE_CAPITALS)
- Color definitions (STROOP_COLORS)
- Utility functions (shuffleArray)
