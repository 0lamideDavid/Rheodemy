"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Send, 
  ShieldCheck, 
  ExternalLink, 
  SlidersHorizontal
} from "lucide-react";

export interface LaurieMessage {
  id: string;
  sender: "laurie" | "user";
  text: string;
  timestamp: string;
  recommendedCourses?: {
    id: string;
    title: string;
    instructor: string;
    medium: "video" | "ebook" | "audio";
    rate: string;
    cap: string;
  }[];
}

interface LaurieAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  learnerName?: string;
  currentCourseContext?: {
    id: string;
    title: string;
    topic?: string;
  };
}

export function LaurieAdvisor({
  isOpen,
  onClose,
  learnerName = "Learner",
  currentCourseContext
}: LaurieAdvisorProps) {
  const [tone, setTone] = useState<"concise" | "thorough">("concise");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<LaurieMessage[]>(() => [
    {
      id: "welcome-1",
      sender: "laurie",
      text: currentCourseContext
        ? `Hello ${learnerName}! I'm Laurie, your AI tutor for "${currentCourseContext.title}". Ask me any conceptual question about this lesson, or request a quick summary. Remember: I cannot spend money or alter your stream rate.`
        : `Hello ${learnerName}! I'm Laurie, your AI course advisor. I can help you plan your next study milestones, filter our catalog by learning budget, or explain platform mechanics. How can I help today?`,
      timestamp: "Just now",
      recommendedCourses: currentCourseContext
        ? undefined
        : [
            {
              id: "ts-arch",
              title: "TypeScript Systems Architecture",
              instructor: "Alex Chen",
              medium: "video",
              rate: "₦6.50/min",
              cap: "₦500 cap"
            },
            {
              id: "product-design",
              title: "Human-Centered Design for Emerging Markets",
              instructor: "Amara Okafor",
              medium: "ebook",
              rate: "₦5.00/min",
              cap: "₦200 cap"
            }
          ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: LaurieMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/laurie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          tone,
          learnerName,
          currentCourseContext
        })
      });

      if (!res.ok) throw new Error("API response error");
      const data = await res.json();

      // Recommend specific catalog cards based on query/reply
      const lower = query.toLowerCase();
      let recs: LaurieMessage["recommendedCourses"] = undefined;

      if (lower.includes("typescript") || lower.includes("backend") || lower.includes("tech")) {
        recs = [{
          id: "ts-arch",
          title: "TypeScript Systems Architecture & Microservices",
          instructor: "Alex Chen",
          medium: "video",
          rate: "₦6.50/min",
          cap: "₦500 cap"
        }];
      } else if (lower.includes("design") || lower.includes("product") || lower.includes("ux")) {
        recs = [{
          id: "product-design",
          title: "Human-Centered Design for Emerging Markets",
          instructor: "Amara Okafor",
          medium: "ebook",
          rate: "₦5.00/min",
          cap: "₦200 cap"
        }];
      } else if (lower.includes("budget") || lower.includes("price") || lower.includes("tier") || lower.includes("cap") || lower.includes("500") || lower.includes("200")) {
        recs = [
          {
            id: "product-design",
            title: "Human-Centered Design for Emerging Markets",
            instructor: "Amara Okafor",
            medium: "ebook",
            rate: "₦5.00/min",
            cap: "₦200 cap"
          },
          {
            id: "arabic-lang",
            title: "Modern Standard Arabic for Pan-African Commerce",
            instructor: "Dr. Tariq Mansoor",
            medium: "audio",
            rate: "₦5.00/min",
            cap: "₦350 cap"
          }
        ];
      }

      const botMsg: LaurieMessage = {
        id: "l-" + Date.now(),
        sender: "laurie",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendedCourses: recs
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Graceful fallback
      const fallbackMsg: LaurieMessage = {
        id: "l-" + Date.now(),
        sender: "laurie",
        text: tone === "concise"
          ? "I recommend exploring either our Tech track (TypeScript Architecture) or Creative track (Human-Centered UX). Both offer ₦0 pause streaming with low caps."
          : "Based on platform learning pathways, pairing Systems Architecture with Human-Centered UX gives you end-to-end product delivery skills. Both instructors have verified credentials on our ledger.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-paper h-full shadow-2xl flex flex-col border-l border-rule animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
        aria-labelledby="laurie-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-rule bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="laurie-title" className="font-serif font-bold text-base text-ink">
                  Laurie
                </h3>
                <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 bg-forest/10 text-forest rounded font-medium border border-forest/20">
                  AI Advisor
                </span>
                <span className="text-[10px] font-mono text-muted">
                  Demo Catalog
                </span>
              </div>
              <p className="text-xs text-muted">
                Curriculum planning & lesson tutor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tone Toggle */}
            <button
              type="button"
              onClick={() => setTone((prev) => (prev === "concise" ? "thorough" : "concise"))}
              className="text-xs px-2 py-1 border border-rule rounded bg-paper hover:bg-forest/5 text-muted hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
              title="Switch response style"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="capitalize">{tone}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted hover:text-ink rounded hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close advisor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Money Guardrail Banner */}
        <div className="bg-forest/5 px-4 py-2 border-b border-forest/15 flex items-start gap-2 text-xs text-forest">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-forest" />
          <span>
            <strong>AI Guardrail:</strong> Laurie can only recommend catalog courses. Laurie cannot initiate payments, access wallet funds, or change course prices.
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[8px] p-3.5 ${
                  msg.sender === "user"
                    ? "bg-forest text-white"
                    : "bg-white border border-rule text-ink shadow-xs"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Inline Recommended Course Cards */}
                {msg.recommendedCourses && msg.recommendedCourses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rule/60 space-y-2">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                      Recommended in Catalog:
                    </p>
                    {msg.recommendedCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-paper rounded border border-rule flex items-center justify-between gap-2 hover:border-forest/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-xs text-ink truncate">
                            {c.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                            <span>{c.instructor}</span>
                            <span>•</span>
                            <span className="font-mono text-forest font-medium">{c.cap}</span>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/learner/course/${c.id}`}
                          onClick={onClose}
                          className="shrink-0 p-1.5 bg-forest text-white rounded hover:bg-forest/90 transition-colors cursor-pointer"
                          title="Open course"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted mt-1 px-1">
                {msg.sender === "laurie" ? "Laurie" : "You"} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start animate-in fade-in duration-150">
              <div className="bg-white border border-rule rounded-[8px] px-3.5 py-2.5 text-xs text-muted flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                <span>Laurie is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-rule bg-white flex gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => handleSend("What should I learn next based on my progress?")}
            className="px-2.5 py-1 bg-paper hover:bg-forest/10 hover:text-forest border border-rule rounded-full whitespace-nowrap text-muted transition-colors cursor-pointer"
          >
            What to learn next?
          </button>
          <button
            type="button"
            onClick={() => handleSend("Show me courses under ₦500 cap")}
            className="px-2.5 py-1 bg-paper hover:bg-forest/10 hover:text-forest border border-rule rounded-full whitespace-nowrap text-muted transition-colors cursor-pointer"
          >
            Courses under ₦500
          </button>
          <button
            type="button"
            onClick={() => handleSend("How does the ₦0 pause policy work?")}
            className="px-2.5 py-1 bg-paper hover:bg-forest/10 hover:text-forest border border-rule rounded-full whitespace-nowrap text-muted transition-colors cursor-pointer"
          >
            ₦0 pause policy
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-rule">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Laurie about courses, topics, or pricing..."
              className="flex-1 bg-paper border border-rule rounded-[6px] px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-hidden focus:border-forest"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-forest text-white rounded-[6px] hover:bg-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
