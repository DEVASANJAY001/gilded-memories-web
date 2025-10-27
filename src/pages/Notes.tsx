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
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import React from "react";

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

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

    const handlers = useSwipeable({
      onSwipedRight: () => onReply(note),
      onSwipedLeft: () => onDelete(note.id),
      delta: 50,
    });

    const tickIcon = note.seen ? (
      <CheckCheck className="w-4 h-4 text-sky-400" />
    ) : note.delivered ? (
      <CheckCheck className="w-4 h-4 text-gray-400" />
    ) : (
      <Check className="w-4 h-4 text-gray-400" />
    );

    return (
      <div {...handlers} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
        <div
          className={`max-w-[75%] rounded-2xl p-3 shadow-md transition-all duration-200 ${
            isOwn
              ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-br-sm"
              : "bg-gradient-to-br from-indigo-500 to-sky-600 text-white rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed drop-shadow-md">
            {note.message}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-white/90">
            <span>{formatTime(note.created_at)}</span>
            {isOwn && tickIcon}
          </div>

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
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, loadNotes)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return console.error(error);

    const map = new Map<string, Note>();
    const roots: Note[] = [];
    data.forEach((n) => map.set(n.id, { ...n, replies: [] }));
    data.forEach((n) => {
      if (n.parent_id) map.get(n.parent_id)?.replies?.push(map.get(n.id)!);
      else roots.push(map.get(n.id)!);
    });
    setNotes(roots);
  };

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
      toast.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    toast.success("Deleted!");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#fdf2f8] via-[#fff] to-[#f0f9ff]">
      <div className="p-4 border-b bg-white/70 backdrop-blur-md text-center font-semibold text-lg text-blue-600">
        💌 Harini & Deva Notes
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {notes.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet 💖
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

      <div className="border-t bg-white/90 backdrop-blur-md p-4 shadow-inner">
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm flex justify-between items-center">
            Replying to <strong>{replyTo.sender}</strong>: “
            {replyTo.message.slice(0, 40)}...”
            <button
              onClick={() => setReplyTo(null)}
              className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1"
            >
              <X size={12} /> Cancel
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
              <Label htmlFor="sender-harini" className="text-sm text-rose-600">
                Harini
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="deva" id="sender-deva" />
              <Label htmlFor="sender-deva" className="text-sm text-indigo-600">
                Deva
              </Label>
            </div>
          </RadioGroup>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={editNote ? "Edit message..." : "Type a message..."}
            className="flex-1 resize-none rounded-2xl min-h-[48px] max-h-[120px] bg-gradient-to-br from-[#c9e6ff] to-[#eaf6ff] border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 text-gray-700"
            rows={2}
          />

          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="rounded-full h-12 w-12 p-0 flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-md"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
