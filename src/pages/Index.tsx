import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Search, GraduationCap, Calendar, Sparkles, ClipboardList, User, ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { schemes, scholarships, exams } from "@/data/mockData";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import AppLayout from "@/components/layout/AppLayout";

const featureCards = [
  { titleEn: "Schemes Finder", titleHi: "योजना खोजक", descEn: "Find all government schemes you qualify for", descHi: "सभी सरकारी योजनाएं जिनके लिए आप पात्र हैं", icon: Search, color: "border-l-primary", route: "/schemes" },
  { titleEn: "Scholarship Hub", titleHi: "छात्रवृत्ति केंद्र", descEn: "Scholarships for your education level & category", descHi: "आपके शिक्षा स्तर और वर्ग के लिए छात्रवृत्तियां", icon: GraduationCap, color: "border-l-secondary", route: "/scholarships" },
  { titleEn: "Exam Calendar", titleHi: "परीक्षा कैलेंडर", descEn: "Never miss an exam deadline again", descHi: "कभी भी परीक्षा की तारीख न छूटे", icon: Calendar, color: "border-l-success", route: "/exams" },
  { titleEn: "Sarthi AI Chat", titleHi: "सारथी AI चैट", descEn: "Career guidance, study plans & form help powered by AI", descHi: "AI से करियर गाइडेंस, स्टडी प्लान और फॉर्म हेल्प", icon: Sparkles, color: "border-l-gold", route: "/ai-assistant", highlight: true },
  { titleEn: "My Applications", titleHi: "मेरे आवेदन", descEn: "Track all your applications in one place", descHi: "अपने सभी आवेदनों को एक जगह ट्रैक करें", icon: ClipboardList, color: "border-l-accent", route: "/applications" },
  { titleEn: "Browser Auto-Fill", titleHi: "ब्राउज़र ऑटो-फिल", descEn: "Fill any government form automatically using our smart bookmarklet", descHi: "हमारे स्मार्ट बुकमार्कलेट से किसी भी सरकारी फॉर्म को ऑटो-फिल करें", icon: Bookmark, color: "border-l-secondary", route: "/bookmarklet", badge: "New ✨" },
];

const steps = [
  { numEn: "1", titleEn: "Complete Profile", titleHi: "प्रोफ़ाइल पूरा करें", descEn: "Complete your profile in 2 minutes", descHi: "2 मिनट में प्रोफ़ाइल भरें" },
  { numEn: "2", titleEn: "AI Finds Schemes", titleHi: "AI योजनाएं खोजे", descEn: "AI finds schemes & exams you qualify for", descHi: "AI आपके लिए योजनाएं और परीक्षाएं खोजे" },
  { numEn: "3", titleEn: "Apply Easily", titleHi: "आसानी से आवेदन करें", descEn: "Upload documents → AI fills forms → You submit", descHi: "दस्तावेज़ अपलोड → AI फॉर्म भरे → आप जमा करें" },
];

export default function HomePage() {
  const { lang, t } = useLanguage();

  const allDeadlines = [
    ...schemes.map(s => ({ name: lang === "hi" ? s.name_hi : s.name, deadline: s.deadline, type: "Scheme" })),
    ...scholarships.map(s => ({ name: lang === "hi" ? s.name_hi : s.name, deadline: s.last_date, type: "Scholarship" })),
    ...exams.map(e => ({ name: lang === "hi" ? e.name_hi : e.name, deadline: e.important_dates.form_end, type: "Exam" })),
  ].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 4);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-16 px-4 md:py-24">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            {lang === "hi" ? "अपना भविष्य खुद बनाओ" : "Build Your Own Future"}
          </h1>
          <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl mx-auto">{t("subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 font-semibold min-h-[48px] w-full sm:w-auto">{t("getStarted")}</Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 min-h-[48px] w-full sm:w-auto">
                <Sparkles className="h-4 w-4 mr-2" /> {lang === "hi" ? "सारथी AI से बात करें" : "Talk to Sarthi AI"}
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs opacity-80">
            <span>50,000+ Students Helped</span><span>·</span><span>200+ Schemes</span><span>·</span><span>100% Free</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {featureCards.map(card => (
            <Link key={card.route} to={card.route} className={`group relative rounded-lg border-l-4 ${card.color} bg-card p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${card.highlight ? "md:col-span-1 ring-2 ring-gold/50 col-span-2" : ""}`}>
              {card.highlight && <span className="absolute -top-2 right-3 bg-gradient-ai text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">AI Powered ✨</span>}
              {(card as any).badge && <span className="absolute -top-2 right-3 bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{(card as any).badge}</span>}
              <card.icon className="h-7 w-7 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">{lang === "hi" ? card.titleHi : card.titleEn}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{lang === "hi" ? card.descHi : card.descEn}</p>
              <span className="text-xs font-medium text-primary flex items-center gap-1">
                {lang === "hi" ? "जानें" : "Explore"} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container py-12">
        <h2 className="text-xl font-bold text-center mb-8">{t("howItWorks")}</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {steps.map(step => (
            <div key={step.numEn} className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg mb-3">{step.numEn}</div>
              <h3 className="font-semibold mb-1">{lang === "hi" ? step.titleHi : step.titleEn}</h3>
              <p className="text-xs text-muted-foreground">{lang === "hi" ? step.descHi : step.descEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deadlines */}
      <section className="container pb-12">
        <h2 className="text-lg font-bold mb-4">{lang === "hi" ? "आगामी अंतिम तिथियां" : "Upcoming Deadlines"}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {allDeadlines.map(item => (
            <div key={item.name} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <span className="text-[10px] text-muted-foreground">{item.type}</span>
              </div>
              <DeadlineCountdown deadline={item.deadline} />
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
