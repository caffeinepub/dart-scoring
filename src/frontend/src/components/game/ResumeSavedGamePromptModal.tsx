import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface ResumeSavedGamePromptModalProps {
  open: boolean;
  onResume: () => void;
  onDiscard: () => void;
}

export default function ResumeSavedGamePromptModal({
  open,
  onResume,
  onDiscard,
}: ResumeSavedGamePromptModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Resume?</DialogTitle>
          <DialogDescription>
            You have a game in progress. Would you like to resume it or start a new game?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="w-full sm:w-auto"
          >
            Discard
          </Button>
          <Button
            onClick={onResume}
            className="w-full sm:w-auto"
          >
            Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
