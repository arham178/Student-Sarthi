import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { indianStates } from "@/data/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, GraduationCap, Wallet, Upload, FileText, X, Loader2, Bookmark, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const educationLevels = ["10th", "11th", "12th", "BA", "BSc", "BCom", "ITI", "Diploma"];
const categories = ["General", "OBC", "SC", "ST", "EWS"];
const genders = ["Male", "Female", "Other"];

export default function ProfilePage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<{ id: string; document_type: string; file_name: string; file_url: string }[]>([]);
  const [profile, setProfile] = useState({
    full_name: "", phone: "", date_of_birth: "", gender: "", state: "", district: "",
    education_level: "", category: "", annual_income: "",
    father_name: "", mother_name: "", address: "", pincode: "",
    aadhaar_last4: "", bank_account_last4: "", ifsc_code: "", bank_name: "",
    institution_name: "", last_percentage: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          state: data.state || "",
          district: data.district || "",
          education_level: data.education_level || "",
          category: data.category || "",
          annual_income: data.annual_income?.toString() || "",
          father_name: (data as any).father_name || "",
          mother_name: (data as any).mother_name || "",
          address: (data as any).address || "",
          pincode: (data as any).pincode || "",
          aadhaar_last4: (data as any).aadhaar_last4 || "",
          bank_account_last4: (data as any).bank_account_last4 || "",
          ifsc_code: (data as any).ifsc_code || "",
          bank_name: (data as any).bank_name || "",
          institution_name: (data as any).institution_name || "",
          last_percentage: (data as any).last_percentage?.toString() || "",
        });
      }
      const { data: docs } = await supabase.from("user_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false });
      if (docs) setDocuments(docs);
    };
    load();
  }, [user]);

  const coreFields = ["full_name", "phone", "date_of_birth", "gender", "state", "district", "education_level", "category", "annual_income"];
  const filled = coreFields.filter(k => (profile as any)[k]).length;
  const total = coreFields.length;
  const pct = Math.round((filled / total) * 100);

  const handleChange = (field: string, value: string) => setProfile(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!user) { toast.error("Please login first"); return; }
    setSaving(true);
    const updateData: any = {
      full_name: profile.full_name || null,
      phone: profile.phone || null,
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender || null,
      state: profile.state || null,
      district: profile.district || null,
      education_level: profile.education_level || null,
      category: profile.category || null,
      annual_income: profile.annual_income ? Number(profile.annual_income) : null,
      is_profile_complete: pct >= 70,
      father_name: profile.father_name || null,
      mother_name: profile.mother_name || null,
      address: profile.address || null,
      pincode: profile.pincode || null,
      aadhaar_last4: profile.aadhaar_last4 || null,
      bank_account_last4: profile.bank_account_last4 || null,
      ifsc_code: profile.ifsc_code || null,
      bank_name: profile.bank_name || null,
      institution_name: profile.institution_name || null,
      last_percentage: profile.last_percentage ? Number(profile.last_percentage) : null,
    };

    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }

    // Save to localStorage for bookmarklet offline use
    const safeProfile = {
      full_name: profile.full_name, date_of_birth: profile.date_of_birth, gender: profile.gender,
      father_name: profile.father_name, mother_name: profile.mother_name,
      phone: profile.phone, email: user.email || "",
      category: profile.category, state: profile.state, district: profile.district,
      pincode: profile.pincode, address: profile.address,
      annual_income: profile.annual_income, education_level: profile.education_level,
      institution_name: profile.institution_name, last_percentage: profile.last_percentage,
      aadhaar_last4: profile.aadhaar_last4, bank_account_last4: profile.bank_account_last4,
      ifsc_code: profile.ifsc_code, bank_name: profile.bank_name,
    };
    localStorage.setItem("ss_offline_profile", JSON.stringify(safeProfile));
    localStorage.setItem("ss_bookmarklet_installed", "true");

    toast.success(lang === "hi" ? "प्रोफ़ाइल सहेजी गई!" : "Profile saved!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be under 5MB"); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("user-documents").upload(path, file);
    if (uploadErr) { toast.error(uploadErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("user_documents").insert({
      user_id: user.id, document_type: docType, file_name: file.name, file_url: urlData.publicUrl,
    });
    setUploading(false);
    if (dbErr) toast.error(dbErr.message);
    else {
      toast.success(`${docType} uploaded!`);
      const { data: docs } = await supabase.from("user_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false });
      if (docs) setDocuments(docs);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    await supabase.from("user_documents").delete().eq("id", docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success("Document removed");
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="container py-16 text-center max-w-md mx-auto">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{lang === "hi" ? "कृपया लॉगिन करें" : "Please Login"}</h2>
          <Link to="/login"><Button className="min-h-[44px]">{lang === "hi" ? "लॉगिन" : "Login"}</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const bookmarkletInstalled = localStorage.getItem("ss_bookmarklet_installed") === "true";

  return (
    <AppLayout>
      <div className="container py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{lang === "hi" ? "मेरी प्रोफ़ाइल" : "My Profile"}</h1>
            <p className="text-xs text-muted-foreground">{lang === "hi" ? `${filled}/${total} फ़ील्ड भरे` : `${filled}/${total} fields completed`}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><User className="h-4 w-4 text-primary" /> {lang === "hi" ? "व्यक्तिगत विवरण" : "Personal Details"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "पूरा नाम" : "Full Name"}</label><Input value={profile.full_name} onChange={e => handleChange("full_name", e.target.value)} /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "फ़ोन" : "Phone"}</label><Input value={profile.phone} onChange={e => handleChange("phone", e.target.value)} /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "जन्म तिथि" : "Date of Birth"}</label><Input type="date" value={profile.date_of_birth} onChange={e => handleChange("date_of_birth", e.target.value)} /></div>
              <div>
                <label className="text-xs mb-1 block">{lang === "hi" ? "लिंग" : "Gender"}</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={profile.gender} onChange={e => handleChange("gender", e.target.value)}>
                  <option value="">Select</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "पिता का नाम" : "Father's Name"}</label><Input value={profile.father_name} onChange={e => handleChange("father_name", e.target.value)} /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "माता का नाम" : "Mother's Name"}</label><Input value={profile.mother_name} onChange={e => handleChange("mother_name", e.target.value)} /></div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><MapPin className="h-4 w-4 text-primary" /> {lang === "hi" ? "स्थान" : "Location"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block">{lang === "hi" ? "राज्य" : "State"}</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={profile.state} onChange={e => handleChange("state", e.target.value)}>
                  <option value="">Select</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "जिला" : "District"}</label><Input value={profile.district} onChange={e => handleChange("district", e.target.value)} /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "पिनकोड" : "Pincode"}</label><Input value={profile.pincode} onChange={e => handleChange("pincode", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="text-xs mb-1 block">{lang === "hi" ? "पता" : "Address"}</label><Input value={profile.address} onChange={e => handleChange("address", e.target.value)} /></div>
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><GraduationCap className="h-4 w-4 text-primary" /> {lang === "hi" ? "शिक्षा" : "Education"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block">{lang === "hi" ? "शिक्षा स्तर" : "Education Level"}</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={profile.education_level} onChange={e => handleChange("education_level", e.target.value)}>
                  <option value="">Select</option>
                  {educationLevels.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "संस्थान का नाम" : "Institution Name"}</label><Input value={profile.institution_name} onChange={e => handleChange("institution_name", e.target.value)} /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "अंतिम प्रतिशत" : "Last Percentage"}</label><Input type="number" value={profile.last_percentage} onChange={e => handleChange("last_percentage", e.target.value)} /></div>
            </div>
          </section>

          {/* Category & Income */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><Wallet className="h-4 w-4 text-primary" /> {lang === "hi" ? "वर्ग और आय" : "Category & Income"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block">{lang === "hi" ? "वर्ग" : "Category"}</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={profile.category} onChange={e => handleChange("category", e.target.value)}>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "वार्षिक आय" : "Annual Income (₹)"}</label><Input type="number" value={profile.annual_income} onChange={e => handleChange("annual_income", e.target.value)} /></div>
            </div>
          </section>

          {/* Identity & Bank (last 4 only) */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><Building2 className="h-4 w-4 text-primary" /> {lang === "hi" ? "पहचान और बैंक" : "Identity & Bank"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "आधार (अंतिम 4 अंक)" : "Aadhaar (last 4 digits)"}</label><Input maxLength={4} value={profile.aadhaar_last4} onChange={e => handleChange("aadhaar_last4", e.target.value.slice(0, 4))} placeholder="XXXX" /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "बैंक खाता (अंतिम 4 अंक)" : "Bank A/C (last 4 digits)"}</label><Input maxLength={4} value={profile.bank_account_last4} onChange={e => handleChange("bank_account_last4", e.target.value.slice(0, 4))} placeholder="XXXX" /></div>
              <div><label className="text-xs mb-1 block">IFSC Code</label><Input value={profile.ifsc_code} onChange={e => handleChange("ifsc_code", e.target.value)} placeholder="e.g. SBIN0001234" /></div>
              <div><label className="text-xs mb-1 block">{lang === "hi" ? "बैंक का नाम" : "Bank Name"}</label><Input value={profile.bank_name} onChange={e => handleChange("bank_name", e.target.value)} /></div>
            </div>
          </section>

          <Button onClick={handleSave} className="w-full min-h-[48px] font-semibold" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {lang === "hi" ? "प्रोफ़ाइल सहेजें" : "Save Profile"}
          </Button>

          {/* Document Uploads */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-3"><Upload className="h-4 w-4 text-primary" /> {lang === "hi" ? "दस्तावेज़ अपलोड" : "Document Uploads"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Aadhaar Card", "10th Marksheet", "12th Marksheet", "Income Certificate", "Caste Certificate", "Bank Passbook"].map(docType => (
                <div key={docType} className="rounded-lg border p-3">
                  <p className="text-xs font-medium mb-2">{docType}</p>
                  {documents.find(d => d.document_type === docType) ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success" />
                      <span className="text-xs text-success flex-1 truncate">{documents.find(d => d.document_type === docType)?.file_name}</span>
                      <button onClick={() => handleDeleteDoc(documents.find(d => d.document_type === docType)!.id)} className="text-destructive"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                      <Upload className="h-3 w-3" />
                      {uploading ? "Uploading..." : "Upload"}
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleFileUpload(e, docType)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Browser Auto-Fill Tool Section */}
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" />
              🔖 {lang === "hi" ? "ब्राउज़र ऑटो-फिल टूल" : "Browser Auto-Fill Tool"}
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              {lang === "hi"
                ? "हमारे ब्राउज़र बुकमार्कलेट को इंस्टॉल करें और किसी भी सरकारी फॉर्म को ऑटो-फिल करें — टाइपिंग की जरूरत नहीं!"
                : "Install our browser bookmarklet to auto-fill any government form with your saved data — no typing needed!"}
            </p>
            {bookmarkletInstalled ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-success/10 text-success text-xs">✅ {lang === "hi" ? "ब्राउज़र टूल सक्रिय" : "Browser Tool Active"}</Badge>
                <Link to="/bookmarklet"><Button variant="outline" size="sm" className="min-h-[36px]">{lang === "hi" ? "प्रबंधित करें →" : "Manage Tool →"}</Button></Link>
              </div>
            ) : (
              <Link to="/bookmarklet">
                <Button className="min-h-[44px] font-semibold">
                  <Bookmark className="h-4 w-4 mr-2" />
                  {lang === "hi" ? "ब्राउज़र टूल सेटअप करें →" : "Setup Browser Tool →"}
                </Button>
              </Link>
            )}
          </section>

          {pct >= 50 && (
            <div className="rounded-lg bg-success/10 p-4">
              <p className="text-sm font-semibold text-success">{lang === "hi" ? "आपकी प्रोफ़ाइल के अनुसार" : "Based on your profile"}</p>
              <p className="text-xs text-muted-foreground">{lang === "hi" ? "आप 4 योजनाओं, 3 छात्रवृत्तियों, 5 परीक्षाओं के पात्र हैं" : "You're eligible for 4 schemes, 3 scholarships, 5 exams"}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
