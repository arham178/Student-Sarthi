import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { schemes, scholarships, exams, documentRequirements } from "@/data/mockData";
import {
  CheckCircle2, XCircle, Upload, FileText, ArrowLeft, ExternalLink,
  Loader2, GraduationCap, Lightbulb, User, Bookmark
} from "lucide-react";

type ItemData = {
  id: string; name: string; name_hi: string; description: string; description_hi: string;
  ministry?: string; provider?: string; conducting_body?: string;
  benefit?: string; amount_per_year?: number; apply_link?: string;
  official_website?: string;
};

function findItem(id: string): { item: ItemData | null; type: string } {
  const s = schemes.find(x => x.id === id);
  if (s) return { item: { ...s, apply_link: s.apply_link }, type: "scheme" };
  const sc = scholarships.find(x => x.id === id);
  if (sc) return { item: { ...sc, apply_link: sc.official_website }, type: "scholarship" };
  const e = exams.find(x => x.id === id);
  if (e) return { item: { ...e, apply_link: e.official_website, ministry: e.conducting_body }, type: "exam" };
  return { item: null, type: "" };
}

export default function ApplyFlowPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [step, setStep] = useState<"docs" | "review">("docs");
  const [userDocs, setUserDocs] = useState<{ id: string; document_type: string; file_name: string; file_url: string }[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const { item, type } = findItem(itemId || "");
  const requiredDocs = documentRequirements[itemId || ""] || [];

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const [{ data: docs }, { data: prof }] = await Promise.all([
        supabase.from("user_documents").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);
      if (docs) setUserDocs(docs);
      if (prof) setProfile(prof);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!item) {
    return (
      <AppLayout>
        <div className="container py-16 text-center">
          <h2 className="text-xl font-bold mb-2">Item not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="container py-16 text-center max-w-md mx-auto">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{lang === "hi" ? "कृपया लॉगिन करें" : "Please Login to Apply"}</h2>
          <Link to="/login"><Button className="min-h-[44px] mt-4">{lang === "hi" ? "लॉगिन" : "Login"}</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const name = lang === "hi" ? item.name_hi : item.name;
  const desc = lang === "hi" ? item.description_hi : item.description;
  const issuer = item.ministry || item.provider || item.conducting_body || "";

  const getDocStatus = (docType: string) => {
    return userDocs.some(d => d.document_type === docType);
  };

  const readyCount = requiredDocs.filter(d => getDocStatus(d)).length;
  const allReady = readyCount === requiredDocs.length;
  const progressPct = requiredDocs.length ? Math.round((readyCount / requiredDocs.length) * 100) : 100;

  const handleUpload = async (docType: string, file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploading(docType);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 200);

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("user-documents").upload(path, file);
    clearInterval(interval);

    if (upErr) { toast.error(upErr.message); setUploading(null); return; }

    const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("user_documents").insert({
      user_id: user.id, document_type: docType, file_name: file.name, file_url: urlData.publicUrl,
    });

    setUploadProgress(100);
    setTimeout(() => { setUploading(null); setUploadProgress(0); }, 500);

    if (dbErr) { toast.error(dbErr.message); return; }
    toast.success(`${docType} uploaded!`);
    const { data: docs } = await supabase.from("user_documents").select("*").eq("user_id", user.id);
    if (docs) setUserDocs(docs);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // REVIEW SCREEN
  if (step === "review") {
    return (
      <AppLayout>
        <div className="container py-6 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => setStep("docs")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> {lang === "hi" ? "वापस" : "Back"}
          </Button>

          <h1 className="text-xl font-bold mb-1">{lang === "hi" ? "आवेदन समीक्षा" : "Application Review"}</h1>
          <p className="text-xs text-muted-foreground mb-6">{name}</p>

          {/* Profile Details */}
          <div className="rounded-lg border bg-card p-4 mb-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> {lang === "hi" ? "आपका विवरण" : "Your Details"}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {[
                ["Name", profile?.full_name],
                ["DOB", profile?.date_of_birth],
                ["Gender", profile?.gender],
                ["Category", profile?.category],
                ["State", profile?.state],
                ["Education", profile?.education_level],
                ["Income", profile?.annual_income ? `₹${Number(profile.annual_income).toLocaleString("en-IN")}` : null],
                ["Phone", profile?.phone],
                ["Email", user?.email],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <span className="text-muted-foreground">{String(label)}:</span>{" "}
                  <span className="font-medium">{String(val || "—")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-lg border bg-card p-4 mb-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> {lang === "hi" ? "संलग्न दस्तावेज़" : "Documents Attached"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {requiredDocs.map(doc => {
                const found = userDocs.find(d => d.document_type === doc);
                return (
                  <div key={doc} className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{doc}</p>
                      {found && <p className="text-[10px] text-muted-foreground truncate">{found.file_name}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/profile">
              <Button variant="outline" className="w-full min-h-[44px]">
                {lang === "hi" ? "प्रोफ़ाइल संपादित करें" : "Edit Profile"}
              </Button>
            </Link>

            <a href={item.apply_link || item.official_website || "#"} target="_blank" rel="noopener noreferrer">
              <Button className="w-full min-h-[48px] font-semibold text-base mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                {lang === "hi" ? "आधिकारिक वेबसाइट पर जाएं →" : "Proceed to Official Website →"}
              </Button>
            </a>

            <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                {lang === "hi"
                  ? "💡 टिप: आधिकारिक वेबसाइट खोलने के बाद, फॉर्म को ऑटो-फिल करने के लिए अपने 'Student Sarthi Filler' बुकमार्कलेट पर क्लिक करें!"
                  : "💡 Tip: After opening the official website, click your 'Student Sarthi Filler' bookmarklet to auto-fill the form!"}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // DOCUMENTS SCREEN
  return (
    <AppLayout>
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> {lang === "hi" ? "वापस" : "Back"}
        </Button>

        {/* Item Info */}
        <div className="rounded-lg border bg-card p-4 mb-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h1 className="text-lg font-bold">{name}</h1>
              <p className="text-xs text-muted-foreground">{issuer}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 capitalize">{type}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{desc}</p>
          {(item.benefit || item.amount_per_year) && (
            <p className="text-sm font-bold text-success">{item.benefit || `₹${item.amount_per_year?.toLocaleString("en-IN")}/year`}</p>
          )}
        </div>

        {/* Required Documents */}
        <h2 className="text-sm font-semibold mb-3">
          {lang === "hi" ? "आवश्यक दस्तावेज़" : "Required Documents"}
        </h2>
        <div className="space-y-3 mb-6">
          {requiredDocs.map(docType => {
            const found = userDocs.find(d => d.document_type === docType);
            const isUploading = uploading === docType;

            return (
              <div key={docType} className={`rounded-lg border p-3 transition-colors ${found ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {found ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-warning shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{docType}</p>
                      {found ? (
                        <p className="text-[10px] text-success truncate">{lang === "hi" ? "सहेजे गए दस्तावेज़ का उपयोग" : "Using saved document"} — {found.file_name}</p>
                      ) : (
                        <p className="text-[10px] text-warning">{lang === "hi" ? "अपलोड करना आवश्यक" : "Upload required"}</p>
                      )}
                    </div>
                  </div>
                  {!found && !isUploading && (
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" className="min-h-[36px]" asChild>
                        <span><Upload className="h-3 w-3 mr-1" /> Upload</span>
                      </Button>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        ref={el => { fileInputRefs.current[docType] = el; }}
                        onChange={e => {
                          if (e.target.files?.[0]) handleUpload(docType, e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Bar */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {readyCount} {lang === "hi" ? "में से" : "of"} {requiredDocs.length} {lang === "hi" ? "दस्तावेज़ तैयार" : "documents ready"}
            </span>
            <span className="text-xs text-muted-foreground">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2 mb-4" />
          <Button
            onClick={() => setStep("review")}
            disabled={!allReady}
            className="w-full min-h-[48px] font-semibold"
          >
            {allReady
              ? (lang === "hi" ? "पुष्टि करें और आगे बढ़ें" : "Confirm & Proceed")
              : (lang === "hi" ? "सभी दस्तावेज़ अपलोड करें" : "Upload all documents first")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
