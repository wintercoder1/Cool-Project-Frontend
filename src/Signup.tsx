import { SignUp } from '@clerk/react';
import AuthPageLayout from './components/AuthPageLayout';

/**
 * Free-tier account creation. This is the ONLY signup flow — it creates an
 * account and costs nothing. The paid tier is a separate, later step
 * (ProCheckout.tsx), reached from inside the app once signed in; it is not an
 * entry point and must never be what "Sign up" means.
 *
 * Before this existed, "Sign up" pointed at the Paddle checkout, which sent
 * anyone clicking it straight into a paid subscription.
 *
 * See Login.tsx for why the route is "/signup/*" and routing is path-based.
 */
export default function Signup() {
  return (
    <AuthPageLayout>
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </AuthPageLayout>
  );
}
