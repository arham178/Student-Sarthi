import { Home, Search, FileText, ClipboardList, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const items = [
  { icon: Home, labelEn: "Home", labelHi: "होम", path: "/" },
  { icon: Search, labelEn: "Schemes", labelHi: "योजनाएं", path: "/schemes" },
  { icon: FileText, labelEn: "AI Chat", labelHi: "AI चैट", path: "/ai-assistant" },
  { icon: ClipboardList, labelEn: "Applied", labelHi: "आवेदन", path: "/applications" },
  { icon: Bookmark, labelEn: "Filler", labelHi: "फिलर", path: "/bookmarklet" },
];

export default function BottomNav() {
  const { lang } = useLanguage();
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex justify-around py-1.5">
        {items.map(item => {
          const active = pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors", active ? "text-primary font-semibold" : "text-muted-foreground")}>
              <item.icon className={cn("h-5 w-5", active && "text-primary")} />
              {lang === "hi" ? item.labelHi : item.labelEn}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
