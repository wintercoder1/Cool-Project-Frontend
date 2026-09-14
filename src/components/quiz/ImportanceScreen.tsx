import type { QuizImportanceSection } from '@/lib/quiz';

interface ImportanceScreenProps {
  importance: QuizImportanceSection;
  weights: Record<string, number>;
  onChange: (issueKey: string, weight: number) => void;
}

/**
 * Screen 1 — how much each issue matters.
 *
 * Every issue is on screen at once rather than one per step. That is what makes
 * people budget their attention across the five instead of marking each one
 * important in isolation, which is the failure mode that produces a flat
 * weighting and a meaningless ranking.
 */
export default function ImportanceScreen({
  importance,
  weights,
  onChange,
}: ImportanceScreenProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">{importance.prompt}</h2>

      {importance.issues.map((issue) => {
        // Undefined until they choose, NOT 0. An issue with no answer scores as
        // 0 either way -- the contract treats an omitted key as zero -- but
        // painting "Not at all" as the selected option makes five untouched
        // rows look answered, while Next stays greyed with no visible reason.
        // Leaving every option unfilled says "you have not answered this yet",
        // and picking "Not at all" stays available as a real choice.
        const current = weights[issue.key];

        return (
          <div key={issue.key} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
            <div className="font-medium text-gray-900">{issue.label}</div>
            {issue.help && (
              <p className="text-sm text-gray-500 mt-0.5">{issue.help}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {importance.options.map((option) => {
                const selected = current === option.value;

                // Blue marks "this is your answer", and nothing else in the
                // quiz uses it — the Next/submit buttons stay black. The site
                // is black and white with blue as an occasional accent, so
                // spending it on one meaning is what keeps it readable as a
                // signal rather than decoration.
                //
                // The colour is the `brand` token (see tailwind.config.js),
                // not a blue-* utility: Tailwind's blue ramp sits at hue 221+
                // and reads violet once dark enough for white text.
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(issue.key, option.value)}
                    className={`text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
                      selected
                        ? 'bg-brand text-white border-brand'
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

      {/* Said once, quietly, and never enforced: marking everything "the main
          thing" scores identically to marking everything "a little", because
          the weights are relative. Blocking it would be worse than explaining
          it — it is a legitimate answer, just not a useful one. */}
      <p className="text-xs text-gray-500 border-t border-gray-200 pt-4">
        These are relative. Marking everything as the main thing works out the
        same as marking everything a little.
      </p>
    </div>
  );
}
