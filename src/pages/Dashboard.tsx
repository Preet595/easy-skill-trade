import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { ArrowRight, BookOpen, Search, Send, Globe2, GraduationCap } from "lucide-react";

const Dashboard = () => {
  const { currentUser, getUserSkills, swapRequests, getMatches, isBootstrapping } = useAppContext();

  if (!currentUser && !isBootstrapping) return <Navigate to="/login" />;

  const { offers, learns } = getUserSkills(currentUser.id);
  const matches = getMatches();
  const pendingReceived = swapRequests.filter((r) => r.receiverId === currentUser.id && r.status === "pending");
  const pendingSent = swapRequests.filter((r) => r.senderId === currentUser.id && r.status === "pending");

  const quickStats = [
    { label: "Skills I Teach", value: offers.length, icon: BookOpen, color: "gradient-hero" },
    { label: "Skills I Want", value: learns.length, icon: BookOpen, color: "gradient-warm" },
    { label: "Matches Found", value: matches.length, icon: Search, color: "gradient-hero" },
    { label: "Pending Requests", value: pendingReceived.length + pendingSent.length, icon: Send, color: "gradient-warm" },
  ];

  const highlightCards = [
    {
      icon: BookOpen,
      title: "Your expertise, shared",
      description:
        "Showcase what you can teach and turn your strengths into learning opportunities for others.",
    },
    {
      icon: Globe2,
      title: "Connect beyond boundaries",
      description:
        "Match with people across skills and backgrounds who are looking for exactly what you offer.",
    },
    {
      icon: GraduationCap,
      title: "Learn what matters",
      description:
        "Focus on real‑world skills from peers who have already walked the path you want to take.",
    },
  ];

  return (
    <div className="app-page-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Greeting */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Hey, {currentUser.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your skill swap overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color} mb-3`}>
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Skills */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="font-bold text-foreground mb-3">Skills I Can Teach</h2>
          {offers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {offers.map((s) => <SkillBadge key={s.id} name={s.name} variant="offer" />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "280ms" }}>
          <h2 className="font-bold text-foreground mb-3">Skills I Want to Learn</h2>
          {learns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {learns.map((s) => <SkillBadge key={s.id} name={s.name} variant="learn" />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Experience Highlights */}
      <div className="mb-8 grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "280ms" }}>
        {highlightCards.map((card, i) => (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
            style={{ animationDelay: `${280 + i * 60}ms` }}
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground leading-snug">{card.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "360ms" }}>
        {[
          { to: "/add-skills", label: "Manage Skills", icon: BookOpen },
          { to: "/matches", label: "Find Matches", icon: Search },
          { to: "/swap-requests", label: "View Requests", icon: Send },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover group"
          >
            <div className="flex items-center gap-3">
              <a.icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{a.label}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
