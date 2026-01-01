# Architecture and Design Patterns

## Application Architecture

### Routing Structure
- **Single Layout**: All routes share a common `<Layout />` component
- **Client-Side Routing**: React Router DOM with BrowserRouter
- **Route Organization**:
  - `/` - Home (dashboard with tool cards)
  - `/intervall` - Custom interval audio reminders
  - `/farben` - Stroop effect color trainer
  - `/kettenrechner` - Chain calculation mental math
  - `/timers` - Interval timer manager with sequences
  - `/sound-counter` - Sound-triggered counting
  - `/capitals` - Capital cities quiz

### Component Architecture
- **Page Components**: Located in `src/pages/`, handle feature logic and UI
- **Shared Components**: Located in `src/components/`, reusable across pages
- **Custom Hooks**: Located in `src/hooks/`, encapsulate reusable logic
- **Composition Pattern**: Components composed of smaller, focused pieces

## State Management Strategy
- **Local Component State**: useState for component-specific state
- **URL State**: React Router for navigation state
- **Persistence**: Local storage via custom hook (no external state management library)
- **No Global State**: No Redux, Zustand, or Context API for global state

## Data Flow Patterns
- **Unidirectional Flow**: Props down, events up (standard React pattern)
- **Custom Hooks for Side Effects**: useAudio, useLocalStorage encapsulate complex logic
- **Callback Props**: Parent components receive event handlers from children

## Key Design Patterns

### Custom Hooks Pattern
```typescript
// Example: useAudio hook
export function useAudio() {
  const refs = useRef(...)
  const callbacks = useCallback(...)
  
  return { publicMethods }
}
```
Encapsulates related logic, provides clean API to components

### Render Props/Component Composition
- Layout component wraps all page content
- Shared navigation structure in Layout

### Conditional Rendering
- Early returns for loading/error states
- Conditional rendering based on feature flags or permissions

## Performance Optimization Strategies
- **useCallback**: Memoize event handlers to prevent child re-renders
- **useRef**: Store values that don't trigger re-renders
- **Code Splitting**: Not currently implemented (could be added for large pages)
- **Asset Optimization**:
  - Google Fonts cached for 1 year
  - Sound files cached via PWA service worker
  - Images at multiple sizes for different devices

## PWA Architecture
- **Service Worker**: Auto-update registration strategy
- **Caching Strategy**: CacheFirst for static assets, runtime caching for external resources
- **Offline-First**: Core functionality works without network
- **App Manifest**: Standalone display mode, portrait orientation locked
- **Update Strategy**: Auto-update service worker on reload

## Audio System Architecture
- **Web Audio API**: Browser-native audio synthesis
- **Oscillator-Based**: No audio files, generates sounds programmatically
- **Singleton Pattern**: Single AudioContext instance via useRef
- **Cleanup Pattern**: Proper stop/disconnect of oscillators to prevent memory leaks

## Styling Architecture
- **Utility-First**: Tailwind CSS for all styling
- **Design Tokens**: Custom color palette in tailwind.config.js
- **Responsive Design**: Mobile-first, uses Tailwind breakpoints
- **Theme System**: Dark theme with canvas/background/surface colors
- **No CSS Modules**: All styling via Tailwind classes

## Component Communication
- **Parent → Child**: Props
- **Child → Parent**: Callback functions
- **Sibling Communication**: Through parent (no event bus)
- **Cross-Page**: Via URL params or local storage

## Error Handling Strategy
- **Silent Failures**: Some errors logged but not shown to user (audio initialization)
- **User Errors**: Should display inline error messages
- **Network Errors**: Handled by PWA offline support
- **Type Safety**: TypeScript prevents many runtime errors

## Testing Considerations
- No testing framework currently configured
- Manual testing required:
  - Dev server for smoke tests
  - Browser DevTools for debugging
  - Device emulation for mobile testing
  - Network throttling for offline testing

## Deployment Architecture
- **Build Output**: `dist/` directory
- **Static Hosting**: Can be deployed to any static host (Vercel, Netlify, GitHub Pages)
- **PWA Hosting**: Requires HTTPS (or localhost)
- **No Backend**: Fully client-side application

## Security Considerations
- **No API Keys**: If using Gemini API, key in .env.local (not committed)
- **Content Security**: No user-generated content requiring sanitization
- **HTTPS Required**: For PWA features and microphone access
- **Microphone Access**: SoundCounter page requires explicit permission
