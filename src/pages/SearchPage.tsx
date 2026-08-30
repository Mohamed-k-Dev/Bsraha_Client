import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAsync } from '@/hooks/useAsync';
import { mockApi } from '@/services/mockApi';
import { Avatar } from '@/components/Avatar';
import { AvatarSkeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import type { User } from '@/types';
import { formatNumber } from '@/utils';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const { loading, error, refetch } = useAsync(async () => {
    const data = await mockApi.searchUsers(debouncedQuery, 1);
    setResults(data.users);
    setTotal(data.total);
    setHasMore(data.hasMore);
    setPage(1);
    return data;
  }, [debouncedQuery]);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    const data = await mockApi.searchUsers(debouncedQuery, next);
    setResults((prev) => [...prev, ...data.users]);
    setHasMore(data.hasMore);
    setPage(next);
  }, [page, debouncedQuery]);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
          Find <span className="italic font-medium">people</span>
        </h1>
        <p className="mt-2 text-ink-500 text-pretty">Search by display name or username. Then say something.</p>
      </motion.div>

      {/* Search input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="input pl-12 pr-12 text-base"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label="Clear">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && !error && results.length > 0 && (
        <p className="text-sm text-ink-400 font-mono mb-4">{total} {total === 1 ? 'person' : 'people'} found</p>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <AvatarSkeleton />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 shimmer-bg rounded" />
                <div className="h-3 w-20 shimmer-bg rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-8 w-8" />}
          title={query ? 'No results' : 'Start searching'}
          description={query ? `No one matches "${query}". Try a different name.` : 'Type a name or username above to find people on Bsraha.'}
        />
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {results.map((u, i) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/u/${u.username}`}
                    className="card p-4 flex items-center gap-4 hover:shadow-cardLg transition-all group"
                  >
                    <Avatar name={u.displayName} seed={u.avatarSeed} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-ink-800 truncate">{u.displayName}</div>
                      <div className="text-xs text-ink-400 font-mono">@{u.username}</div>
                      <div className="text-sm text-ink-500 truncate mt-0.5">{u.bio}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-ink-400">{formatNumber(u.messagesCount)} msgs</div>
                      <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-ink-600 group-hover:translate-x-1 transition-all mt-1 ml-auto" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={loadMore} className="btn btn-outline">Load more</button>
            </div>
          )}
        </>
      )}

      {/* Future search hint */}
      {!loading && !error && results.length > 0 && (
        <p className="mt-8 text-center text-xs text-ink-300 font-mono">
          Designed for autocomplete, fuzzy search, and typo tolerance
        </p>
      )}
    </div>
  );
}
