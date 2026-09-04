import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SignInOptions from './SignInOptions';

interface SignInPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Overrides the heading — saving and viewing are different asks. */
  title?: string;
  /** Overrides the body copy — e.g. for an expired session rather than a signed-out visitor. */
  description?: string;
}

/**
 * Explains why an action needs an account, then offers the two ways to get one.
 *
 * Shown instead of sending someone straight to /login: a gated action that
 * silently navigates away reads as the app losing your place, whereas naming
 * the reason first makes the trip somewhere else feel intentional.
 *
 * Both buttons navigate rather than opening Clerk's own `mode="modal"` sign-in.
 * Nesting Clerk's modal inside this Radix dialog puts two focus traps on screen
 * at once, which is a real risk of the inner one being unusable. Navigating
 * carries redirect_url so people land back on the answer they were saving.
 */
export default function SignInPromptDialog({
  open,
  onOpenChange,
  title = 'Sign in to save favorites',
  description = 'You need to be signed in to save queries to your favorites.',
}: SignInPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <SignInOptions className="sm:justify-end pt-2" />
      </DialogContent>
    </Dialog>
  );
}
