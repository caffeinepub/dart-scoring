import { User } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  score: number;
  isActive?: boolean;
}

export default function PlayerCard({ name, score, isActive = false }: PlayerCardProps) {
  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        isActive
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
        {isActive && (
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            Active
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Current Score</p>
        <p className="text-4xl font-bold tracking-tight">{score}</p>
      </div>
    </div>
  );
}
