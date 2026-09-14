import { useCallback, useEffect, useMemo, useState } from 'react';
import networkManager from './network/NetworkManager';
import QuizLayout from './components/quiz/QuizLayout';
import ImportanceScreen from './components/quiz/ImportanceScreen';
import StanceScreen from './components/quiz/StanceScreen';
import ScopeScreen from './components/quiz/ScopeScreen';
import QuizResults from './components/quiz/QuizResults';
import {
  buildSubmission,
  emptyAnswers,
  isVersionMismatch,
  readQuizErrors,
  validateAnswers,
  visibleStanceQuestions,
  weightedIssueKeys,
  type QuizAnswers,
  type QuizDefinition,
  type QuizResultResponse,
  type QuizStanceValue,
} from './lib/quiz';

const STEP_TITLES = ['What matters', 'Which way', 'Where to shop'];

/**
 * Compass Match — the values quiz.
 *
 * Three screens of questions, then a ranked set of companies per shopping
 * category. The whole interface lives here: the server serves the questions and
 * scores the answers, and ships no UI of its own.
 *
 * The result deliberately does NOT go into the URL. The share token is the
 * user's answers, compressed — pushing it into the address bar on a primary run
 * would write their stated political positions into browser history, which is
 * exactly what posting the answers in a request body avoids. The share link is
 * offered as a thing they choose to copy, never as a thing that happens to
 * them.
 */
export default function Quiz() {
  const [definition, setDefinition] = useState<QuizDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResultResponse | null>(null);

  const loadDefinition = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await networkManager.getQuizDefinition();
      setDefinition(data);
    } catch (error) {
      console.error('Failed to load the quiz definition:', error);
      // A 503 here is the database being unavailable, which is not a statement
      // about the quiz being empty — so it must not be phrased as one.
      const status = (error as { status?: number })?.status;
      setLoadError(
        status === 503
          ? 'Our data is briefly unavailable. Please try again shortly.'
          : 'We could not load the quiz just now.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDefinition();
  }, [loadDefinition]);

  const stanceQuestions = useMemo(
    () => (definition ? visibleStanceQuestions(definition, answers.weights) : []),
    [definition, answers.weights]
  );

  // Nothing seeded anywhere: every shelf is empty, so there is no ranking to
  // produce and starting the quiz would waste someone's time before telling
  // them so.
  const nothingAvailable = Boolean(
    definition &&
      definition.categories.options.every((option) => option.company_count === 0)
  );

  const setWeight = (issueKey: string, weight: number) => {
    setAnswers((previous) => {
      const weights = { ...previous.weights, [issueKey]: weight };
      // Dropping an issue to 0 drops the direction we collected for it. Keeping
      // it would mean holding a political opinion that no longer feeds
      // anything, and buildSubmission would have to filter it out again anyway.
      const stances = { ...previous.stances };
      if (weight === 0) delete stances[issueKey];
      return { ...previous, weights, stances };
    });
  };

  const setStance = (issueKey: string, value: QuizStanceValue) => {
    setAnswers((previous) => ({
      ...previous,
      stances: { ...previous.stances, [issueKey]: value },
    }));
  };

  const toggleCategory = (value: string) => {
    setAnswers((previous) => ({
      ...previous,
      categories: previous.categories.includes(value)
        ? previous.categories.filter((entry) => entry !== value)
        : [...previous.categories, value],
    }));
  };

  const toggleDealbreaker = (value: string) => {
    setAnswers((previous) => {
      if (previous.dealbreakers.includes(value)) {
        return {
          ...previous,
          dealbreakers: previous.dealbreakers.filter((entry) => entry !== value),
        };
      }
      if (previous.dealbreakers.length >= (definition?.dealbreakers.max ?? 2)) {
        return previous;
      }
      return { ...previous, dealbreakers: [...previous.dealbreakers, value] };
    });
  };

  const canAdvance = (() => {
    if (!definition) return false;
    if (step === 0) return weightedIssueKeys(answers.weights).length > 0;
    if (step === 1) {
      return stanceQuestions.every(
        (question) => answers.stances[question.key] !== undefined
      );
    }
    return answers.categories.length > 0;
  })();

  const handleSubmit = async () => {
    if (!definition) return;

    const problems = validateAnswers(definition, answers);
    if (problems.length > 0) {
      setSubmitErrors(problems);
      return;
    }

    setSubmitting(true);
    setSubmitErrors([]);

    try {
      const data = await networkManager.submitQuiz(
        buildSubmission(definition, answers)
      );
      setResult(data);
      setStep(3);
      window.scrollTo({ top: 0 });
    } catch (error) {
      console.error('Failed to submit the quiz:', error);
      const messages = readQuizErrors(error);
      setSubmitErrors(messages);

      // A version mismatch means the definition we rendered no longer matches
      // the scorer. Old answers are deliberately not migrated — a retuned
      // scorer makes them incomparable — so the only honest move is to reload
      // the questions and start again.
      if (isVersionMismatch(messages)) {
        setAnswers(emptyAnswers());
        setStep(0);
        loadDefinition();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers(emptyAnswers());
    setResult(null);
    setSubmitErrors([]);
    setStep(0);
    window.scrollTo({ top: 0 });
  };

  if (loading) {
    return (
      <QuizLayout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          Loading…
        </div>
      </QuizLayout>
    );
  }

  if (loadError || !definition) {
    return (
      <QuizLayout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-700">{loadError || 'We could not load the quiz.'}</p>
          <button
            type="button"
            onClick={loadDefinition}
            className="mt-4 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </QuizLayout>
    );
  }

  if (nothingAvailable) {
    return (
      <QuizLayout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Not ready yet</h1>
          <p className="text-gray-600 mt-2">
            We do not hold enough ratings to recommend anything in any category
            yet. Come back once there is something on the shelves.
          </p>
        </div>
      </QuizLayout>
    );
  }

  if (result) {
    return (
      <QuizLayout>
        <QuizResults result={result} onRetake={handleRetake} />
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Find your match</h1>
        <p className="text-sm text-gray-500 mt-1">
          Step {step + 1} of 3 · {STEP_TITLES[step]}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {step === 0 && (
          <ImportanceScreen
            importance={definition.importance}
            weights={answers.weights}
            onChange={setWeight}
          />
        )}

        {step === 1 && (
          <StanceScreen
            questions={stanceQuestions}
            stances={answers.stances}
            onChange={setStance}
          />
        )}

        {step === 2 && (
          <ScopeScreen
            definition={definition}
            categories={answers.categories}
            dealbreakers={answers.dealbreakers}
            requireVerified={answers.requireVerified}
            onToggleCategory={toggleCategory}
            onToggleDealbreaker={toggleDealbreaker}
            onChangeRequireVerified={(value) =>
              setAnswers((previous) => ({ ...previous, requireVerified: value }))
            }
          />
        )}

        {submitErrors.length > 0 && (
          <div className="mt-5 text-sm text-red-800 bg-red-50 rounded-md px-3 py-2 space-y-1">
            {submitErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="text-sm font-medium text-gray-700 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              disabled={!canAdvance}
              className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance || submitting}
              className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Scoring…' : 'See my matches'}
            </button>
          )}
        </div>
      </div>

      {/* Required on the quiz as well as on results. */}
      {definition.disclaimer && (
        <p className="text-xs text-gray-500 mt-4 px-1">{definition.disclaimer}</p>
      )}
    </QuizLayout>
  );
}
