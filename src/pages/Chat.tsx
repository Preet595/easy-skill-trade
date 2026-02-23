import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, Mic, Send, Square } from "lucide-react";

interface ChatMessage {
  id: string;
  swapRequestId: string;
  senderId: string;
  body: string;
  createdAt: string;
  kind?: "text" | "audio";
  audioUrl?: string | null;
}

interface ChatBootstrap {
  swapRequest: {
    id: string;
    senderId: string;
    receiverId: string;
    skillId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
  };
  messages: ChatMessage[];
}

const Chat = () => {
  const { swapRequestId } = useParams<{ swapRequestId: string }>();
  const navigate = useNavigate();
  const { currentUser, getUserById, getSkillById, swapRequests, isBootstrapping } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  if (!currentUser && !isBootstrapping) return <Navigate to="/login" />;

  const swap = swapRequests.find((r) => r.id === swapRequestId);
  if (!swapRequestId || !swap) {
    return <Navigate to="/swap-requests" />;
  }

  const otherUser = getUserById(swap.senderId === currentUser.id ? swap.receiverId : swap.senderId);
  const skill = getSkillById(swap.skillId);

  const canChat = swap.status === "accepted";

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/chats/${swapRequestId}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || "Failed to load chat");
        }
        const data: ChatBootstrap = await res.json();
        setMessages(data.messages);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [swapRequestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !canChat) return;

    try {
      setSending(true);
      setError("");
      const res = await fetch(`/api/chats/${swapRequestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUser.id, body: trimmed, kind: "text" }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to send message");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleStartRecording = async () => {
    if (!canChat || isRecording) return;

    if (typeof window !== "undefined" && !("MediaRecorder" in window)) {
      setError("Voice messages are not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result;
          if (typeof result !== "string") return;

          try {
            setSending(true);
            setError("");
            const res = await fetch(`/api/chats/${swapRequestId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ senderId: currentUser!.id, body: result, kind: "audio" }),
            });

            if (!res.ok) {
              const payload = await res.json().catch(() => null);
              throw new Error(payload?.message || "Failed to send voice message");
            }

            const data = await res.json();
            setMessages((prev) => [...prev, data.message]);
          } catch (err: any) {
            setError(err.message || "Something went wrong while sending voice message");
          } finally {
            setSending(false);
          }
        };

        reader.readAsDataURL(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setError("Could not access microphone");
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && isRecording) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="app-page-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {otherUser?.avatar}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{otherUser?.name ?? "Skill partner"}</p>
              <p className="text-xs text-muted-foreground">
                {skill ? `Chat about ${skill.name}` : "Skill swap chat"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase text-accent-foreground">
            {canChat ? "Accepted" : swap.status}
          </span>
        </div>

        {!canChat && (
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Chat will be available once this swap request is accepted.
          </div>
        )}

        <div className="flex-1 rounded-2xl border border-border bg-card/80 shadow-card flex flex-col min-h-[360px] max-h-[480px]">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
            {loading && <p className="text-muted-foreground text-xs">Loading conversation…</p>}
            {!loading && messages.length === 0 && (
              <p className="text-muted-foreground text-xs">No messages yet. Say hi to start the conversation!</p>
            )}
            {messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-card ${
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {m.kind === "audio" && m.audioUrl ? (
                      <audio controls src={m.audioUrl} className="mt-1 max-w-full">
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p>{m.body}</p>
                    )}
                    <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {m.createdAt}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-border px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!canChat}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              placeholder={canChat ? "Type a message..." : "Chat will unlock after acceptance"}
            />
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={!canChat || sending}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground shadow-sm transition-all ${
                isRecording ? "bg-destructive/10 text-destructive" : "bg-background hover:bg-muted/60"
              }`}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canChat || sending || !input.trim()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full gradient-hero text-primary-foreground shadow-button disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
