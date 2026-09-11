import ReactMarkdown from 'react-markdown';

/**
 * The analysis body.
 *
 * Rendered as markdown: a lot of the stored overviews were generated with
 * headings, bold and bullet lists, and the previous line-splitting renderer
 * showed the syntax literally — "## Recipients" and "**no recorded
 * contributions**" as visible characters.
 *
 * Styling is per-element rather than via @tailwindcss/typography, which isn't
 * installed. Tailwind's preflight strips heading sizes, list markers and
 * margins, so without these each element would render as undifferentiated body
 * text and the markdown would be invisible rather than wrong.
 *
 * Core markdown only — remark-gfm isn't installed, so GFM tables and
 * strikethrough still pass through as raw text. Nothing in the current
 * overviews uses them; add the plugin if that changes.
 */

/**
 * Drops a leading top-level heading.
 *
 * The card already shows a title ("Financial Contributions Overview for Citi"),
 * and these documents usually open with their own ("# Analysis of Citigroup's
 * Political Contributions"), so rendering it would show the same thing twice.
 * Removing it was a deliberate choice in the original renderer and is kept.
 *
 * The old version cut a fixed two characters past the newline, which ate the
 * first letter of the body whenever a heading wasn't followed by a blank line.
 */
const stripLeadingHeading = (text: string): string => {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith('#')) return text;
  return trimmed.replace(/^#{1,6}[^\n]*(?:\n+|$)/, '');
};

const ContextSection = ({ context }: { context?: string | null }) => {
  if (!context) return null;

  const processed = stripLeadingHeading(context);
  if (!processed.trim()) return null;

  return (
    <div className="text-base text-gray-700">
      <ReactMarkdown
        components={{
          // h1 is demoted: the card's own title outranks anything inside the body.
          h1: ({ ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2 first:mt-0" {...props} />
          ),
          h2: ({ ...props }) => (
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2 first:mt-0" {...props} />
          ),
          h3: ({ ...props }) => (
            <h4 className="text-base font-semibold text-gray-900 mt-4 mb-1.5 first:mt-0" {...props} />
          ),
          h4: ({ ...props }) => (
            <h5 className="text-base font-semibold text-gray-800 mt-4 mb-1.5 first:mt-0" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
          strong: ({ ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-3" {...props} />
          ),
          hr: ({ ...props }) => <hr className="my-5 border-gray-200" {...props} />,
          code: ({ ...props }) => (
            <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono" {...props} />
          ),
          pre: ({ ...props }) => (
            <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto text-sm my-3" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
              {...props}
            />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export default ContextSection;
