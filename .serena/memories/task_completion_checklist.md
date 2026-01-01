# Task Completion Checklist

## When a Task is Completed

### 1. Code Quality
- [ ] TypeScript compiles without errors (check with `npm run build`)
- [ ] No TypeScript warnings or `any` types introduced (unless necessary)
- [ ] Code follows project conventions (functional components, custom hooks)
- [ ] Proper cleanup in useEffect (return cleanup function)
- [ ] Error handling implemented (try-catch, error states)

### 2. Testing Checklist
- [ ] Test in dev server (`npm run dev`)
- [ ] Test on mobile viewport (Chrome DevTools device emulation)
- [ ] Test PWA functionality (offline mode, installation)
- [ ] Test audio features if modified (browser compatibility)
- [ ] Test local storage persistence if relevant
- [ ] Verify no console errors in browser

### 3. Build Verification
```bash
npm run build                  # Should complete without errors
npm run preview                # Quick visual check of production build
```

### 4. PWA-Specific Checks (if relevant)
- [ ] Service worker updates correctly
- [ ] Manifest is valid
- [ ] Icons display properly
- [ ] App works offline
- [ ] Caching strategy works (Google Fonts, sounds)

### 5. Code Organization
- [ ] Components in appropriate directories (pages/, components/, hooks/)
- [ ] No unused imports
- [ ] Proper export/import structure
- [ ] Consistent naming with existing codebase

### 6. Git Workflow
```bash
git status                     # Check what files changed
git add .                      # Stage changes
git commit -m "message"        # Commit with descriptive message
git push                       # Push if working on feature branch
```

### 7. Linting/Formatting
- Note: This project does NOT have ESLint or Prettier configured
- Manual code review required for:
  - Consistent indentation (2 spaces)
  - Consistent quote style (single quotes preferred)
  - No trailing whitespace
  - Reasonable line length

### 8. Browser Compatibility
- [ ] Test in Chrome/Edge (primary target)
- [ ] Test in Firefox (if possible)
- [ ] Safari considerations:
  - Web Audio API requires user interaction first
  - Different PWA installation flow
  - Test iOS Safari specifically

### 9. Performance Considerations
- [ ] No unnecessary re-renders (useCallback, useMemo, React.memo where appropriate)
- [ ] Large lists not causing performance issues
- [ ] Images optimized (if new images added)
- [ ] Bundle size reasonable (check build output)

### 10. Language and Localization
- [ ] German language used for UI text (existing pattern)
- [ ] English for code comments is acceptable
- [ ] Consistent with existing German terminology

## Common Issues to Check

### Web Audio API
- Audio context must be resumed after user interaction
- Clean up oscillators and nodes to prevent memory leaks
- Safari requires explicit user gesture

### PWA Manifest
- Icons must exist at all specified sizes
- Colors match Tailwind theme
- Display mode set to 'standalone'

### Tailwind CSS
- Use existing color palette from tailwind.config.js
- Check responsive classes for mobile vs desktop
- Verify dark mode styles work correctly

## Before Marking Task Complete
1. Run `npm run build` - must succeed
2. Quick smoke test of modified features
3. Check for console errors
4. Verify git status shows only expected changes
