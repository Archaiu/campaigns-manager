import React, { useState } from "react";

const Keywords = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 25;

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`cursor-pointer hover:text-blue-600 transition-colors ${
        isExpanded ? "break-words whitespace-normal" : ""
      }`}
    >
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
    </div>
  );
};

export default Keywords;