import { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@clerk/react';
import networkManager from '../network/NetworkManager';
import SignInPromptDialog from './SignInPromptDialog';

const SIGNED_OUT_REASON =
  'You need to be signed in to save queries to your favorites.';
// A 401 on a session we thought was good means it lapsed mid-visit, which is a
// different situation to explain than never having signed in.
const SESSION_EXPIRED_REASON =
  'Your session has expired. Sign in again to save this to your favorites.';

/** HTTP status off an error thrown by NetworkManager.makeRequest, if it has one. */
const httpStatusOf = (err: unknown): number | undefined =>
  typeof err === 'object' && err !== null && 'status' in err
    ? (err as { status?: number }).status
    : undefined;

interface FavoriteButtonProps {
  /** Canonical backend query type, e.g. 'POLITICAL_LEANING'. */
  queryType?: string | null;
  /** The answer row's id — favorites are per answer row, not per topic. */
  answerId?: number | string | null;
  className?: string;
}

/**
 * Save/unsave one answer. Login-gated: signed-out visitors see the control but
 * clicking sends them to /login rather than failing with a 401.
 *
 * State survives future visits because it is read back from the server on
 * mount (GET /isFavorited) rather than kept in browser storage — so a save made
 * on one device shows up on another.
 *
 * Uses /isFavorited rather than the `favorited` field that assessment responses
 * already carry: picking it off the response would mean threading a Clerk token
 * through the existing data-fetching hooks, which are shared with anonymous
 * page loads. One small extra request keeps this component self-contained. The
 * API README endorses /isFavorited for exactly this single-answer case.
 */
export default function FavoriteButton({
  queryType,
  answerId,
  className = '',
}: FavoriteButtonProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [favorited, setFavorited] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Set when the failure was a 401, so the error offers signing in rather than
  // a retry that would re-send the same rejected token.
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptReason, setPromptReason] = useState(SIGNED_OUT_REASON);

  // Only meaningful once we know which answer row we're looking at; the detail
  // page renders before its data resolves.
  const addressable = Boolean(queryType) && answerId != null && answerId !== '';

  // Read the saved state back from the server whenever the answer or the
  // signed-in state changes. Ignores results from a superseded request so a
  // slow response for a previous answer can't overwrite the current one.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !addressable) {
      setFavorited(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    setError('');

    (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const data = await networkManager.isFavorited(queryType, answerId, token);
        if (!cancelled) setFavorited(Boolean(data?.favorited));
      } catch (err) {
        // A failed lookup shouldn't shout at someone just reading the page —
        // leave the control in its unsaved state and let a click retry.
        console.error('Favorite status lookup failed:', err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, addressable, queryType, answerId, getToken]);

  const handleClick = useCallback(async () => {
    if (!isSignedIn) {
      // Explain the gate before moving them anywhere.
      setPromptReason(SIGNED_OUT_REASON);
      setPromptOpen(true);
      return;
    }
    if (!addressable || saving) return;

    const next = !favorited;
    setFavorited(next); // optimistic
    setSaving(true);
    setError('');
    setNeedsSignIn(false);

    try {
      const token = await getToken();
      if (!token) throw new Error('No session token');
      if (next) {
        await networkManager.addFavorite(queryType, answerId, token);
      } else {
        await networkManager.removeFavorite(queryType, answerId, token);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      setFavorited(!next); // roll back
      // A 401 means the session itself was rejected, so "try again" is useless
      // advice — a retry re-sends the same token and fails identically. Offer
      // the only thing that can actually help.
      // Kept short: this sits inline in the card's action row, so a long
      // sentence would wrap the row.
      if (httpStatusOf(err) === 401) {
        setNeedsSignIn(true);
        setError('Session expired.');
      } else {
        setNeedsSignIn(false);
        setError("Couldn't save.");
      }
    } finally {
      setSaving(false);
    }
  }, [isSignedIn, addressable, saving, favorited, getToken, queryType, answerId]);

  // Both auth failures — never signed in, and signed in but lapsed — route
  // through the same dialog, so "you need an account for this" always looks the
  // same wherever you hit it.
  const openSessionExpiredPrompt = useCallback(() => {
    setPromptReason(SESSION_EXPIRED_REASON);
    setPromptOpen(true);
  }, []);

  // Nothing to save yet — keep the row from jumping once data lands.
  if (!addressable) return null;

  return (
    // Error sits to the LEFT of the pill so the pill stays adjacent to the copy-
    // link button beside it, and the message grows into the row's empty middle.
    <div className={`flex items-center gap-2 ${className}`}>
      {error && (
        <span className="text-xs text-red-500 whitespace-nowrap">
          {error}
          {needsSignIn && (
            <button
              type="button"
              onClick={openSessionExpiredPrompt}
              className="ml-1 underline font-medium hover:text-red-600"
            >
              Sign in
            </button>
          )}
        </span>
      )}
      {/* Pill styling deliberately mirrors the vote and copy-link buttons it
          sits beside, so the row reads as one set of actions. Saved state is
          shown three ways — filled heart, darker border, and the word itself —
          because an icon-only toggle can't tell you whether it means "saved"
          or "tap to save". */}
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || checking}
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        title={isSignedIn ? undefined : 'Sign in to save this answer'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors bg-transparent border disabled:opacity-50 disabled:cursor-not-allowed ${
          favorited
            ? 'border-gray-800 text-gray-800'
            : 'border-gray-200 text-gray-500 hover:border-gray-800 hover:text-gray-800'
        }`}
      >
        <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
        <span>{favorited ? 'Saved' : 'Save'}</span>
      </button>

      <SignInPromptDialog
        open={promptOpen}
        onOpenChange={setPromptOpen}
        description={promptReason}
      />
    </div>
  );
}
