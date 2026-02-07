import { Delete, Mic } from 'lucide-react';

interface KeypadProps {
  currentInput: string;
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onSetInput: (value: string) => void;
  disabled?: boolean;
  voiceSupported?: boolean;
  onVoiceStart?: () => void;
  voiceDisabled?: boolean;
}

export default function Keypad({ 
  currentInput, 
  onDigitPress, 
  onClear, 
  onSubmit, 
  onSetInput,
  disabled = false,
  voiceSupported = false,
  onVoiceStart,
  voiceDisabled = false,
}: KeypadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const quickChips = [26, 41, 45, 60, 85, 100, 121, 140, 180];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Display current input with optional microphone button */}
      <div className="mb-4 h-16 rounded-lg bg-muted flex items-center justify-center relative">
        <span className="text-3xl font-bold tracking-wider">
          {currentInput || '0'}
        </span>
        {voiceSupported && onVoiceStart && (
          <button
            onClick={onVoiceStart}
            disabled={disabled || voiceDisabled}
            className="absolute right-3 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick score chips */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Quick Scores</p>
        <div className="flex flex-wrap gap-2">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => onSetInput(chip.toString())}
              disabled={disabled}
              className="px-3 py-2 rounded-md bg-accent hover:bg-accent/80 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => onDigitPress(num.toString())}
            disabled={disabled}
            className="h-16 rounded-lg bg-secondary hover:bg-secondary/80 active:scale-95 transition-all font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary"
          >
            {num}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onClear}
          disabled={disabled}
          className="h-14 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-destructive"
        >
          <Delete className="h-5 w-5" />
          Clear
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || currentInput === ''}
          className="h-14 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
