import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  EyeOff,
  Share2,
  Send,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Avatar } from "@/components/Avatar";
import { MessageCard } from "@/components/MessageCard";
import { Spinner } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/States";
import { api } from "@/api/axios";
import { getUserProfile } from "@/api/user.api";
import { reactToTarget, removeReaction } from "@/api/reactions.api";
import { sendMessage } from "@/api/messages.api";
import { cn } from "@/utils";

const getPublicUserProfile = async (displayName: string) => {
  const cleanName = displayName.replace(/@Bsraha/gi, "").trim();

  const [profileRes, messagesRes] = await Promise.allSettled([
    api.get(`/user/profile/${encodeURIComponent(cleanName)}`),
    api.get(`/message/public/${encodeURIComponent(cleanName)}`),
  ]);

  const profileData =
    profileRes.status === "fulfilled" ? profileRes.value.data?.data : null;
  const messagesData =
    messagesRes.status === "fulfilled" ? messagesRes.value.data?.data : null;

  return {
    profile: profileData?.profile || profileData?.user || profileData,
    messages:
      messagesData?.messages ||
      (Array.isArray(messagesData) ? messagesData : []),
  };
};

export function PublicProfilePage() {
  const { displayName } = useParams<{ displayName: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUserProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  const [currentCoverIdx, setCurrentCoverIdx] = useState(0);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedMessageForPublish, setSelectedMessageForPublish] = useState<
    string | null
  >(null);

  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-profile", displayName],
    queryFn: () => getPublicUserProfile(displayName!),
    enabled: !!displayName,
  });

  const profile = profileData?.profile;
  const publishedMessages = profileData?.messages || [];
  const coverImages: any[] = profile?.coverImages || [];

  // ROBUST & SAFE ID-BASED OWNERSHIP CHECK
  const currentUserId =
    currentUserProfile?._id ||
    currentUserProfile?.id ||
    currentUserProfile?.user?._id;
  const profileId = profile?._id || profile?.id || profile?.user?._id;

  const isProfileOwner = Boolean(
    currentUserId &&
      profileId &&
      String(currentUserId).trim() === String(profileId).trim()
  );

  useEffect(() => {
    if (coverImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverIdx((prev) => (prev + 1) % coverImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [coverImages.length]);

  const cleanDisplayName = displayName
    ? displayName.replace(/@Bsraha/gi, "").trim()
    : profile?.displayName
    ? profile.displayName.replace(/@Bsraha/gi, "").trim()
    : "";

  const reactionMutation = useMutation({
    mutationFn: async ({
      messageId,
      type,
      currentReaction,
    }: {
      messageId: string;
      type: string;
      currentReaction: string | null;
    }) => {
      if (currentReaction === type) {
        return removeReaction({ targetType: "message", targetId: messageId });
      } else {
        return reactToTarget({
          targetType: "message",
          targetId: messageId,
          type,
        });
      }
    },
    onMutate: async ({ messageId, type, currentReaction }) => {
      await queryClient.cancelQueries({
        queryKey: ["public-profile", displayName],
      });
      const previousData = queryClient.getQueryData([
        "public-profile",
        displayName,
      ]);

      queryClient.setQueryData(["public-profile", displayName], (old: any) => {
        if (!old) return old;
        const messagesList = old.messages || [];
        const updatedList = Array.isArray(messagesList)
          ? messagesList.map((msg: any) => {
              if ((msg._id || msg.id) !== messageId) return msg;
              const isRemoving = currentReaction === type;
              const newMyReaction = isRemoving ? null : type;

              let updatedTypes = [...(msg.reactions?.types || [])];
              if (currentReaction) {
                const prev = updatedTypes.find(
                  (t) => t.type === currentReaction
                );
                if (prev) prev.count = Math.max(0, prev.count - 1);
              }
              if (!isRemoving) {
                const curr = updatedTypes.find((t) => t.type === type);
                if (curr) curr.count += 1;
                else updatedTypes.push({ type, count: 1 });
              }

              return {
                ...msg,
                myReaction: newMyReaction,
                reactions: {
                  ...msg.reactions,
                  myReaction: newMyReaction,
                  types: updatedTypes,
                },
              };
            })
          : messagesList;

        return { ...old, messages: updatedList };
      });

      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["public-profile", displayName],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["public-profile", displayName],
      });
    },
  });

  const handleReact = (
    messageId: string,
    type: string,
    currentReaction: string | null
  ) => {
    toast.promise(
      reactionMutation.mutateAsync({ messageId, type, currentReaction }),
      {
        pending: "Updating reaction...",
        success: "Reaction updated!",
        error: "Failed to update reaction.",
      }
    );
  };

  const togglePublishMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const targetMsg = (
        Array.isArray(publishedMessages) ? publishedMessages : []
      ).find((m: any) => (m._id || m.id) === messageId);
      const endpoint = targetMsg?.isPublic
        ? `/message/unPublish/${messageId}`
        : `/message/publish/${messageId}`;
      const res = await api.patch(endpoint);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["public-profile", displayName],
      });
      toast.success("Message visibility updated!");
      setSelectedMessageForPublish(null);
    },
    onError: () => {
      toast.error("Failed to update message status.");
    },
  });

  const handlePublishToggleClick = (messageId: string) => {
    setSelectedMessageForPublish(messageId);
  };

  const sendNoteMutation = useMutation({
    mutationFn: () =>
      sendMessage({
        displayName: cleanDisplayName,
        content: content.trim(),
        isAnonymous,
      }),
    onSuccess: () => {
      toast.success(`Secret note sent to ${cleanDisplayName}!`);
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
    onError: (err: any) => {
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send message. Please try again.";
      toast.error(serverMessage);
    },
  });

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendNoteMutation.isPending) return;
    sendNoteMutation.mutate();
  };

  const nextCover = () => {
    setCurrentCoverIdx((prev) => (prev + 1) % coverImages.length);
  };

  const prevCover = () => {
    setCurrentCoverIdx(
      (prev) => (prev - 1 + coverImages.length) % coverImages.length
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-50 flex justify-center items-center py-20">
        <Spinner size="lg" className="text-ember-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <ErrorState
          message={
            error instanceof Error ? error.message : "User profile not found."
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  const messagesArray = Array.isArray(publishedMessages)
    ? publishedMessages
    : [];

  return (
    <div className="min-h-screen bg-paper-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-48 sm:h-72 lg:h-80 mt-4 sm:mt-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm bg-ink-900 border border-ink-100 group"
        >
          {coverImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentCoverIdx}
                src={
                  coverImages[currentCoverIdx]?.url ||
                  coverImages[currentCoverIdx]
                }
                alt={`Cover ${currentCoverIdx + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover absolute inset-0"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full bg-[linear-gradient(135deg,#1f1a13,#4b3f2f)] opacity-90 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-ink-700/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent pointer-events-none" />
          {coverImages.length > 1 && (
            <>
              <button
                onClick={prevCover}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-ink-900/50 hover:bg-ink-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextCover}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-ink-900/50 hover:bg-ink-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {coverImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCoverIdx(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentCoverIdx
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className="flex justify-center -mt-16 sm:-mt-20 relative z-10"
        >
          <div className="p-1.5 bg-paper-50 rounded-full shadow-sm">
            {profile?.image?.url ? (
              <img
                src={profile.image.url}
                alt={cleanDisplayName}
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <Avatar
                name={cleanDisplayName}
                seed={profile?.userName || cleanDisplayName}
                size="2xl"
                className="h-28 w-28 sm:h-36 sm:w-36 text-4xl shadow-inner border border-ink-100"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-4 sm:mt-6 px-4"
        >
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            {cleanDisplayName}
          </h1>
          <p className="text-ink-400 font-mono text-sm sm:text-base mt-1">
            @{profile?.userName || displayName}
          </p>
          <p className="max-w-2xl mx-auto mt-4 text-ink-800 text-sm sm:text-[15px] leading-relaxed text-pretty">
            {profile?.bio || "This user hasn't written a bio yet."}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={handleShareProfile}
              className="px-5 py-2.5 rounded-xl bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8 max-w-3xl mx-auto"
        >
          {profile?.email && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Mail className="h-4 w-4 text-ink-400" />
              {profile.email}
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Phone className="h-4 w-4 text-ink-400" />
              {profile.phone}
            </div>
          )}
          {profile?.gender && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <UserIcon className="h-4 w-4 text-ink-400" />
              {profile.gender}
            </div>
          )}
          {profile?.age && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Calendar className="h-4 w-4 text-ink-400" />
              {profile.age} years old
            </div>
          )}
        </motion.div>

        {/* SEND NOTE BOX: Hidden ONLY if the logged-in viewer is the owner of this profile */}
        {!isProfileOwner && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-12 mx-auto bg-white border border-ink-100 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="font-display font-semibold text-lg text-ink-900">
                Send Note to {cleanDisplayName}
              </h3>
              <p className="text-xs text-ink-400 font-mono mt-0.5">
                Say what's on your mind completely honestly.
              </p>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
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
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 800))}
                  placeholder={`Write something to ${cleanDisplayName}...`}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-ink-200 bg-paper-50 px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent transition text-sm"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-ink-400 font-mono">
                    {content.length}/800
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end">
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
        )}

        <div className="mt-16 sm:mt-20">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-10 w-10 rounded-xl bg-ember-100 flex items-center justify-center text-ember-600 border border-ember-200">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                Published Messages
              </h2>
              <p className="text-sm text-ink-400 font-mono mt-0.5">
                {messagesArray.length}{" "}
                {messagesArray.length === 1 ? "entry" : "entries"} available
                publicly
              </p>
            </div>
          </div>

          {messagesArray.length === 0 ? (
            <EmptyState
              icon={<EyeOff className="h-8 w-8" />}
              title="No Public Messages"
              description="This user has not published any messages to their profile yet."
              className="py-16 bg-white border border-ink-100 rounded-3xl shadow-sm"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {messagesArray.map((msg: any) => {
                const messageId = msg._id || msg.id;

                const getNormalizedReactions = (m: any) => {
                  if (
                    Array.isArray(m.reactions?.types) &&
                    m.reactions.types.length > 0
                  ) {
                    return m.reactions.types;
                  }
                  const summaryTypes = m.reactionSummary?.types;
                  if (summaryTypes && typeof summaryTypes === "object") {
                    return Object.entries(summaryTypes)
                      .filter(
                        ([key, count]) =>
                          key !== "_id" &&
                          typeof count === "number" &&
                          count > 0
                      )
                      .map(([type, count]) => ({ type, count }));
                  }
                  if (Array.isArray(m.reactions)) return m.reactions;
                  return [];
                };

                const activeReaction =
                  msg.reactions?.myReaction ||
                  msg.myReaction ||
                  msg.reactionSummary?.myReaction ||
                  null;

                const totalComments =
                  msg.repliesCount ??
                  msg.replyCount ??
                  msg.commentsCount ??
                  msg.replySummary?.total ??
                  0;

                const msgReceiverId =
                  msg.receiver?._id || msg.receiver?.id || msg.receiver;
                const msgSenderId =
                  msg.sender?._id || msg.sender?.id || msg.sender;

                const isMessageOwnerOrReceiver = Boolean(
                  currentUserId &&
                    (String(currentUserId) === String(msgReceiverId) ||
                      String(currentUserId) === String(msgSenderId) ||
                      isProfileOwner)
                );

                return (
                  <MessageCard
                    key={messageId}
                    message={{
                      ...msg,
                      _id: messageId,
                      repliesCount: totalComments,
                      replyCount: totalComments,
                      myReaction: activeReaction,
                      reactions: {
                        ...(msg.reactions || {}),
                        myReaction: activeReaction,
                        types: getNormalizedReactions(msg),
                      },
                    }}
                    onReact={(type) =>
                      handleReact(messageId, type, activeReaction)
                    }
                    onTogglePublish={
                      isMessageOwnerOrReceiver
                        ? () => handlePublishToggleClick(messageId)
                        : undefined
                    }
                    showActions={true}
                    currentUserId={currentUserId}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedMessageForPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setSelectedMessageForPublish(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-cardLg border border-ink-100"
            >
              <div className="flex items-center gap-3 mb-3 text-ink-900">
                <AlertTriangle className="h-6 w-6 text-ember-500" />
                <h3 className="font-display font-semibold text-lg">
                  Change Public Visibility?
                </h3>
              </div>
              <p className="text-sm text-ink-600 mb-6 text-pretty">
                Are you sure you want to change the public status of this
                message on your profile?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedMessageForPublish(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    togglePublishMutation.mutate(selectedMessageForPublish)
                  }
                  disabled={togglePublishMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {togglePublishMutation.isPending && <Spinner size="sm" />}{" "}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
