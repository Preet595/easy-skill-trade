import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { BookOpen, Plus, Search } from "lucide-react";

const AddSkills = () => {
  const { currentUser, skills, getUserSkills, addUserSkill, removeUserSkill } = useAppContext();
  const [search, setSearch] = useState("");

  if (!currentUser) return <Navigate to="/login" />;

  const { offers, learns } = getUserSkills(currentUser.id);
  const offerIds = offers.map((s) => s.id);
  const learnIds = learns.map((s) => s.id);

  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Manage Skills
        </h1>
        <p className="text-muted-foreground mt-1">Add skills you can teach or want to learn</p>
      </div>

      {/* Current Skills */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in">
          <h2 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">I Can Teach</h2>
          {offers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {offers.map((s) => (
                <SkillBadge key={s.id} name={s.name} variant="offer" onRemove={() => removeUserSkill(s.id, "offer")} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Teach" below to add skills</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">I Want to Learn</h2>
          {learns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {learns.map((s) => (
                <SkillBadge key={s.id} name={s.name} variant="learn" onRemove={() => removeUserSkill(s.id, "learn")} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Learn" below to add skills</p>
          )}
        </div>
      </div>

      {/* Search & Add */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search skills..."
          />
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredSkills.map((skill) => {
            const isOffering = offerIds.includes(skill.id);
            const isLearning = learnIds.includes(skill.id);
            return (
              <div key={skill.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground text-sm">{skill.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => isOffering ? removeUserSkill(skill.id, "offer") : addUserSkill(skill.id, "offer")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isOffering
                        ? "bg-accent text-accent-foreground"
                        : "border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {isOffering ? "✓ Teaching" : <><Plus className="h-3 w-3" /> Teach</>}
                  </button>
                  <button
                    onClick={() => isLearning ? removeUserSkill(skill.id, "learn") : addUserSkill(skill.id, "learn")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isLearning
                        ? "bg-secondary/20 text-secondary"
                        : "border border-border text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
                    }`}
                  >
                    {isLearning ? "✓ Learning" : <><Plus className="h-3 w-3" /> Learn</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddSkills;
