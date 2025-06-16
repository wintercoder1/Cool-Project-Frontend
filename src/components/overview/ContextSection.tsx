import React from "react";

const ContextSection = ({ context }) => {
  if (!context) return null;

  return (
    <div className="text-base space-y-20">
      {context.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line.trim()}
          {i < context.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextSection;