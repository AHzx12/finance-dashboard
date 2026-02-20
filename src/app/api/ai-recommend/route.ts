import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get_session";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product, minPrice, maxPrice } = body;

    if (!product || !product.trim()) {
      return NextResponse.json(
        { error: "Product type is required" },
        { status: 400 }
      );
    }

    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      return NextResponse.json(
        { error: "Invalid price range" },
        { status: 400 }
      );
    }

    const prompt = `You are a smart shopping advisor. Search the web for REAL, CURRENT prices for the following product request.

## Request
- Product: ${product.trim()}
- Budget: $${Number(minPrice).toFixed(2)} - $${Number(maxPrice).toFixed(2)}

IMPORTANT: You MUST use web search to find real current prices. Search for each product on Amazon, Best Buy, and other retailers. Do NOT guess prices.

Search for: "${product.trim()} price" and "${product.trim()} buy"

After searching, recommend exactly 3 products that are CURRENTLY available and within the budget. Return ONLY valid JSON with no other text, no markdown backticks. Use this exact format:

{
  "products": [
    {
      "name": "Brand Model Name",
      "price": 79.99,
      "rating": 4.5,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1"],
      "summary": "One sentence summary.",
      "badge": "Best Overall",
      "searchQuery": "exact product name for search",
      "source": "Where you found this price (e.g. Amazon, Best Buy)"
    }
  ],
  "shoppingTip": "A brief tip for buying this type of product."
}

CRITICAL: Every product price MUST be between $${Number(minPrice).toFixed(2)} and $${Number(maxPrice).toFixed(2)}. Use REAL prices from your web search results. The first badge should be "Best Overall", second "Best Value", third "Budget Pick".`;

    // 使用 web search 工具让 Claude 搜索实时价格
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // 从回复中提取文本（可能包含多个 content blocks）
    const rawText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      // 找到 JSON 部分（可能前后有其他文字）
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");

      const data = JSON.parse(jsonMatch[0]);

      const productsWithLinks = data.products.map((p: any) => {
        const q = encodeURIComponent(p.searchQuery);
        return {
          ...p,
          links: [
            { name: "Amazon", url: `https://www.amazon.com/s?k=${q}`, color: "#FF9900" },
            { name: "Google", url: `https://www.google.com/search?tbm=shop&q=${q}`, color: "#4285F4" },
            { name: "Best Buy", url: `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`, color: "#0046BE" },
            { name: "Walmart", url: `https://www.walmart.com/search?q=${q}`, color: "#0071DC" },
            { name: "eBay", url: `https://www.ebay.com/sch/i.html?_nkw=${q}`, color: "#E53238" },
            { name: "Newegg", url: `https://www.newegg.com/p/pl?d=${q}`, color: "#F7821B" },
          ],
        };
      });

      return NextResponse.json({
        products: productsWithLinks,
        shoppingTip: data.shoppingTip,
      });
    } catch {
      return NextResponse.json({
        products: [],
        shoppingTip: rawText,
        fallback: true,
      });
    }
  } catch (error) {
    console.error("AI recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}