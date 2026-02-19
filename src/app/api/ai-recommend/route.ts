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

    const prompt = `You are a smart shopping advisor. The user is looking for product recommendations.

## Request
- Product: ${product.trim()}
- Budget: $${Number(minPrice).toFixed(2)} - $${Number(maxPrice).toFixed(2)}

Please recommend exactly 3 products. CRITICAL: Every product's price MUST be between $${Number(minPrice).toFixed(2)} and $${Number(maxPrice).toFixed(2)}. Do NOT recommend any product below $${Number(minPrice).toFixed(2)} or above $${Number(maxPrice).toFixed(2)}. Return ONLY valid JSON with no other text, no markdown backticks. Use this exact format:
{
  "products": [
    {
      "name": "Brand Model Name",
      "price": 79.99,
      "rating": 4.5,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1"],
      "summary": "One sentence summary of why this is a good pick.",
      "badge": "Best Value",
      "searchQuery": "exact product name to search on amazon"
    }
  ],
  "shoppingTip": "A brief, useful tip for buying this type of product."
}

Use real product names, realistic prices within the budget, and realistic ratings (out of 5). The searchQuery should be the exact product name optimized for Amazon search. The first product badge should be "Best Overall", the second "Best Value", and the third "Budget Pick".`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleaned);

      const productsWithLinks = data.products.map((p: any) => {
        const q = encodeURIComponent(p.searchQuery);
        return {
          ...p,
          links: [
            { name: "Amazon", url: `https://www.amazon.com/s?k=${q}`, color: "#FF9900", icon: "amazon" },
            { name: "Google Shopping", url: `https://www.google.com/search?tbm=shop&q=${q}`, color: "#4285F4", icon: "google" },
            { name: "Best Buy", url: `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`, color: "#0046BE", icon: "bestbuy" },
            { name: "Walmart", url: `https://www.walmart.com/search?q=${q}`, color: "#0071DC", icon: "walmart" },
            { name: "eBay", url: `https://www.ebay.com/sch/i.html?_nkw=${q}`, color: "#E53238", icon: "ebay" },
            { name: "Newegg", url: `https://www.newegg.com/p/pl?d=${q}`, color: "#F7821B", icon: "newegg" },
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