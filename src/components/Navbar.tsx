import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ArrowRightLeft, BookOpen, Home, LogOut, Search, Send, User } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Navigation links for authenticated users
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/add-skills", label: "Skills", icon: BookOpen },
    { to: "/matches", label: "Matches", icon: Search },
    { to: "/swap-requests", label: "Requests", icon: Send },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <ArrowRightLeft className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">SkillSwap</span>
        </Link>

        {/* Navigation */}
        {currentUser ? (
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            {/* User avatar & logout */}
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {currentUser.avatar}
              </div>
              <button onClick={handleLogout} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/register" className="rounded-lg gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-button transition-all hover:opacity-90">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
