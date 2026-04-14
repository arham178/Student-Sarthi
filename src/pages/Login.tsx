import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const { lang } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(lang === "hi" ? "सभी फ़ील्ड भरें" : "Please fill all fields");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === "hi" ? "लॉगिन सफल!" : "Login successful!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gradient-hero">{lang === "hi" ? "स्टूडेंट सारथी" : "Student Sarthi"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{lang === "hi" ? "लॉगिन करें" : "Welcome back"}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <Button type="submit" className="w-full min-h-[48px] font-semibold" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {lang === "hi" ? "लॉगिन" : "Login"}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-4">
          {lang === "hi" ? "खाता नहीं है?" : "Don't have an account?"}{" "}
          <Link to="/register" className="text-primary font-medium">{lang === "hi" ? "रजिस्टर करें" : "Register"}</Link>
        </p>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-2 hover:text-primary">
          {lang === "hi" ? "अतिथि के रूप में जारी रखें" : "Continue as Guest →"}
        </Link>
      </div>
    </div>
  );
}
