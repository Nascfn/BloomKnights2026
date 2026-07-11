import { GoogleGenAI } from '@google/genai';

// LOCKED prompt — encodes team product rules (licensing, chain, status,
// corporate-action traps). Change only with the whole team's sign-off.
const PROMPT = `You are the product-ownership engine for an app called WhoOwnsIt.
You are given a photo of a product. Identify the product and determine who ACTUALLY owns it.

RULES (follow exactly):
1. The owner is the company that owns the BRAND of the physical product — NOT a licensor.
   Example: a "LEGO Star Wars" set is owned by The LEGO Group; Star Wars is merely licensed
   from Disney. In that case ultimate_parent = "The LEGO Group" and licensing_note explains
   the Disney license. Apply this reasoning to all licensed merchandise.
2. Build the full ownership chain from the product's brand up to the ultimate parent.
   Example: Doritos -> Frito-Lay -> PepsiCo.
3. Classify the ultimate parent as exactly one status:
   - "US_PUBLIC": publicly traded with its primary listing on a US exchange (NYSE/NASDAQ).
     Provide the ticker of the primary US common stock (prefer the common/voting class,
     e.g. GOOGL over GOOG).
   - "FOREIGN": the ultimate parent is a non-US company — even if US ADRs exist, classify
     as FOREIGN and set ticker to null.
   - "PRIVATE": privately held. ticker null.
   - "UNIDENTIFIABLE": you cannot identify a branded product with reasonable confidence. Do NOT guess.
4. Before giving a ticker, sanity-check corporate actions: recent spinoffs, renames, mergers,
   splits, or going-private deals. (Example trap: Pringles belongs to Kellanova, ticker K —
   not "Kellogg's".) If the company was taken private, status is "PRIVATE".
5. "summary": 2-3 plain-English sentences about the owning company.
6. "confidence": 0.0-1.0.

Return ONLY valid JSON:
{ "status": "US_PUBLIC"|"FOREIGN"|"PRIVATE"|"UNIDENTIFIABLE", "product_name": string,
  "brand": string, "ownership_chain": [string], "ultimate_parent": string,
  "ticker": string|null, "exchange": string|null, "country": string,
  "licensing_note": string|null, "summary": string, "confidence": number }`;

let client;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Confidence gate: below 0.7 we refuse to guess.
export function applyConfidenceGate(parsed) {
  if (parsed.confidence < 0.7 && parsed.status !== 'UNIDENTIFIABLE') {
    parsed.status = 'UNIDENTIFIABLE';
  }
  return parsed;
}

export async function identifyOwner(buffer, mimeType) {
  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: buffer.toString('base64') } },
          { text: PROMPT },
        ],
      },
    ],
    config: { temperature: 0.2, responseMimeType: 'application/json' },
  });

  // Strip ``` fences defensively — responseMimeType should prevent them,
  // but a fenced reply must not crash the parse.
  const text = response.text
    .trim()
    .replace(/^```(?:json)?\s*/, '')
    .replace(/\s*```$/, '');

  return applyConfidenceGate(JSON.parse(text));
}
