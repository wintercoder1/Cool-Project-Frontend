import React from "react";

const removeBeginningMarkup = (text) => {
  if (!text) return text;
  
  const trimmedText = text.trim();
  if (trimmedText.startsWith('#')) {
    const firstLineEndIndex = trimmedText.indexOf('\n');
    if (firstLineEndIndex === -1) {
      // Only one line and it starts with #, return empty string
      return '';
    }
    return trimmedText.substring(firstLineEndIndex + 2); // Skip the line with markup plus the line after.
  }
  
  return text;
};

const ContextSection = ({ context }) => {
  if (!context) return null;

  const processedContext = removeBeginningMarkup(context);

  return (
    <div className="text-base space-y-20">
      {processedContext.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line.trim()}
          {i < processedContext.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextSection;