import { useState, useEffect, useCallback, useRef } from 'react';

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = [],
  options: { skip?: boolean } = {}
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const run = useCallback(() => {
    if (options.skip) return;
    setLoading(true);
    setError(null);
    fnRef.current()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message || 'Something went wrong');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
