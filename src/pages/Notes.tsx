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
  const [isEditing, setIsEditing] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [editMessage, setEditMessage] = useState(note.message);
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

  const handleEditNote = async () => {
    const validation = noteSchema.safeParse({ sender: note.sender, message: editMessage });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notes").update({ message: editMessage }).eq("id", note.id);

      if (error) {
        console.error("Error editing note:", error);
        toast.error("Failed to edit note");
        return;
      }

      toast.success("Note updated! ✏️");
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing note:", error);
      toast.error("Failed to edit note");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", note.id);

      if (error) {
        console.error("Error deleting note:", error);
        toast.error("Failed to delete note");
        return;
      }

      toast.success("Note deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className={`flex ${isHarini ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[75%] ${isHarini ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Sender name and time */}
        <div className={`flex items-center gap-2 px-2 ${isHarini ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-semibold text-muted-foreground capitalize">{note.sender}</span>
          <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg ${
            isHarini
              ? "bg-gradient-to-br from-rose to-lavender text-white rounded-tr-sm"
              : "bg-gradient-to-br from-sky to-mint text-white rounded-tl-sm"
          }`}
        >
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="resize-none rounded-xl bg-white/20 text-white placeholder:text-white/70 border-white/30"
                rows={3}
                maxLength={500}
              />
              <div className="flex gap-2">
                <Button onClick={handleEditNote} disabled={isSending} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditMessage(note.message);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-white leading-relaxed whitespace-pre-wrap break-words">{note.message}</p>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className={`flex items-center gap-3 px-2 flex-wrap ${isHarini ? "justify-end" : "justify-start"}`}>
            <Button
              onClick={() => setIsReplying((prev) => !prev)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary p-0 h-auto text-xs"
            >
              <Reply size={14} className="mr-1" />
              {isReplying ? "Hide" : "Reply"}
            </Button>

            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary p-0 h-auto text-xs"
            >
              <MessageCircle size={14} className="mr-1" />
              Edit
            </Button>

            <Button
              onClick={handleDeleteNote}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive p-0 h-auto text-xs"
            >
              Delete
            </Button>

            {note.replies && note.replies.length > 0 && (
              <Button
                onClick={() => setShowReplies((prev) => !prev)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-0 h-auto text-xs"
              >
                {showReplies ? (
                  <>
                    <ChevronUp size={14} className="mr-1" /> Hide ({note.replies.length})
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} className="mr-1" /> View ({note.replies.length})
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <div className="w-full mt-2 space-y-3 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border">
            <RadioGroup
              value={replySender}
              onValueChange={(value) => setReplySender(value as "harini" | "deva")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harini" id={`reply-harini-${note.id}`} />
                <Label htmlFor={`reply-harini-${note.id}`} className="cursor-pointer text-sm">
                  Harini
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deva" id={`reply-deva-${note.id}`} />
                <Label htmlFor={`reply-deva-${note.id}`} className="cursor-pointer text-sm">
                  Deva
                </Label>
              </div>
            </RadioGroup>

            <Textarea
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="resize-none rounded-xl bg-background/50"
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
                Send
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

        {/* Recursive Replies */}
        {showReplies && note.replies && note.replies.length > 0 && (
          <div className="w-full space-y-3 mt-2">
            {note.replies.map((reply) => (
              <NoteCard key={reply.id} note={reply} />
            ))}
          </div>
        )}
      </div>
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

        {/* Chat Messages */}
        <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 shadow-elegant border border-primary/10 min-h-[500px] max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-lg">Loading messages...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <MessageCircle className="w-16 h-16 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-xl">No messages yet. Start the conversation! 💌</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
