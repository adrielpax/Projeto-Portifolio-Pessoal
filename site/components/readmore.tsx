'use client'; // Apenas esta parte pequena será client
import { useState } from 'react';

export default function ReadMoreButton({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 150; // limite de caracteres

  if (text.length <= limit) return <p>{text}</p>;

  return (
    <div>
      <p className={`text-gray-700 ${isExpanded ? 'line-clamp-none':'line-clamp-1'}`}>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-500 hover:underline text-sm"
      >
        {isExpanded ? 'Ler menos' : 'Ler mais'}
      </button>
    </div>
  );
}
