import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface SchemeCardProps {
  id: string;
  name: string;
  name_hi: string;
  ministry?: string;
  provider?: string;
  benefit?: string;
  amount_per_year?: number;
  description: string;
  description_hi: string;
  eligibility: { education_levels: string[]; categories: string[]; max_income?: number };
  deadline?: string;
  last_date?: string;
  type?: string;
  tags?: string[];
  is_popular?: boolean;
  variant?: "scheme" | "scholarship";
  official_website?: string;
}

export default function SchemeCard(props: SchemeCardProps) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const dl = props.deadline || props.last_date || "";
  const name = lang === "hi" ? props.name_hi : props.name;
  const desc = lang === "hi" ? props.description_hi : props.description;
  const itemType = props.variant || "scheme";

  return (
    <div className="group relative rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {props.is_popular && <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px]">Popular</Badge>}
      <h3 className="font-semibold text-sm leading-tight mb-1">{name}</h3>
      <p className="text-xs text-muted-foreground mb-2">{props.ministry || props.provider}</p>
      {(props.benefit || props.amount_per_year) && (
        <p className="text-sm font-bold text-success mb-2">{props.benefit || `₹${props.amount_per_year?.toLocaleString("en-IN")}/year`}</p>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{desc}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {props.eligibility.categories.slice(0, 3).map(c => <Badge key={c} variant="outline" className="text-[10px] py-0">{c}</Badge>)}
        {props.eligibility.education_levels.slice(0, 2).map(e => <Badge key={e} variant="secondary" className="text-[10px] py-0">{e}</Badge>)}
      </div>
      {dl && <div className="mb-3"><DeadlineCountdown deadline={dl} /></div>}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/apply/${props.id}?type=${itemType}`)}
          className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          {t("applyWithAI")} ✨
        </button>
        {props.official_website && (
          <a href={props.official_website} target="_blank" rel="noopener noreferrer" className="rounded-md border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors min-h-[44px] flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> {lang === "hi" ? "वेबसाइट" : "Website"}
          </a>
        )}
      </div>
    </div>
  );
}
