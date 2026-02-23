import { Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { ArrowRightLeft, Search, Send } from "lucide-react";
import { useState } from "react";

const MatchSkills = () => {
  const { currentUser, getMatches, sendSwapRequest, swapRequests, isBootstrapping } = useAppContext();
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  if (!currentUser && !isBootstrapping) return <Navigate to="/login" />;

  const matches = getMatches();

  const handleSendRequest = (receiverId: string, skillId: string) => {
    sendSwapRequest(receiverId, skillId);
    setSentFeedback(`${receiverId}-${skillId}`);
    setTimeout(() => setSentFeedback(null), 2000);
  };

  const isRequestSent = (receiverId: string, skillId: string) =>
    swapRequests.some(
      (r) => r.senderId === currentUser.id && r.receiverId === receiverId && r.skillId === skillId
    );

  return (
    <div className="app-page-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          Skill Matches
        </h1>
        <p className="text-muted-foreground mt-1">Users who offer skills you want to learn</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <ArrowRightLeft className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No matches yet</h2>
          <p className="text-muted-foreground">Add more skills you want to learn to find matching users</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <div
              key={match.user.id}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {match.user.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{match.user.name}</h3>
                    <p className="text-xs text-muted-foreground">{match.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">They can teach you</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matchingSkills.map((s) => (
                      <SkillBadge key={s.id} name={s.name} variant="match" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">They want to learn</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.theyWant.map((s) => (
                      <SkillBadge key={s.id} name={s.name} variant="learn" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Send request buttons for each matching skill */}
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                {match.matchingSkills.map((skill) => {
                  const sent = isRequestSent(match.user.id, skill.id);
                  const justSent = sentFeedback === `${match.user.id}-${skill.id}`;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => !sent && handleSendRequest(match.user.id, skill.id)}
                      disabled={sent}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        sent
                          ? "bg-muted text-muted-foreground cursor-default"
                          : "gradient-hero text-primary-foreground shadow-button hover:opacity-90"
                      }`}
                    >
                      <Send className="h-3 w-3" />
                      {justSent ? "Sent! ✓" : sent ? `Requested: ${skill.name}` : `Request: ${skill.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MatchSkills;
