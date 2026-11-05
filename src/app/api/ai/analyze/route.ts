import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { estimatePrice } from "@/lib/pricing";
import type { Category, Condition } from "@/lib/types";

interface Body {
  image?: string; // base64 JPEG, no data: prefix
  category?: Category;
  condition?: Condition;
  ageYears?: number;
  originalPrice?: number;
  comparables?: number[];
}

export interface AnalyzeResult {
  source: "claude" | "estimate";
  identified: null | {
    is_furniture: boolean;
    category: Category;
    condition: Condition;
    title: string;
    description: string;
  };
  price: { low: number; high: number; suggested: number; basis: string };
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["is_furniture", "category", "condition", "title", "description", "price_low", "price_high", "suggested_price", "reasoning"],
  properties: {
    is_furniture: { type: "boolean" },
    category: { type: "string", enum: CATEGORIES.map((c) => c.value) },
    condition: { type: "string", enum: CONDITIONS.map((c) => c.value) },
    title: { type: "string", description: "Listing title, under 60 characters, e.g. 'Three-seater teak sofa'" },
    description: { type: "string", description: "Two or three plain sentences a seller would write: material, size, visible wear." },
    price_low: { type: "integer" },
    price_high: { type: "integer" },
    suggested_price: { type: "integer" },
    reasoning: { type: "string", description: "One sentence on what the price is based on." },
  },
};

const SYSTEM = `You help people in Kerala, India list second-hand furniture for sale.
Look at the photo, identify the piece and judge its visible condition. Suggest a fair resale price in Indian rupees
for the local second-hand market (OLX / Facebook Marketplace level, not showroom prices).
If the photo does not show furniture, set is_furniture to false and still fill the other fields with your best guess.
Use the seller's own details when given; they override what you see.`;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fallback = (): AnalyzeResult => ({
    source: "estimate",
    identified: null,
    price: estimatePrice({
      category: body.category ?? "other",
      condition: body.condition ?? "good",
      ageYears: body.ageYears,
      originalPrice: body.originalPrice,
      comparables: body.comparables,
    }),
  });

  if (!process.env.ANTHROPIC_API_KEY || !body.image) return NextResponse.json(fallback());
  if (body.image.length > 4_000_000) return NextResponse.json({ error: "Image too large" }, { status: 413 });

  const details = [
    body.category && `Seller says category: ${body.category}`,
    body.condition && `Seller says condition: ${body.condition}`,
    body.ageYears != null && `Age: about ${body.ageYears} years`,
    body.originalPrice && `Original price paid: ₹${body.originalPrice}`,
    body.comparables?.length && `Similar listings on FurniCycle are priced at: ${body.comparables.slice(0, 20).map((p) => `₹${p}`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic();
    const params = {
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: body.image } },
            { type: "text", text: details || "Identify this item and suggest a price." },
          ],
        },
      ],
    };
    // `fallbacks: "default"` is newer than some SDK typings, so the params are passed untyped.
    const msg = (await client.beta.messages.create(params as never)) as Anthropic.Beta.BetaMessage;

    if (msg.stop_reason === "refusal") return NextResponse.json(fallback());
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return NextResponse.json(fallback());
    const out = JSON.parse(text.text);

    const result: AnalyzeResult = {
      source: "claude",
      identified: {
        is_furniture: out.is_furniture,
        category: out.category,
        condition: out.condition,
        title: out.title,
        description: out.description,
      },
      price: {
        low: Math.round(out.price_low / 100) * 100,
        high: Math.round(out.price_high / 100) * 100,
        suggested: Math.round(out.suggested_price / 100) * 100,
        basis: out.reasoning,
      },
    };
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error("AI analyze failed", err.status, err.message);
    else console.error("AI analyze failed", err);
    return NextResponse.json(fallback());
  }
}
