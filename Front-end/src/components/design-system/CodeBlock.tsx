"use client";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting for TSX/JSX
  const highlightCode = (code: string) => {
    return code
      .replace(/(&lt;|<)(\/?[\w-]+)/g, '<span class="text-blue-400">$1$2</span>')
      .replace(/([\w-]+)=/g, '<span class="text-green-400">$1</span>=')
      .replace(/("([^"]*)"|'([^']*)')/g, '<span class="text-yellow-400">$1</span>')
      .replace(/\/\/(.*)/g, '<span class="text-gray-500">//$1</span>')
      .replace(/\b(import|export|const|let|var|function|return|from|default|interface|type)\b/g, '<span class="text-purple-400">$1</span>');
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
        <button
          onClick={copyCode}
          className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="bg-black p-4 rounded-b-lg overflow-x-auto border border-gray-800">
        <code
          className="text-sm font-mono text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
    </div>
  );
}
