import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// VERIFIED CATALOG CONTEXT INJECTED INTO LAURIE'S KNOWLEDGE BASE
// ============================================================================
const VERIFIED_CATALOG = `
- "TypeScript Systems Architecture & Microservices" by Alex Chen (Staff Infrastructure Engineer). Format: Video (45 min). Rate: ₦6.50/min. Lifetime cap: ₦500. Topics: RPC boundaries, type-safe schemas, Interledger streaming channels.
- "Human-Centered Design for Emerging Markets" by Amara Okafor (Lead Product Strategist). Format: Ebook (120 pages). Rate: ₦5.00/min. Lifetime cap: ₦200. Topics: Offline-first UX, zero-asset UI, 2G/3G data constraints, slow-reader guarantee (₦2.25/page cap).
- "Modern Standard Arabic for Pan-African Commerce" by Dr. Tariq Mansoor (Associate Professor of Linguistics). Format: Audio (60 min). Rate: ₦5.00/min. Lifetime cap: ₦350. Topics: Formal business dialects, trade contracts across North & West Africa.
- "Advanced Financial Modelling with Python" by Folake Adeyemi (Fintech Quant Lead). Format: Video (55 min). Rate: ₦8.00/min. Lifetime cap: ₦750. Topics: Monte Carlo simulations, treasury cashflow hedging, FX rate risk.
- "Mobile Money Infrastructure & USSD Architecture" by Kwame Osei (Principal Telco Architect). Format: Ebook (95 pages). Rate: ₦6.00/min. Lifetime cap: ₦500. Topics: SMPP gateways, telecom session timeouts, SIM toolkit protocols.
- "High-Performance Calculus & Linear Algebra" by Prof. Chidi Nwosu (Mathematics Department Chair). Format: Video (70 min). Rate: ₦6.50/min. Lifetime cap: ₦500. Topics: Calculus shortcuts, probability distributions, matrix factorizations.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages = [], 
      tone = "concise", 
      learnerName = "Learner", 
      currentCourseContext 
    } = body;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // ------------------------------------------------------------------------
    // 1. SYSTEM PROMPT & PERSONA INSTRUCTIONS
    // ------------------------------------------------------------------------
    const toneInstruction = tone === "concise"
      ? "Respond with high information density, brevity, and practical next steps. Keep responses under 3-4 sentences or short bullet points unless a detailed code breakdown is explicitly requested."
      : "Adopt an encouraging, thorough academic tutoring tone. Provide pedagogical analogies, contextual background, and step-by-step conceptual explanations.";

    const contextInstruction = currentCourseContext
      ? `The student is currently inside the lesson player for: "${currentCourseContext.title}" (Topic: ${currentCourseContext.topic || "Current Module"}). You act as their real-time conceptual tutor. Note that playback is paused at ₦0.00 while they converse with you.`
      : `The student is on the Learner Dashboard. You act as their curriculum advisor, helping them choose their next courses based on budget, career goals, and time.`;

    const systemPrompt = `You are Laurie, the AI course advisor and conceptual tutor on Rheodemy (an Interledger-powered pay-as-you-learn educational platform).

PERSONA & ETHOS:
- Name: Laurie
- Character: Calm, credible, helpful, deeply knowledgeable, and honest.
- You are clearly an AI assistant.
- Address the student by their name (${learnerName}) when appropriate.
- TONE STYLE: ${toneInstruction}

RHEODEMY PLATFORM TRUTHS:
- Learners stream payments per second only while actively watching, reading, or listening.
- ₦0.00 while paused, buffering, or reading at a slow contemplative pace.
- Rent-to-own: Every second spent counts toward the course's lifetime unlock cap. Once the cap is reached, the course is 100% permanently owned with free lifetime rewatch.
- Transparent Revenue Split: 80% directly to the Creator, 15% Platform infrastructure, 5% Regional Bursary Fund for underrepresented students.
- Currency: Nigerian Naira (₦) for domestic students, with global Interledger settlement.

SAFETY & GUARDRAILS:
- NEVER invent non-existent courses or prices. You only know the courses in your verified catalog below.
- You CANNOT initiate payments, debit wallets, change course prices, or issue refunds.
- Never use generic crypto hype, glowing cyber terms, or emojis as bullet points.

CURRENT CONTEXT:
${contextInstruction}

VERIFIED COURSE CATALOG:
${VERIFIED_CATALOG}
`;

    // ------------------------------------------------------------------------
    // 2. LIVE INFERENCE: GOOGLE GEMINI (Free at https://aistudio.google.com/app/apikey)
    // ------------------------------------------------------------------------
    if (geminiKey) {
      try {
        const model = process.env.LAURIE_MODEL && process.env.LAURIE_MODEL.startsWith("gemini")
          ? process.env.LAURIE_MODEL
          : "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        
        const contents = messages.map((m: { sender: string; text: string }) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }));

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              maxOutputTokens: 600,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to formulate a response.";
          return NextResponse.json({ reply: replyText, provider: "gemini" });
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          return NextResponse.json({
            reply: `⚠️ Google Gemini Notice: ${errMsg}`,
            provider: "gemini-error"
          });
        }
      } catch (err: unknown) {
        console.warn("Gemini network error:", err);
      }
    }

    // ------------------------------------------------------------------------
    // 3. LIVE INFERENCE: ANTHROPIC CLAUDE (If ANTHROPIC_API_KEY is present)
    // ------------------------------------------------------------------------
    if (anthropicKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: process.env.LAURIE_MODEL || "claude-3-5-sonnet-20241022",
            max_tokens: 600,
            system: systemPrompt,
            messages: messages.map((m: { sender: string; text: string }) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.content?.[0]?.text || "I was unable to formulate a response.";
          return NextResponse.json({ reply: replyText, provider: "anthropic" });
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          return NextResponse.json({
            reply: `⚠️ Anthropic Notice: ${errMsg}`,
            provider: "anthropic-error"
          });
        }
      } catch (err: unknown) {
        console.warn("Anthropic network error:", err);
      }
    }

    // ------------------------------------------------------------------------
    // 3. LIVE INFERENCE: OPENAI CHATGPT (If OPENAI_API_KEY is present)
    // ------------------------------------------------------------------------
    if (openaiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: process.env.LAURIE_MODEL || "gpt-4o-mini",
            max_tokens: 600,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: { sender: string; text: string }) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text
              }))
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.choices?.[0]?.message?.content || "I was unable to formulate a response.";
          return NextResponse.json({ reply: replyText, provider: "openai" });
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          return NextResponse.json({
            reply: `⚠️ OpenAI Notice: ${errMsg}`,
            provider: "openai-error"
          });
        }
      } catch (err: unknown) {
        console.warn("OpenAI network error:", err);
      }
    }

    // ------------------------------------------------------------------------
    // 4. SMART DEMO SIMULATOR FALLBACK (When no API keys are configured)
    // ------------------------------------------------------------------------
    const latestUserMsg = [...messages].reverse().find((m: { sender: string }) => m.sender === "user")?.text || "";
    const lower = latestUserMsg.toLowerCase().trim();
    let simulated = "";

    if (!lower || lower.length < 3 || /^[^a-zA-Z0-9]+$/.test(lower) || /^[b-df-hj-np-tv-z]{4,}$/.test(lower)) {
      simulated = "I didn't quite catch that. Could you ask me about a specific topic, skill track, or course pricing? For example: 'Which courses are under ₦500?' or 'Tell me about Alex Chen's TypeScript course.'";
    } else if (lower.includes("budget") || lower.includes("price") || lower.includes("cap") || lower.includes("tier") || lower.includes("cost") || lower.includes("money")) {
      simulated = tone === "concise"
        ? "Courses on Rheodemy follow three platform tiers: Tier 1 Primers cap at ₦200, Tier 2 Core at ₦500, and Tier 3 Masterclasses at ₦1,000. Every second you stream pays the creator, and you never pay while paused."
        : `Rheodemy uses a rent-to-own tiered framework: instead of monthly subscriptions, you stream micro-kobo per second. Once your cumulative payments reach the course cap (₦200 for Primers, ₦500 for Core, ₦1,000 for Masterclasses), you automatically receive permanent lifetime access.`;
    } else if (lower.includes("typescript") || lower.includes("code") || lower.includes("tech") || lower.includes("software") || lower.includes("backend")) {
      simulated = tone === "concise"
        ? "For backend architecture, Alex Chen's 'TypeScript Systems Architecture' (₦6.50/min, ₦500 cap) covers type-safe RPC boundaries and zero-downtime schemas."
        : "Building distributed systems in high-latency environments demands strong type boundaries. Alex Chen's TypeScript Architecture course teaches you how to construct type-safe microservices with automated Interledger channel settlements.";
    } else if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("product")) {
      simulated = tone === "concise"
        ? "Check out Amara Okafor's 'Human-Centered Design for Emerging Markets' (₦5.00/min, ₦200 cap). It covers low-bandwidth UX and offline caching."
        : "Amara Okafor's course on Human-Centered Design teaches practical UX principles for emerging markets, focusing on zero-asset typography, 2G/3G constraints, and empathetic product workflows.";
    } else if (currentCourseContext) {
      simulated = `Focusing on "${currentCourseContext.title}": this module emphasizes minimizing data footprint and caching ledger states locally. Because playback is paused while we discuss this, your consultation costs ₦0.00.`;
    } else {
      simulated = tone === "concise"
        ? "I recommend either our Tech track (TypeScript Architecture) or Creative track (Human-Centered UX). Both feature ₦0 pause streaming and verified instructor credentials."
        : "To develop well-rounded product expertise for emerging markets, I recommend pairing Alex Chen's Systems Architecture course with Amara Okafor's Human-Centered Design. Both courses have generous caps and offline-first reading patterns.";
    }

    return NextResponse.json({
      reply: simulated,
      provider: "demo-simulator",
      notice: "Add ANTHROPIC_API_KEY or OPENAI_API_KEY to your .env.local file to enable live Claude/ChatGPT inference."
    });

  } catch (error) {
    console.error("Laurie API handler error:", error);
    return NextResponse.json(
      { error: "Internal server error handling Laurie request" },
      { status: 500 }
    );
  }
}
