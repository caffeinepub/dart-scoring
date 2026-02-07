import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface VoiceScoreConfirmModalProps {
  open: boolean;
  transcript: string;
  proposedScore: number | null;
  onOk: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

export default function VoiceScoreConfirmModal({
  open,
  transcript,
  proposedScore,
  onOk,
  onEdit,
  disabled = false,
}: VoiceScoreConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onEdit()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <DialogDescription>
            Confirm the recognized score or edit manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              You said:
            </p>
            <p className="text-base font-semibold">{transcript || '(no input)'}</p>
          </div>

          {proposedScore !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Recognized score:
              </p>
              <p className="text-3xl font-bold text-primary">{proposedScore}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive font-medium">
                Could not detect a valid score from your input.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            onClick={onOk}
            disabled={disabled || proposedScore === null}
            className="flex-1"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
