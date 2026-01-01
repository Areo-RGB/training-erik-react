# Suggested Commands

## Development Workflow

### Package Management
```bash
npm install                    # Install all dependencies
npm install <package>          # Add a new dependency
npm install -D <package>       # Add a dev dependency
```

### Development
```bash
npm run dev                    # Start Vite dev server (http://localhost:5173)
```

### Building
```bash
npm run build                  # Production build (TypeScript compile + Vite bundle)
npm run preview                # Preview production build locally
```

## Windows System Commands

### File Operations
```bash
dir                            # List directory contents (like ls)
dir /s                        # Recursive directory listing
cd <path>                     # Change directory
type <file>                   # Display file contents (like cat)
copy <src> <dest>             # Copy files
move <src> <dest>             # Move files
del <file>                    # Delete files
rmdir <dir>                   # Remove directory
mkdir <dir>                   # Create directory
```

### Search Operations
```bash
findstr /s /i "pattern" *.ts  # Search in files (like grep)
where <command>               # Find command location
```

### Git Commands
```bash
git status                    # Check repository status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to remote
git pull                      # Pull from remote
git log                       # View commit history
git branch                    # List branches
git checkout -b <branch>      # Create and switch to branch
```

## Vite-Specific Commands
- Dev server runs on port 5173 by default
- Hot Module Replacement (HMR) enabled
- TypeScript errors shown in browser overlay

## PWA Testing
```bash
npm run build                 # Build PWA
npm run preview               # Test PWA in production mode
# Use Chrome DevTools > Application > Service Workers to verify
# Use Chrome DevTools > Application > Manifest to verify installability
```

## Environment Setup
- Create `.env.local` file for environment variables
- `GEMINI_API_KEY` mentioned in README (if applicable)

## Useful Development Tips
1. **TypeScript**: Errors appear in dev server overlay and terminal
2. **PWA**: Test offline mode in Chrome DevTools (Network > Offline checkbox)
3. **Audio**: Test Web Audio API in different browsers (Safari requires user interaction)
4. **Local Storage**: Use Chrome DevTools > Application > Local Storage to debug
5. **Tailwind**: Classes are generated on-demand, unused styles purged in production
