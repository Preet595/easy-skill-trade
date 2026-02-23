import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import SkillBadge from "@/components/SkillBadge";
import { Check, Inbox, Send, X } from "lucide-react";

const SwapRequests = () => {
  const { currentUser, swapRequests, updateSwapRequest, getUserById, getSkillById, isBootstrapping } = useAppContext();

  if (!currentUser && !isBootstrapping) return <Navigate to="/login" />;

  const received = swapRequests.filter((r) => r.receiverId === currentUser.id);
  const sent = swapRequests.filter((r) => r.senderId === currentUser.id);

  const statusStyles = {
    pending: "bg-secondary/15 text-secondary",
    accepted: "bg-accent text-accent-foreground",
    rejected: "bg-destructive/10 text-destructive",
  };

  const renderRequest = (r: typeof swapRequests[0], type: "received" | "sent") => {
    const otherUser = getUserById(type === "received" ? r.senderId : r.receiverId);
    const skill = getSkillById(r.skillId);
    if (!otherUser || !skill) return null;

    const showChat = r.status === "accepted";

    return (
      <div key={r.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {otherUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{otherUser.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <SkillBadge name={skill.name} variant="match" />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[r.status]}`}>
                {r.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {/* Actions for received pending requests */}
          {type === "received" && r.status === "pending" && (
            <>
              <button
                onClick={() => updateSwapRequest(r.id, "accepted")}
                className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground transition-all hover:opacity-80"
              >
                <Check className="h-3.5 w-3.5" /> Accept
              </button>
              <button
                onClick={() => updateSwapRequest(r.id, "rejected")}
                className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-all hover:opacity-80"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          )}

          {showChat && (
            <Link
              to={`/chat/${r.id}`}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-accent/40"
            >
              <Send className="h-3.5 w-3.5" /> Open chat
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-page-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Send className="h-8 w-8 text-primary" />
          Swap Requests
        </h1>
        <p className="text-muted-foreground mt-1">Manage your skill swap requests</p>
      </div>

      {/* Received */}
      <div className="mb-8 animate-fade-in">
        <h2 className="flex items-center gap-2 font-bold text-foreground mb-4">
          <Inbox className="h-5 w-5 text-primary" />
          Received ({received.length})
        </h2>
        {received.length > 0 ? (
          <div className="space-y-3">
            {received.map((r) => renderRequest(r, "received"))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No received requests yet
          </div>
        )}
      </div>

      {/* Sent */}
      <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <h2 className="flex items-center gap-2 font-bold text-foreground mb-4">
          <Send className="h-5 w-5 text-secondary" />
          Sent ({sent.length})
        </h2>
        {sent.length > 0 ? (
          <div className="space-y-3">
            {sent.map((r) => renderRequest(r, "sent"))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No sent requests yet. Find matches to send requests!
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SwapRequests;
