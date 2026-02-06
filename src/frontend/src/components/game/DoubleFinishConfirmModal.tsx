import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface DoubleFinishConfirmModalProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
}

export default function DoubleFinishConfirmModal({
  open,
  onYes,
  onNo,
}: DoubleFinishConfirmModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Double Finish Confirmation</DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Was it a double finish?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onNo}
            className="flex-1"
          >
            No
          </Button>
          <Button
            onClick={onYes}
            className="flex-1"
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
