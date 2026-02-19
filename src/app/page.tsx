import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">💰 FinanceDash</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            ✨ AI-Powered Finance Tracking
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Take Control of Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Financial Future
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Track your income and expenses, visualize spending patterns with
            beautiful charts, and get personalized AI-powered financial advice
            — all in one dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Start for Free →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="font-bold text-lg mb-2">Visual Analytics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Beautiful pie charts and bar graphs show exactly where your
              money goes each month.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <h3 className="font-bold text-lg mb-2">AI Financial Advisor</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get personalized spending insights and budget recommendations
              powered by Claude AI.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              🛍️
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Shopping</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI-powered product recommendations with price comparisons
              across 6 major retailers.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          Built by Alan Huang · NYU Tandon · 2026
        </div>
      </footer>
    </div>
  );
}