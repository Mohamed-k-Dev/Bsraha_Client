import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search as SearchIcon,
  X,
  Send,
  Menu,
  ShieldCheck,
  Eye,
  Sparkles,
} from "lucide-react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers } from "@/api/user.api";
import { sendMessage } from "@/api/messages.api";
import { Avatar } from "@/components/Avatar";
import { AvatarSkeleton } from "@/components/Skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import type { User as UserType } from "@/types";
import type { LayoutContextType } from "@/components/AppLayout";
import { formatNumber, cn } from "@/utils";

// --- SEND NOTE MODAL COMPONENT ---
function SendNoteModal({
  user,
  onClose,
}: {
  user: UserType;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const cleanDisplayName = user.displayName.split("@")[0];
  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      onClose();
    },
  });


  const handleSend = () => {
    if (!content.trim()) return;

    const promise = sendMutation.mutateAsync({
      displayName: cleanDisplayName,
      content: content.trim(),
      isAnonymous,
    });

    toast.promise(promise, {
      pending: "Sending your note...",
      success: "Message sent successfully!",
      error: "Failed to send message.",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 b">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full lg:w-1/3 card bg-white shadow-2xl border border-red-100 rounded-[2rem] overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
          <div className="flex items-center gap-4">
            <Avatar name={cleanDisplayName} seed={user.userName} size="md" />
            <div>
              <h3 className="font-display font-semibold text-lg text-ink-900 leading-tight">
                {cleanDisplayName}
              </h3>
              <p className="text-sm text-ink-500 font-mono">@{user.userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Identity Toggle */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-ink-500 uppercase mb-3">
              Sender Identity
            </label>
            <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0 p-1 py-2 md:py-1 bg-ink-50 rounded-2xl border border-ink-100">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  isAnonymous
                    ? "bg-ember-500 text-white shadow-sm"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Secret (Anonymous)
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  !isAnonymous
                    ? "bg-ink-900 text-white shadow-sm"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/50"
                )}
              >
                <Eye className="h-4 w-4" />
                Identified
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-500 flex items-center gap-1.5 px-1">
              <Sparkles className="h-3.5 w-3.5 text-moss-500" />
              {isAnonymous
                ? "Your identity and tokens are strictly concealed."
                : "The receiver will see your profile and display name."}
            </p>
          </div>

          {/* Message Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              placeholder={`Say what you've always wanted to say to ${cleanDisplayName} without holding back...`}
              className="w-full h-36 resize-none bg-white border border-ink-200 rounded-2xl p-4 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/20 focus:border-ember-500 transition-all shadow-sm text-sm"
            />
            <div className="mt-2 text-right text-xs font-mono text-ink-400">
              {content.length}/500
            </div>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="p-6 border-t border-ink-100 bg-ink-50/50">
          <button
            onClick={handleSend}
            disabled={!content.trim() || sendMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-ink-900 text-paper-50 hover:bg-ink-800 shadow-sm text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMutation.isPending ? (
              <span className="h-5 w-5 border-2 border-paper-50/20 border-t-paper-50 rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send {isAnonymous ? "Secret " : ""}Message
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function SearchPage() {
  const { setMobileOpen } = useOutletContext<LayoutContextType>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const getCleanName = (displayName: string) => displayName.split("@")[0];

  // State for the active selected user to message
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["search-users", debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      searchUsers({ q: debouncedQuery, pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!debouncedQuery.trim(),
  });

  const results = data?.pages.flatMap((page) => page.users) || [];
  const total = data?.pages[0]?.pagination?.totalUsers || 0;

  return (
    <div className="w-full lg:w-3/4 mx-auto px-5 sm:px-8 py-8 sm:py-12 relative flex flex-col min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 text-ink-900 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl transition-colors shadow-sm"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
            Find <span className="italic font-medium">people</span>
          </h1>
        </div>
        <p className="mt-2 text-ink-500 text-pretty md:ml-0 ml-12">
          Search by display name or username. Then send them an anonymous note.
        </p>
      </motion.div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-white border border-ink-200 rounded-2xl py-3.5 pl-12 pr-12 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/20 focus:border-ember-500 transition-all shadow-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 p-1 bg-ink-50 rounded-full transition-colors"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isLoading &&
        !isError &&
        results.length > 0 &&
        !!debouncedQuery.trim() && (
          <p className="text-sm text-ink-500 font-mono mb-6 ml-1">
            {formatNumber(total)} {total === 1 ? "person" : "people"} found
          </p>
        )}

      <div className="flex-1">
        {!debouncedQuery.trim() ? (
          <EmptyState
            icon={<SearchIcon className="h-8 w-8" />}
            title="Start searching"
            description="Type a name or username above to find people."
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card p-5 border border-ink-100 rounded-3xl bg-white"
              >
                <div className="flex items-center gap-4 mb-4">
                  <AvatarSkeleton />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-ink-100 animate-pulse rounded" />
                    <div className="h-3 w-20 bg-ink-50 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-10 bg-ink-50 animate-pulse rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Search failed"}
            onRetry={() => refetch()}
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-8 w-8" />}
            title="No results"
            description={`No one matches "${query}". Try a different name.`}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((u: UserType, i: number) => {
                const cleanDisplayName = u.displayName.split("@")[0];

                return (
                  <motion.div
                    key={u._id || u.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="card bg-white border border-ink-100 rounded-[1.5rem] p-5 sm:p-6 hover:shadow-cardLg transition-all flex flex-col group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={cleanDisplayName}
                        seed={u.userName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg text-ink-900 truncate">
                          {cleanDisplayName}
                        </h3>
                        <p className="text-sm text-ink-500 font-mono truncate">
                          @{u.userName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex-1">
                      <p className="text-sm text-ink-600 line-clamp-2 leading-relaxed">
                        {u.bio || "This user hasn't added a bio yet."}
                      </p>
                    </div>

                    <div className="mt-5 pt-5 border-t border-ink-100 flex items-center gap-3">
                      <Link
                        to={`/profile/${encodeURIComponent(
                          getCleanName(u.displayName)
                        )}`}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-50 text-sm font-medium text-center transition-colors"
                      >
                        View Profile
                      </Link>

                      {/* Changed from Link to Button to trigger Modal */}
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-ember-500 text-white hover:bg-ember-600 shadow-sm text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Note
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {hasNextPage && (
        <div className="mt-10 text-center pb-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 rounded-xl border border-ink-200 bg-white text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
          >
            {isFetchingNextPage ? (
              <>
                <span className="h-4 w-4 border-2 border-ink-300 border-t-ink-700 rounded-full animate-spin" />
                Loading more...
              </>
            ) : (
              "Load more people"
            )}
          </button>
        </div>
      )}

      {/* Render the Modal using AnimatePresence for smooth mounting/unmounting */}
      <AnimatePresence>
        {selectedUser && (
          <SendNoteModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
