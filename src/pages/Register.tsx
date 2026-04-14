import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const { lang } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error(lang === "hi" ? "सभी फ़ील्ड भरें" : "Please fill all fields");
      return;
    }
    if (password.length < 6) {
      toast.error(lang === "hi" ? "पासवर्ड कम से कम 6 अक्षर" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === "hi" ? "रजिस्ट्रेशन सफल! लॉगिन हो गया।" : "Registration successful! You're logged in.");
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gradient-hero">{lang === "hi" ? "स्टूडेंट सारथी" : "Student Sarthi"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{lang === "hi" ? "नया खाता बनाएं" : "Create your account"}</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">{lang === "hi" ? "पूरा नाम" : "Full Name"}</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <Button type="submit" className="w-full min-h-[48px] font-semibold" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {lang === "hi" ? "रजिस्टर करें" : "Register"}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-4">
          {lang === "hi" ? "पहले से खाता है?" : "Already have an account?"}{" "}
          <Link to="/login" className="text-primary font-medium">{lang === "hi" ? "लॉगिन करें" : "Login"}</Link>
        </p>
      </div>
    </div>
  );
}
