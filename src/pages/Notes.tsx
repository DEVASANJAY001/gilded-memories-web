import { useState, useEffect } from "react";
import {
  Send,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  Reply,
  X,
} from "lucide-react";
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
// HELPERS
// ============================
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ============================
// MESSAGE BUBBLE COMPONENT
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

    // ✅ Tick Icons
    const tickIcon = note.seen ? (
      <CheckCheck className="w-4 h-4 text-sky-400" />
    ) : note.delivered ? (
      <CheckCheck className="w-4 h-4 text-muted-foreground" />
    ) : (
      <Check className="w-4 h-4 text-muted-foreground" />
    );

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
        <div
          className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
            isOwn
              ? "bg-gradient-to-br from-pink-500 to-rose-400 text-white rounded-br-sm"
              : "bg-gradient-to-br from-sky-500 to-cyan-400 text-white rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {note.message}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[11px] opacity-90">
            <span>{formatTime(note.created_at)}</span>
            {isOwn && tickIcon}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex gap-2 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            } text-white/80`}
          >
            <button
              onClick={() => onReply(note)}
              className="text-[11px] hover:text-white flex items-center gap-1"
            >
              <Reply size={11} /> Reply
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onEdit(note)}
                  className="text-[11px] hover:text-white flex items-center gap-1"
                >
                  <Edit2 size={11} /> Edit
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  className="text-[11px] hover:text-white flex items-center gap-1"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </>
            )}
          </div>

          {/* Recursive Replies */}
          {note.replies && note.replies.length > 0 && (
            <div className="mt-2 border-l border-white/30 pl-3 space-y-2">
              {note.replies.map((reply) => (
                <MessageBubble
                  key={reply.id}
                  note={reply}
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
// MAIN CHAT PAGE
// ============================
const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sender, setSender] = useState<"harini" | "deva">("harini");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isSending, setIsSending] = useState(false);

  // 🔁 Load + Realtime sync
  useEffect(() => {
    loadNotes();
    const channel = supabase
      .channel("notes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, loadNotes)
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
      console.error("Error loading notes:", err);
    }
  };

  // ✉️ Send / Edit / Reply
  const handleSend = async () => {
    if (!message.trim()) return;
    const validation = noteSchema.safeParse({ sender, message });
    if (!validation.success) return toast.error("Invalid message");

    setIsSending(true);
    try {
      if (editNote) {
        const { error } = await supabase
          .from("notes")
          .update({ message })
          .eq("id", editNote.id);
        if (error) throw error;
        toast.success("Message updated!");
        setEditNote(null);
      } else {
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
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#fdf2f8] via-[#f0f9ff] to-[#fefcfb]">
      {/* Header */}
      <div className="p-4 border-b bg-white/80 backdrop-blur-xl text-center font-semibold text-lg text-gray-800 shadow-sm">
        💬 Harini & Deva Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {notes.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start chatting! 💌
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

      {/* Input Bar */}
      <div className="border-t bg-white/90 backdrop-blur-xl p-4 shadow-inner">
        {replyTo && (
          <div className="mb-2 p-2 bg-sky-50 border border-sky-200 rounded-md text-sm flex justify-between items-center">
            Replying to <strong>{replyTo.sender}</strong>: "
            {replyTo.message.slice(0, 40)}..."
            <button
              onClick={() => setReplyTo(null)}
              className="text-xs text-muted-foreground hover:text-sky-500 flex items-center gap-1"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          {/* Sender Selector */}
          <RadioGroup
            value={sender}
            onValueChange={(v) => setSender(v as "harini" | "deva")}
            className="flex gap-3 items-center"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="harini" id="sender-harini" />
              <Label htmlFor="sender-harini" className="text-sm">
                Harini
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="deva" id="sender-deva" />
              <Label htmlFor="sender-deva" className="text-sm">
                Deva
              </Label>
            </div>
          </RadioGroup>

          {/* Message Box */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={editNote ? "Edit message..." : "Type a message..."}
            className="flex-1 resize-none rounded-2xl min-h-[48px] max-h-[120px] bg-gray-50 border border-gray-200 focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            rows={2}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="rounded-full h-12 w-12 p-0 flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
