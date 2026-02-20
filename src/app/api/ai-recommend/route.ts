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

    const prompt = `You are a shopping advisor. I need you to find 3 real products currently for sale.

## Request
- Product: ${product.trim()}
- Budget: $${Number(minPrice).toFixed(2)} - $${Number(maxPrice).toFixed(2)}

## Instructions
1. Search for "${product.trim()}" on Amazon and other major retailers
2. Find 3 specific products that are CURRENTLY listed and priced between $${Number(minPrice).toFixed(2)} and $${Number(maxPrice).toFixed(2)}
3. For each product, you MUST find the ACTUAL product page URL (like https://www.amazon.com/dp/BXXXXXXXXX or the full product URL) and the REAL current price shown on that page
4. Search for each product individually to confirm its price and availability

CRITICAL: I need REAL direct URLs to actual product pages, NOT search page URLs. Each URL should go directly to the product's detail/buy page. The price must be the actual listed price on that page.

After searching, return ONLY valid JSON (no markdown, no backticks, no extra text):

{
  "products": [
    {
      "name": "Full Product Name",
      "price": 79.99,
      "rating": 4.5,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1"],
      "summary": "Why this is a good pick.",
      "badge": "Best Overall",
      "directUrl": "https://www.amazon.com/actual-product-page/dp/BXXXXXXXXX",
      "source": "Amazon",
      "searchQuery": "product name for backup search"
    }
  ],
  "shoppingTip": "A useful buying tip."
}

Badges: first = "Best Overall", second = "Best Value", third = "Budget Pick".
All prices MUST be real and between $${Number(minPrice).toFixed(2)} and $${Number(maxPrice).toFixed(2)}.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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

    const rawText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");

      const data = JSON.parse(jsonMatch[0]);

      const productsWithLinks = data.products.map((p: any) => {
        const q = encodeURIComponent(p.searchQuery || p.name);
        return {
          name: p.name,
          price: p.price,
          rating: p.rating,
          pros: p.pros,
          cons: p.cons,
          summary: p.summary,
          badge: p.badge,
          source: p.source,
          directUrl: p.directUrl,
          links: [
            ...(p.directUrl
              ? [{ name: `Buy on ${p.source || "Store"}`, url: p.directUrl, color: "#FF9900", primary: true }]
              : []),
            { name: "Amazon", url: `https://www.amazon.com/s?k=${q}`, color: "#FF9900", primary: false },
            { name: "Google", url: `https://www.google.com/search?tbm=shop&q=${q}`, color: "#4285F4", primary: false },
            { name: "Best Buy", url: `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`, color: "#0046BE", primary: false },
            { name: "Walmart", url: `https://www.walmart.com/search?q=${q}`, color: "#0071DC", primary: false },
            { name: "eBay", url: `https://www.ebay.com/sch/i.html?_nkw=${q}`, color: "#E53238", primary: false },
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