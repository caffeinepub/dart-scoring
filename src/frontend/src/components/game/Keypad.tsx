import { Delete } from 'lucide-react';

export default function Keypad() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {numbers.map((num) => (
          <button
            key={num}
            className="h-16 rounded-lg bg-secondary hover:bg-secondary/80 active:scale-95 transition-all font-semibold text-xl"
          >
            {num}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="h-14 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 transition-all font-semibold flex items-center justify-center gap-2">
          <Delete className="h-5 w-5" />
          Clear
        </button>
        <button className="h-14 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all font-semibold">
          Submit Score
        </button>
      </div>
    </div>
  );
}
