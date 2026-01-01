# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled (`strict: true`)
- **Module System**: ESNext with bundler resolution
- **JSX**: React JSX transform (no import needed for React)
- **Target**: ES2020
- **Unused Locals/Params**: Disabled (allowed to exist)

## Code Style Patterns

### Component Structure
- **Functional Components Only**: No class components used
- **Component Declaration**: `const ComponentName = () => { ... }` or `function ComponentName() { ... }`
- **Exports**: Default exports for components

### Hooks Usage
- **useRef**: Used for DOM references and persistent values
- **useCallback**: Memoized callbacks for performance optimization
- **useEffect**: For side effects and lifecycle management
- **useState**: For component state
- **Custom Hooks**: Located in `src/hooks/`, follow naming convention `use*`

### Naming Conventions
- **Components**: PascalCase (e.g., `SoundCounter`, `SequenceBuilder`)
- **Functions/Variables**: camelCase (e.g., `playBeep`, `audioContextRef`)
- **Constants**: Typically camelCase, sometimes UPPER_CASE for globals
- **Files**: PascalCase for components (e.g., `SoundCounter.tsx`), camelCase for utilities (e.g., `useAudio.ts`)
- **Interfaces/Types**: PascalCase, often inline with component usage

### Import Organization
```typescript
// External dependencies first
import { useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

// Internal imports after
import Layout from './components/Layout'
import { useAudio } from './hooks/useAudio'
```

### Error Handling
- **Console Logging**: `console.error()` for error cases
- **Silent Failures**: Some error cases use try-catch with empty catch blocks when errors are expected/ignorable
- **Type Guards**: TypeScript strict mode provides compile-time safety

### Styling Conventions
- **CSS Framework**: Tailwind CSS utility classes
- **Color System**: Custom theme colors defined in tailwind.config.js
  - `canvas`: #0B0E14 (background)
  - `surface`: #151A23 (cards/panels)
  - `primary`: #F1F5F9 (text)
  - `action`: #3B82F6 (interactive elements)
  - `success`: #10B981
  - `muted-red`: #EF4444
  - `muted-orange`: #F97316
- **Responsive**: Mobile-first, uses Tailwind breakpoints
- **Typography**: Inter font family

### Audio Implementation
- Web Audio API for sound generation
- Oscillator-based beeps (not audio files)
- Frequency and duration parameters for flexibility
- Proper cleanup with stop() and disconnect()

## File Organization
- **Co-location**: Components keep related code together
- **Barrel Exports**: Not commonly used (direct imports preferred)
- **Index Files**: Not used for exports
- **Component Files**: Single component per file

## Comments and Documentation
- **Language**: German comments for domain logic, English for general code
- **JSDoc**: Minimal usage, TypeScript types provide documentation
- **Inline Comments**: Used for complex logic or workarounds
