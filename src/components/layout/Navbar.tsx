import { GraduationCap, Bell, Globe, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-gradient-hero">{t("appName")}</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleLang} className="text-muted-foreground" title="Toggle Language">
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={signOut} title={t("logout")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs font-medium">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
