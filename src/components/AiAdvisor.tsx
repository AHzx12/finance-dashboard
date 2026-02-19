"use client";

import { useState } from "react";

export default function AiAdvisor() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAdvice = async () => {
    setLoading(true);
    setError("");
    setAdvice("");

    try {
      const res = await fetch("/api/ai-advice", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to get advice");
        return;
      }

      setAdvice(data.advice);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown-like rendering for bold text and headings
  const renderAdvice = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Heading lines (## or ###)
      if (line.startsWith("### ")) {
        return (
          <h4
            key={i}
            className="font-bold text-gray-800 mt-4 mb-1 text-sm flex items-center gap-2"
          >
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3
            key={i}
            className="font-bold text-gray-900 mt-4 mb-2 text-base"
          >
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Numbered list items
      if (/^\d+\./.test(line.trim())) {
        return (
          <p key={i} className="text-sm text-gray-700 leading-relaxed pl-2 py-0.5">
            {renderBold(line)}
          </p>
        );
      }
      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <p key={i} className="text-sm text-gray-700 leading-relaxed pl-4 py-0.5">
            • {renderBold(line.trim().replace(/^[-•]\s/, ""))}
          </p>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      // Regular text
      return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
          {renderBold(line)}
        </p>
      );
    });
  };

  // Render **bold** text
  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg shadow-md">
            🤖
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Financial Advisor
            </h2>
            <p className="text-xs text-gray-400">
              AI-powered spending analysis
            </p>
          </div>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Get Advice"
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Analyzing your spending patterns...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Advice Content */}
      {advice && !loading && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
          {renderAdvice(advice)}
        </div>
      )}

      {/* Empty State */}
      {!advice && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-sm text-gray-400">
            Click &quot;Get Advice&quot; for personalized financial insights
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Based on your transaction history and spending patterns
          </p>
        </div>
      )}
    </div>
  );
}