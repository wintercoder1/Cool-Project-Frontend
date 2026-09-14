import { Link } from 'react-router-dom';

/**
 * The main-page entry to Compass Match.
 *
 * This is the discovery route, not the nav strip. The strip's link is 12px and
 * deliberately recessive — right for something you already know about, wrong
 * for a feature nobody has been told exists. Here it sits above the list, at
 * the moment someone is looking at companies and has no particular one in mind.
 *
 * Hidden during search: someone typing a company name already knows what they
 * want, and this would be in the way of it.
 */
export default function QuizPrompt() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="min-w-0">
        <div className="font-semibold text-gray-900">
          Not sure where to start?
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          Answer a few questions about what matters to you and we&apos;ll rank
          the companies that fit. No account needed.
        </p>
      </div>

      <Link
        to="/quiz"
        className="flex-shrink-0 self-start sm:self-auto bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Take the quiz
      </Link>
    </div>
  );
}
