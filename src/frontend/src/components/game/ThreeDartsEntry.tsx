import { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import type { Dart, DartMultiplier } from '../../lib/gameCore';

interface ThreeDartsEntryProps {
  onSubmit: (darts: Dart[]) => void;
  disabled?: boolean;
}

export default function ThreeDartsEntry({ onSubmit, disabled = false }: ThreeDartsEntryProps) {
  const [darts, setDarts] = useState<Dart[]>([]);
  const [selectedMult, setSelectedMult] = useState<'S' | 'D' | 'T'>('S');

  const handleNumberClick = (value: number) => {
    if (darts.length >= 3 || disabled) return;
    
    const newDart: Dart = {
      mult: selectedMult,
      value,
    };
    setDarts([...darts, newDart]);
  };

  const handleBullClick = (isBull: boolean) => {
    if (darts.length >= 3 || disabled) return;
    
    const newDart: Dart = {
      mult: isBull ? 'B' : 'OB',
      value: isBull ? 50 : 25,
    };
    setDarts([...darts, newDart]);
  };

  const handleClearDart = () => {
    if (darts.length === 0 || disabled) return;
    setDarts(darts.slice(0, -1));
  };

  const handleClearAll = () => {
    if (disabled) return;
    setDarts([]);
  };

  const handleSubmit = () => {
    if (darts.length === 0 || disabled) return;
    onSubmit(darts);
    setDarts([]);
    setSelectedMult('S');
  };

  const formatDart = (dart: Dart): string => {
    if (dart.mult === 'OB') return 'OB';
    if (dart.mult === 'B') return 'Bull';
    return `${dart.mult}${dart.value}`;
  };

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Dart Slots Display */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Darts</p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 rounded-lg bg-muted flex items-center justify-center border-2 border-border"
            >
              {darts[index] ? (
                <span className="text-xl font-bold">{formatDart(darts[index])}</span>
              ) : (
                <span className="text-muted-foreground text-sm">Dart {index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Multiplier Selection */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Multiplier</p>
        <div className="grid grid-cols-3 gap-2">
          {(['S', 'D', 'T'] as const).map((mult) => (
            <button
              key={mult}
              onClick={() => setSelectedMult(mult)}
              disabled={disabled}
              className={`h-12 rounded-lg font-semibold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedMult === mult
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {mult === 'S' ? 'Single' : mult === 'D' ? 'Double' : 'Triple'}
            </button>
          ))}
        </div>
      </div>

      {/* Number Grid */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Value</p>
        <div className="grid grid-cols-5 gap-2">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={disabled || darts.length >= 3}
              className="h-12 rounded-lg bg-secondary hover:bg-secondary/80 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Bull Buttons */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Bull</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleBullClick(false)}
            disabled={disabled || darts.length >= 3}
            className="h-12 rounded-lg bg-accent hover:bg-accent/80 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
          >
            Outer Bull (25)
          </button>
          <button
            onClick={() => handleBullClick(true)}
            disabled={disabled || darts.length >= 3}
            className="h-12 rounded-lg bg-accent hover:bg-accent/80 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
          >
            Bull (50)
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={handleClearDart}
          disabled={disabled || darts.length === 0}
          className="h-14"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Dart
        </Button>
        <Button
          variant="destructive"
          onClick={handleClearAll}
          disabled={disabled || darts.length === 0}
          className="h-14"
        >
          Clear All
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={disabled || darts.length === 0}
          className="h-14 font-semibold"
        >
          Submit Turn
        </Button>
      </div>
    </div>
  );
}
