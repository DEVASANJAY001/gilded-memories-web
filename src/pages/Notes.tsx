import { useState, useEffect } from "react";
import { MessageCircle, Send, Reply, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import React from "react";

// ============================
// SCHEMA & TYPES
// ============================
const noteSchema = z.object({
  sender: z.enum(["harini", "deva"], { required_error: "Please select who you are" }),
  message: z.string().trim().min(1, "Message cannot be empty").max(500, "Message is too long (max 500 characters)"),
});

interface Note {
  id: string;
  sender: "harini" | "deva";
  message: string;
  parent_id: string | null;
  created_at: string;
  replies?: Note[];
}

// ============================
// UTIL FUNCTION
// ============================
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ============================
// RECURSIVE NOTE CARD COMPONENT
// ============================
const NoteCard = React.memo(({ note }: { note: Note }) => {
  const isHarini = note.sender === "harini";
  const [isReplying, setIsReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySender, setReplySender] = useState<"harini" | "deva">("harini");
  const [isSending, setIsSending] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleSendReply = async () => {
    const validation = noteSchema.safeParse({ sender: replySender, message: replyMessage });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notes").insert({
        sender: replySender,
        message: replyMessage,
        parent_id: note.id,
      });

      if (error) {
        console.error("Error sending reply:", error);
        toast.error("Failed to send reply");
        return;
      }

      toast.success("Reply sent! 💬");
      setReplyMessage("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`bg-card/80 backdrop-blur-xl rounded-3xl p-6 shadow-soft border-2 transition-all duration-300 hover:shadow-elegant ${
          isHarini ? "border-rose/30" : "border-sky/30"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-handwriting text-xl ${
                isHarini ? "bg-gradient-to-br from-rose to-lavender" : "bg-gradient-to-br from-sky to-mint"
              } text-white shadow-soft`}
            >
              {isHarini ? "H" : "D"}
            </div>
            <div>
              <p className="font-semibold text-foreground capitalize">{note.sender}</p>
              <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
            </div>
          </div>
          {!note.parent_id && <Heart className={`${isHarini ? "text-rose" : "text-sky"} fill-current`} size={20} />}
        </div>

        {/* Message */}
        <p className="text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">{note.message}</p>

        {/* Reply Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsReplying((prev) => !prev)}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            <Reply size={16} className="mr-1" />
            {isReplying ? "Hide Reply" : "Reply"}
          </Button>

          {note.replies && note.replies.length > 0 && (
            <Button
              onClick={() => setShowReplies((prev) => !prev)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary/80 p-0 h-auto"
            >
              {showReplies ? (
                <>
                  <ChevronUp size={16} className="mr-1" /> Hide Replies ({note.replies.length})
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" /> View Replies ({note.replies.length})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4 space-y-4 pt-4 border-t border-border">
            <RadioGroup
              value={replySender}
              onValueChange={(value) => setReplySender(value as "harini" | "deva")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harini" id={`reply-harini-${note.id}`} />
                <Label htmlFor={`reply-harini-${note.id}`} className="cursor-pointer">
                  Harini
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deva" id={`reply-deva-${note.id}`} />
                <Label htmlFor={`reply-deva-${note.id}`} className="cursor-pointer">
                  Deva
                </Label>
              </div>
            </RadioGroup>

            <Textarea
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="resize-none rounded-2xl bg-background/50"
              rows={3}
              maxLength={500}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSendReply}
                disabled={isSending || !replyMessage.trim()}
                size="sm"
                className="rounded-full"
              >
                <Send size={16} className="mr-1" />
                Send Reply
              </Button>
              <Button
                onClick={() => {
                  setIsReplying(false);
                  setReplyMessage("");
                }}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recursive Replies */}
      {showReplies && note.replies && note.replies.length > 0 && (
        <div className="ml-8 md:ml-12 space-y-3">
          {note.replies.map((reply) => (
            <NoteCard key={reply.id} note={reply} />
          ))}
        </div>
      )}
    </div>
  );
});

// ============================
// MAIN NOTES COMPONENT
// ============================
const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sender, setSender] = useState<"harini" | "deva">("harini");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadNotes();

    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => loadNotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: true });
      if (error) throw error;

      const notesMap = new Map<string, Note>();
      const rootNotes: Note[] = [];

      data?.forEach((n) => notesMap.set(n.id, { ...n, sender: n.sender as "harini" | "deva", replies: [] }));

      data?.forEach((n) => {
        if (n.parent_id) {
          const parent = notesMap.get(n.parent_id);
          if (parent) parent.replies!.push(notesMap.get(n.id)!);
        } else rootNotes.push(notesMap.get(n.id)!);
      });

      setNotes(rootNotes);
    } catch (err) {
      console.error("Error loading notes:", err);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNote = async () => {
    const validation = noteSchema.safeParse({ sender, message });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notes").insert({ sender, message, parent_id: null });
      if (error) throw error;

      toast.success("Note sent! 💌");
      setMessage("");
    } catch (err) {
      console.error("Error sending note:", err);
      toast.error("Failed to send note");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-6 animate-fade-in">
          <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">Our Notes 💌</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
            Leave a sweet message for each other — and reply anytime 💬
          </p>
        </div>

        {/* New Note Form */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-elegant border-2 border-primary/10 space-y-6 mb-12 animate-scale-in">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-foreground">Write a Note</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base mb-3 block">I am:</Label>
              <RadioGroup value={sender} onValueChange={(v) => setSender(v as "harini" | "deva")} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harini" id="harini" />
                  <Label htmlFor="harini" className="cursor-pointer text-base">
                    Harini 💖
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deva" id="deva" />
                  <Label htmlFor="deva" className="cursor-pointer text-base">
                    Deva ✨
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message" className="text-base mb-2 block">
                Your Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here... (max 500 characters)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none rounded-2xl bg-background/50 min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/500</p>
            </div>

            <Button
              onClick={handleSendNote}
              disabled={isSending || !message.trim()}
              className="w-full rounded-full py-6 text-lg shadow-glow hover:shadow-elegant transition-all duration-500 bg-gradient-primary border-0"
            >
              <Send size={20} className="mr-2" />
              Send Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground text-xl">No notes yet. Be the first to write one! 💌</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Heart className="text-primary fill-primary" size={24} />
              All Notes
            </h2>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
