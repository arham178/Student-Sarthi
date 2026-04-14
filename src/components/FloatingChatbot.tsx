import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Minus, Send, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sarthi-chat`;

const suggestions = [
  { text: "How to fill SSC CGL form? 📝", prompt: "How to fill SSC CGL form step by step?" },
  { text: "Which career suits me? 🎯", prompt: "I am a 12th pass student from a rural area, OBC category. Which career options are best for me?" },
  { text: "UPSC roadmap for beginners 🗺️", prompt: "Create a detailed UPSC preparation roadmap for complete beginners" },
  { text: "Scholarship for OBC students 💰", prompt: "What scholarships are available for OBC students in India?" },
  { text: "UP Police form kaise bharen? 🚔", prompt: "UP Police constable form kaise bharen? Step by step batao Hindi mein" },
  { text: "Documents for NSP scholarship 📄", prompt: "What documents are required for NSP scholarship application?" },
];

const langOptions = [
  { key: "en", label: "EN" },
  { key: "hi", label: "हिंदी" },
  { key: "hinglish", label: "Hinglish" },
] as const;

type ChatLang = "en" | "hi" | "hinglish";

async function streamChat(messages: Msg[], chatLang: ChatLang, onDelta: (t: string) => void, onDone: () => void) {
  const langSuffix = chatLang === "hi"
    ? "\n\nसभी जवाब हिंदी में दें।"
    : chatLang === "hinglish"
      ? "\n\nRespond in Hinglish (mix of Hindi and English, casual tone)."
      : "\n\nRespond in English only.";

  const enrichedMessages = messages.map((m, i) =>
    i === messages.length - 1 && m.role === "user"
      ? { ...m, content: m.content + langSuffix }
      : m
  );

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: enrichedMessages }),
  });

  if (!resp.ok) {
    throw new Error("Sathi AI is taking a break. Please try again! 🙏");
  }
  if (!resp.body) throw new Error("No stream");

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
      } catch {}
    }
  }
  onDone();
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLang, setChatLang] = useState<ChatLang>("en");
  const scrollRef = useRef<HTMLDivElement>(null);

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
      await streamChat(updated, chatLang, (chunk) => {
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

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-[1000]">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full animate-ping-slow opacity-40" style={{ background: "linear-gradient(135deg, hsl(18 100% 60%), hsl(270 60% 55%))" }} />
          <button
            onClick={() => setOpen(true)}
            className="relative h-[60px] w-[60px] rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: "linear-gradient(135deg, #FF6B35, #7C3AED)" }}
            title="Sarthi AI — Career Guide"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </button>
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[1000]">
        <button
          onClick={() => setMinimized(false)}
          className="h-[60px] w-[60px] rounded-full shadow-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FF6B35, #7C3AED)" }}
        >
          <Sparkles className="h-7 w-7 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed z-[1000] bottom-0 right-0 sm:bottom-20 sm:right-4 w-full sm:w-[380px] h-[85vh] sm:h-[600px] flex flex-col bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden">
      {/* Header */}
      <div className="p-3 text-white" style={{ background: "linear-gradient(135deg, #FF6B35, #7C3AED)" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span className="font-bold text-sm">🎓 Sarthi AI</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMinimized(true)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/20 text-sm">—</button>
            <button onClick={() => setOpen(false)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/20"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <p className="text-[10px] opacity-80">Career & Form Guide</p>
        <div className="flex gap-1 mt-2">
          {langOptions.map(l => (
            <button
              key={l.key}
              onClick={() => setChatLang(l.key)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${chatLang === l.key ? "bg-white text-primary" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div>
            <div className="text-center mb-4 mt-2">
              <p className="text-sm font-semibold">Namaste! I'm Sarthi 🙏</p>
              <p className="text-xs text-muted-foreground">How can I help you today?</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.prompt)}
                  className="rounded-full border bg-card px-3 py-1.5 text-[11px] hover:bg-muted transition-colors text-left"
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #FF6B35, #7C3AED)" }}>
                <GraduationCap className="h-3 w-3 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap ${
              msg.role === "user"
                ? "rounded-br-md text-white" : "bg-muted rounded-bl-md"
            }`} style={msg.role === "user" ? { background: "hsl(18 100% 60%)" } : undefined}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #FF6B35, #7C3AED)" }}>
              <GraduationCap className="h-3 w-3 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask me anything..."
            className="flex-1 text-xs h-9"
            disabled={isLoading}
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => send(input)} disabled={isLoading || !input.trim()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
