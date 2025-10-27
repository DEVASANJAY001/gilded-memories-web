import { useState, useEffect } from "react";
import { Send, Edit2, Trash2, Check, CheckCheck, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import React from "react";

// ============================
// SCHEMA & TYPES
// ============================
const noteSchema = z.object({
  sender: z.enum(["harini", "deva"]),
  message: z.string().trim().min(1).max(500),
});

interface Note {
  id: string;
  sender: "harini" | "deva";
  message: string;
  parent_id: string | null;
  created_at: string;
  delivered?: boolean;
  seen?: boolean;
  replies?: Note[];
}

// ============================
// TIME FORMATTER
// ============================
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ============================
// SINGLE MESSAGE COMPONENT
// ============================
const MessageBubble = React.memo(
  ({
    note,
    currentUser,
    onReply,
    onEdit,
    onDelete,
  }: {
    note: Note;
    currentUser: "harini" | "deva";
    onReply: (note: Note) => void;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
  }) => {
    const isOwn = note.sender === currentUser;

    const tickIcon = note.seen
      ? <CheckCheck className="w-4 h-4 text-blue-500" />
      : note.delivered
      ? <CheckCheck className="w-4 h-4 text-muted-foreground" />
      : <Check className="w-4 h-4 text-muted-foreground" />;

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
        <div
          className={`max-w-[75%] rounded-2xl p-3 shadow ${
            isOwn
              ? "bg-gradient-to-br from-rose-500 to-pink-400 text-white rounded-br-sm"
              : "bg-gradient-to-br from-sky-500 to-teal-400 text-white rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{note.message}</p>

          <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-80">
            <span>{formatTime(note.created_at)}</span>
            {isOwn && tickIcon}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex gap-2 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            } text-white/70`}
          >
            <button
              onClick={() => onReply(note)}
              className="text-xs hover:text-white flex items-center gap-1"
            >
              <Reply size={12} /> Reply
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onEdit(note)}
                  className="text-xs hover:text-white flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  className="text-xs hover:text-white flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
          </div>

          {/* Recursive replies */}
          {note.replies && note.replies.length > 0 && (
            <div className="mt-2 border-l border-white/30 pl-3 space-y-2">
              {note.replies.map((r) => (
                <MessageBubble
                  key={r.id}
                  note={r}
                  currentUser={currentUser}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ============================
// MAIN CHAT COMPONENT
// ============================
const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sender, setSender] = useState<"harini" | "deva">("harini");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadNotes();

    const channel = supabase
      .channel("notes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        loadNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const map = new Map<string, Note>();
      const roots: Note[] = [];

      data.forEach((n) => map.set(n.id, { ...n, replies: [] }));
      data.forEach((n) => {
        if (n.parent_id) {
          map.get(n.parent_id)?.replies?.push(map.get(n.id)!);
        } else roots.push(map.get(n.id)!);
      });

      setNotes(roots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const validation = noteSchema.safeParse({ sender, message });
    if (!validation.success) return toast.error("Invalid message");

    setIsSending(true);
    try {
      if (editNote) {
        // Edit existing note
        const { error } = await supabase
          .from("notes")
          .update({ message })
          .eq("id", editNote.id);
        if (error) throw error;
        toast.success("Message updated!");
        setEditNote(null);
      } else {
        // Send new or reply
        const { error } = await supabase.from("notes").insert({
          sender,
          message,
          parent_id: replyTo ? replyTo.id : null,
        });
        if (error) throw error;
        toast.success(replyTo ? "Reply sent!" : "Message sent!");
        setReplyTo(null);
      }
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted">
      {/* Chat Header */}
      <div className="p-4 border-b bg-card/80 backdrop-blur-xl text-center font-semibold text-lg">
        💬 Harini & Deva Chat
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {notes.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          notes.map((note) => (
            <MessageBubble
              key={note.id}
              note={note}
              currentUser={sender}
              onReply={(n) => setReplyTo(n)}
              onEdit={(n) => {
                setEditNote(n);
                setMessage(n.message);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t bg-card/90 backdrop-blur-xl p-4">
        {replyTo && (
          <div className="mb-2 p-2 bg-primary/10 rounded-md text-sm flex justify-between items-center">
            Replying to <strong>{replyTo.sender}</strong>: "{replyTo.message.slice(0, 30)}..."
            <button
              onClick={() => setReplyTo(null)}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <RadioGroup
            value={sender}
            onValueChange={(v) => setSender(v as "harini" | "deva")}
            className="flex gap-3 items-center"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="harini" id="sender-harini" />
              <Label htmlFor="sender-harini" className="text-sm">Harini</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="deva" id="sender-deva" />
              <Label htmlFor="sender-deva" className="text-sm">Deva</Label>
            </div>
          </RadioGroup>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={editNote ? "Edit message..." : "Type a message..."}
            className="flex-1 resize-none rounded-2xl min-h-[48px] max-h-[120px]"
            rows={2}
          />

          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
