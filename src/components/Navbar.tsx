import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ArrowRightLeft, BookOpen, Home, LogOut, MessageCircle, Search, Send } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout, swapRequests } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const pendingRequests = currentUser
    ? swapRequests.filter((r) => (r.senderId === currentUser.id || r.receiverId === currentUser.id) && r.status === "pending").length
    : 0;

  const activeChats = currentUser
    ? swapRequests.filter((r) => (r.senderId === currentUser.id || r.receiverId === currentUser.id) && r.status === "accepted").length
    : 0;

  // Navigation links for authenticated users
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/add-skills", label: "Skills", icon: BookOpen },
    { to: "/matches", label: "Matches", icon: Search },
    {
      to: "/swap-requests",
      label: "Requests",
      icon: Send,
      badge: pendingRequests > 0 ? (pendingRequests > 99 ? "99+" : String(pendingRequests)) : undefined,
    },
    {
      to: "/chats",
      label: "Chats",
      icon: MessageCircle,
      badge: activeChats > 0 ? (activeChats > 99 ? "99+" : String(activeChats)) : undefined,
    },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-background/80 via-card/80 to-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero shadow-card">
            <ArrowRightLeft className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-foreground tracking-tight">
            Skill<span className="text-primary">Swap</span>
          </span>
        </Link>

        {/* Navigation */}
        {currentUser ? (
          <nav className="flex items-center gap-1 rounded-full bg-card/70 border border-border/70 px-1.5 py-1 shadow-sm backdrop-blur-md">
            {navLinks.map(({ to, label, icon: Icon, badge }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-button"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {badge && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-background/90 px-1.5 text-[10px] font-semibold text-foreground shadow-sm">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* User avatar & logout */}
            <div className="ml-2 flex items-center gap-2 border-l border-border/70 pl-3">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-xs font-medium text-foreground leading-tight">{currentUser.name.split(" ")[0]}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{currentUser.email}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-card">
                {currentUser.avatar}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Logout"
              >
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
