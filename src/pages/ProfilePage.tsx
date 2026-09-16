import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Avatar } from "@/components/Avatar";
import { MessageCard } from "@/components/MessageCard";
import { Spinner } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/States";
import { api } from "@/api/axios";
import { getUserProfile } from "@/api/user.api";
import { cn } from "@/utils";

const getMyPublicMessages = async (displayName: string) => {
  if (!displayName) return [];
  const cleanName = displayName.replace(/@Bsraha/gi, "").trim();
  const res = await api.get(`/message/public/${encodeURIComponent(cleanName)}`);
  return res.data?.data?.messages || res.data?.data || [];
};

export function ProfilePage() {
  const navigate = useNavigate();
  const [currentCoverIdx, setCurrentCoverIdx] = useState(0);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const cleanDisplayName = profile?.displayName
    ? profile.displayName.replace(/@Bsraha/gi, "").trim()
    : profile?.userName || "";

  const { data: publishedMessages = [], isLoading: isMessagesLoading } =
    useQuery({
      queryKey: ["my-public-messages", cleanDisplayName],
      queryFn: () => getMyPublicMessages(cleanDisplayName),
      enabled: !!cleanDisplayName,
    });

  const coverImages: any[] = profile?.coverImages || [];

  useEffect(() => {
    if (coverImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverIdx((prev) => (prev + 1) % coverImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [coverImages.length]);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(
      cleanDisplayName
    )}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  };

  const nextCover = () => {
    setCurrentCoverIdx((prev) => (prev + 1) % coverImages.length);
  };

  const prevCover = () => {
    setCurrentCoverIdx(
      (prev) => (prev - 1 + coverImages.length) % coverImages.length
    );
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-ember-500" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <ErrorState
          message={
            profileError instanceof Error
              ? profileError.message
              : "Failed to load profile."
          }
          onRetry={refetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-50 pb-20 w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Image Banner */}
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

        {/* Avatar Overlay */}
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

        {/* User Info Header */}
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
            @{profile?.userName}
          </p>
          {profile?.bio && (
            <p className="max-w-2xl mx-auto mt-4 text-ink-800 text-sm sm:text-[15px] leading-relaxed text-pretty">
              {profile.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/settings"
              className="px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Settings className="h-4 w-4" /> Edit Profile
            </Link>
            <button
              onClick={handleShareProfile}
              className="px-5 py-2.5 rounded-xl bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
          </div>
        </motion.div>

        {/* User Details Metadata Badges */}
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

        {/* User's Published Messages List */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-10 w-10 rounded-xl bg-ember-100 flex items-center justify-center text-ember-600 border border-ember-200">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                Your Public Messages
              </h2>
              <p className="text-sm text-ink-400 font-mono mt-0.5">
                {publishedMessages.length}{" "}
                {publishedMessages.length === 1 ? "entry" : "entries"} published
                to your public profile
              </p>
            </div>
          </div>

          {isMessagesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" className="text-ember-500" />
            </div>
          ) : publishedMessages.length === 0 ? (
            <EmptyState
              icon={<EyeOff className="h-8 w-8" />}
              title="No Public Messages"
              description="You haven't published any messages to your public profile yet."
              className="py-16 bg-white border border-ink-100 rounded-3xl shadow-sm"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {publishedMessages.map((msg: any) => (
                <MessageCard
                  key={msg._id || msg.id}
                  message={msg}
                  showActions={true}
                  currentUserId={profile._id || profile.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
