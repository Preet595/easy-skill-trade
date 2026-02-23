import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { MessageCircle } from "lucide-react";

const Chats = () => {
  const { currentUser, swapRequests, getUserById, getSkillById, isBootstrapping } = useAppContext();

  if (!currentUser && !isBootstrapping) return <Navigate to="/login" />;

  const accepted = currentUser
    ? swapRequests.filter(
        (r) => r.status === "accepted" && (r.senderId === currentUser.id || r.receiverId === currentUser.id)
      )
    : [];

  return (
    <div className="app-page-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Chats
          </h1>
          <p className="text-muted-foreground mt-1">All your active skill swap conversations</p>
        </div>

        {accepted.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground animate-fade-in">
            You don't have any accepted swaps yet. Once a request is accepted, it will appear here so you can chat.
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {accepted.map((r) => {
              const otherUserId = currentUser && r.senderId === currentUser.id ? r.receiverId : r.senderId;
              const otherUser = getUserById(otherUserId);
              const skill = getSkillById(r.skillId);
              if (!otherUser || !skill) return null;

              return (
                <Link
                  key={r.id}
                  to={`/chat/${r.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover hover:bg-accent/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {otherUser.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{otherUser.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <SkillBadge name={skill.name} variant="match" />
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                          Accepted
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Open chat
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
