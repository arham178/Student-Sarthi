import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  documents_pending: "bg-warning/10 text-warning-foreground",
  ready_to_submit: "bg-accent/20 text-accent-foreground",
  submitted: "bg-primary/10 text-primary",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export default function ApplicationsPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("applied_at", { ascending: false });
      setApplications(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <AppLayout>
        <div className="container py-16 text-center max-w-md mx-auto">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{lang === "hi" ? "कृपया लॉगिन करें" : "Please Login"}</h2>
          <p className="text-sm text-muted-foreground mb-4">{lang === "hi" ? "आवेदन देखने के लिए लॉगिन करें" : "Login to view your applications"}</p>
          <Link to="/login"><Button className="min-h-[44px]">{lang === "hi" ? "लॉगिन" : "Login"}</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ["draft", "documents_pending", "ready_to_submit", "submitted"].includes(a.status)).length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">{t("myApplications")}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border bg-card p-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="rounded-lg border bg-card p-3 text-center"><p className="text-2xl font-bold text-primary">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          <div className="rounded-lg border bg-card p-3 text-center"><p className="text-2xl font-bold text-success">{stats.approved}</p><p className="text-xs text-muted-foreground">Approved</p></div>
          <div className="rounded-lg border bg-card p-3 text-center"><p className="text-2xl font-bold text-destructive">{stats.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{lang === "hi" ? "कोई आवेदन नहीं मिला" : "No applications yet"}</p>
            <Link to="/schemes"><Button className="min-h-[44px]">{lang === "hi" ? "योजनाएं खोजें" : "Browse Schemes"}</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="rounded-lg border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{app.scheme_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{app.scheme_type}</Badge>
                    <Badge className={`text-[10px] ${statusColors[app.status] || ""}`}>{app.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Applied: {new Date(app.applied_at).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
