import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import networkManager from './network/NetworkManager';
import QuizLayout from './components/quiz/QuizLayout';
import QuizResults from './components/quiz/QuizResults';
import { readQuizErrors, type QuizResultResponse } from './lib/quiz';

/**
 * A shared quiz result, re-scored from the token in the URL.
 *
 * Nothing is looked up: the token carries the answers, and the server scores
 * them again through the identical path that produced the original. It
 * reproduces the original ranking because `as_of` is pinned inside the token,
 * so a link shared months ago still shows the run that made it rather than
 * drifting as ratings land behind it.
 */
export default function QuizResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('a');

  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!shareToken) {
      setLoading(false);
      setErrors(['That link is missing its answers.']);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const data = await networkManager.getQuizResult(shareToken);
      setResult(data);
    } catch (error) {
      console.error('Failed to read the shared quiz result:', error);
      setResult(null);
      // An unreadable token is not worth retrying — malformed, truncated or
      // oversized all mean the same thing to the reader, and the only way
      // forward is a fresh run.
      setErrors(readQuizErrors(error));
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <QuizLayout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          Loading…
        </div>
      </QuizLayout>
    );
  }

  if (!result) {
    return (
      <QuizLayout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            We could not read that link
          </h1>
          <div className="text-gray-600 mt-2 space-y-1">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
          <Link
            to="/quiz"
            className="inline-block mt-4 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors"
          >
            Take the quiz
          </Link>
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      {/* Someone arriving here is reading another person's answers, not their
          own. Saying so is the difference between "here are your matches" and
          a result they might mistake for their own. */}
      <p className="text-sm text-gray-600 bg-white rounded-lg shadow-sm px-4 py-3 mb-4">
        This is a shared result, scored from the answers in the link.
      </p>

      <QuizResults
        result={result}
        // A shared result carries someone else's answers, and the token is
        // only decodable server-side, so there is nothing here to edit. Both
        // actions start a fresh run, and the label says so rather than
        // offering to change answers the viewer never gave.
        onEditAnswers={() => navigate('/quiz')}
        editLabel="Take the quiz yourself"
        onRestart={() => navigate('/quiz')}
        restartLabel="Take the quiz yourself"
      />
    </QuizLayout>
  );
}
