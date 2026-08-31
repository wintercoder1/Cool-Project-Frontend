import { SignIn } from '@clerk/react';
import AuthPageLayout from './components/AuthPageLayout';

/**
 * Sign-in page — for every user, not just paid ones. Clerk owns the form,
 * validation, error states, verification and password reset.
 *
 * The route in index.tsx is "/login/*" on purpose: Clerk navigates to
 * sub-paths for email verification, MFA and SSO callbacks, so a bare "/login"
 * silently breaks those steps — and it looks fine until someone actually hits
 * verification. `routing="path"` is what makes it use those sub-paths rather
 * than the URL hash.
 */
export default function Login() {
  return (
    <AuthPageLayout>
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </AuthPageLayout>
  );
}
