import type { QuizStanceQuestion, QuizStanceValue } from '@/lib/quiz';

interface StanceScreenProps {
  questions: QuizStanceQuestion[];
  stances: Record<string, QuizStanceValue>;
  onChange: (issueKey: string, value: QuizStanceValue) => void;
}

/**
 * Screen 2 — which direction, for the issues that got a weight.
 *
 * `questions` is already filtered to weighted issues by the caller. An issue
 * left at "Not at all" must never have its direction asked: it shortens the
 * quiz, and it avoids collecting a political opinion the result will not use.
 */
export default function StanceScreen({
  questions,
  stances,
  onChange,
}: StanceScreenProps) {
  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const current = stances[question.key];

        return (
          <div
            key={question.key}
            className="border-t border-gray-200 pt-5 first:border-t-0 first:pt-0"
          >
            <h2 className="font-medium text-gray-900">{question.prompt}</h2>
            {question.help && (
              <p className="text-sm text-gray-500 mt-0.5">{question.help}</p>
            )}

            <div className="space-y-2 mt-3">
              {question.options.map((option) => {
                // Values are mixed: numbers in -1.0…1.0, plus the string
                // 'stay_out' on political giving. Both are primitives, so ===
                // compares correctly; String() is only for the React key, and
                // the value itself is handed back untouched — coercing
                // 'stay_out' to a number would turn a different scoring rule
                // into a midpoint on the axis.
                const selected = current === option.value;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(question.key, option.value)}
                    className={`w-full text-left text-sm px-4 py-3 rounded-md border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
