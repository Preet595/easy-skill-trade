import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { ArrowRight, BookOpen, Search, Send } from "lucide-react";

const Dashboard = () => {
  const { currentUser, getUserSkills, swapRequests, getMatches } = useAppContext();

  if (!currentUser) return <Navigate to="/login" />;

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

  return (
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
  );
};

export default Dashboard;
