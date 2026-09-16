import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Lock, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { sendMessage } from "@/api/messages.api";
import { Spinner } from "@/components/ui";
import { cn } from "@/utils";

interface SendNoteModalProps {
  recipientDisplayName: string; // Used to target the endpoint `/message/send/to/:displayName`
  recipientName: string; // Used for clean UI display
  onClose: () => void;
}

export function SendNoteModal({
  recipientDisplayName,
  recipientName,
  onClose,
}: SendNoteModalProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const sendNoteMutation = useMutation({
    mutationFn: () =>
      sendMessage({
        displayName: recipientDisplayName,
        content: content.trim(),
        isAnonymous,
      }),
    onSuccess: () => {
      toast.success(`Secret note sent to ${recipientName}!`);
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendNoteMutation.isPending) return;
    sendNoteMutation.mutate();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white text-ink-900 rounded-3xl p-6 max-w-md w-full shadow-cardLg border border-ink-100 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-ink-900">
                Send Note to {recipientName}
              </h3>
              <p className="text-xs text-ink-400 font-mono mt-0.5">
                Say what's on your mind completely honestly.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-900 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity Switcher */}
            <div>
              <label className="block text-[12px] font-bold tracking-wider text-ink-400 uppercase mb-2">
                Send identity
              </label>
              <div className="flex p-1.5 bg-ink-50 rounded-xl border border-ink-100 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                    isAnonymous
                      ? "bg-ember-500 text-white shadow-sm"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                  )}
                >
                  <Lock className="h-3.5 w-3.5" /> Secret (Anonymous)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                    !isAnonymous
                      ? "bg-ink-900 text-white shadow-sm"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Identified
                </button>
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 800))}
                placeholder={`Write something to ${recipientName}...`}
                rows={4}
                className="w-full resize-none rounded-2xl border border-ink-200 bg-paper-50 px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent transition text-sm"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-ink-400 font-mono">
                  {content.length}/800
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() || sendNoteMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-ember-500 hover:bg-ember-600 text-white shadow-sm text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {sendNoteMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Note
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
