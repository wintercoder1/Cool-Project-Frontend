import type { QuizDefinition } from '@/lib/quiz';

interface ScopeScreenProps {
  definition: QuizDefinition;
  categories: string[];
  dealbreakers: string[];
  requireVerified: boolean;
  onToggleCategory: (value: string) => void;
  onToggleDealbreaker: (value: string) => void;
  onChangeRequireVerified: (value: boolean) => void;
}

/** Screen 3 — where to shop, what rules a company out, and how strict to be. */
export default function ScopeScreen({
  definition,
  categories,
  dealbreakers,
  requireVerified,
  onToggleCategory,
  onToggleDealbreaker,
  onChangeRequireVerified,
}: ScopeScreenProps) {
  const atDealbreakerCap = dealbreakers.length >= definition.dealbreakers.max;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-medium text-gray-900">
          {definition.categories.prompt}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {definition.categories.options.map((option) => {
            const selected = categories.includes(option.value);

            // Unavailable categories are shown disabled with their count rather
            // than hidden. An empty shelf someone can see beats one that
            // silently is not there — the count is also the honest explanation
            // for why it is off.
            return (
              <button
                key={option.value}
                type="button"
                disabled={!option.available}
                aria-pressed={selected}
                onClick={() => onToggleCategory(option.value)}
                className={`text-left text-sm px-4 py-3 rounded-md border transition-colors ${
                  !option.available
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : selected
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">{option.label}</span>
                {/* blue-50 rather than blue-100 on the selected card: at 12px
                    this is normal-size text, and blue-100 on blue-600 comes to
                    4.24:1, under the 4.5:1 AA floor. blue-50 clears it at
                    4.75:1 and still reads as secondary. */}
                <span
                  className={`block text-xs mt-0.5 ${
                    selected && option.available ? 'text-blue-50' : 'text-gray-500'
                  }`}
                >
                  {option.available
                    ? `${option.company_count} ${
                        option.company_count === 1 ? 'company' : 'companies'
                      }`
                    : 'Nothing here yet'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="font-medium text-gray-900">
          {definition.dealbreakers.prompt}
        </h2>
        {definition.dealbreakers.help && (
          <p className="text-sm text-gray-500 mt-0.5">
            {definition.dealbreakers.help}
          </p>
        )}

        <div className="space-y-2 mt-3">
          {definition.dealbreakers.options.map((option) => {
            const selected = dealbreakers.includes(option.value);
            // At the cap, the unpicked ones go inert rather than silently
            // swapping one out from under the user.
            const blocked = !selected && atDealbreakerCap;

            return (
              <button
                key={option.value}
                type="button"
                disabled={blocked}
                aria-pressed={selected}
                onClick={() => onToggleDealbreaker(option.value)}
                className={`w-full text-left text-sm px-4 py-3 rounded-md border transition-colors ${
                  blocked
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : selected
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* A dealbreaker removes a company from the list instead of ranking it
            low, and removed companies are never named — that is a real
            difference in what the results mean, so it is said plainly. */}
        <p className="text-xs text-gray-500 mt-3">
          A dealbreaker leaves a company out of your results entirely rather
          than showing it with a low score. Companies left out are counted, not
          named.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="font-medium text-gray-900">
          {definition.verification.prompt}
        </h2>

        <div className="space-y-2 mt-3">
          {definition.verification.options.map((option) => {
            const selected = requireVerified === option.value;

            return (
              <button
                key={String(option.value)}
                type="button"
                aria-pressed={selected}
                onClick={() => onChangeRequireVerified(option.value)}
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
    </div>
  );
}
