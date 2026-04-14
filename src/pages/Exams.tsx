import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { exams } from "@/data/mockData";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import { Calendar, Users, ExternalLink, Bell } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const examCategories = ["All", "SSC", "Police", "Banking", "Railway", "Teaching", "Defence", "ITI"];

export default function ExamsPage() {
  const { lang, t } = useLanguage();
  const [selCat, setSelCat] = useState("All");

  const filtered = useMemo(() => {
    if (selCat === "All") return exams;
    return exams.filter(e => e.category === selCat);
  }, [selCat]);

  return (
    <AppLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-2">{t("examCalendar")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{lang === "hi" ? "आगामी परीक्षाएं और आवेदन तिथियां" : "Upcoming exams and application dates"}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {examCategories.map(c => (
            <Badge key={c} variant={selCat === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelCat(c)}>{c}</Badge>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(exam => (
            <div key={exam.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{lang === "hi" ? exam.name_hi : exam.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{exam.conducting_body}</p>
                  <p className="text-xs text-muted-foreground mb-3">{lang === "hi" ? exam.description_hi : exam.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs mb-3">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {exam.vacancies > 0 ? `${exam.vacancies.toLocaleString("en-IN")} vacancies` : "Eligibility Test"}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Exam: {format(new Date(exam.important_dates.exam_date), "dd MMM yyyy")}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                    <div><span className="text-muted-foreground">Notification:</span><br />{format(new Date(exam.important_dates.notification), "dd MMM yy")}</div>
                    <div><span className="text-muted-foreground">Form Start:</span><br />{format(new Date(exam.important_dates.form_start), "dd MMM yy")}</div>
                    <div><span className="text-muted-foreground">Last Date:</span><br />{format(new Date(exam.important_dates.form_end), "dd MMM yy")}</div>
                    <div><span className="text-muted-foreground">Exam Date:</span><br />{format(new Date(exam.important_dates.exam_date), "dd MMM yy")}</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {exam.eligibility.education_levels.map(e => <Badge key={e} variant="secondary" className="text-[10px] py-0">{e}</Badge>)}
                    <Badge variant="outline" className="text-[10px] py-0">Age: {exam.eligibility.min_age}-{exam.eligibility.max_age}</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 sm:items-end">
                  <DeadlineCountdown deadline={exam.important_dates.form_end} />
                  <Link to={`/apply/${exam.id}?type=exam`} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 min-h-[44px]">
                    {t("applyWithAI")} ✨
                  </Link>
                  <a href={exam.official_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted min-h-[44px]">
                    <ExternalLink className="h-3 w-3" /> {lang === "hi" ? "वेबसाइट" : "Official Site"}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
