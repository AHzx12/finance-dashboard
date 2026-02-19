"use client";

import { useState } from "react";

type ShopLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

type Product = {
  name: string;
  price: number;
  rating: number;
  pros: string[];
  cons: string[];
  summary: string;
  badge: string;
  links: ShopLink[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? "text-amber-400"
              : star - 0.5 <= rating
              ? "text-amber-300"
              : "text-gray-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function BadgeColor(badge: string) {
  if (badge.includes("Overall"))
    return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
  if (badge.includes("Value"))
    return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white";
  return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
}

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${BadgeColor(
            product.badge
          )}`}
        >
          {product.badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Product header */}
        <div className="pr-24 mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
            {product.name}
          </h3>
          <StarRating rating={product.rating} />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xs text-gray-400 font-medium">Est.</span>
          <span className="text-3xl font-extrabold text-gray-900">
            ${Math.floor(product.price)}
          </span>
          <span className="text-lg font-semibold text-gray-400">
            .{((product.price % 1) * 100).toFixed(0).padStart(2, "0")}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {product.summary}
        </p>

        {/* Expandable pros/cons */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-400 hover:text-gray-600 transition mb-3 flex items-center gap-1"
        >
          <svg
            className={`w-3 h-3 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {expanded ? "Hide details" : "Show pros & cons"}
        </button>

        {expanded && (
          <div className="space-y-2 mb-4">
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-1">
                ✓ Pros
              </p>
              {product.pros.map((pro, i) => (
                <p key={i} className="text-xs text-gray-600 pl-3 py-0.5">
                  • {pro}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 mb-1">
                ✗ Cons
              </p>
              {product.cons.map((con, i) => (
                <p key={i} className="text-xs text-gray-600 pl-3 py-0.5">
                  • {con}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Price disclaimer */}
        <div className="flex items-center gap-1 mb-3">
          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-600">
            Estimated price — click below for real-time pricing
          </span>
        </div>

        {/* Shop links */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Compare prices on:</p>
          <div className="grid grid-cols-3 gap-2">
            {product.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2 px-2 rounded-lg text-white text-xs font-semibold transition-all duration-200 hover:shadow-md hover:scale-105"
                style={{ backgroundColor: link.color }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiRecommend() {
  const [product, setProduct] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingTip, setShoppingTip] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProducts([]);
    setShoppingTip("");
    setFallbackText("");
    setSearched(true);

    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          minPrice: parseFloat(minPrice) || 0,
          maxPrice: parseFloat(maxPrice) || 1000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to get recommendations");
        return;
      }

      if (data.fallback) {
        setFallbackText(data.shoppingTip);
      } else {
        setProducts(data.products);
        setShoppingTip(data.shoppingTip);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md">
          🛍️
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            AI Shopping Advisor
          </h2>
          <p className="text-xs text-gray-400">
            Smart recommendations within your budget
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            required
            placeholder="What are you looking for? (e.g. wireless headphones)"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition"
            />
          </div>
          <div className="flex items-center text-gray-300 text-sm">to</div>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
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
              Finding best deals...
            </span>
          ) : (
            "Find Recommendations"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Fallback text */}
      {fallbackText && !loading && (
        <div className="bg-purple-50 rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {fallbackText}
        </div>
      )}

      {/* Product Cards */}
      {products.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="space-y-3">
            {products.map((p, index) => (
              <ProductCard key={index} product={p} index={index} />
            ))}
          </div>

          {/* Shopping Tip */}
          {shoppingTip && (
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-lg">💡</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">
                  Shopping Tip
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {shoppingTip}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searched && !loading && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-gray-400">
            Tell us what you want to buy and your budget
          </p>
          <p className="text-xs text-gray-300 mt-1">
            AI will find the best options with direct purchase links
          </p>
        </div>
      )}
    </div>
  );
}