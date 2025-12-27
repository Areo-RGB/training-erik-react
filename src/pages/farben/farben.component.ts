import { Component, OnDestroy, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';

const COLORS = {
  white: { id: 'white', label: 'White', bgClass: 'bg-white', textClass: 'text-slate-900' },
  red: { id: 'red', label: 'Red', bgClass: 'bg-red-600', textClass: 'text-white' },
  blue: { id: 'blue', label: 'Blue', bgClass: 'bg-blue-600', textClass: 'text-white' },
  green: { id: 'green', label: 'Green', bgClass: 'bg-green-600', textClass: 'text-white' },
};
type ColorKey = keyof typeof COLORS;

@Component({
  selector: 'app-farben',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- CONFIG MODE -->
    @if (status() === 'config') {
      <div class="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
        <div class="w-full max-w-md bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 transition-all">
            
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-[#F1F5F9]">Farben</h1>
                    <p class="text-[#94A3B8]">Stroop effect trainer</p>
                </div>
                <div class="w-12 h-12 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center text-[#3B82F6] shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                </div>
            </div>

            <div class="space-y-4">
                <!-- Interval Speed -->
                <div class="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <label class="font-bold text-[#94A3B8] text-sm uppercase tracking-wider">Speed</label>
                        <span class="font-mono text-[#F1F5F9] font-bold">{{ intervalMs() }}ms</span>
                    </div>
                    <input type="range" min="250" max="5000" step="250"
                           [ngModel]="intervalMs()" (ngModelChange)="intervalMs.set($event)"
                           class="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
                </div>

                <!-- Step Limit -->
                <div class="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
                    <label class="block font-bold text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Amount of Changes</label>
                    <input type="number" 
                           [ngModel]="limitSteps()" 
                           (ngModelChange)="limitSteps.set($event)"
                           placeholder="Infinite (leave empty)"
                           class="w-full px-3 py-2 rounded-lg bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none text-[#F1F5F9] text-sm transition-colors placeholder:text-gray-600" />
                </div>

                <!-- Toggles Grid -->
                <div class="grid grid-cols-1 gap-3">
                    <!-- No Colors -->
                    <div class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors" (click)="toggleNoColors()">
                        <div>
                            <div class="font-semibold text-[#F1F5F9]">No Colors</div>
                            <div class="text-xs text-[#94A3B8]">Text only mode</div>
                        </div>
                        <button class="w-12 h-7 rounded-full transition-colors relative"
                                [class]="noColors() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                            <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                 [class]="noColors() ? 'left-6' : 'left-1'"></div>
                        </button>
                    </div>

                    <!-- No Duplicates -->
                    <div class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors" (click)="togglePreventDuplicates()">
                         <div>
                            <div class="font-semibold text-[#F1F5F9]">No Duplicates</div>
                            <div class="text-xs text-[#94A3B8]">Unique sequence</div>
                        </div>
                        <button class="w-12 h-7 rounded-full transition-colors relative"
                                [class]="preventDuplicateWords() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                            <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                 [class]="preventDuplicateWords() ? 'left-6' : 'left-1'"></div>
                        </button>
                    </div>

                    <!-- Play Sound -->
                    <div class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors" (click)="togglePlaySound()">
                        <div>
                            <div class="font-semibold text-[#F1F5F9]">Sound</div>
                            <div class="text-xs text-[#94A3B8]">Beep on change</div>
                        </div>
                        <button class="w-12 h-7 rounded-full transition-colors relative"
                                [class]="playSound() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                            <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                 [class]="playSound() ? 'left-6' : 'left-1'"></div>
                        </button>
                    </div>
                </div>

                <!-- Custom Words -->
                <div class="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
                    <label class="block font-bold text-[#94A3B8] text-sm uppercase tracking-wider mb-3">Custom Words</label>
                    <div class="space-y-2 max-h-32 overflow-y-auto pr-1">
                        @for (label of customLabels(); track $index) {
                            <div class="flex gap-2">
                                <input [ngModel]="label" (ngModelChange)="updateLabel($index, $event)"
                                       placeholder="Add word..."
                                       class="flex-1 px-3 py-2 rounded-lg bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none text-[#F1F5F9] text-sm transition-colors" />
                                @if ($index < customLabels().length - 1) {
                                    <button (click)="removeLabel($index)" class="p-2 text-[#94A3B8] hover:text-red-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>

            <button (click)="startGame()"
                    class="w-full mt-8 bg-[#3B82F6] text-white py-4 rounded-xl text-lg font-bold shadow-lg hover-spring transition-all hover:bg-[#2563EB]">
                Start Training
            </button>
        </div>
      </div>
    }

    <!-- PLAYING MODE -->
    @if (status() === 'playing') {
      <div class="fixed inset-0 z-50 flex flex-col h-full transition-colors duration-300 animate-enter" 
           [class]="displayConfig().bgClass">
        
        <!-- Controls -->
        <div class="absolute top-6 right-6 z-10 flex gap-4">
             <!-- Stop Button -->
             <button (click)="stopGame()" 
                     class="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white font-medium transition-all hover:pr-6 border border-white/10">
                <div class="w-2 h-2 rounded-full bg-red-400 group-hover:animate-pulse"></div>
                Stop
             </button>
        </div>

        <!-- Display Area -->
        <div class="flex-1 flex flex-col items-center justify-center p-4">
          <h1 class="text-6xl md:text-9xl font-black tracking-tighter uppercase select-none transition-colors duration-300 text-center"
              [class]="displayConfig().textClass">
            {{ currentLabel() }}
          </h1>
        </div>
      </div>
    }
  `
})
export class FarbenComponent implements OnDestroy {
  private router: Router = inject(Router);
  private audio = inject(AudioService);

  // Persistence Initializers
  private loadBoolean(key: string, def: boolean): boolean {
    return localStorage.getItem(key) !== null ? localStorage.getItem(key) === 'true' : def;
  }
  private loadNumber(key: string, def: number): number {
    return parseInt(localStorage.getItem(key) || String(def), 10);
  }
  private loadString(key: string, def: string): string {
    return localStorage.getItem(key) || def;
  }
  private loadArray(key: string, def: string[]): string[] {
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : def;
    } catch {
      return def;
    }
  }

  status = signal<'config' | 'playing'>('config');

  currentColor = signal<ColorKey>('white');
  intervalMs = signal(this.loadNumber('farben_interval', 1000));
  limitSteps = signal(this.loadString('farben_limitSteps', ''));
  currentStepCount = signal(0);

  noColors = signal(this.loadBoolean('farben_noColors', false));
  preventDuplicateWords = signal(this.loadBoolean('farben_noDuplicates', false));
  playSound = signal(this.loadBoolean('farben_playSound', false));
  
  // Default minimal list with one empty slot for new inputs
  customLabels = signal<string[]>(this.loadArray('farben_customLabels', [''])); 
  
  currentLabel = signal('');

  private intervalRef: any = null;
  private colorKeys = Object.keys(COLORS) as ColorKey[];

  displayConfig = computed(() => {
    const config = COLORS[this.currentColor()];
    if (this.noColors()) {
      return { ...config, bgClass: 'bg-[#0B0E14]', textClass: 'text-white' };
    }
    return config;
  });

  validLabels = computed(() => this.customLabels().filter(l => l.trim().length > 0));

  constructor() {
    // Setup Persistence Effects
    effect(() => localStorage.setItem('farben_interval', String(this.intervalMs())));
    effect(() => localStorage.setItem('farben_limitSteps', this.limitSteps()));
    effect(() => localStorage.setItem('farben_noColors', String(this.noColors())));
    effect(() => localStorage.setItem('farben_noDuplicates', String(this.preventDuplicateWords())));
    effect(() => localStorage.setItem('farben_playSound', String(this.playSound())));
    effect(() => localStorage.setItem('farben_customLabels', JSON.stringify(this.customLabels())));

    // React to speed changes during play
    effect(() => {
      if (this.status() === 'playing') {
        this.stopInterval();
        this.startInterval();
      }
    });
  }

  toggleNoColors() {
    this.noColors.update(v => !v);
  }

  togglePreventDuplicates() {
    this.preventDuplicateWords.update(v => !v);
  }

  togglePlaySound() {
    this.playSound.update(v => !v);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  updateLabel(index: number, value: string) {
    const newLabels = [...this.customLabels()];
    newLabels[index] = value;
    if (index === newLabels.length - 1 && value.trim() !== '') {
      newLabels.push('');
    }
    this.customLabels.set(newLabels);
  }

  removeLabel(index: number) {
    const newLabels = this.customLabels().filter((_, i) => i !== index);
    if (newLabels.length === 0) newLabels.push('');
    this.customLabels.set(newLabels);
  }

  async startGame() {
    await this.audio.resumeAudioContext();
    this.status.set('playing');
    this.currentStepCount.set(0);
    this.nextStep();
    this.startInterval();
  }

  stopGame() {
    this.status.set('config');
    this.stopInterval();
  }

  private startInterval() {
    this.intervalRef = setInterval(() => this.nextStep(), this.intervalMs());
  }

  private stopInterval() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  private nextStep() {
    // Check if limit is reached
    const limit = parseInt(this.limitSteps(), 10);
    if (!isNaN(limit) && limit > 0) {
      if (this.currentStepCount() >= limit) {
        this.stopGame();
        return;
      }
    }

    this.currentStepCount.update(c => c + 1);

    // Next Color
    const availableColors = this.colorKeys.filter(c => c !== this.currentColor());
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    this.currentColor.set(randomColor);

    // Next Label
    const pool = this.validLabels();
    if (pool.length === 0) {
      this.currentLabel.set('');
    } else {
      let candidates = pool;
      if (this.preventDuplicateWords() && this.currentLabel() && pool.length > 1) {
        candidates = pool.filter(l => l !== this.currentLabel());
      }
      const randomLabel = candidates[Math.floor(Math.random() * candidates.length)];
      this.currentLabel.set(randomLabel);
    }

    // Play sound if enabled
    if (this.playSound()) {
      this.audio.playBeep(800, 0.05, 0.1);
    }
  }

  ngOnDestroy() {
    this.stopInterval();
  }
}