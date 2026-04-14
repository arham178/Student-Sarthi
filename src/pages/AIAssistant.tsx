import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Bot, User, Lightbulb, BookOpen, FileText, Briefcase } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sarthi-chat`;

const suggestionsEn = [
  { icon: Briefcase, text: "Best career for me", prompt: "I'm a 12th pass student from UP, category OBC. What are the best career options for me?" },
  { icon: BookOpen, text: "Study roadmap for UPSC", prompt: "Create a detailed 12-month study roadmap for UPSC CSE preparation" },
  { icon: FileText, text: "How to apply for SSC?", prompt: "Explain step-by-step how to apply for SSC CGL exam. What documents do I need?" },
  { icon: Lightbulb, text: "Scholarships for SC students", prompt: "What scholarships are available for SC category students doing graduation?" },
];

const suggestionsHi = [
  { icon: Briefcase, text: "मेरे लिए बेस्ट करियर", prompt: "मैं UP से 12वीं पास छात्र हूं, OBC कैटेगरी। मेरे लिए बेस्ट करियर क्या हैं?" },
  { icon: BookOpen, text: "UPSC की तैयारी कैसे करें", prompt: "UPSC CSE की तैयारी के लिए 12 महीने का स्टडी प्लान बनाओ" },
  { icon: FileText, text: "SSC कैसे अप्लाई करें", prompt: "SSC CGL परीक्षा के लिए स्टेप-बाय-स्टेप कैसे अप्लाई करें? कौन से डॉक्यूमेंट चाहिए?" },
  { icon: Lightbulb, text: "SC छात्रों के लिए छात्रवृत्ति", prompt: "SC कैटेगरी के ग्रैजुएशन छात्रों के लिए कौन-कौन सी छात्रवृत्तियां हैं?" },
];

async function streamChat(messages: Msg[], onDelta: (t: string) => void, onDone: () => void) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  if (!resp.body) throw new Error("No stream body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial */ }
    }
  }
  onDone();
}

export default function AIAssistantPage() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = lang === "hi" ? suggestionsHi : suggestionsEn;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      await streamChat(updated, (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      }, () => setIsLoading(false));
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ ${e.message}` }]);
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem-3.5rem)] md:h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="border-b bg-gradient-ai px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <h1 className="font-bold text-primary-foreground text-lg">
              {lang === "hi" ? "सारथी AI" : "Sarthi AI"}
            </h1>
            <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px] border-0">
              {lang === "hi" ? "AI संचालित ✨" : "AI Powered ✨"}
            </Badge>
          </div>
          <p className="text-xs text-primary-foreground/80 mt-0.5">
            {lang === "hi" ? "करियर गाइडेंस • स्टडी प्लान • स्कीम हेल्प • फॉर्म भरने की गाइड" : "Career Guidance • Study Plans • Scheme Help • Form Filling Guide"}
          </p>
        </div>

        {/* Chat body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-ai flex items-center justify-center mx-auto mb-3">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold mb-1">
                  {lang === "hi" ? "नमस्ते! मैं सारथी हूं 🙏" : "Hello! I'm Sarthi 🙏"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {lang === "hi" ? "मैं आपकी करियर, परीक्षा, छात्रवृत्ति और फॉर्म भरने में मदद कर सकता हूं" : "I can help with career guidance, exam prep, scholarships, and form filling"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.prompt)}
                    className="flex items-center gap-2 rounded-lg border bg-card p-3 text-left hover:bg-muted transition-colors text-sm"
                  >
                    <s.icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-gradient-ai flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-ai flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-card p-3">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder={lang === "hi" ? "अपना सवाल पूछें..." : "Ask me anything..."}
              className="flex-1"
              disabled={isLoading}
            />
            <Button size="icon" onClick={() => send(input)} disabled={isLoading || !input.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
