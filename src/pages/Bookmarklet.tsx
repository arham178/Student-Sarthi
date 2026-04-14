import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bookmark, Copy, GripHorizontal, CheckCircle2, Smartphone, ExternalLink, TestTube } from "lucide-react";
import { Link } from "react-router-dom";

const worksOnSites = [
  "scholarships.gov.in", "ssc.nic.in", "uppbpb.gov.in", "ibps.in",
  "scholarship.up.gov.in", "rrb.indianrailways.gov.in", "nsp.gov.in", "mahadbt.maharashtra.gov.in",
];

const autoFillFields = [
  "Full Name", "Father's Name", "Mother's Name", "Date of Birth", "Gender", "Category",
  "Annual Income", "Aadhaar (last 4)", "Mobile", "Email", "Address", "State", "District",
  "Pincode", "Education Level", "Institution Name", "Percentage", "Bank Account", "IFSC", "Bank Name",
];

const installSteps = [
  { en: "Press Ctrl+Shift+B to show Bookmarks Bar", hi: "बुकमार्क बार दिखाने के लिए Ctrl+Shift+B दबाएं" },
  { en: "Drag the orange button above to the bar", hi: "ऊपर के ऑरेंज बटन को बार में ड्रैग करें" },
  { en: "Visit any government form website", hi: "किसी भी सरकारी फॉर्म वेबसाइट पर जाएं" },
  { en: "Click 'Student Sarthi Filler' from your bookmarks", hi: "बुकमार्क से 'Student Sarthi Filler' पर क्लिक करें" },
  { en: "Click 'Auto Fill' in the sidebar that appears", hi: "साइडबार में 'Auto Fill' पर क्लिक करें" },
];

function generateBookmarkletCode(apiEndpoint: string, userToken: string) {
  const script = `(function(){if(document.getElementById('ss-sidebar')){document.getElementById('ss-sidebar').style.display='flex';return;}var API='${apiEndpoint}/functions/v1/profile-export';var TOKEN='${userToken}';var profile=null;function getProfile(cb){var cached=localStorage.getItem('ss_offline_profile');if(cached){profile=JSON.parse(cached);cb(profile);return;}fetch(API+'?token='+TOKEN).then(function(r){return r.json()}).then(function(d){profile=d;cb(d)}).catch(function(){var l=localStorage.getItem('ss_offline_profile');cb(l?JSON.parse(l):null)});}function getFields(){return Array.from(document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]),select,textarea')).map(function(el){var label='';if(el.id){var lb=document.querySelector('label[for=\"'+el.id+'\"]');if(lb)label=lb.innerText.trim();}if(!label&&el.placeholder)label=el.placeholder;if(!label&&el.name)label=el.name;if(!label){var p=el.previousElementSibling;if(p)label=p.innerText.trim().slice(0,60);}return{el:el,label:label.toLowerCase(),id:(el.id||el.name||'').toLowerCase(),tag:el.tagName};});}var MAP={full_name:['name','fullname','applicant_name','student_name','naam','candidate_name'],father_name:['father','pita','guardian_name'],mother_name:['mother','mata'],date_of_birth:['dob','birth_date','date_of_birth','janm_tithi','birthdate'],email:['email','mail','email_id'],phone:['mobile','phone','contact','mob','cell'],aadhaar_last4:['aadhaar','aadhar','uid'],address:['address','addr','pata','residence'],state:['state','rajya'],district:['district','zila'],pincode:['pincode','pin','postal'],gender:['gender','sex','ling'],category:['category','caste','varg'],annual_income:['income','annual_income','aay'],last_percentage:['percentage','marks','percent'],institution_name:['institution','school','college','university'],bank_account_last4:['account_no','account_number','bank_account'],ifsc_code:['ifsc'],bank_name:['bank_name']};function fill(fields,p){var n=0;fields.forEach(function(f){Object.keys(MAP).forEach(function(key){if(!p[key])return;var hit=MAP[key].some(function(k){return f.label.includes(k)||f.id.includes(k)});if(!hit)return;try{if(f.tag==='SELECT'){var opt=Array.from(f.el.options).find(function(o){return o.text.toLowerCase().includes(String(p[key]).toLowerCase())||o.value.toLowerCase()===String(p[key]).toLowerCase()});if(opt){f.el.value=opt.value;n++;}}else{f.el.value=p[key];f.el.style.background='#fffde7';f.el.style.border='2px solid #FF6B35';f.el.title='Filled by Student Sarthi';f.el.dispatchEvent(new Event('input',{bubbles:true}));f.el.dispatchEvent(new Event('change',{bubbles:true}));n++;}}catch(e){}});});return n;}function buildUI(){var s=document.createElement('div');s.id='ss-sidebar';s.style.cssText='position:fixed;top:0;right:0;width:300px;height:100vh;background:#fff;box-shadow:-4px 0 24px rgba(0,0,0,0.18);z-index:2147483647;display:flex;flex-direction:column;font-family:Arial,sans-serif;border-left:4px solid #FF6B35;';s.innerHTML='<div style="background:linear-gradient(135deg,#FF6B35,#1A237E);padding:14px 16px;color:#fff;display:flex;align-items:center;justify-content:space-between;"><div><div style="font-weight:700;font-size:15px;">🎓 Student Sarthi</div><div style="font-size:11px;opacity:.8;">Form Auto-Filler</div></div><button id="ss-x" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:14px;">✕</button></div><div id="ss-st" style="padding:10px 14px;background:#fff8e1;border-bottom:1px solid #ffe082;font-size:12px;color:#795548;">⏳ Loading profile...</div><div style="padding:14px;flex:1;overflow-y:auto;"><div id="ss-pv" style="display:none;background:#f5f5f5;border-radius:8px;padding:10px;font-size:12px;line-height:1.9;color:#333;margin-bottom:12px;"></div><button id="ss-fill" style="width:100%;padding:11px;background:#FF6B35;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px;display:none;">✨ Auto Fill This Form</button><button id="ss-scan" style="width:100%;padding:9px;background:#1A237E;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;margin-bottom:8px;display:none;">🔍 Scan Fields</button><button id="ss-clr" style="width:100%;padding:9px;background:#f5f5f5;color:#555;border:1px solid #ddd;border-radius:8px;font-size:12px;cursor:pointer;display:none;">🗑️ Clear</button><div id="ss-res" style="margin-top:10px;display:none;padding:10px;border-radius:8px;font-size:12px;"></div><div id="ss-fl" style="margin-top:10px;font-size:11px;"></div></div><div style="padding:10px 14px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center;">Student Sarthi</div>';document.body.appendChild(s);document.getElementById('ss-x').onclick=function(){s.style.display='none'};getProfile(function(p){var st=document.getElementById('ss-st');if(!p){st.style.background='#ffebee';st.style.color='#c62828';st.innerHTML='❌ Profile not found.';return;}st.style.background='#e8f5e9';st.style.color='#2e7d32';st.innerHTML='✅ '+(p.full_name||'Student')+' — Profile loaded';document.getElementById('ss-pv').style.display='block';document.getElementById('ss-pv').innerHTML=(p.full_name?'<b>Name:</b> '+p.full_name+'<br>':'')+(p.date_of_birth?'<b>DOB:</b> '+p.date_of_birth+'<br>':'')+(p.category?'<b>Category:</b> '+p.category+'<br>':'')+(p.state?'<b>State:</b> '+p.state+'<br>':'')+(p.education_level?'<b>Education:</b> '+p.education_level+'<br>':'');['ss-fill','ss-scan','ss-clr'].forEach(function(id){document.getElementById(id).style.display='block'});document.getElementById('ss-scan').onclick=function(){var f=getFields();var fl=document.getElementById('ss-fl');fl.innerHTML='<b style="color:#1A237E;">'+f.length+' fields found:</b><br>'+f.slice(0,15).map(function(x){return'<span style="display:inline-block;background:#eee;border-radius:4px;padding:2px 6px;margin:2px;font-size:10px;">'+(x.label||x.id||'field')+'</span>'}).join('')};document.getElementById('ss-fill').onclick=function(){var btn=document.getElementById('ss-fill');btn.innerHTML='⏳ Filling...';btn.disabled=true;setTimeout(function(){var n=fill(getFields(),p);var r=document.getElementById('ss-res');r.style.display='block';if(n>0){r.style.background='#e8f5e9';r.style.color='#2e7d32';r.style.border='1px solid #a5d6a7';r.innerHTML='✅ <b>'+n+' fields</b> filled! Review before submitting.';}else{r.style.background='#fff3e0';r.style.color='#e65100';r.style.border='1px solid #ffcc80';r.innerHTML='⚠️ No matching fields found.';}btn.innerHTML='✨ Fill Again';btn.disabled=false;},600)};document.getElementById('ss-clr').onclick=function(){document.querySelectorAll('[title="Filled by Student Sarthi"]').forEach(function(el){el.value='';el.style.background='';el.style.border='';el.title='';});var r=document.getElementById('ss-res');r.style.display='block';r.style.background='#f5f5f5';r.style.color='#666';r.style.border='1px solid #ddd';r.innerHTML='🗑️ Cleared all filled fields.';}});}buildUI();})();`;
  return 'javascript:' + encodeURIComponent(script);
}

export default function BookmarkletPage() {
  const { lang } = useLanguage();
  const { user, session } = useAuth();
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const installed = typeof window !== "undefined" && localStorage.getItem("ss_bookmarklet_installed") === "true";

  useEffect(() => {
    if (session?.access_token) {
      const apiUrl = import.meta.env.VITE_SUPABASE_URL || "";
      setBookmarkletUrl(generateBookmarkletCode(apiUrl, session.access_token));
    }
  }, [session]);

  const copyCode = () => {
    navigator.clipboard.writeText(bookmarkletUrl);
    toast.success(lang === "hi" ? "कोड कॉपी हो गया!" : "Code copied to clipboard!");
  };

  return (
    <AppLayout>
      <div className="container py-6 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-3">
            <Bookmark className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">🔖 Student Sarthi Browser Filler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "hi" ? "किसी भी सरकारी फॉर्म वेबसाइट पर एक क्लिक — डेटा अपने आप भर जाएगा" : "Click once on any government form website — your data fills automatically"}
          </p>
        </div>

        {/* Drag to Install */}
        {user && bookmarkletUrl ? (
          <div className="rounded-2xl p-6 mb-6 text-center text-primary-foreground bg-gradient-hero">
            <p className="text-sm font-semibold mb-3">
              {lang === "hi" ? "इस बटन को अपने ब्राउज़र के बुकमार्क बार में ड्रैग करें ↓" : "Drag this button to your browser's Bookmarks Bar ↓"}
            </p>
            <a
              href={bookmarkletUrl}
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm shadow-lg cursor-grab active:cursor-grabbing bg-card text-foreground hover:shadow-xl transition-shadow"
              draggable
            >
              <GripHorizontal className="h-4 w-4" />
              🎓 Student Sarthi Filler
            </a>
            <p className="text-[10px] mt-3 opacity-70">
              {lang === "hi" ? "क्लिक न करें — इसे बुकमार्क बार में ड्रैग करें" : "Do not click — drag it to your bookmarks bar"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4 text-center mb-6">
            <p className="text-sm text-muted-foreground">{lang === "hi" ? "बुकमार्कलेट बनाने के लिए लॉगिन करें" : "Login to generate your bookmarklet"}</p>
            <Link to="/login"><Button className="mt-2">{lang === "hi" ? "लॉगिन" : "Login"}</Button></Link>
          </div>
        )}

        {/* Install Steps */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">{lang === "hi" ? "इंस्टॉल करने के स्टेप" : "Installation Steps"}</h2>
          <div className="space-y-2">
            {installSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <p className="text-xs">{lang === "hi" ? s.hi : s.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Install */}
        <div className="rounded-lg border border-accent/50 bg-accent/10 p-4 mb-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Smartphone className="h-4 w-4" /> {lang === "hi" ? "मोबाइल पर इंस्टॉल" : "Mobile Installation"}</h3>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-3">
            <li>{lang === "hi" ? "नीचे 'कोड कॉपी करें' बटन दबाएं" : "Tap 'Copy Code' button below"}</li>
            <li>{lang === "hi" ? "Chrome में कोई भी पेज बुकमार्क करें" : "Bookmark any page in Chrome"}</li>
            <li>{lang === "hi" ? "बुकमार्क एडिट करें → URL को कॉपी किए कोड से बदलें" : "Edit bookmark → replace URL with the copied code"}</li>
          </ol>
          {bookmarkletUrl && (
            <Button variant="outline" size="sm" onClick={copyCode} className="min-h-[36px]">
              <Copy className="h-3 w-3 mr-1" /> {lang === "hi" ? "कोड कॉपी करें" : "Copy Code"}
            </Button>
          )}
        </div>

        {/* Works on */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">{lang === "hi" ? "इन साइटों पर काम करता है" : "Works on these sites"}</h2>
          <div className="grid grid-cols-2 gap-2">
            {worksOnSites.map(site => (
              <div key={site} className="flex items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                {site}
              </div>
            ))}
          </div>
        </div>

        {/* What gets auto-filled */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">{lang === "hi" ? "क्या ऑटो-फिल होता है" : "What gets auto-filled"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {autoFillFields.map(f => (
              <Badge key={f} variant="secondary" className="text-[10px] justify-center">{f}</Badge>
            ))}
          </div>
        </div>

        {/* Test */}
        <Link to="/bookmarklet/test">
          <Button variant="outline" className="w-full min-h-[48px] font-semibold">
            <TestTube className="h-4 w-4 mr-2" />
            🧪 {lang === "hi" ? "डेमो फॉर्म पर टेस्ट करें" : "Try on Demo Form"}
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
