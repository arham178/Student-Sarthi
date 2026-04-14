import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scholarships } from "@/data/mockData";
import SchemeCard from "@/components/SchemeCard";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const educationLevels = ["10th", "11th", "12th", "BA", "BSc", "BCom", "ITI", "Diploma"];
const categories = ["General", "OBC", "SC", "ST", "EWS"];

export default function ScholarshipsPage() {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selEdu, setSelEdu] = useState<string[]>([]);
  const [selCat, setSelCat] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return scholarships.filter(s => {
      const name = lang === "hi" ? s.name_hi : s.name;
      if (search && !name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selEdu.length && !selEdu.some(e => s.eligibility.education_levels.includes(e))) return false;
      if (selCat.length && !selCat.some(c => s.eligibility.categories.includes(c))) return false;
      return true;
    });
  }, [search, selEdu, selCat, lang]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="rounded-lg bg-gradient-hero p-4 text-primary-foreground mb-6">
          <h1 className="text-xl font-bold">{t("scholarshipHub")}</h1>
          <p className="text-xs opacity-90">{lang === "hi" ? "छात्रवृत्ति कैलेंडर — आवेदन करने से पहले न चूकें!" : "Scholarship Calendar — Apply before you miss!"}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("search")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium md:hidden">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-6">
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-4 mb-4`}>
            <div>
              <p className="text-xs font-semibold mb-2">{t("education")}</p>
              <div className="flex flex-wrap gap-1">
                {educationLevels.map(e => <Badge key={e} variant={selEdu.includes(e) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleFilter(selEdu, e, setSelEdu)}>{e}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">{t("category")}</p>
              <div className="flex flex-wrap gap-1">
                {categories.map(c => <Badge key={c} variant={selCat.includes(c) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleFilter(selCat, c, setSelCat)}>{c}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-3">{lang === "hi" ? `${filtered.length} छात्रवृत्तियां` : `Showing ${filtered.length} of ${scholarships.length} scholarships`}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(s => <SchemeCard key={s.id} {...s} variant="scholarship" deadline={s.last_date} official_website={s.official_website} />)}
            </div>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No scholarships found</p>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
